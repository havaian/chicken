const mongoose = require('mongoose');

const dailyActivitySchema = new mongoose.Schema({
  courier: {
      type: String,
      ref: 'Courier',
      required: true
  },
  delivered_to: {
      type: Array
  },
  date: {
      type: Date,
      required: true,
  },
  remained: {
      type: Number,
      required: true
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
