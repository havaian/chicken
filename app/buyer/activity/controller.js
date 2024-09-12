const DailyBuyerActivity = require("./model");
const Buyer = require("../model");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { logger, readLog } = require("../../utils/logging");
const moment = require('moment-timezone');

const fs = require('fs');
const path = require('path');

const getPrices = () => {
  try {
    const pricesPath = path.join(__dirname, '../../data/prices.js');
    const data = fs.readFileSync(pricesPath, 'utf8');
    
    // Use regex to extract the object from the file content
    const match = data.match(/module\.exports\s*=\s*({[\s\S]*});/);
    if (match && match[1]) {
      // Use eval to parse the object (be cautious with this approach)
      const prices = eval('(' + match[1] + ')');
      
      if (typeof prices === 'object' && Object.keys(prices).length > 0) {
        return prices;
      }
    }
    
    logger.info('Failed to extract valid prices from file');
    return null;
  } catch (error) {
    logger.info('Error reading prices file:', error);
    return null;
  }
};

// Function to get today's 6 a.m. in UTC+5
const getTodaySixAMUTCPlusFive = () => {
  const timeZone = 'Asia/Tashkent'; // UTC+5
  return moment.tz(timeZone).startOf('day').add(6, 'hours');
};

// Function to get the start of the current "day" (6 a.m. today or 6 a.m. yesterday if it's before 6 a.m.)
const getCurrentDayStart = () => {
  const timeZone = 'Asia/Tashkent'; // UTC+5
  const now = moment.tz(timeZone);
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
    logger.error(error);
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
    logger.error(error);
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
    logger.error(error);
    res.status(400).json({ message: error.message });
  }
};

exports.getAllTodaysActivities = async (req, res) => {
  try {
    const dayStart = getCurrentDayStart();
    const dayEnd = moment(dayStart).add(1, 'day');
    const defaultPrices = getPrices();

    const activities = await Buyer.aggregate([
      { $match: { deleted: false } },
      {
        $addFields: {
          defaultPrices: defaultPrices  // Add default prices to each document
        }
      },
      {
        $lookup: {
          from: 'dailyactivitybuyers',
          let: { buyerId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: [{ $toObjectId: '$buyer' }, '$$buyerId'] }
              }
            },
            { $sort: { date: -1 } },
            { $limit: 1 }
          ],
          as: 'lastActivity'
        }
      },
      {
        $addFields: {
          activity: {
            $cond: {
              if: { $size: '$lastActivity' },
              then: {
                $let: {
                  vars: {
                    lastAct: { $arrayElemAt: ['$lastActivity', 0] }
                  },
                  in: {
                    $mergeObjects: [
                      '$$lastAct',
                      {
                        isToday: {
                          $and: [
                            { $gte: ['$$lastAct.date', dayStart.toDate()] },
                            { $lt: ['$$lastAct.date', dayEnd.toDate()] }
                          ]
                        },
                        price: {
                          $cond: {
                            if: {
                              $and: [
                                { $gte: ['$$lastAct.date', dayStart.toDate()] },
                                { $lt: ['$$lastAct.date', dayEnd.toDate()] }
                              ]
                            },
                            then: '$$lastAct.price',
                            else: '$defaultPrices'
                          }
                        }
                      }
                    ]
                  }
                }
              },
              else: {
                _id: null,
                price: '$defaultPrices',
                buyer: '$_id',
                debt: 0,
                date: dayStart.toDate(),
                isToday: true
              }
            }
          }
        }
      },
      {
        $addFields: {
          activity: {
            $mergeObjects: [
              '$activity',
              { debt: { $toDouble: '$activity.debt' } }
            ]
          }
        }
      },
      {
        $project: {
          _id: 1,
          full_name: 1,
          phone_num: 1,
          locations: 1,
          createdAt: 1,
          updatedAt: 1,
          __v: 1,
          deactivated: 1,
          debt_limit: 1,
          deleted: 1,
          categories: 1,
          activity: {
            _id: 1,
            buyer: 1,
            date: 1,
            debt: 1,
            price: 1,
            isToday: 1
          }
        }
      }
    ]);

    res.status(200).json(activities);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: "❌ Error retrieving activities for all buyers", error: error.message });
  }
};

exports.updateAllTodaysActivitiesPrices = async (req, res) => {
  try {
    const { price } = req.body;

    if (!price || typeof price !== 'object') {
      return res.status(400).json({ message: "❌ Invalid price data in request body" });
    }

    const dayStart = getCurrentDayStart();
    const dayEnd = moment(dayStart).add(1, 'day');

    const result = await DailyBuyerActivity.updateMany(
      {
        date: {
          $gte: dayStart.toDate(),
          $lt: dayEnd.toDate()
        }
      },
      { $set: { price: price } }
    );

    logger.info(`Updated ${result.modifiedCount} activities with new price data`);

    res.status(200).json({
      message: `✅ Successfully updated ${result.modifiedCount} activities with new price data`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    logger.error('Error updating today\'s activities prices:', error);
    res.status(500).json({ message: "❌ Error updating activities", error: error.message });
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
      buyerExists = await Buyer.findOne({ _id: buyerId, deleted: false });
    }

    // If not found by ObjectId, try to find by phone_number
    if (!buyerExists) {
      buyerExists = await Buyer.findOne({ phone_num: buyerId, deleted: false });
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
    logger.error(error);
    res.status(400).json({ message: error.message });
  }
};

const createTodaysActivity = async (buyerId) => {
  const lastActivity = await DailyBuyerActivity.findOne({
    buyer: buyerId,
  }).sort({ date: -1 });

  const prices = getPrices();

  const todayActivity = new DailyBuyerActivity({
    buyer: buyerId,
    date: getCurrentDayStart().toDate(),
    debt: lastActivity ? lastActivity.debt : 0,
    price: prices
  });

  await todayActivity.save();
  return todayActivity;
};

exports.getLatestActivity = async (req, res) => {
  try {
    const { buyerId } = req.params;

    let buyer;

    // Check if buyerId is a valid ObjectId
    if (ObjectId.isValid(buyerId)) {
      buyer = await Buyer.findOne({ _id: buyerId, deleted: false });
    }

    // If not found by ObjectId, try to find by phone_number
    if (!buyer) {
      buyer = await Buyer.findOne({ phone_num: buyerId, deleted: false });
    }

    if (!buyer) {
      return res.status(404).json({ message: "❌ Buyer not found." });
    }

    const dayStart = getCurrentDayStart();
    const dayEnd = moment(dayStart).add(1, 'day');

    const latestActivity = await DailyBuyerActivity.findOne({
      buyer: buyer._id,
      date: {
        $gte: dayStart.toDate(),
        $lt: dayEnd.toDate()
      }
    }).lean();

    if (!latestActivity) {
      // If no activity found for today, return null
      return res.status(200).json(null);
    }

    // Add isToday flag (always true in this case)
    latestActivity.isToday = true;

    res.status(200).json(latestActivity);
  } catch (error) {
    logger.error('Error retrieving latest activity:', error);
    res.status(500).json({ message: "❌ Error retrieving latest activity", error: error.message });
  }
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
      req.params.buyerId = req.body.buyer;

      const todaysActivity = this.getTodaysActivity();
      
      activity = await DailyBuyerActivity.findByIdAndUpdate(todaysActivity._id, 
        req.body, 
        { new: true, runValidators: true, upsert: true }
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
    logger.error(error);
    res.status(400).json({ message: error.message });
  }
};