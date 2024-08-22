const DailyBuyerActivity = require("./model");
const Buyer = require("../model");
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

// Create a new daily buyer activity
exports.createDailyActivity = async (req, res) => {
  try {
    const { buyer } = req.body;
    const dayStart = getCurrentDayStart();

    // Check if an activity already exists for the given buyer and date
    const existingActivity = await DailyBuyerActivity.findOne({
      buyer: buyer,
      date: {
        $gte: dayStart.toDate(),
        $lt: moment(dayStart).add(1, 'day').toDate()
      }
    });

    if (existingActivity) {
      logger.info("❌ Activity for this buyer on the given date already exists.");
      return res.status(400).json({
        message: "❌ Activity for this buyer on the given date already exists.",
      });
    }

    const lastActivity = await DailyBuyerActivity.findOne({ buyer: buyer }).sort({ date: -1 });

    // Create new daily activity
    const activity = new DailyBuyerActivity({
      ...req.body,
      date: dayStart.toDate(),
      debt: lastActivity ? lastActivity.debt : 0
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
    if (req.params.buyerId) {
      options.buyer = req.params.buyerId;
    }
    const activities = await DailyBuyerActivity.find(options);
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
    if (req.params.buyerId) {
      options.buyer = req.params.buyerId;
    }
    const activities = await DailyBuyerActivity.find(options);
    res.status(200).json(activities);
  } catch (error) {
    logger.info(error);
    res.status(400).json({ message: error.message });
  }
};

exports.getAllTodaysActivities = async (req, res) => {
  try {
    const dayStart = getCurrentDayStart();
    const dayEnd = moment(dayStart).add(1, 'day');

    // Get all unique buyers
    const allBuyers = await Buyer.find({}, '_id');

    // Array to store all activities
    let allActivities = [];

    // Process each buyer
    for (const buyer of allBuyers) {
      // Try to find today's activity for the buyer
      let activity = await DailyBuyerActivity.findOne({
        buyer: buyer._id,
        date: {
          $gte: dayStart.toDate(),
          $lt: dayEnd.toDate()
        }
      }).select('_id price debt buyer');

      // If no activity found for today, get the most recent activity
      if (!activity) {
        activity = await DailyBuyerActivity.findOne({
          buyer: buyer._id
        }).sort({ date: -1 }).select('_id price debt buyer');
      }

      // If still no activity found, create a new one with default values
      if (!activity) {
        activity = {
          _id: null,
          price: {}, // You might want to set default prices here
          buyer: buyer._id,
          debt: 0
        };
      }

      // Add the activity to the array
      allActivities.push({
        _id: activity._id,
        price: activity.price,
        buyer: activity.buyer,
        debt: activity.debt
      });
    }

    res.status(200).json(allActivities);
  } catch (error) {
    logger.info(error);
    res.status(500).json({ message: "❌ Error retrieving activities for all buyers", error: error.message });
  }
};

exports.getTodaysActivity = async (req, res) => {
  try {
    const { buyerId } = req.params;
    
    const dayStart = getCurrentDayStart();
    const dayEnd = moment(dayStart).add(1, 'day');

    let buyerExists;

    // Check if buyerId is a valid ObjectId
    if (ObjectId.isValid(buyerId)) {
      buyerExists = await Buyer.findById(buyerId);
    }

    // If not found by ObjectId, try to find by phone_number
    if (!buyerExists) {
      buyerExists = await Buyer.findOne({ phone_num: buyerId });
    }

    if (!buyerExists) {
      return res.status(404).json({ message: "❌ Buyer not found." });
    }

    let activity = await DailyBuyerActivity.findOne({
      buyer: buyerExists._id,
      date: {
        $gte: dayStart.toDate(),
        $lt: dayEnd.toDate()
      }
    });

    if (!activity) {
      activity = await createTodaysActivity(buyerExists._id);
    }

    res.status(200).json(activity);
  } catch (error) {
    logger.info(error);
    res.status(400).json({ message: error.message });
  }
};

const createTodaysActivity = async (buyerId) => {
  const lastActivity = await DailyBuyerActivity.findOne({
    buyer: buyerId,
  }).sort({ date: -1 });

  const todayActivity = new DailyBuyerActivity({
    buyer: buyerId,
    date: getCurrentDayStart().toDate(),
    debt: lastActivity ? lastActivity.debt : 0,
    price: lastActivity ? lastActivity.price : {}
  });

  await todayActivity.save();
  return todayActivity;
};

// Update an activity by ID or today's activity if no ID is provided
exports.updateActivityById = async (req, res) => {
  try {
    let activity;
    
    if (req.params.id) {
      activity = await DailyBuyerActivity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!activity) {
        return res.status(404).json({ message: "❌ Activity not found" });
      }
    } else {
      const dayStart = getCurrentDayStart();
      const dayEnd = moment(dayStart).add(1, 'day');
      
      activity = await DailyBuyerActivity.findOneAndUpdate(
        { 
          buyer: req.body.buyer,
          date: {
            $gte: dayStart.toDate(),
            $lt: dayEnd.toDate()
          }
        }, 
        req.body, 
        { new: true, runValidators: true, upsert: true }
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
      activity = await DailyBuyerActivity.findByIdAndDelete(req.params.id);
      if (!activity) {
        return res.status(404).json({ message: "❌ Activity not found" });
      }
    } else {
      const dayStart = getCurrentDayStart();
      const dayEnd = moment(dayStart).add(1, 'day');
      
      activity = await DailyBuyerActivity.findOneAndDelete({
        buyer: req.body.buyer,
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