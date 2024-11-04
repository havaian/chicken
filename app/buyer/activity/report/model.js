// reportMetadata.model.js
const mongoose = require('mongoose');

const reportMetadataSchema = new mongoose.Schema({
  year: Number,
  month: Number,
  lastGenerated: Date,
  lastDataUpdate: Date,
  filePath: String,
  actualFilePath: String
});

module.exports = mongoose.model('ReportMetadata', reportMetadataSchema);