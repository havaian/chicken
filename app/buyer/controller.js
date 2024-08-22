const Buyer = require("./model");
const { logger, readLog } = require("../utils/logging");

const mongoose = require("mongoose");

// Create a new buyer
exports.createBuyer = async (req, res) => {
  try {
    const buyer = new Buyer(req.body);
    await buyer.save();
    res.status(201).json(buyer);
  } catch (error) {
    logger.info(error);
    res.status(400).json({ message: error.message });
  }
};

// Get all buyers (non-deleted only)
exports.getAllBuyers = async (req, res) => {
  try {
    const buyers = await Buyer.find({ deleted: false });
    res.status(200).json(buyers);
  } catch (error) {
    logger.info(error);
    res.status(400).json({ message: error.message });
  }
};

// Get a single buyer by ID (including deleted)
exports.getBuyerById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the id is a valid ObjectId
    const isObjectId = mongoose.Types.ObjectId.isValid(id);

    const buyer = await Buyer.findOne({
      $or: [
        isObjectId ? { _id: id } : null,        // Search by _id if valid ObjectId
        { full_name: id },                      // Search by full_name
        { phone_num: id },                      // Search by phone_num
      ].filter(Boolean), // Filter out nulls (for invalid ObjectId cases)
    });

    if (!buyer) {
      return res.status(404).json({ message: "❌ Buyer not found" });
    }

    res.status(200).json(buyer);
  } catch (error) {
    logger.info(error);
    res.status(400).json({ message: error.message });
  }
};

// Function to get buyers by full name (partial or complete match, non-deleted only)
exports.getBuyersByName = async (req, res) => {
  try {
    const nameQuery = req.body.client_name;
    const buyers = await Buyer.find({
      full_name: new RegExp(nameQuery, "i"),
      deleted: false,
      $or: [
        { deactivated: false },
        { deactivated: { $exists: false } }
      ]
    }).limit(50);
    if (buyers.length === 0) {
      return res.status(404).json({ message: "❌ No buyers found" });
    }
    res.status(200).json(buyers);
  } catch (error) {
    logger.info(error);
    res.status(400).json({ message: error.message });
  }
};

// Update a buyer by ID
exports.updateBuyerById = async (req, res) => {
  try {
    const buyer = await Buyer.findOneAndUpdate(
      { $or: [{ phone_num: req.params.id }, { _id: req.params.id }] },
      req.body,
      { new: true, runValidators: true }
    );
    if (!buyer) {
      return res.status(404).json({ message: "❌ Buyer not found" });
    }
    res.status(200).json(buyer);
  } catch (error) {
    logger.info(error);
    res.status(400).json({ message: error.message });
  }
};

// Soft delete a buyer by ID (set deleted to true)
exports.deleteBuyerById = async (req, res) => {
  try {
    const buyer = await Buyer.findOneAndUpdate(
      { phone_num: req.params.id, deleted: false },
      { deleted: true },
      { new: true }
    );
    if (!buyer) {
      return res.status(404).json({ message: "❌ Buyer not found or already deleted" });
    }
    res.status(200).json({ message: "✅ Buyer soft deleted successfully" });
  } catch (error) {
    logger.info(error);
    res.status(400).json({ message: error.message });
  }
};

// Function to find closest location (non-deleted only)
exports.findClosestLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    // Validate lat and lng are present
    if (!lat || !lng) {
      return res
        .status(400)
        .json({ message: "❌ Latitude and longitude are required" });
    }

    // Query to find the closest locations
    const closestBuyers = await Buyer.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)], // MongoDB expects [longitude, latitude]
          },
          $maxDistance: 10000000, // Adjust max distance as needed (in meters)
        },
      },
      deleted: false, // Only consider non-deleted buyers
    }).limit(5); // Limiting to 5 closest locations

    if (closestBuyers.length === 0) {
      return res.status(404).json({ message: "❌ No closest locations found" });
    }

    // Prepare response with full info
    const closestLocations = closestBuyers.map((buyer) => ({
      _id: buyer._id,
      full_name: buyer.full_name,
      resp_person: buyer.resp_person,
      phone_num: buyer.phone_num,
      location: buyer.location,
    }));

    res.status(200).json(closestLocations);
  } catch (error) {
    logger.info(error);
    res.status(500).json({ message: "❌ Internal server error" });
  }
};