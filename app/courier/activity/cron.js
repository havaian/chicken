// const cron = require("node-cron");
// const DailyActivity = require("./model");
// const Courier = require("../model");
// const { createTodaysActivity } = require("./controller");

// const createTodaysActivityForAllCouriers = async () => {
//     const couriers = await Courier.find();

//     for (const courier of couriers) {
//         const today = new Date();
//         today.setHours(11, 0, 0, 0);

//         let activity = await DailyActivity.findOne({ courier: courier._id, date: today });

//         if (!activity) {
//             createTodaysActivity(courier._id);
//         }
//     }
// };

// // Schedule the cron job to run at midnight every day
// cron.schedule("0 0 * * *", createTodaysActivityForAllCouriers);
