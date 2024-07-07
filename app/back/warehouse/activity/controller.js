const DailyActivity = require('./model');

// Create a new daily activity
exports.createDailyActivity = async (req, res) => {
    try {
        const date = new Date();

        // Ensure the date is stripped of time for comparison
        const startOfDay = new Date(date);
        if (isNaN(startOfDay.getTime())) {
            return res.status(400).json({ message: "❌ Invalid date format." });
        }
        startOfDay.setHours(0, 0, 0, 0);

        // Check if an activity already exists for the given date
        const existingActivity = await DailyActivity.findOne({ 
            date: startOfDay
        });

        if (existingActivity) {
            return res.status(400).json({ message: "❌ Activity on the given date already exists." });
        }

        // Create new daily activity
        const activity = new DailyActivity({ ...req.body, date: startOfDay });
        await activity.save();
        res.status(201).json(activity);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all activities
exports.getAllActivities = async (req, res) => {
    try {
        const activities = await DailyActivity.find();
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
        });
        res.status(200).json(activities);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get today's activity
exports.getTodaysActivity = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let activity = await DailyActivity.findOne({ date: today });
        
        if (!activity) {
            activity = await createTodaysActivity();
        }

        res.status(200).json(activity);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const createTodaysActivity = async () => {
    const lastActivity = await DailyActivity.findOne().sort({ date: -1 });

    const todayActivity = new DailyActivity({
        date: new Date().setHours(0, 0, 0, 0),
        by_morning: lastActivity ? lastActivity.current : 0,
        current: lastActivity ? lastActivity.current : 0,
        accepted: 0
    });

    await todayActivity.save();
    return todayActivity;
};

// Update an activity by ID or today's activity if no ID is provided
exports.updateActivityById = async (req, res) => {
    try {
        let activity;
        
        if (req.params.id) {
            let today = new Date(req.body.date);
            today.setHours(0, 0, 0, 0);
            req.body.date = today;

            activity = await DailyActivity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
            if (!activity) return res.status(404).json({ message: "❌ Activity not found" });
        } else {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            req.body.date = today;
            activity = await DailyActivity.findOneAndUpdate({ date: today }, req.body, { new: true, runValidators: true });
            if (!activity) return res.status(404).json({ message: "❌ Today's activity not found" });
        }
        res.status(200).json(activity);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete an activity by ID or today's activity if no ID is provided
exports.deleteActivityById = async (req, res) => {
    try {
        let activity;
        if (req.params.id) {
            activity = await DailyActivity.findByIdAndDelete(req.params.id);
            if (!activity) return res.status(404).json({ message: "❌ Activity not found" });
        } else {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            activity = await DailyActivity.findOneAndDelete({ date: today });
            if (!activity) return res.status(404).json({ message: "❌ Today's activity not found" });
        }
        res.status(200).json({ message: "✅ Activity deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
