const DailyActivity = require("./model");
const { logger, readLog } = require("../../utils/logs");
const moment = require('moment-timezone');

// Function to get 6 a.m. in UTC+5 for the current day
const getSixAMUTCPlusFive = () => {
  const timeZone = 'Asia/Tashkent'; // UTC+5
  const sixAM = moment.tz(timeZone).set({ hour: 6, minute: 0, second: 0, millisecond: 0 });
  return sixAM;
};

// Example usage
const todaySixAM = getSixAMUTCPlusFive().format();

// Create a new daily activity
exports.createDailyActivity = async (req, res) => {
  try {
    const date = todaySixAM;

    // Ensure the date is stripped of time for comparison
    if (isNaN(date.getTime())) {
      return res.status(400).json({ message: "❌ Invalid date format." });
    }

    // Check if an activity already exists for the given date
    const existingActivity = await DailyActivity.findOne({ 
      date: date
    });

    if (existingActivity) {
      return res.status(400).json({ message: "❌ Activity on the given date already exists." });
    }

    // Create new daily activity
    const activity = new DailyActivity({ ...req.body, date: date });
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
    const activities = await DailyActivity.find();
    res.status(200).json(activities);
  } catch (error) {
    logger.info(error);
    res.status(400).json({ message: error.message });
  }
};

// Get activities for the last 30 days
exports.getLast30DaysActivities = async (req, res) => {
  try {
    const activities = await DailyActivity.find({
      date: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 30))
      }
    });
    res.status(200).json(activities);
  } catch (error) {
    logger.info(error);
    res.status(400).json({ message: error.message });
  }
};

// Get today's activity
exports.getTodaysActivity = async (req, res) => {
  try {
    const date = todaySixAM;

    let activity = await DailyActivity.findOne({ date: date });
    
    if (!activity) {
      activity = await createTodaysActivity();
    }

    res.status(200).json(activity);
  } catch (error) {
    logger.info(error);
    res.status(400).json({ message: error.message });
  }
};

const createTodaysActivity = async () => {
  const lastActivity = await DailyActivity.findOne().sort({ date: -1 });

  const todayActivity = new DailyActivity({
    date: todaySixAM,
    by_morning: lastActivity ? lastActivity.current : 0,
    current: lastActivity ? lastActivity.current : 0,
    accepted: 0
  });

  await todayActivity.save();
  return todayActivity;
};

// Update an activity by ID or today's activity if no ID is provided
exports.updateActivityById = async (req, res) => {
  try {
    let activity;
    
    if (req.params.id) {
      req.body.date = todaySixAM;

      activity = await DailyActivity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!activity) {
        return res.status(404).json({ message: "❌ Activity not found" });
      }
    } else {
      req.body.date = todaySixAM;
      activity = await DailyActivity.findOneAndUpdate({ date: todaySixAM }, req.body, { new: true, runValidators: true });
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
      activity = await DailyActivity.findByIdAndDelete(req.params.id);
      if (!activity) {
        return res.status(404).json({ message: "❌ Activity not found" });
      }
    } else {
      activity = await DailyActivity.findOneAndDelete({ date: todaySixAM });
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
