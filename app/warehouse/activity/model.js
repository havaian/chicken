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
      type: Array,
      required: true,
      default: [],
    },
    by_morning: {
      type: Object,
      required: true,
      default: {},
    },
    // submitted by warehouse user
    remained: {
      type: Object,
      required: true,
      default: {},
    },
    // automatically calculated
    current: {
      type: Object,
      required: true,
      default: {},
    },
    // used for undoing purposes
    old_current: {
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
    melange_by_warehouse: {
      type: Object,
      required: true,
      default: 0,
    },
    broken: {
      type: Object,
      required: true,
      default: {},
    },
    intact: {
      type: Object,
      required: true,
      default: {},
    },
    deficit: {
      type: Object,
      required: true,
      default: {},
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
