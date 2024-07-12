const express = require("express");
const router = express.Router();
const courierController = require("./controller");
const activityRoutes = require("./activity/routes");

const cron = require("./activity/cron");

// Use activity routes
router.use("/activity", activityRoutes);

// Create a new courier
router.post("/new/", courierController.createCourier);

// Get all couriers
router.get("/all", courierController.getAllCouriers);

// Get a single courier by ID
router.get("/:id", courierController.getCourierById);

// Update a courier by ID
router.put("/:id", courierController.updateCourierById);

// Delete a courier by ID
router.delete("/:id", courierController.deleteCourierById);

module.exports = router;
