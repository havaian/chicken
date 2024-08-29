const Courier = require("./model");
const { logger, readLog } = require("../utils/logging");

// Create a new courier
exports.createCourier = async (req, res) => {
  try {
    const courier = new Courier(req.body);
    await courier.save();
    res.status(201).json(courier);
  } catch (error) {
    logger.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Get all couriers (non-deleted only)
exports.getAllCouriers = async (req, res) => {
  try {
    const couriers = await Courier.find({ deleted: false });
    res.status(200).json(couriers);
  } catch (error) {
    logger.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Get a single courier by phone number or ID (including deleted)
exports.getCourierById = async (req, res) => {
  try {
    const searchCriteria = {};
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      searchCriteria._id = req.params.id;
    } else {
      searchCriteria.phone_num = req.params.id;
    }

    const courier = await Courier.findOne(searchCriteria);
    if (!courier) {
      return res.status(404).json({ message: "❌ Courier not found" });
    }
    res.status(200).json(courier);
  } catch (error) {
    logger.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Update a courier by phone number or ID
exports.updateCourierById = async (req, res) => {
  try {
    const searchCriteria = {};
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      searchCriteria._id = req.params.id;
    } else {
      searchCriteria.phone_num = req.params.id;
    }

    const courier = await Courier.findOneAndUpdate(searchCriteria, req.body, {
      new: true,
      runValidators: true,
    });
    if (!courier) {
      return res.status(404).json({ message: "❌ Courier not found" });
    }
    res.status(200).json(courier);
  } catch (error) {
    logger.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Soft delete a courier by ID (set deleted to true)
exports.deleteCourierById = async (req, res) => {
  try {
    const courier = await Courier.findOneAndUpdate(
      { phone_num: req.params.id, deleted: false },
      { deleted: true },
      { new: true }
    );
    if (!courier) {
      return res.status(404).json({ message: "❌ Courier not found or already deleted" });
    }
    res.status(200).json({ message: "✅ Courier soft deleted successfully" });
  } catch (error) {
    logger.error(error);
    res.status(400).json({ message: error.message });
  }
};

// New function to get couriers by name (partial or complete match, non-deleted only)
exports.getCouriersByName = async (req, res) => {
  try {
    const nameQuery = req.body.courier_name;
    const couriers = await Courier.find({
      full_name: new RegExp(nameQuery, "i"),
      deleted: false
    }).limit(50);
    if (couriers.length === 0) {
      return res.status(404).json({ message: "❌ No couriers found" });
    }
    res.status(200).json(couriers);
  } catch (error) {
    logger.error(error);
    res.status(400).json({ message: error.message });
  }
};