const mongoose = require("mongoose");

const dailyActivitySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true, // Ensure one entry per day for all warehouses
    },
    distributed_to: {
      type: Array,
      required: true,
      default: [],
    },
    accepted: {
      type: Number,
      required: true,
      default: 0,
    },
    accepted_from: {
      type: Array,
      required: true,
      default: [],
    },
    by_morning: {
      type: Number,
      required: true,
      default: 0,
    },
    // submitted by warehouse user
    remained: {
      type: Number,
      required: true,
      default: 0,
    },
    // automatically calculated
    current: {
      type: Number,
      required: true,
      default: 0,
    },
    // used for undoing purposes
    old_current: {
      type: Number,
      required: true,
      default: 0,
    },
    incision: {
      type: Number,
      required: true,
      default: 0,
    },
    melange: {
      type: Number,
      required: true,
      default: 0,
    },
    broken: {
      type: Number,
      required: true,
      default: 0,
    },
    intact: {
      type: Number,
      required: true,
      default: 0,
    },
    deficit: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: false,
  }
);

const DailyActivity = mongoose.model(
  "DailyActivityWarehouse",
  dailyActivitySchema
);

module.exports = DailyActivity;
