const mongoose = require('mongoose');

const dailyActivitySchema = new mongoose.Schema({
  courier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Courier',
      required: true
  },
  date: {
      type: Date,
      required: true,
      unique: true, // Ensure one entry per day per courier
      default: Date.now // Default to the current date
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

const DailyActivity = mongoose.model('DailyActivity', dailyActivitySchema);

module.exports = DailyActivity;
