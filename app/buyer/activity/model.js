const mongoose = require("mongoose");

const dailyBuyerActivitySchema = new mongoose.Schema(
  {
    buyer: {
      type: String,
      ref: "Buyer",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    debt: {
      type: Number,
      required: true,
      default: 0,
    },
    accepted: [{
      _id: { type: String, required: true },
      courier: {
        _id: String,
        full_name: String,
        phone_num: String,
        car_num: String
      },
      eggs: [{
        category: String,
        amount: Number,
        price: Number
      }],
      payment: Number,
      debt: Number,
      time: String
    }],
    price: {
      type: Object,
      required: true,
      default: {},
    }
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: false,
  }
);

const DailyBuyerActivity = mongoose.model(
  "DailyActivityBuyer",
  dailyBuyerActivitySchema
);

module.exports = DailyBuyerActivity;
