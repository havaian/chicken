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
        const buyer = await Buyer.findOne({ $or: [{ full_name: req.params.id }, { phone_num: req.params.id }, { _id: req.params.id }]});
        if (!buyer) return res.status(404).json({ message: "❌ Buyer not found" });
        res.status(200).json(buyer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a buyer by ID
exports.updateBuyerById = async (req, res) => {
    try {
        const buyer = await Buyer.findOneAndUpdate({ phone_num: req.params.id }, req.body, { new: true, runValidators: true });
        if (!buyer) return res.status(404).json({ message: "❌ Buyer not found" });
        res.status(200).json(buyer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a buyer by ID
exports.deleteBuyerById = async (req, res) => {
    try {
        const buyer = await Buyer.findOneAndDelete({ phone_num: req.params.id });
        if (!buyer) return res.status(404).json({ message: "❌ Buyer not found" });
        res.status(200).json({ message: "✅ Buyer deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Function to find closest location
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
          $maxDistance: 200, // Adjust max distance as needed (in meters)
        },
      },
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
    console.error(error);
    res.status(500).json({ message: "❌ Internal server error" });
  }
};