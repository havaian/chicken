const cron = require('node-cron');
const DailyActivity = require('./model');

const createTodaysActivityForAllWarehouses = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let activity = await DailyActivity.findOne({ date: today });

    if (!activity) {
        const lastActivity = await DailyActivity.findOne().sort({ date: -1 });

        activity = new DailyActivity({
            date: today,
            remainder: lastActivity ? lastActivity.remainder : '0',
            accepted: '0'
        });

        await activity.save();
    }
};

// Schedule the cron job to run at midnight every day
cron.schedule('0 0 * * *', createTodaysActivityForAllWarehouses);
