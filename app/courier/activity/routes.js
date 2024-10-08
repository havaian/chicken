const express = require("express");
const router = express.Router();
const activityController = require("./controller");

// Create a new daily activity
router.post("/new/", activityController.createDailyActivity);

// Get all activities
router.get("/all", activityController.getAllActivities);

// Get activities for the last 30 days
router.get("/last30days", activityController.getLast30DaysActivities);

// New route to get today's accepted and unfinished activities
router.get("/today/accepted-unfinished", activityController.getTodaysAcceptedUnfinishedActivities);

// New route to get today's accepted and unfinished activities
router.get("/today/unaccepted", activityController.getUnacceptedCouriersForToday);

// Get all today's activities
router.get("/today/all", activityController.getAllTodaysActivities);

// Get today's activity
router.get("/today/:courierId", activityController.getTodaysActivity);

// Update an activity by ID
router.put("/:id", activityController.updateActivityById);

// Delete an activity by ID
router.delete("/:id", activityController.deleteActivityById);

// New route to get activities by date
router.get("/by-date/:date", activityController.getActivitiesByDate);

module.exports = router;
