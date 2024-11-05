const express = require('express');
const router = express.Router();
const UnitController = require('./controller');

/**
 * @route   GET /api/units
 * @desc    Get all available units
 * @access  Private
 */
router.get('/', UnitController.getAllUnits);

/**
 * @route   GET /api/units/:unit/items
 * @desc    Get all items using specific unit
 * @access  Private
 */
router.get('/:unit/items', UnitController.getItemsByUnit);

/**
 * @route   PATCH /api/units
 * @desc    Update units in bulk
 * @access  Private
 * @body    {
 *            categories?: Array<{id: string, unit: string}>,
 *            subcategories?: Array<{id: string, unit: string}>,
 *            items?: Array<{id: string, unit: string}>
 *          }
 */
router.patch('/', UnitController.updateUnits);

module.exports = router;