// models/buyer.model.js
const mongoose = require("mongoose");

// Embedded schema for allowed items in buyer settings
const allowedItemSchema = {
  _id: false,
  customPrice: {
      type: Number,
      required: false,
  },
  priceExpiration: {
      type: Date,
      required: false,  // Optional - if not set, price doesn't expire
  },
  active: {
      type: Boolean,
      default: true,
  }
};

const buyerSchema = new mongoose.Schema(
    {
        full_name: {
            type: String,
            required: true,
        },
        phone_num: {
            type: String,
            required: false,
        },
        location: {
            type: { type: String },
            coordinates: {},
        },
        locations: {
            type: Array,
            required: false
        },
        deactivated: {
            type: Boolean,
            required: true,
            default: false,
        },
        debt_limit: {
            type: Number,
            required: false,
        },
        // Product settings embedded directly in buyer
        allowedCategories: [{
            category: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Category',
                required: true,
            },
            ...allowedItemSchema
        }],
        allowedSubcategories: [{
            subcategory: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Subcategory',
                required: true,
            },
            ...allowedItemSchema
        }],
        allowedItems: [{
            item: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Item',
                required: true,
            },
            ...allowedItemSchema
        }],
        restrictions: {
            type: Map,
            of: mongoose.Schema.Types.Mixed,
            default: {},
        },
        deleted: {
            type: Boolean,
            required: true,
            default: false,
        }
    },
    {
        timestamps: true,
        strict: true,
        strictQuery: false,
    }
);

// Indexes
buyerSchema.index({ location: "2dsphere" }); // Index for geospatial queries
buyerSchema.index(
    { full_name: 1, deleted: 1 }, 
    { unique: true, partialFilterExpression: { deleted: false } }
);
// Uncomment if phone_num uniqueness is needed
// buyerSchema.index(
//     { phone_num: 1, deleted: 1 }, 
//     { unique: true, partialFilterExpression: { deleted: false } }
// );

// Virtual for populating settings fields
buyerSchema.virtual('productSettings').get(function() {
    return {
        allowedCategories: this.allowedCategories || [],
        allowedSubcategories: this.allowedSubcategories || [],
        allowedItems: this.allowedItems || [],
        restrictions: this.restrictions || {}
    };
});

// When converting to JSON/Object, include virtuals
buyerSchema.set('toJSON', { virtuals: true });
buyerSchema.set('toObject', { virtuals: true });

// Then modify the getDefaultPrices method to check expiration:
buyerSchema.methods.getDefaultPrices = async function() {
  try {
      const prices = {};
      const now = new Date();
      
      const buyer = this.populated('allowedCategories.category') ? 
          this : 
          await this.populate([
              {
                  path: 'allowedCategories.category',
                  select: 'baseSalePrice deleted active'
              },
              {
                  path: 'allowedSubcategories.subcategory',
                  select: 'salePrice deleted active'
              },
              {
                  path: 'allowedItems.item',
                  select: 'salePrice deleted active'
              }
          ]);

      // Add category prices
      for (const catSetting of buyer.allowedCategories || []) {
          if (catSetting.active && catSetting.category && !catSetting.category.deleted) {
              // Use custom price only if it hasn't expired
              const useCustomPrice = catSetting.customPrice && 
                  (!catSetting.priceExpiration || catSetting.priceExpiration > now);
              
              prices[catSetting.category._id] = useCustomPrice ? 
                  catSetting.customPrice : 
                  catSetting.category.baseSalePrice;
          }
      }

      // Add subcategory prices
      for (const subSetting of buyer.allowedSubcategories || []) {
          if (subSetting.active && subSetting.subcategory && !subSetting.subcategory.deleted) {
              const useCustomPrice = subSetting.customPrice && 
                  (!subSetting.priceExpiration || subSetting.priceExpiration > now);
              
              prices[subSetting.subcategory._id] = useCustomPrice ? 
                  subSetting.customPrice : 
                  subSetting.subcategory.salePrice;
          }
      }

      // Add item prices
      for (const itemSetting of buyer.allowedItems || []) {
          if (itemSetting.active && itemSetting.item && !itemSetting.item.deleted) {
              const useCustomPrice = itemSetting.customPrice && 
                  (!itemSetting.priceExpiration || itemSetting.priceExpiration > now);
              
              prices[itemSetting.item._id] = useCustomPrice ? 
                  itemSetting.customPrice : 
                  itemSetting.item.salePrice;
          }
      }

      return prices;
  } catch (error) {
      console.error('Error getting default prices:', error);
      return {};
  }
};

// Helper method to get all allowed items (useful for validation)
buyerSchema.methods.getAllowedItems = function() {
    return {
        categories: this.allowedCategories.filter(cat => cat.active).map(cat => cat.category.toString()),
        subcategories: this.allowedSubcategories.filter(sub => sub.active).map(sub => sub.subcategory.toString()),
        items: this.allowedItems.filter(item => item.active).map(item => item.item.toString())
    };
};

const Buyer = mongoose.model("Buyer", buyerSchema);

module.exports = Buyer;