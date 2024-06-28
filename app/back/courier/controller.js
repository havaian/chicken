const Courier = require('./model');

// Create a new courier
exports.createCourier = async (req, res) => {
    try {
        const courier = new Courier(req.body);
        await courier.save();
        res.status(201).json(courier);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all couriers
exports.getAllCouriers = async (req, res) => {
    try {
        const couriers = await Courier.find();
        res.status(200).json(couriers);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get a single courier by ID
exports.getCourierById = async (req, res) => {
    try {
        const courier = await Courier.findById(req.params.id);
        if (!courier) return res.status(404).json({ message: "❌ Courier not found" });
        res.status(200).json(courier);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a courier by ID
exports.updateCourierById = async (req, res) => {
    try {
        const courier = await Courier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!courier) return res.status(404).json({ message: "❌ Courier not found" });
        res.status(200).json(courier);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a courier by ID
exports.deleteCourierById = async (req, res) => {
    try {
        const courier = await Courier.findByIdAndDelete(req.params.id);
        if (!courier) return res.status(404).json({ message: "❌ Courier not found" });
        res.status(200).json({ message: "✅ Courier deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
