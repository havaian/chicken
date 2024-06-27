const DailyActivity = require('./model');
const Warehouse = require('../model');

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
        const activities = await DailyActivity.find().populate('warehouse');
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
        }).populate('warehouse');
        res.status(200).json(activities);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get today's activity
exports.getTodaysActivity = async (req, res) => {
    try {
        const { warehouseId } = req.params;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let activity = await DailyActivity.findOne({ warehouse: warehouseId, date: today }).populate('warehouse');
        
        if (!activity) {
            activity = await createTodaysActivity(warehouseId);
        }

        res.status(200).json(activity);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const createTodaysActivity = async (warehouseId) => {
    const lastActivity = await DailyActivity.findOne({ warehouse: warehouseId }).sort({ date: -1 });

    const todayActivity = new DailyActivity({
        warehouse: warehouseId,
        date: new Date().setHours(0, 0, 0, 0),
        remainder: lastActivity ? lastActivity.remainder : 0,
        accepted: '0'
    });

    await todayActivity.save();
    return todayActivity;
};

// Update an activity by ID
exports.updateActivityById = async (req, res) => {
    try {
        const activity = await DailyActivity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('warehouse');
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
