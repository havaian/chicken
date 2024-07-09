const cron = require('node-cron');
const DailyActivity = require('./model');
const Courier = require('../model');

const createTodaysActivityForAllCouriers = async () => {
    const couriers = await Courier.find();

    for (const courier of couriers) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let activity = await DailyActivity.findOne({ courier: courier._id, date: today });

        if (!activity) {
            const lastActivity = await DailyActivity.findOne({ courier: courier._id }).sort({ date: -1 });

            activity = new DailyActivity({
                courier: courier._id,
                date: today,
                current: lastActivity ? lastActivity.current : 0,
                broken: 0,
                earnings: 0,
                expenses: 0
            });

            await activity.save();
        }
    }
};

// Schedule the cron job to run at midnight every day
cron.schedule('0 0 * * *', createTodaysActivityForAllCouriers);
