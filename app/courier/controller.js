const Courier = require("./model");
const { logger, readLog } = require("../utils/logging");

// Create a new courier
exports.createCourier = async (req, res) => {
  try {
    const courier = new Courier(req.body);
    await courier.save();
    res.status(201).json(courier);
  } catch (error) {
    logger.info(error);
    res.status(400).json({ message: error.message });
  }
};

// Get all couriers
exports.getAllCouriers = async (req, res) => {
  try {
    const couriers = await Courier.find();
    res.status(200).json(couriers);
  } catch (error) {
    logger.info(error);
    res.status(400).json({ message: error.message });
  }
};

// Get a single courier by phone number or ID
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
    logger.info(error);
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
    logger.info(error);
    res.status(400).json({ message: error.message });
  }
};

// Delete a courier by ID
exports.deleteCourierById = async (req, res) => {
  try {
    const courier = await Courier.findOneAndDelete({
      phone_num: req.params.id,
    });
    if (!courier) {
      return res.status(404).json({ message: "❌ Courier not found" });
    }
    res.status(200).json({ message: "✅ Courier deleted successfully" });
  } catch (error) {
    logger.info(error);
    res.status(400).json({ message: error.message });
  }
};
