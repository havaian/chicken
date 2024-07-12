const express = require("express");
const router = express.Router();
const importerController = require("./controller");
const activityRoutes = require("./activity/routes");

const cron = require("./activity/cron");

// Use activity routes
router.use("/activity", activityRoutes);

// Create a new buyer
router.post("/new/", importerController.createImporter);

// Get all importers
router.get("/all", importerController.getAllImporters);

// Get a single buyer by ID
router.get("/:id", importerController.getImporterById);

// Update a buyer by ID
router.put("/:id", importerController.updateImporterById);

// Delete a buyer by ID
router.delete("/:id", importerController.deleteImporterById);

module.exports = router;
