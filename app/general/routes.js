const express = require("express");
const router = express.Router();
const commonDeliveryController = require("./commonDeliveryController")

// Get activity from both buyer & courier
router.get('/delivery/:deliveryId', commonDeliveryController.getDeliveryById);

// Update activity for both buyer & courier
router.put('/delivery/:deliveryId', commonDeliveryController.updateDeliveryById);

module.exports = router;