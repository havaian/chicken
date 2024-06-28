const mongoose = require('mongoose');

const dailyActivitySchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true // Ensure one entry per day for all warehouses
    },
    remainder: {
        type: Number,
        required: true
    },
    accepted: {
        type: Number,
        required: true,
        default: 0
    }
}, {
    timestamps: true,
    strict: true,
    strictQuery: false
});

const DailyActivity = mongoose.model('DailyActivityWarehouse', dailyActivitySchema);

module.exports = DailyActivity;
