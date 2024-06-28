const mongoose = require('mongoose');

const courierSchema = new mongoose.Schema({
  full_name: {
      type: String,
      required: true,
      unique: true
  },
  phone_num: {
      type: String,
      required: true,
      unique: true
  },
  car_num: {
      type: String,
      required: true,
      unique: true
  },
}, 
{ 
  timestamps: true, 
  strict: true, 
  strictQuery: false 
});

const Courier = mongoose.model('Courier', courierSchema);

module.exports = Courier;
