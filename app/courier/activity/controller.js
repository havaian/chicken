const Courier = require("../model");
const DailyActivity = require("./model");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { logger, readLog } = require("../../utils/logs");

// Helper function to check if a string is a valid ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Create a new daily activity
exports.createDailyActivity = async (req, res) => {
  try {
    const { courier } = req.body;

    // Ensure the date is stripped of time for comparison
    const startOfDay = new Date();
    if (isNaN(startOfDay.getTime())) {
      return res.status(400).json({ message: "❌ Invalid date format." });
    }
    startOfDay.setHours(11, 0, 0, 0);

    // Check if an activity already exists for the given courier and date
    const existingActivity = await DailyActivity.findOne({
      courier: courier,
      date: startOfDay,
    });

    if (existingActivity) {
      logger.info(
        "❌ Activity for this courier on the given date already exists."
      );
      return res.status(400).json({
        message:
          "❌ Activity for this courier on the given date already exists.",
      });
    }

    // Create new daily activity
    const activity = new DailyActivity({ ...req.body, date: startOfDay });
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
        $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
      },
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
    const { courierId } = req.params;
    const today = new Date();
    today.setHours(11, 0, 0, 0);

    // Check if courierId is a valid ObjectId
    let courierExists;
    if (ObjectId.isValid(courierId)) {
      courierExists = await Courier.findById(courierId);
    }

    // If not found by ObjectId, try to find by phone_num
    if (!courierExists) {
      courierExists = await Courier.findOne({ phone_num: courierId });
    }

    if (!courierExists) {
      return res.status(404).json({ message: "❌ Courier not found." });
    }

    let activity = await DailyActivity.findOne({
      courier: courierExists._id,
      date: today,
    });

    if (!activity) {
      activity = await this.createTodaysActivity(courierExists._id);
    }

    res.status(200).json(activity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.createTodaysActivity = async (courierId) => {
  const lastActivity = await DailyActivity.findOne({ courier: courierId }).sort(
    { date: -1 }
  );

  // Create a new date instance for today
  const today = new Date();
  today.setHours(11, 0, 0, 0);

  const todayActivity = new DailyActivity({
    courier: courierId,
    date: today,
    by_morning: lastActivity ? lastActivity.current : 0,
    current: lastActivity ? lastActivity.current : 0,
    broken: 0,
    earnings: 0,
    expenses: 0,
  });

  await todayActivity.save();
  return todayActivity;
};

// Update an activity by ID
exports.updateActivityById = async (req, res) => {
  try {
    const activity = await DailyActivity.findByIdAndUpdate(
      req.params.id,
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
    const activity = await DailyActivity.findByIdAndDelete(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: "❌ Activity not found" });
    }
    res.status(200).json({ message: "✅ Activity deleted successfully" });
  } catch (error) {
    logger.info(error);
    res.status(400).json({ message: error.message });
  }
};
