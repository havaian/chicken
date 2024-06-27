const cron = require('node-cron');
const DailyBuyerActivity = require('./model');
const Buyer = require('../model');

const createTodaysActivityForAllBuyers = async () => {
    const buyers = await Buyer.find();

    for (const buyer of buyers) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let activity = await DailyBuyerActivity.findOne({ buyer: buyer._id, date: today });

        if (!activity) {
            const lastActivity = await DailyBuyerActivity.findOne({ buyer: buyer._id }).sort({ date: -1 });

            activity = new DailyBuyerActivity({
                buyer: buyer._id,
                date: today,
                debt: lastActivity ? lastActivity.debt : 0,
                remainder: lastActivity ? lastActivity.remainder : 0
            });

            await activity.save();
        }
    }
};

// Schedule the cron job to run at midnight every day
cron.schedule('0 0 * * *', createTodaysActivityForAllBuyers);
