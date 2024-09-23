const Courier = require("../model");
const DailyActivity = require("./model");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { logger, readLog } = require("../../utils/logging");
const moment = require('moment-timezone');

const redisUtils = require('../../utils/redis/courierActivity');

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
    const { courier } = req.body;
    const dayStart = getCurrentDayStart();

    // Check if an activity already exists for the given courier and date
    const existingActivity = await DailyActivity.findOne({
      courier: courier,
      date: {
        $gte: dayStart.toDate(),
        $lt: moment(dayStart).add(1, 'day').toDate()
      }
    });

    if (existingActivity) {
      logger.info("❌ Activity for this courier on the given date already exists.");
      return res.status(400).json({
        message: "❌ Activity for this courier on the given date already exists.",
      });
    }

    const lastActivity = await DailyActivity.findOne({ courier: courier }).sort({ date: -1 });

    // Create new daily activity
    const activity = new DailyActivity({
      ...req.body,
      date: dayStart.toDate(),
      current: lastActivity ? lastActivity.current : {},
      day_finished: false
    });
    await activity.save();
    res.status(201).json(activity);
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
    const thirtyDaysAgo = moment().subtract(30, 'days');
    const activities = await DailyActivity.find({
      date: {
        $gte: thirtyDaysAgo.toDate(),
      },
    });
    res.status(200).json(activities);
  } catch (error) {
    logger.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Function to get yesterday's 6 a.m. in UTC+5
const getYesterdaySixAMUTCPlusFive = () => {
  const timeZone = 'Asia/Tashkent'; // UTC+5
  return moment.tz(timeZone).subtract(1, 'day').startOf('day').add(6, 'hours');
};

// Function to get the end of yesterday's "day" (6 a.m. today)
const getYesterdayDayEnd = () => {
  return getTodaySixAMUTCPlusFive();
};

exports.getTodaysActivity = async (req, res) => {
  try {
    const { courierId } = req.params;
    
    const activity = await redisUtils.getOrSetCourierActivityWithConditions(courierId, async () => {
      const yesterdayStart = getYesterdaySixAMUTCPlusFive();
      const yesterdayEnd = getYesterdayDayEnd();

      // Check if courierId is a valid ObjectId
      let courierExists;
      if (ObjectId.isValid(courierId)) {
        courierExists = await Courier.findOne({ _id: courierId, deleted: false });
      }

      // If not found by ObjectId, try to find by phone_num
      if (!courierExists) {
        courierExists = await Courier.findOne({ phone_num: courierId, deleted: false });
      }

      if (!courierExists) {
        return null;
      }

      let activity = await DailyActivity.findOne({
        courier: courierExists._id,
        date: {
          $gte: yesterdayStart.toDate(),
          $lt: yesterdayEnd.toDate()
        },
        day_finished: false,
        accepted_today: true
      });

      if (activity) {
        activity = activity.toObject();
        activity.unfinished = true;
        return activity;
      }

      // If no activity found for yesterday, look for today's activity
      const todayStart = getCurrentDayStart();
      const todayEnd = moment(todayStart).add(1, 'day');

      activity = await DailyActivity.findOne({
        courier: courierExists._id,
        date: {
          $gte: todayStart.toDate(),
          $lt: todayEnd.toDate()
        },
        day_finished: false
      });

      if (!activity) {
        // If no activity found for today, create a new one
        activity = await createTodaysActivity(courierExists._id);
      }

      // Convert to plain object
      return activity.toObject();
    });

    if (!activity) {
      return res.status(404).json({ message: "❌ Courier not found." });
    }

    res.status(200).json(activity);
  } catch (error) {
    logger.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Get today's activity
exports.getAllTodaysActivities = async (req, res) => {
  try {    
    const dayStart = getCurrentDayStart();
    const dayEnd = moment(dayStart).add(1, 'day');

    let activities = await DailyActivity.find({
      date: {
        $gte: dayStart.toDate(),
        $lt: dayEnd.toDate()
      },
    }).populate("courier", "full_name");

    res.status(200).json(activities);
  } catch (error) {
    logger.error(error);
    res.status(400).json({ message: error.message });
  }
};

const createTodaysActivity = async (courierId) => {
  const lastActivity = await DailyActivity.findOne({ courier: courierId }).sort({ date: -1 });

  const todayActivity = new DailyActivity({
    courier: courierId,
    date: getCurrentDayStart().toDate(),
    current: lastActivity ? lastActivity.current : {},
    day_finished: false
  });

  await todayActivity.save();
  return todayActivity;
};

// New function to get today's accepted and unfinished activities
exports.getTodaysAcceptedUnfinishedActivities = async (req, res) => {
  try {
    const dayStart = getCurrentDayStart();
    const dayEnd = moment(dayStart).add(1, 'day');

    const activities = await DailyActivity.find({
      date: {
        $gte: dayStart.toDate(),
        $lt: dayEnd.toDate()
      },
      accepted_today: true,
      day_finished: false
    }).populate('courier', 'full_name phone_num');

    if (activities.length === 0) {
      return res.status(404).json({ message: "❌ No accepted and unfinished activities found for today."});
    }

    res.status(200).json(activities);
  } catch (error) {
    logger.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Function to get all couriers for today who don't have accepted_today set to true
exports.getUnacceptedCouriersForToday = async (req, res) => {
  try {
    const dayStart = getTodaySixAMUTCPlusFive();
    const dayEnd = moment(dayStart).add(1, 'day');

    // Find all active couriers
    const allCouriers = await Courier.find({ deleted: false });

    // Array to store unaccepted couriers
    const unacceptedCouriers = [];

    // Check each courier's activity for today
    for (const courier of allCouriers) {
      const todayActivity = await DailyActivity.findOne({
        courier: courier._id,
        date: {
          $gte: dayStart.toDate(),
          $lt: dayEnd.toDate()
        },
        day_finished: false
      });

      // If no activity found or accepted_today is not true, add to unaccepted list
      if (!todayActivity) {
        const yesterdayStart = getYesterdaySixAMUTCPlusFive();
        const yesterdayEnd = getYesterdayDayEnd();
    
        let activity = await DailyActivity.findOne({
          courier: courier._id,
          date: {
            $gte: yesterdayStart.toDate(),
            $lt: yesterdayEnd.toDate()
          },
          day_finished: false,
          accepted_today: true
        });

        if (!activity) {
          unacceptedCouriers.push(courier);
        }
      } else if (!todayActivity.accepted_today) {
        unacceptedCouriers.push(courier);
      }
    }

    if (unacceptedCouriers.length === 0) {
      return res.status(404).json({ message: "❌ All couriers have accepted_today set to true for today." });
    }

    res.status(200).json(unacceptedCouriers);
  } catch (error) {
    logger.error(error);
    res.status(400).json({ message: error.message });
  }
};

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
          courier: req.body.courier,
          date: {
            $gte: dayStart.toDate(),
            $lt: dayEnd.toDate()
          },
          day_finished: false
        }, 
        req.body, 
        { new: true, runValidators: true }
      );
      if (!activity) {
        return res.status(404).json({ message: "❌ Today's activity not found" });
      }
    }

    // Update Redis cache
    await redisUtils.updateCourierActivity(activity.courier.toString(), activity);

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
        courier: req.body.courier,
        date: {
          $gte: dayStart.toDate(),
          $lt: dayEnd.toDate()
        },
        day_finished: false
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

// New function to get activities of all couriers for a given date
exports.getActivitiesByDate = async (req, res) => {
  try {
    const { date } = req.params; // Expecting date in format YYYY-MM-DD
    
    // Parse the input date
    const inputDate = moment.tz(date, 'YYYY-MM-DD', 'Asia/Tashkent');
    
    // Set the start time to 6 a.m. of the input date
    const startTime = inputDate.clone().startOf('day').add(6, 'hours');
    
    // Set the end time to 6 a.m. of the next day
    const endTime = startTime.clone().add(1, 'day');

    // Find all activities within the time range
    const activities = await DailyActivity.find({
      date: {
        $gte: startTime.toDate(),
        $lt: endTime.toDate()
      }
    }).populate('courier', 'full_name phone_num'); // Populate courier details if needed

    if (activities.length === 0) {
      return res.status(404).json({ message: "❌ No activities found for the given date." });
    }

    res.status(200).json(activities);
  } catch (error) {
    logger.error(error);
    res.status(400).json({ message: error.message });
  }
};