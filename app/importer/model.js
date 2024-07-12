const mongoose = require("mongoose");

const importerSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: false,
  }
);

const Importer = mongoose.model("Importer", importerSchema);

module.exports = Importer;
