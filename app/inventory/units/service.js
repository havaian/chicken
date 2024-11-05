const UNITS = require('./units');
const { Category, Subcategory, Item } = require('../model');
const mongoose = require('mongoose');

class UnitService {
    // Get all available units
    static async getAllUnits() {
        return Object.entries(UNITS).map(([key, value]) => ({
            code: key,
            name: value
        }));
    }

    // Get items using specific unit
    static async getItemsByUnit(unit) {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            // Find all entities using this unit
            const categories = await Category.find({ 
                unit, 
                deleted: false 
            }).session(session);

            const subcategories = await Subcategory.find({ 
                unit, 
                deleted: false 
            }).populate('category', 'name unit').session(session);

            const items = await Item.find({ 
                unit, 
                deleted: false 
            }).populate({
                path: 'subcategory',
                select: 'name unit category',
                populate: {
                    path: 'category',
                    select: 'name unit'
                }
            }).session(session);

            await session.commitTransaction();

            return {
                categories: categories.map(cat => ({
                    _id: cat._id,
                    name: cat.name,
                    unit: cat.unit
                })),
                subcategories: subcategories.map(sub => ({
                    _id: sub._id,
                    name: sub.name,
                    unit: sub.unit,
                    category: {
                        _id: sub.category._id,
                        name: sub.category.name,
                        unit: sub.category.unit
                    }
                })),
                items: items.map(item => ({
                    _id: item._id,
                    name: item.name,
                    unit: item.unit,
                    subcategory: {
                        _id: item.subcategory._id,
                        name: item.subcategory.name,
                        unit: item.subcategory.unit,
                        category: {
                            _id: item.subcategory.category._id,
                            name: item.subcategory.category.name,
                            unit: item.subcategory.category.unit
                        }
                    }
                }))
            };
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    // Check if unit exists
    static isValidUnit(unit) {
        return Object.values(UNITS).includes(unit);
    }

    // Update units in bulk
    static async updateUnits(updates) {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            const results = {
                categories: [],
                subcategories: [],
                items: []
            };

            // Update categories
            if (updates.categories?.length) {
                for (const update of updates.categories) {
                    const category = await Category.findOneAndUpdate(
                        { _id: update.id, deleted: false },
                        { unit: update.unit },
                        { new: true, session }
                    );
                    if (category) results.categories.push(category);
                }
            }

            // Update subcategories
            if (updates.subcategories?.length) {
                for (const update of updates.subcategories) {
                    const subcategory = await Subcategory.findOneAndUpdate(
                        { _id: update.id, deleted: false },
                        { unit: update.unit },
                        { new: true, session }
                    );
                    if (subcategory) results.subcategories.push(subcategory);
                }
            }

            // Update items
            if (updates.items?.length) {
                for (const update of updates.items) {
                    const item = await Item.findOneAndUpdate(
                        { _id: update.id, deleted: false },
                        { unit: update.unit },
                        { new: true, session }
                    );
                    if (item) results.items.push(item);
                }
            }

            await session.commitTransaction();
            return results;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}

module.exports = UnitService;