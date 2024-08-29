const DailyActivity = require("./model");
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

// Create a new daily activity
exports.createDailyActivity = async (req, res) => {
  try {
    const lastActivity = await DailyActivity.findOne().sort({ date: -1 });
  
    const todayActivity = new DailyActivity({
      ...req.body,
      date: getCurrentDayStart().toDate(),
      by_morning: lastActivity ? lastActivity.current : {},
      current: lastActivity ? lastActivity.current : {},
      accepted: []
    });
  
    await todayActivity.save();
    res.status(201).json(todayActivity);
  } catch (error) {
    logger.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Get all activities
exports.getAllActivities = async (req, res) => {
  try {
    const activities = await DailyActivity.find();
    res.status(200).json(activities);
  } catch (error) {
    logger.error(error);
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
    logger.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Get today's activity
exports.getTodaysActivity = async (req, res) => {
  try {
    const dayStart = getCurrentDayStart();
    const dayEnd = moment(dayStart).add(1, 'day');

    let activity = await DailyActivity.findOne({
      date: {
        $gte: dayStart.toDate(),
        $lt: dayEnd.toDate()
      }
    });
    
    if (!activity) {
      activity = await createTodaysActivity();
    }

    res.status(200).json(activity);
  } catch (error) {
    logger.error(error);
    res.status(400).json({ message: error.message });
  }
};

const createTodaysActivity = async () => {
  const lastActivity = await DailyActivity.findOne().sort({ date: -1 });

  const todayActivity = new DailyActivity({
    date: getCurrentDayStart().toDate(),
    by_morning: lastActivity ? lastActivity.current : {},
    current: lastActivity ? lastActivity.current : {},
    accepted: []
  });

  await todayActivity.save();
  return todayActivity;
};

// Update an activity by ID or today's activity if no ID is provided
exports.updateActivityById = async (req, res) => {
  try {
    let activity;
    
    if (req.params.id) {
      activity = await DailyActivity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!activity) {
        return res.status(404).json({ message: "❌ Activity not found" });
      }
    } else {
      const dayStart = getCurrentDayStart();
      const dayEnd = moment(dayStart).add(1, 'day');
      
      activity = await DailyActivity.findOneAndUpdate(
        { 
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
    logger.error(error);
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
      const dayStart = getCurrentDayStart();
      const dayEnd = moment(dayStart).add(1, 'day');
      
      activity = await DailyActivity.findOneAndDelete({
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
    logger.error(error);
    res.status(400).json({ message: error.message });
  }
};
// Get activity by date
exports.getActivityByDate = async (req, res) => {
  try {
    const { date } = req.params; // Expecting date in format YYYY-MM-DD
    
    // Parse the input date
    const inputDate = moment.tz(date, 'YYYY-MM-DD', 'Asia/Tashkent');
    
    // Set the start time to 6 a.m. of the input date
    const startTime = inputDate.clone().startOf('day').add(6, 'hours');
    
    // Set the end time to 6 a.m. of the next day
    const endTime = startTime.clone().add(1, 'day');

    // Find the activity within the time range
    const activity = await DailyActivity.findOne({
      date: {
        $gte: startTime.toDate(),
        $lt: endTime.toDate()
      }
    });

    if (!activity) {
      return res.status(404).json({ message: "No activity found for the given date." });
    }

    res.status(200).json(activity);
  } catch (error) {
    logger.error(error);
    res.status(400).json({ message: error.message });
  }
};
