const mongoose = require("mongoose");

const courierSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
    },
    phone_num: {
      type: String,
      required: true,
    },
    car_num: {
      type: String,
      required: false,
    },
    telegram_chat_id: {
      type: String,
      required: false,
    },
    deleted: {
      type: Boolean,
      default: false,
      required: true,
    }
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: false,
  }
);

// Add compound indexes for full_name and deleted, and phone_num and deleted
// This ensures uniqueness of full_name and phone_num only among non-deleted documents
courierSchema.index({ full_name: 1, deleted: 1 }, { unique: true, partialFilterExpression: { deleted: false } });
courierSchema.index({ phone_num: 1, deleted: 1 }, { unique: true, partialFilterExpression: { deleted: false } });

const Courier = mongoose.model("Courier", courierSchema);

module.exports = Courier;
