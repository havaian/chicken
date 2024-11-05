// routes/index.js
const express = require('express');
const router = express.Router();

const { CategoryController, SubcategoryController, ItemController } = require("./controller");

/**
 * @route   POST /api/categories
 * @desc    Create a new category
 * @access  Private
 * @body    {
 *            name: string,
 *            description?: string,
 *            baseProductionCost: number,
 *            baseSalePrice: number,
 *            unit: string,
 *            active?: boolean,
 *            properties?: object
 *          }
 */
router.post('/category/', CategoryController.create);

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Private
 * @query   includeInactive: boolean
 */
router.get('/category/', CategoryController.getAll);

/**
 * @route   GET /api/categories/:id
 * @desc    Get category by ID
 * @access  Private
 */
router.get('/category/:id', CategoryController.getById);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category
 * @access  Private
 */
router.put('/category/:id', CategoryController.update);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category (soft delete)
 * @access  Private
 */
router.delete('/category/:id', CategoryController.delete);

/**
 * @route   PATCH /api/categories/:id/prices
 * @desc    Update category prices
 * @access  Private
 * @body    {
 *            productionCost: number,
 *            salePrice: number
 *          }
 */
router.patch('/category/:id/prices', CategoryController.updatePrices);

/**
 * @route   POST /api/subcategories
 * @desc    Create a new subcategory
 * @access  Private
 * @body    {
 *            name: string,
 *            description?: string,
 *            category: ObjectId,
 *            productionCost: number,
 *            salePrice: number,
 *            active?: boolean,
 *            properties?: object
 *          }
 */
router.post('/subcategory/', SubcategoryController.create);

/**
 * @route   GET /api/subcategories
 * @desc    Get all subcategories
 * @access  Private
 * @query   categoryId?: ObjectId
 * @query   includeInactive?: boolean
 */
router.get('/subcategory/', SubcategoryController.getAll);

/**
 * @route   GET /api/subcategories/:id
 * @desc    Get subcategory by ID
 * @access  Private
 */
router.get('/subcategory/:id', SubcategoryController.getById);

/**
 * @route   PUT /api/subcategories/:id
 * @desc    Update subcategory
 * @access  Private
 */
router.put('/subcategory/:id', SubcategoryController.update);

/**
 * @route   DELETE /api/subcategories/:id
 * @desc    Delete subcategory (soft delete)
 * @access  Private
 */
router.delete('/subcategory/:id', SubcategoryController.delete);

/**
 * @route   PATCH /api/subcategories/:id/prices
 * @desc    Update subcategory prices
 * @access  Private
 * @body    {
 *            productionCost: number,
 *            salePrice: number
 *          }
 */
router.patch('/subcategory/:id/prices', SubcategoryController.updatePrices);

/**
 * @route   POST /api/items
 * @desc    Create a new item
 * @access  Private
 * @body    {
 *            name: string,
 *            description?: string,
 *            subcategory: ObjectId,
 *            productionCost: number,
 *            salePrice: number,
 *            active?: boolean,
 *            properties?: object
 *          }
 */
router.post('/item/', ItemController.create);

/**
 * @route   GET /api/items
 * @desc    Get all items
 * @access  Private
 * @query   subcategoryId?: ObjectId
 * @query   includeInactive?: boolean
 */
router.get('/item/', ItemController.getAll);

/**
 * @route   GET /api/items/:id
 * @desc    Get item by ID
 * @access  Private
 */
router.get('/item/:id', ItemController.getById);

/**
 * @route   PUT /api/items/:id
 * @desc    Update item
 * @access  Private
 */
router.put('/item/:id', ItemController.update);

/**
 * @route   DELETE /api/items/:id
 * @desc    Delete item (soft delete)
 * @access  Private
 */
router.delete('/item/:id', ItemController.delete);

/**
 * @route   PATCH /api/items/:id/prices
 * @desc    Update item prices
 * @access  Private
 * @body    {
 *            productionCost: number,
 *            salePrice: number
 *          }
 */
router.patch('/item/:id/prices', ItemController.updatePrices);

/**
 * @route   PATCH /api/items/:id/variety
 * @desc    Update item variety
 * @access  Private
 * @body    {
 *            variety: string
 *          }
 */
router.patch('/item/:id/variety', ItemController.updateVariety);

/**
 * @route   GET /api/items/variety
 * @desc    Get items by variety
 * @access  Private
 * @query   variety: string
 * @query   subcategoryId?: ObjectId
 */
router.get('/item/variety', ItemController.getByVariety);

router.use('/unit', require('./units/routes'));

module.exports = router;