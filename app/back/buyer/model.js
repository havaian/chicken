const mongoose = require('mongoose');

const buyerSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
      unique: true
    },
    resp_person: {
      type: String,
      required: true
    },
    phone_num: {
      type: String,
      required: true,
      unique: true
    },
    location: {
      type: Object,
      required: true
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: false,
  }
);

const Buyer = mongoose.model('Buyer', buyerSchema);

module.exports = Buyer;
