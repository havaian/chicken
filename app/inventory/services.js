const { Category, Subcategory, Item } = require('./model');
const { logger } = require('../utils/logging');

class CategoryService {
  static async createCategory(categoryData) {
    const category = new Category(categoryData);
    return await category.save();
  }

  static async getAllCategories(includeInactive = false) {
    const query = { deleted: false };
    if (!includeInactive) {
      query.active = true;
    }
    return await Category.find(query);
  }

  static async getCategoryById(id) {
    return await Category.findOne({ _id: id, deleted: false });
  }

  static async updateCategory(id, updateData) {
    return await Category.findOneAndUpdate(
      { _id: id, deleted: false },
      updateData,
      { new: true, runValidators: true }
    );
  }

  static async deleteCategory(id) {
    return await Category.findOneAndUpdate(
      { _id: id, deleted: false },
      { deleted: true },
      { new: true }
    );
  }

  static async getCategoryByName(name) {
    return await Category.findOne({ 
      name: new RegExp(`^${name}$`, 'i'),
      deleted: false 
    });
  }

  static async updateBasePrices(id, productionCost, salePrice) {
    return await Category.findOneAndUpdate(
      { _id: id, deleted: false },
      { 
        baseProductionCost: productionCost,
        baseSalePrice: salePrice 
      },
      { new: true }
    );
  }
}

class SubcategoryService {
  static async createSubcategory(subcategoryData) {
    const subcategory = new Subcategory(subcategoryData);
    return await subcategory.save();
  }

  static async getAllSubcategories(categoryId = null, includeInactive = false) {
    const query = { deleted: false };
    if (categoryId) {
      query.category = categoryId;
    }
    if (!includeInactive) {
      query.active = true;
    }
    return await Subcategory.find(query).populate('category', 'name');
  }

  static async getSubcategoryById(id) {
    return await Subcategory.findOne({ _id: id, deleted: false })
      .populate('category', 'name baseProductionCost baseSalePrice');
  }

  static async updateSubcategory(id, updateData) {
    return await Subcategory.findOneAndUpdate(
      { _id: id, deleted: false },
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name');
  }

  static async deleteSubcategory(id) {
    return await Subcategory.findOneAndUpdate(
      { _id: id, deleted: false },
      { deleted: true },
      { new: true }
    );
  }

  static async getSubcategoryByName(name, categoryId) {
    return await Subcategory.findOne({ 
      name: new RegExp(`^${name}$`, 'i'),
      category: categoryId,
      deleted: false 
    });
  }

  static async updatePrices(id, productionCost, salePrice) {
    return await Subcategory.findOneAndUpdate(
      { _id: id, deleted: false },
      { 
        productionCost: productionCost,
        salePrice: salePrice 
      },
      { new: true }
    );
  }
}

class ItemService {
  static async createItem(itemData) {
    const item = new Item(itemData);
    return await item.save();
  }

  static async getAllItems(subcategoryId = null, includeInactive = false) {
    const query = { deleted: false };
    if (subcategoryId) {
      query.subcategory = subcategoryId;
    }
    if (!includeInactive) {
      query.active = true;
    }
    return await Item.find(query)
      .populate({
        path: 'subcategory',
        select: 'name category',
        populate: {
          path: 'category',
          select: 'name'
        }
      });
  }

  static async getItemById(id) {
    return await Item.findOne({ _id: id, deleted: false })
      .populate({
        path: 'subcategory',
        select: 'name productionCost salePrice category',
        populate: {
          path: 'category',
          select: 'name baseProductionCost baseSalePrice'
        }
      });
  }

  static async updateItem(id, updateData) {
    return await Item.findOneAndUpdate(
      { _id: id, deleted: false },
      updateData,
      { new: true, runValidators: true }
    ).populate('subcategory', 'name category');
  }

  static async deleteItem(id) {
    return await Item.findOneAndUpdate(
      { _id: id, deleted: false },
      { deleted: true },
      { new: true }
    );
  }

  static async getItemByName(name, subcategoryId) {
    return await Item.findOne({ 
      name: new RegExp(`^${name}$`, 'i'),
      subcategory: subcategoryId,
      deleted: false 
    });
  }

  static async updatePrices(id, productionCost, salePrice) {
    return await Item.findOneAndUpdate(
      { _id: id, deleted: false },
      { 
        productionCost: productionCost,
        salePrice: salePrice 
      },
      { new: true }
    );
  }

  static async updateVariety(id, variety) {
    return await Item.findOneAndUpdate(
        { _id: id, deleted: false },
        { variety },
        { new: true }
    );
  }

  static async getItemsByVariety(variety, subcategoryId = null) {
    const query = { 
        deleted: false,
        variety: new RegExp(variety, 'i')
    };
    
    if (subcategoryId) {
        query.subcategory = subcategoryId;
    }

    return await Item.find(query)
        .populate({
            path: 'subcategory',
            select: 'name category',
            populate: {
                path: 'category',
                select: 'name'
            }
        });
  }
}

module.exports = {
  CategoryService,
  SubcategoryService,
  ItemService
};