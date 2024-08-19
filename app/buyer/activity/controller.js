const DailyBuyerActivity = require("./model");
const Buyer = require("../model");
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

// Create a new daily buyer activity
exports.createDailyActivity = async (req, res) => {
  try {
    const { buyer } = req.body;
    const date = getSixAMUTCPlusFive().format();

    // Ensure the date is stripped of time for comparison
    if (isNaN(date.getTime())) {
      return res.status(400).json({ message: "❌ Invalid date format." });
    }

    // Check if an activity already exists for the given buyer and date
    const existingActivity = await DailyBuyerActivity.findOne({
      buyer: buyer,
      date: date,
    });

    if (existingActivity) {
      logger.info(
        "❌ Activity for this buyer on the given date already exists."
      );
      return res.status(400).json({
        message: "❌ Activity for this buyer on the given date already exists.",
      });
    }

    // Create new daily activity
    const activity = new DailyBuyerActivity({ ...req.body, date: date });
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
    const options = {
      date: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
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

// exports.getAllTodaysActivities = async (req, res) => {
//   try {
//     const todayStart = getSixAMUTCPlusFive().format();
//     const todayEnd = getSixAMUTCPlusFive().add(1, 'days').format();

//     // Get all unique buyers
//     const allBuyers = await Buyer.find({}, '_id');

//     // Array to store all activities
//     let allActivities = [];

//     // Process each buyer
//     for (const buyer of allBuyers) {
//       // Try to find today's activity for the buyer
//       let activity = await DailyBuyerActivity.findOne({
//         buyer: buyer._id,
//         date: {
//           $gte: todayStart,
//           $lt: todayEnd
//         }
//       }).select('_id price debt buyer');

//       // If no activity found, create one
//       if (!activity) {
//         activity = await this.createTodaysActivity(buyer._id);
//       }

//       // Format and add the activity to the array
//       allActivities.push({
//         _id: activity._id,
//         price: activity.price,
//         buyer: activity.buyer,
//         debt: activity.debt
//       });
//     }

//     res.status(200).json(allActivities);
//   } catch (error) {
//     logger.info(error);
//     res.status(500).json({ message: "❌ Error retrieving today's activities for all buyers", error: error.message });
//   }
// };

exports.getAllTodaysActivities = async (req, res) => {
  try {
    const todayStart = getSixAMUTCPlusFive().format();
    const todayEnd = getSixAMUTCPlusFive().add(1, 'days').format();

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
          $gte: todayStart,
          $lt: todayEnd
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
    const options = {
      date: getSixAMUTCPlusFive().format(),
    };

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

    options.buyer = buyerExists._id;

    let activity = await DailyBuyerActivity.findOne(options);

    if (!activity) {
      activity = await this.createTodaysActivity(buyerExists._id);
    }

    res.status(200).json(activity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.createTodaysActivity = async (buyerId) => {
  const lastActivity = await DailyBuyerActivity.findOne({
    buyer: buyerId,
  }).sort({ date: -1 });

  const todayActivity = new DailyBuyerActivity({
    buyer: buyerId,
    date: getSixAMUTCPlusFive().format(),
    debt: lastActivity ? lastActivity.debt : 0
  });

  await todayActivity.save();
  return todayActivity;
};

// Update an activity by ID
exports.updateActivityById = async (req, res) => {
  try {
    const { id } = req.params;
    req.body.date = getSixAMUTCPlusFive().format();

    const activity = await DailyBuyerActivity.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
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
    req.body.date = getSixAMUTCPlusFive().format();

    const activity = await DailyBuyerActivity.findByIdAndDelete(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!activity) {
      return res.status(404).json({ message: "❌ Activity not found" });
    }
    res.status(200).json(activity);
  } catch (error) {
    logger.info(error);
    res.status(400).json({ message: error.message });
  }
};
