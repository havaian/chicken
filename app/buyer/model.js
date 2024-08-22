const mongoose = require("mongoose");

const buyerSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
    },
    phone_num: {
      type: String,
      required: false,
    },
    location: {
      type: { type: String },
      coordinates: {},
    },
    locations: {
      type: Array,
      required: false
    },
    deactivated: {
      type: Boolean,
      required: true,
      default: false,
    },
    categories: {
      type: Array,
      required: false,
    },
    debt_limit: {
      type: Number,
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

buyerSchema.index({ location: "2dsphere" }); // Index for geospatial queries

buyerSchema.index({ full_name: 1, deleted: 1 }, { unique: true, partialFilterExpression: { deleted: false } });
buyerSchema.index({ phone_num: 1, deleted: 1 }, { unique: true, partialFilterExpression: { deleted: false } });

const Buyer = mongoose.model("Buyer", buyerSchema);

module.exports = Buyer;
