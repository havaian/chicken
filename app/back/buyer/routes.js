const express = require('express');
const router = express.Router();
const buyerController = require('./controller');
const activityRoutes = require('./activity/routes');

const cron = require('./activity/cron');

// Use activity routes
router.use('/activity', activityRoutes);

// Create a new buyer
router.post('/new/', buyerController.createBuyer);

// Get all buyers
router.get('/all', buyerController.getAllBuyers);

// Get a single buyer by ID
router.get('/:id', buyerController.getBuyerById);

// Update a buyer by ID
router.put('/:id', buyerController.updateBuyerById);

// Delete a buyer by ID
router.delete('/:id', buyerController.deleteBuyerById);

module.exports = router;
