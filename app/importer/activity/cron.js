// const cron = require("node-cron");
// const DailyBuyerActivity = require("./model");
// const Buyer = require("../model");
// const { createTodaysActivity } = require("./controller");

// const createTodaysActivityForAllBuyers = async () => {
//     const buyers = await Buyer.find();

//     for (const buyer of buyers) {
//         const today = new Date();
//         today.setHours(11, 0, 0, 0);

//         let activity = await DailyBuyerActivity.findOne({ buyer: buyer._id, date: today });

//         if (!activity) {
//             createTodaysActivity(buyer._id);
//         }
//     }
// };

// // Schedule the cron job to run at midnight every day
// cron.schedule("0 0 * * *", createTodaysActivityForAllBuyers);
