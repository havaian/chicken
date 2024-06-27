const mongoose = require('mongoose');

const dailyBuyerActivitySchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buyer',
    required: true
  },
  date: {
    type: Date,
    required: true,
    unique: true, // Ensure one entry per day per buyer
    default: Date.now // Default to the current date
  },
  debt: {
    type: Number,
    required: true,
    default: 0
  },
  remainder: {
    type: Number,
    required: true,
    default: 0
  },
}, 
{ 
  timestamps: true, 
  strict: true, 
  strictQuery: false 
});

const DailyBuyerActivity = mongoose.model('DailyBuyerActivity', dailyBuyerActivitySchema);

module.exports = DailyBuyerActivity;
