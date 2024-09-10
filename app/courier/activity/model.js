const mongoose = require("mongoose");

const dailyActivitySchema = new mongoose.Schema(
  {
    courier: {
      type: String,
      ref: "Courier",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    delivered_to: {
      type: Array
    },
    by_morning: {
      type: Object,
      required: true,
      default: {},
    },
    current: {
      type: Object,
      required: true,
      default: {},
    },
    current_by_courier: {
      type: Object,
      required: true,
      default: {},
    },
    money_by_courier: {
      type: Number,
      required: true,
      default: 0,
    },
    accepted: {
      type: Array,
      required: true,
      default: [],
    },
    accepted_today: {
      type: Boolean,
      required: true,
      default: false,
    },
    broken: {
      type: Object,
      required: true,
      default: {},
    },
    incision: {
      type: Object,
      required: true,
      default: {},
    },
    melange: {
      type: Object,
      required: true,
      default: 0,
    },
    melange_by_courier: {
      type: Object,
      required: true,
      default: 0,
    },
    earnings: {
      type: Number,
      default: 0,
    },
    expenses: {
      type: Number,
      default: 0,
    },
    day_finished: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: false,
  }
);

const DailyActivity = mongoose.model(
  "DailyActivityCourier",
  dailyActivitySchema
);

module.exports = DailyActivity;
