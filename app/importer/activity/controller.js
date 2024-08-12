const DailyImporterActivity = require("./model");
const Importer = require("../model");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { logger, readLog } = require("../../utils/logging");
const moment = require('moment-timezone');

// Function to get 6 a.m. in UTC+5 for the current day
const getSixAMUTCPlusFive = () => {
  const timeZone = 'Asia/Tashkent'; // UTC+5
  const sixAM = moment.tz(timeZone).set({ hour: 6, minute: 0, second: 0, millisecond: 0 });
  return sixAM;
};

// Create a new daily importer activity
exports.createDailyActivity = async (req, res) => {
  try {
    const { importer } = req.body;
    const date = getSixAMUTCPlusFive().format();

    // Ensure the date is stripped of time for comparison
    if (isNaN(date.getTime())) {
      return res.status(400).json({ message: "❌ Invalid date format." });
    }

    // Check if an activity already exists for the given importer and date
    const existingActivity = await DailyImporterActivity.findOne({
      importer: importer,
      date: date,
    });

    if (existingActivity) {
      logger.info(
        "❌ Activity for this importer on the given date already exists."
      );
      return res.status(400).json({
        message:
          "❌ Activity for this importer on the given date already exists.",
      });
    }

    // Create new daily activity
    const activity = new DailyImporterActivity({
      ...req.body,
      date: date,
    });
    await activity.save();
    res.status(201).json(activity);
  } catch (error) {
    logger.info(error);
    res.status(400).json({ message: error.message });
  }
};

// Get all activities
exports.getAllActivities = async (req, res) => {
  try {
    const options = {};
    if (req.params.importerId) {
      options.importer = req.params.importerId;
    }
    const activities = await DailyImporterActivity.find(options);
    res.status(200).json(activities);
  } catch (error) {
    logger.info(error);
    res.status(400).json({ message: error.message });
  }
};

// Get activities for the last 30 days
exports.getLast30DaysActivities = async (req, res) => {
  try {
    const options = {
      date: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
      },
    };
    if (req.params.importerId) {
      options.importer = req.params.importerId;
    }
    const activities = await DailyImporterActivity.find(options);
    res.status(200).json(activities);
  } catch (error) {
    logger.info(error);
    res.status(400).json({ message: error.message });
  }
};

exports.getTodaysActivity = async (req, res) => {
  try {
    const { importerId } = req.params;
    const date = getSixAMUTCPlusFive().format();
    const options = {
      date: date,
    };

    let importerExists;

    // Check if importerId is a valid ObjectId
    if (ObjectId.isValid(importerId)) {
      importerExists = await Importer.findById(importerId);
    }

    // If not found by ObjectId, try to find by phone_number
    if (!importerExists) {
      importerExists = await Importer.findOne({ phone_num: importerId });
    }

    if (!importerExists) {
      return res.status(404).json({ message: "❌ Importer not found." });
    }

    options.importer = importerExists._id;

    let activity = await DailyImporterActivity.findOne(options);

    if (!activity) {
      activity = await this.createTodaysActivity(importerExists._id);
    }

    res.status(200).json(activity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.createTodaysActivity = async (importerId) => {
  const lastActivity = await DailyImporterActivity.findOne({
    importer: importerId,
  }).sort({ date: -1 });

  const todayActivity = new DailyImporterActivity({
    importer: importerId,
    date: getSixAMUTCPlusFive().format(),
    amount: [],
  });

  await todayActivity.save();
  return todayActivity;
};

// Update an activity by ID
exports.updateActivityById = async (req, res) => {
  try {
    const { id } = req.params;
    req.body.date = getSixAMUTCPlusFive().format();

    const activity = await DailyImporterActivity.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!activity) {
      return res.status(404).json({ message: "❌ Activity not found" });
    }
    res.status(200).json(activity);
  } catch (error) {
    logger.info(error);
    res.status(400).json({ message: error.message });
  }
};

// Delete an activity by ID
exports.deleteActivityById = async (req, res) => {
  try {
    const { id } = req.params;

    const activity = await DailyImporterActivity.findByIdAndDelete(id);
    if (!activity) {
      return res.status(404).json({ message: "❌ Activity not found" });
    }
    res.status(200).json({ message: "✅ Activity deleted successfully" });
  } catch (error) {
    logger.info(error);
    res.status(400).json({ message: error.message });
  }
};
