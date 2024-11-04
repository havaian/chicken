const express = require("express");
const router = express.Router();
const activityController = require("./controller");

// Generate or retrieve a monthly report
router.get("/monthly-report/:year/:month", activityController.getOrGenerateMonthlyReport);

module.exports = router;
