// models/DailyActivity.js

const mongoose = require('mongoose');

const dailyActivitySchema = new mongoose.Schema({
    warehouse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Warehouse',
        required: true
    },
    date: {
        type: Date,
        required: true,
        unique: true,
        default: Date.now
    },
    remainder: {
        type: String,
        required: true
    },
    accepted: {
        type: String,
        required: true,
        default: '0'
    }
}, {
    timestamps: true,
    strict: true,
    strictQuery: false
});

const DailyActivity = mongoose.model('DailyActivity', dailyActivitySchema);

module.exports = DailyActivity;
