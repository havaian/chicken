const mongoose = require("mongoose");

const warehouseSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
      unique: true,
    },
    phone_num: {
      type: Array,
      required: true,
      unique: true,
    },
    telegram_chat_id: {
      type: Array,
      required: false,
      unique: true,
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: false,
  }
);

const Warehouse = mongoose.model("Warehouse", warehouseSchema);

module.exports = Warehouse;
