const express = require("express");
const router = express.Router();
const activityController = require("./controller");

// Create a new daily activity
router.post("/new/", activityController.createDailyActivity);

// Get all activities
router.get("/all", activityController.getAllActivities);

// Get activities for the last 30 days
router.get("/last30days", activityController.getLast30DaysActivities);

// Get today's activity
router.get("/today", activityController.getTodaysActivity);

// Update an activity by ID or today's activity if no ID is provided
router.put("/:id?", activityController.updateActivityById);

// Delete an activity by ID or today's activity if no ID is provided
router.delete("/:id?", activityController.deleteActivityById);

// New route to get activity by date
router.get("/by-date/:date", activityController.getActivityByDate);

module.exports = router;
