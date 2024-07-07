const mongoose = require('mongoose');

const dailyActivitySchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true // Ensure one entry per day for all warehouses
    },
    confirmed: {
        type: Boolean,
        required: true,
        default: false
    },
    distributed_to: {
        type: Array,
        required: true,
        default: []
    },
    accepted: {
        type: Number,
        required: true,
        default: 0
    },
    accepted_at: {
        type: Array,
        required: true,
        default: []
    },
    by_morning: {
        type: Number,
        required: true,
        default: 0
    },
    current: {
        type: Number,
        required: true,
        default: 0
    },
    couriers_broken: {
        type: Number,
        required: true,
        default: 0
    },
    couriers_current: {
        type: Number,
        required: true,
        default: 0
    },
    butun: {
        type: Number,
        required: true,
        default: 0
    },
    nasechka: {
        type: Number,
        required: true,
        default: 0
    },
    melaj: {
        type: Number,
        required: true,
        default: 0
    },
    kamomat: {
        type: Number,
        required: true,
        default: 0
    },
    ombor_mudiri: {
        type: String,
        required: false,
    }
}, {
    timestamps: true,
    strict: true,
    strictQuery: false
});

const DailyActivity = mongoose.model('DailyActivityWarehouse', dailyActivitySchema);

module.exports = DailyActivity;
