const mongoose = require("mongoose");

const dailyBuyerActivitySchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
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
    items: [{
      category: {
        _id: String,
        name: String,
      },
<<<<<<< Updated upstream
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
=======
      items: [{
        category: String,
        amount: Number,
        price: Number
      }],
      payment: Number,
      debt: Number,
      time: String
>>>>>>> Stashed changes
    }],
    payment: Number,
    debt: Number,
    time: String
  }],
  prices: {
    type: Map,
    of: Number,
    default: {},
  },
  lastModified: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true,
  strict: true,
  strictQuery: false,
});

dailyBuyerActivitySchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

const DailyBuyerActivity = mongoose.model(
  "DailyActivityBuyer",
  dailyBuyerActivitySchema
);

module.exports = DailyBuyerActivity;