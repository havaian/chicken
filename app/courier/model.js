const mongoose = require("mongoose");

const courierSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
      unique: true,
    },
    phone_num: {
      type: String,
      required: true,
      unique: true,
    },
    car_num: {
      type: String,
      required: false,
      unique: false,
    },
    telegram_chat_id: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: false,
  }
);

const Courier = mongoose.model("Courier", courierSchema);

module.exports = Courier;
