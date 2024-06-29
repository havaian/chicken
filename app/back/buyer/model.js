const mongoose = require("mongoose");

const buyerSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
      unique: true,
    },
    resp_person: {
      type: String,
      required: true,
    },
    phone_num: {
      type: String,
      required: true,
      unique: true,
    },
    location: {
      type: { type: String },
      coordinates: {},
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: false,
  }
);

buyerSchema.index({ location: "2dsphere" }); // Index for geospatial queries

const Buyer = mongoose.model("Buyer", buyerSchema);

module.exports = Buyer;
