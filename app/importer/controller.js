const Importer = require("./model");
const { logger, readLog } = require("../utils/logging");

// Create a new importer
exports.createImporter = async (req, res) => {
  try {
    const importer = new Importer(req.body);
    await importer.save();
    res.status(201).json(importer);
  } catch (error) {
    logger.info(error);
    res.status(400).json({ message: error.message });
  }
};

// Get all importers
exports.getAllImporters = async (req, res) => {
  try {
    const importers = await Importer.find();
    res.status(200).json(importers);
  } catch (error) {
    logger.info(error);
    res.status(400).json({ message: error.message });
  }
};

// Get a single importer by ID
exports.getImporterById = async (req, res) => {
  try {
    const importer = await Importer.findOne({
      $or: [
        { full_name: req.params.id },
        { phone_num: req.params.id },
        { _id: req.params.id },
      ],
    });
    if (!importer) {
      return res.status(404).json({ message: "❌ Importer not found" });
    }
    res.status(200).json(importer);
  } catch (error) {
    logger.info(error);
    res.status(400).json({ message: error.message });
  }
};

// Function to get importers by full name (partial or complete match)
exports.getImportersByName = async (req, res) => {
  try {
    const nameQuery = req.body.client_name;
    const importers = await Importer.find({
      full_name: new RegExp(nameQuery, "i"),
    });
    if (importers.length === 0) {
      return res.status(404).json({ message: "❌ No importers found" });
    }
    res.status(200).json(importers);
  } catch (error) {
    logger.info(error);
    res.status(400).json({ message: error.message });
  }
};

// Update a importer by ID
exports.updateImporterById = async (req, res) => {
  try {
    const importer = await Importer.findOneAndUpdate(
      { $or: [{ phone_num: req.params.id }, { _id: req.params.id }] },
      req.body,
      { new: true, runValidators: true }
    );
    if (!importer) {
      return res.status(404).json({ message: "❌ Importer not found" });
    }
    res.status(200).json(importer);
  } catch (error) {
    logger.info(error);
    res.status(400).json({ message: error.message });
  }
};

// Delete a importer by ID
exports.deleteImporterById = async (req, res) => {
  try {
    const importer = await Importer.findOneAndDelete({
      phone_num: req.params.id,
    });
    if (!importer) {
      return res.status(404).json({ message: "❌ Importer not found" });
    }
    res.status(200).json({ message: "✅ Importer deleted successfully" });
  } catch (error) {
    logger.info(error);
    res.status(400).json({ message: error.message });
  }
};
