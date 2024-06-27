const Buyer = require('./model');

// Create a new buyer
exports.createBuyer = async (req, res) => {
    try {
        const buyer = new Buyer(req.body);
        await buyer.save();
        res.status(201).json(buyer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all buyers
exports.getAllBuyers = async (req, res) => {
    try {
        const buyers = await Buyer.find();
        res.status(200).json(buyers);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get a single buyer by ID
exports.getBuyerById = async (req, res) => {
    try {
        const buyer = await Buyer.findById(req.params.id);
        if (!buyer) return res.status(404).json({ message: 'Buyer not found' });
        res.status(200).json(buyer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a buyer by ID
exports.updateBuyerById = async (req, res) => {
    try {
        const buyer = await Buyer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!buyer) return res.status(404).json({ message: 'Buyer not found' });
        res.status(200).json(buyer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a buyer by ID
exports.deleteBuyerById = async (req, res) => {
    try {
        const buyer = await Buyer.findByIdAndDelete(req.params.id);
        if (!buyer) return res.status(404).json({ message: 'Buyer not found' });
        res.status(200).json({ message: 'Buyer deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
