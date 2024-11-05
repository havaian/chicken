const mongoose = require("mongoose");
const UNITS = require('./units/units');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    unit: {
        type: String,
        enum: Object.values(UNITS),
        required: true
    },
    baseProductionCost: {
        type: Number,
        required: true,
    },
    baseSalePrice: {
        type: Number,
        required: true,
    },
    active: {
        type: Boolean,
        default: true,
        required: true,
    },
    buttons: {
        type: Array,
        required: false
    },
    properties: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {},
    },
    deleted: {
        type: Boolean,
        default: false,
        required: true,
    }
}, {
    timestamps: true,
    strict: true,
    strictQuery: false,
});

categorySchema.index({ name: 1, deleted: 1 }, { unique: true, partialFilterExpression: { deleted: false } });

const Category = mongoose.model("Category", categorySchema);

// models/subcategory.model.js
const subcategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    unit: {
        type: String,
        enum: Object.values(UNITS),
        required: true
    },
    productionCost: {
        type: Number,
        required: true,
    },
    salePrice: {
        type: Number,
        required: true,
    },
    active: {
        type: Boolean,
        default: true,
        required: true,
    },
    buttons: {
        type: Array,
        required: false
    },
    properties: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {},
    },
    deleted: {
        type: Boolean,
        default: false,
        required: true,
    }
}, {
    timestamps: true,
    strict: true,
    strictQuery: false,
});

subcategorySchema.index(
    { name: 1, category: 1, deleted: 1 }, 
    { unique: true, partialFilterExpression: { deleted: false } }
);

// Pre-save middleware to inherit unit from category if not specified
subcategorySchema.pre('save', async function(next) {
    if (!this.unit) {
        const category = await Category.findById(this.category);
        if (category) {
            this.unit = category.unit;
        }
    }
    next();
});

const Subcategory = mongoose.model("Subcategory", subcategorySchema);

// models/item.model.js
const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory',
        required: true,
    },
    unit: {
        type: String,
        enum: Object.values(UNITS),
        required: true
    },
    productionCost: {
        type: Number,
        required: true,
    },
    salePrice: {
        type: Number,
        required: true,
    },
    active: {
        type: Boolean,
        default: true,
        required: true,
    },
    buttons: {
        type: Array,
        required: false
    },
    properties: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {},
    },
    variety: {
        type: String,
        required: false,
        default: ''
    },
    deleted: {
        type: Boolean,
        default: false,
        required: true,
    }
}, {
    timestamps: true,
    strict: true,
    strictQuery: false,
});

itemSchema.index(
    { name: 1, subcategory: 1, deleted: 1 }, 
    { unique: true, partialFilterExpression: { deleted: false } }
);

// Pre-save middleware to inherit unit from subcategory if not specified
itemSchema.pre('save', async function(next) {
    if (!this.unit) {
        const subcategory = await Subcategory.findById(this.subcategory);
        if (subcategory) {
            this.unit = subcategory.unit;
        }
    }
    next();
});

const Item = mongoose.model("Item", itemSchema);

module.exports = {
    UNITS,
    Category,
    Subcategory,
    Item
};