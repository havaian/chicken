const mongoose = require('mongoose');

const dailyActivitySchema = new mongoose.Schema({
  courier: {
      type: String,
      ref: 'Courier',
      required: true
  },
  confirmed: {
      type: Boolean,
      required: true,
      default: false
  },
  date: {
      type: Date,
      required: true,
  },
  delivered_to: {
      type: Array
  },
  by_morning: {
      type: Number,
      required: true,
      default: 0
  },
  current: {
      type: Number,
      required: true,
      default: 0
  },
  accepted: {
      type: Number,
      required: true,
      default: 0
  },
  broken: {
      type: Number, // Changed to Number for consistency
      required: true,
      default: 0
  },
  earnings: {
      type: Number,
      default: 0
  },
  expenses: {
      type: Number,
      default: 0
  }
}, 
{ 
  timestamps: true, 
  strict: true, 
  strictQuery: false 
});

const DailyActivity = mongoose.model('DailyActivityCourier', dailyActivitySchema);

module.exports = DailyActivity;
