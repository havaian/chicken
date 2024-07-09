const DailyBuyerActivity = require('./model');
const Buyer = require('../model');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const { logger, readLog } = require("../../utils/logs");

// Create a new daily buyer activity
exports.createDailyActivity = async (req, res) => {
    try {
        const { buyer } = req.body;
        const date = new Date();

        // Ensure the date is stripped of time for comparison
        const startOfDay = new Date(date);
        if (isNaN(startOfDay.getTime())) {
            return res.status(400).json({ message: "❌ Invalid date format." });
        }
        startOfDay.setHours(0, 0, 0, 0);

        // Check if an activity already exists for the given buyer and date
        const existingActivity = await DailyBuyerActivity.findOne({
            buyer: buyer,
            date: startOfDay
        });

        if (existingActivity) {
            logger.info("❌ Activity for this buyer on the given date already exists.");
            return res
                .status(400)
                .json({
                    message:
                        "❌ Activity for this buyer on the given date already exists.",
                });
        }

        // Create new daily activity
        const activity = new DailyBuyerActivity({ ...req.body, date: startOfDay });
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
            options.buyer = req.params.buyerId
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
                $gte: new Date(new Date().setDate(new Date().getDate() - 30))
            }
        };
        if (req.params.buyerId) {
            options.buyer = req.params.buyerId
        }
        const activities = await DailyBuyerActivity.find(options);
        res.status(200).json(activities);
    } catch (error) {
        logger.info(error);
        res.status(400).json({ message: error.message });
    }
};

exports.getTodaysActivity = async (req, res) => {
    try {
        const { buyerId } = req.params;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const options = {
            date: today
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
            activity = await createTodaysActivity(buyerExists._id);
        }

        res.status(200).json(activity);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const createTodaysActivity = async (buyerId) => {
    const lastActivity = await DailyBuyerActivity.findOne({ buyer: buyerId }).sort({ date: -1 });

    const todayActivity = new DailyBuyerActivity({
        buyer: buyerId,
        date: new Date().setHours(0, 0, 0, 0),
        payment: lastActivity ? lastActivity.payment : 0,
        current: lastActivity ? lastActivity.current : 0
    });

    await todayActivity.save();
    return todayActivity;
};

// Update an activity by ID
exports.updateActivityById = async (req, res) => {
    try {
        const { id } = req.params;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        req.body.date = today;

        const activity = await DailyBuyerActivity.findByIdAndUpdate(
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

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        req.body.date = today;

        const activity = await DailyBuyerActivity.findByIdAndDelete(
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
