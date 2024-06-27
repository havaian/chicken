const DailyBuyerActivity = require('./model');
const Buyer = require('../model');

// Create a new daily buyer activity
exports.createDailyActivity = async (req, res) => {
    try {
        const activity = new DailyBuyerActivity(req.body);
        await activity.save();
        res.status(201).json(activity);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all activities
exports.getAllActivities = async (req, res) => {
    try {
        const activities = await DailyBuyerActivity.find().populate('buyer');
        res.status(200).json(activities);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get activities for the last 30 days
exports.getLast30DaysActivities = async (req, res) => {
    try {
        const activities = await DailyBuyerActivity.find({
            date: {
                $gte: new Date(new Date().setDate(new Date().getDate() - 30))
            }
        }).populate('buyer');
        res.status(200).json(activities);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get today's activity
exports.getTodaysActivity = async (req, res) => {
    try {
        const { buyerId } = req.params;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let activity = await DailyBuyerActivity.findOne({ buyer: buyerId, date: today }).populate('buyer');
        
        if (!activity) {
            activity = await createTodaysActivity(buyerId);
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
        debt: lastActivity ? lastActivity.debt : 0,
        remainder: lastActivity ? lastActivity.remainder : 0
    });

    await todayActivity.save();
    return todayActivity;
};

// Update an activity by ID
exports.updateActivityById = async (req, res) => {
    try {
        const activity = await DailyBuyerActivity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('buyer');
        if (!activity) return res.status(404).json({ message: 'Activity not found' });
        res.status(200).json(activity);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete an activity by ID
exports.deleteActivityById = async (req, res) => {
    try {
        const activity = await DailyBuyerActivity.findByIdAndDelete(req.params.id);
        if (!activity) return res.status(404).json({ message: 'Activity not found' });
        res.status(200).json({ message: 'Activity deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
