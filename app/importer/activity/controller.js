const DailyImporterActivity = require("./model");
const Importer = require("../model");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { logger, readLog } = require("../../utils/logging");
const moment = require('moment-timezone');

// Function to get today's 6 a.m. in UTC+5
const getTodaySixAMUTCPlusFive = () => {
  const timeZone = 'Asia/Tashkent'; // UTC+5
  return moment.tz(timeZone).startOf('day').add(6, 'hours');
};

// Function to get the start of the current "day" (6 a.m. today or 6 a.m. yesterday if it's before 6 a.m.)
const getCurrentDayStart = () => {
  const now = moment.tz('Asia/Tashkent');
  const todaySixAM = getTodaySixAMUTCPlusFive();
  return now.isBefore(todaySixAM) ? todaySixAM.subtract(1, 'day') : todaySixAM;
};

// Create a new daily importer activity
exports.createDailyActivity = async (req, res) => {
  try {
    const { importer } = req.body;
    const dayStart = getCurrentDayStart();

    // Check if an activity already exists for the given importer and date
    const existingActivity = await DailyImporterActivity.findOne({
      importer: importer,
      date: {
        $gte: dayStart.toDate(),
        $lt: moment(dayStart).add(1, 'day').toDate()
      }
    });

    if (existingActivity) {
      logger.info("❌ Activity for this importer on the given date already exists.");
      return res.status(400).json({
        message: "❌ Activity for this importer on the given date already exists.",
      });
    }

    const lastActivity = await DailyImporterActivity.findOne({ importer: importer }).sort({ date: -1 });

    // Create new daily activity
    const activity = new DailyImporterActivity({
      ...req.body,
      date: dayStart.toDate(),
      amount: [],
      // Add any other fields you want to initialize based on the last activity
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
    const thirtyDaysAgo = moment().subtract(30, 'days');
    const options = {
      date: {
        $gte: thirtyDaysAgo.toDate(),
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
    
    const dayStart = getCurrentDayStart();
    const dayEnd = moment(dayStart).add(1, 'day');

    const options = {
      date: {
        $gte: dayStart.toDate(),
        $lt: dayEnd.toDate()
      }
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
      activity = await createTodaysActivity(importerExists._id);
    }

    res.status(200).json(activity);
  } catch (error) {
    logger.info(error);
    res.status(400).json({ message: error.message });
  }
};

const createTodaysActivity = async (importerId) => {
  const lastActivity = await DailyImporterActivity.findOne({
    importer: importerId,
  }).sort({ date: -1 });

  const todayActivity = new DailyImporterActivity({
    importer: importerId,
    date: getCurrentDayStart().toDate(),
    amount: [],
    // Add any other fields you want to initialize based on the last activity
  });

  await todayActivity.save();
  return todayActivity;
};

// Update an activity by ID or today's activity if no ID is provided
exports.updateActivityById = async (req, res) => {
  try {
    let activity;
    
    if (req.params.id) {
      activity = await DailyImporterActivity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!activity) {
        return res.status(404).json({ message: "❌ Activity not found" });
      }
    } else {
      const dayStart = getCurrentDayStart();
      const dayEnd = moment(dayStart).add(1, 'day');
      
      activity = await DailyImporterActivity.findOneAndUpdate(
        { 
          importer: req.body.importer,
          date: {
            $gte: dayStart.toDate(),
            $lt: dayEnd.toDate()
          }
        }, 
        req.body, 
        { new: true, runValidators: true }
      );
      if (!activity) {
        return res.status(404).json({ message: "❌ Today's activity not found" });
      }
    }
    res.status(200).json(activity);
  } catch (error) {
    logger.info(error);
    res.status(400).json({ message: error.message });
  }
};

// Delete an activity by ID or today's activity if no ID is provided
exports.deleteActivityById = async (req, res) => {
  try {
    let activity;
    if (req.params.id) {
      activity = await DailyImporterActivity.findByIdAndDelete(req.params.id);
      if (!activity) {
        return res.status(404).json({ message: "❌ Activity not found" });
      }
    } else {
      const dayStart = getCurrentDayStart();
      const dayEnd = moment(dayStart).add(1, 'day');
      
      activity = await DailyImporterActivity.findOneAndDelete({
        importer: req.body.importer,
        date: {
          $gte: dayStart.toDate(),
          $lt: dayEnd.toDate()
        }
      });
      if (!activity) {
        return res.status(404).json({ message: "❌ Today's activity not found" });
      }
    }
    res.status(200).json({ message: "✅ Activity deleted successfully" });
  } catch (error) {
    logger.info(error);
    res.status(400).json({ message: error.message });
  }
};