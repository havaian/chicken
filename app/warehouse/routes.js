const express = require("express");
const router = express.Router();
const warehouseController = require("./controller");
const activityRoutes = require("./activity/routes");

const cron = require("./activity/cron");

// Use activity routes
router.use("/activity", activityRoutes);

// Create a new warehouse
router.post("/new/", warehouseController.createWarehouse);

// Get all warehouses
router.get("/", warehouseController.getAllWarehouses);

// Get a single warehouse by ID
router.get("/:id", warehouseController.getWarehouseById);

// Update a warehouse by ID
router.put("/:id", warehouseController.updateWarehouseById);

// Delete a warehouse by ID
router.delete("/:id", warehouseController.deleteWarehouseById);

module.exports = router;
