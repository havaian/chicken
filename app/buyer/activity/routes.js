const express = require("express");
const router = express.Router();
const activityController = require("./controller");

// Create a new daily buyer activity
router.post("/new/", activityController.createDailyActivity);

// Get all activities
router.get("/all/:buyerId?", activityController.getAllActivities);

// Get activities for the last 30 days
router.get("/last30days/:buyerId?", activityController.getLast30DaysActivities);

// New route to get today's activities for all buyers
router.get("/today/all", activityController.getAllTodaysActivities);

// New route to update today's activities for all buyers
router.put('/update-todays-prices', activityController.updateAllTodaysActivitiesPrices);

// Get today's activity
router.get("/today/:buyerId?", activityController.getTodaysActivity);

// Update an activity by ID
router.put("/:id", activityController.updateActivityById);

// Delete an activity by ID
router.delete("/:id", activityController.deleteActivityById);

module.exports = router;
