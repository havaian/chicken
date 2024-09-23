const Courier = require("./model");
const { logger, readLog } = require("../utils/logging");

const redisUtils = require('../utils/redis/courierActivity');

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
  
exports.getCourierById = async (req, res) => {
  try {
    const courier = await redisUtils.getOrSetCourier(req.params.id, async () => {
      const searchCriteria = {};
      if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        searchCriteria._id = req.params.id;
      } else {
        searchCriteria.phone_num = req.params.id;
      }

      return await Courier.findOne(searchCriteria);
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

    // Update Redis cache
    await redisUtils.updateCourier(courier.phone_num, courier);

    res.status(200).json(courier);
  } catch (error) {
    logger.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Remember to invalidate cache when deleting a courier
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

    // Invalidate Redis cache
    await redisUtils.invalidateCourier(req.params.id);
    await redisUtils.invalidateCourierActivity(req.params.id);

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