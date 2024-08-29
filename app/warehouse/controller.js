const Warehouse = require("./model");
const { logger, readLog } = require("../utils/logging");

// Create a new warehouse
exports.createWarehouse = async (req, res) => {
  try {
    const warehouse = new Warehouse(req.body);
    await warehouse.save();
    res.status(201).json(warehouse);
  } catch (error) {
    logger.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Get all warehouses
exports.getAllWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.find();
    res.status(200).json(warehouses);
  } catch (error) {
    logger.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Get a single warehouse by phone number or ID
exports.getWarehouseById = async (req, res) => {
  try {
    const searchCriteria = {};
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      searchCriteria._id = req.params.id;
    } else {
      searchCriteria.phone_num = req.params.id;
    }

    const warehouse = await Warehouse.findOne(searchCriteria);
    if (!warehouse) {
      return res.status(404).json({ message: "❌ Warehouse not found" });
    }
    res.status(200).json(warehouse);
  } catch (error) {
    logger.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Update a warehouse by phone number or ID
exports.updateWarehouseById = async (req, res) => {
  try {
    const searchCriteria = {};
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      searchCriteria._id = req.params.id;
    } else {
      searchCriteria.phone_num = req.params.id;
    }

    const warehouse = await Warehouse.findOneAndUpdate(
      searchCriteria,
      req.body,
      { new: true, runValidators: true }
    );
    if (!warehouse) {
      return res.status(404).json({ message: "❌ Warehouse not found" });
    }
    res.status(200).json(warehouse);
  } catch (error) {
    logger.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Delete a warehouse by ID
exports.deleteWarehouseById = async (req, res) => {
  try {
    const warehouse = await Warehouse.findOneAndDelete({
      phone_num: req.params.id,
    });
    if (!warehouse) {
      return res.status(404).json({ message: "❌ Warehouse not found" });
    }
    res.status(200).json({ message: "✅ Warehouse deleted successfully" });
  } catch (error) {
    logger.error(error);
    res.status(400).json({ message: error.message });
  }
};
