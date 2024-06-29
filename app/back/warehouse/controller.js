const Warehouse = require('./model');

// Create a new warehouse
exports.createWarehouse = async (req, res) => {
    try {
        const warehouse = new Warehouse(req.body);
        await warehouse.save();
        res.status(201).json(warehouse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all warehouses
exports.getAllWarehouses = async (req, res) => {
    try {
        const warehouses = await Warehouse.find();
        res.status(200).json(warehouses);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get a single warehouse by ID
exports.getWarehouseById = async (req, res) => {
    try {
        const warehouse = await Warehouse.findOne({ phone_num: req.params.id });
        if (!warehouse) return res.status(404).json({ message: "❌ Warehouse not found" });
        res.status(200).json(warehouse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a warehouse by ID
exports.updateWarehouseById = async (req, res) => {
    try {
        const warehouse = await Warehouse.findOneAndUpdate({ phone_num: req.params.id }, req.body, { new: true, runValidators: true });
        if (!warehouse) return res.status(404).json({ message: "❌ Warehouse not found" });
        res.status(200).json(warehouse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a warehouse by ID
exports.deleteWarehouseById = async (req, res) => {
    try {
        const warehouse = await Warehouse.findOneAndDelete({ phone_num: req.params.id });
        if (!warehouse) return res.status(404).json({ message: "❌ Warehouse not found" });
        res.status(200).json({ message: "✅ Warehouse deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
