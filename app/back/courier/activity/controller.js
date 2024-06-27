const DailyActivity = require('./model');
const Courier = require('../model');

// Create a new daily activity
exports.createDailyActivity = async (req, res) => {
    try {
        const activity = new DailyActivity(req.body);
        await activity.save();
        res.status(201).json(activity);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all activities
exports.getAllActivities = async (req, res) => {
    try {
        const activities = await DailyActivity.find().populate('courier');
        res.status(200).json(activities);
    } catch (error) {
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
        }).populate('courier');
        res.status(200).json(activities);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get today's activity
exports.getTodaysActivity = async (req, res) => {
    try {
        const { courierId } = req.params;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let activity = await DailyActivity.findOne({ courier: courierId, date: today }).populate('courier');
        
        if (!activity) {
            activity = await createTodaysActivity(courierId);
        }

        res.status(200).json(activity);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const createTodaysActivity = async (courierId) => {
    const lastActivity = await DailyActivity.findOne({ courier: courierId }).sort({ date: -1 });

    const todayActivity = new DailyActivity({
        courier: courierId,
        date: new Date().setHours(0, 0, 0, 0),
        remained: lastActivity ? lastActivity.remained : 0,
        broken: 0,
        earnings: 0,
        expenses: 0
    });

    await todayActivity.save();
    return todayActivity;
};

// Update an activity by ID
exports.updateActivityById = async (req, res) => {
    try {
        const activity = await DailyActivity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('courier');
        if (!activity) return res.status(404).json({ message: 'Activity not found' });
        res.status(200).json(activity);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete an activity by ID
exports.deleteActivityById = async (req, res) => {
    try {
        const activity = await DailyActivity.findByIdAndDelete(req.params.id);
        if (!activity) return res.status(404).json({ message: 'Activity not found' });
        res.status(200).json({ message: 'Activity deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
