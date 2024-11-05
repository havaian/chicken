const UnitService = require('./service');
const { logger } = require('../../utils/logging');

class UnitController {
    static async getAllUnits(req, res) {
        try {
            const units = await UnitService.getAllUnits();
            res.status(200).json(units);
        } catch (error) {
            logger.error(error);
            res.status(400).json({ message: error.message });
        }
    }

    static async getItemsByUnit(req, res) {
        try {
            const { unit } = req.params;
            
            if (!UnitService.isValidUnit(unit)) {
                return res.status(400).json({ message: "❌ Invalid unit specified" });
            }

            const items = await UnitService.getItemsByUnit(unit);
            res.status(200).json(items);
        } catch (error) {
            logger.error(error);
            res.status(400).json({ message: error.message });
        }
    }

    static async updateUnits(req, res) {
        try {
            const updates = req.body;
            
            // Validate updates structure
            if (!updates.categories && !updates.subcategories && !updates.items) {
                return res.status(400).json({ 
                    message: "❌ No updates provided" 
                });
            }

            // Validate all units in updates
            const allUpdates = [
                ...(updates.categories || []),
                ...(updates.subcategories || []),
                ...(updates.items || [])
            ];

            for (const update of allUpdates) {
                if (!UnitService.isValidUnit(update.unit)) {
                    return res.status(400).json({ 
                        message: `❌ Invalid unit specified: ${update.unit}` 
                    });
                }
            }

            const results = await UnitService.updateUnits(updates);
            res.status(200).json(results);
        } catch (error) {
            logger.error(error);
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = UnitController;