const mongoose = require('mongoose');

const dailyImporterActivitySchema = new mongoose.Schema({
  importer: {
    type: String,
    ref: 'Importer',
    required: true
  },
  date: {
    type: Date,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    default: 0
  },
}, 
{ 
  timestamps: true, 
  strict: true, 
  strictQuery: false 
});

const DailyImporterActivity = mongoose.model("DailyActivityImporter", dailyImporterActivitySchema);

module.exports = DailyImporterActivity;
