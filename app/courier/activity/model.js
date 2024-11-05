const mongoose = require("mongoose");

const dailyActivitySchema = new mongoose.Schema({
  courier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Courier",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  delivered_to: [{
    _id: { type: String, required: true },
    buyer: {
      _id: String,
      full_name: String,
      phone_num: String
    },
    items: [{
      category: {
        _id: String,
        name: String,
      },
      subcategory: {
        _id: String,
        name: String,
      },
      item: {
        _id: String,
        name: String,
      },
      amount: Number,
      price: Number,
      _id: false
    }],
    payment: Number,
    debt: Number,
    time: String
  }],
  inventory: {
    type: Map,
    of: Number,
    default: {},
  },
  inventory_by_courier: {
    type: Map,
    of: Number,
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
  damaged: {
    type: Map,
    of: Number,
    default: {},
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
}, {
  timestamps: true,
  strict: true,
  strictQuery: false,
});

const DailyActivity = mongoose.model(
  "DailyActivityCourier",
  dailyActivitySchema
);

module.exports = DailyActivity;
