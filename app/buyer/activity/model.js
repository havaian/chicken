const mongoose = require('mongoose');

const dailyBuyerActivitySchema = new mongoose.Schema({
  buyer: {
    type: String,
    ref: 'Buyer',
    required: true
  },
  date: {
    type: Date,
    required: true,
  },
  payment: {
    type: Number,
    required: true,
    default: 0
  },
  accepted: {
    type: Array,
    required: true,
    default: []
  },
}, 
{ 
  timestamps: true, 
  strict: true, 
  strictQuery: false 
});

const DailyBuyerActivity = mongoose.model("DailyActivityBuyer", dailyBuyerActivitySchema);

module.exports = DailyBuyerActivity;
