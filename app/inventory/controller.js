// controllers/category.controller.js
const { CategoryService } = require('./services');
const { logger } = require('../utils/logging');

class CategoryController {
    static async create(req, res) {
        try {
            const existingCategory = await CategoryService.getCategoryByName(req.body.name);
            if (existingCategory) {
                return res.status(409).json({ message: "❌ Category with this name already exists" });
            }
            const category = await CategoryService.createCategory(req.body);
            res.status(201).json(category);
        } catch (error) {
            logger.error(error);
            res.status(400).json({ message: error.message });
        }
    }

    static async getAll(req, res) {
        try {
            const includeInactive = req.query.includeInactive === 'true';
            const categories = await CategoryService.getAllCategories(includeInactive);
            res.status(200).json(categories);
        } catch (error) {
            logger.error(error);
            res.status(400).json({ message: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const category = await CategoryService.getCategoryById(req.params.id);
            if (!category) {
                return res.status(404).json({ message: "❌ Category not found" });
            }
            res.status(200).json(category);
        } catch (error) {
            logger.error(error);
            res.status(400).json({ message: error.message });
        }
    }

    static async update(req, res) {
        try {
            if (req.body.name) {
                const existingCategory = await CategoryService.getCategoryByName(req.body.name);
                if (existingCategory && existingCategory._id.toString() !== req.params.id) {
                    return res.status(409).json({ message: "❌ Category with this name already exists" });
                }
            }
            const category = await CategoryService.updateCategory(req.params.id, req.body);
            if (!category) {
                return res.status(404).json({ message: "❌ Category not found" });
            }
            res.status(200).json(category);
        } catch (error) {
            logger.error(error);
            res.status(400).json({ message: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const category = await CategoryService.deleteCategory(req.params.id);
            if (!category) {
                return res.status(404).json({ message: "❌ Category not found or already deleted" });
            }
            res.status(200).json({ message: "✅ Category deleted successfully" });
        } catch (error) {
            logger.error(error);
            res.status(400).json({ message: error.message });
        }
    }

    static async updatePrices(req, res) {
        try {
            const { productionCost, salePrice } = req.body;
            const category = await CategoryService.updateBasePrices(
                req.params.id, 
                productionCost, 
                salePrice
            );
            if (!category) {
                return res.status(404).json({ message: "❌ Category not found" });
            }
            res.status(200).json(category);
        } catch (error) {
            logger.error(error);
            res.status(400).json({ message: error.message });
        }
    }
}

// controllers/subcategory.controller.js
const { SubcategoryService } = require('./services');

class SubcategoryController {
    static async create(req, res) {
        try {
            const existingSubcategory = await SubcategoryService.getSubcategoryByName(
                req.body.name,
                req.body.category
            );
            if (existingSubcategory) {
                return res.status(409).json({ 
                    message: "❌ Subcategory with this name already exists in the category" 
                });
            }
            const subcategory = await SubcategoryService.createSubcategory(req.body);
            res.status(201).json(subcategory);
        } catch (error) {
            logger.error(error);
            res.status(400).json({ message: error.message });
        }
    }

    static async getAll(req, res) {
        try {
            const { categoryId } = req.query;
            const includeInactive = req.query.includeInactive === 'true';
            const subcategories = await SubcategoryService.getAllSubcategories(
                categoryId, 
                includeInactive
            );
            res.status(200).json(subcategories);
        } catch (error) {
            logger.error(error);
            res.status(400).json({ message: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const subcategory = await SubcategoryService.getSubcategoryById(req.params.id);
            if (!subcategory) {
                return res.status(404).json({ message: "❌ Subcategory not found" });
            }
            res.status(200).json(subcategory);
        } catch (error) {
            logger.error(error);
            res.status(400).json({ message: error.message });
        }
    }

    static async update(req, res) {
        try {
            const currentSubcategory = await SubcategoryService.getSubcategoryById(req.params.id);
            if (!currentSubcategory) {
                return res.status(404).json({ message: "❌ Subcategory not found" });
            }

            if (req.body.name) {
                const existingSubcategory = await SubcategoryService.getSubcategoryByName(
                    req.body.name,
                    req.body.category || currentSubcategory.category
                );
                if (existingSubcategory && existingSubcategory._id.toString() !== req.params.id) {
                    return res.status(409).json({ 
                        message: "❌ Subcategory with this name already exists in the category" 
                    });
                }
            }

            const subcategory = await SubcategoryService.updateSubcategory(
                req.params.id,
                req.body
            );
            res.status(200).json(subcategory);
        } catch (error) {
            logger.error(error);
            res.status(400).json({ message: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const subcategory = await SubcategoryService.deleteSubcategory(req.params.id);
            if (!subcategory) {
                return res.status(404).json({ message: "❌ Subcategory not found or already deleted" });
            }
            res.status(200).json({ message: "✅ Subcategory deleted successfully" });
        } catch (error) {
            logger.error(error);
            res.status(400).json({ message: error.message });
        }
    }

    static async updatePrices(req, res) {
        try {
            const { productionCost, salePrice } = req.body;
            const subcategory = await SubcategoryService.updatePrices(
                req.params.id,
                productionCost,
                salePrice
            );
            if (!subcategory) {
                return res.status(404).json({ message: "❌ Subcategory not found" });
            }
            res.status(200).json(subcategory);
        } catch (error) {
            logger.error(error);
            res.status(400).json({ message: error.message });
        }
    }
}

// controllers/item.controller.js
const { ItemService } = require('./services');

class ItemController {
    static async create(req, res) {
        try {
            const existingItem = await ItemService.getItemByName(
                req.body.name,
                req.body.subcategory
            );
            if (existingItem) {
                return res.status(409).json({ 
                    message: "❌ Item with this name already exists in the subcategory" 
                });
            }
            const item = await ItemService.createItem(req.body);
            res.status(201).json(item);
        } catch (error) {
            logger.error(error);
            res.status(400).json({ message: error.message });
        }
    }

    static async getAll(req, res) {
        try {
            const { subcategoryId } = req.query;
            const includeInactive = req.query.includeInactive === 'true';
            const items = await ItemService.getAllItems(subcategoryId, includeInactive);
            res.status(200).json(items);
        } catch (error) {
            logger.error(error);
            res.status(400).json({ message: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const item = await ItemService.getItemById(req.params.id);
            if (!item) {
                return res.status(404).json({ message: "❌ Item not found" });
            }
            res.status(200).json(item);
        } catch (error) {
            logger.error(error);
            res.status(400).json({ message: error.message });
        }
    }

    static async update(req, res) {
        try {
            const currentItem = await ItemService.getItemById(req.params.id);
            if (!currentItem) {
                return res.status(404).json({ message: "❌ Item not found" });
            }

            if (req.body.name) {
                const existingItem = await ItemService.getItemByName(
                    req.body.name,
                    req.body.subcategory || currentItem.subcategory
                );
                if (existingItem && existingItem._id.toString() !== req.params.id) {
                    return res.status(409).json({ 
                        message: "❌ Item with this name already exists in the subcategory" 
                    });
                }
            }

            const item = await ItemService.updateItem(req.params.id, req.body);
            res.status(200).json(item);
        } catch (error) {
            logger.error(error);
            res.status(400).json({ message: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const item = await ItemService.deleteItem(req.params.id);
            if (!item) {
                return res.status(404).json({ message: "❌ Item not found or already deleted" });
            }
            res.status(200).json({ message: "✅ Item deleted successfully" });
        } catch (error) {
            logger.error(error);
            res.status(400).json({ message: error.message });
        }
    }

    static async updatePrices(req, res) {
        try {
            const { productionCost, salePrice } = req.body;
            const item = await ItemService.updatePrices(
                req.params.id,
                productionCost,
                salePrice
            );
            if (!item) {
                return res.status(404).json({ message: "❌ Item not found" });
            }
            res.status(200).json(item);
        } catch (error) {
            logger.error(error);
            res.status(400).json({ message: error.message });
        }
    }

    static async updateVariety(req, res) {
        try {
            const { variety } = req.body;
            const item = await ItemService.updateVariety(req.params.id, variety);
            
            if (!item) {
                return res.status(404).json({ message: "❌ Item not found" });
            }
            
            res.status(200).json(item);
        } catch (error) {
            logger.error(error);
            res.status(400).json({ message: error.message });
        }
    }

    static async getByVariety(req, res) {
        try {
            const { variety, subcategoryId } = req.query;
            
            if (!variety) {
                return res.status(400).json({ message: "❌ Variety parameter is required" });
            }

            const items = await ItemService.getItemsByVariety(variety, subcategoryId);
            res.status(200).json(items);
        } catch (error) {
            logger.error(error);
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = { CategoryController, SubcategoryController, ItemController };