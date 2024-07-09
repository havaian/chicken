const mongoose = require('mongoose');

const dailyActivitySchema = new mongoose.Schema({
    courier: {
        type: String,
        ref: 'Courier',
        required: true
    },
    date: {
        type: Date,
        required: true,
    },
    delivered_to: {
        type: Array,
        validate: {
            validator: function (arr) {
                return arr.length <= 40;
            },
            message: '❌ The delivered_to array exceeds the maximum allowed length of 40.'
        }
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
    accepted: {
        type: Number,
        required: true,
        default: 0
    },
    broken: {
        type: Number, // Changed to Number for consistency
        required: true,
        default: 0
    },
    earnings: {
        type: Number,
        default: 0
    },
    expenses: {
        type: Number,
        default: 0
    }
},
    {
        timestamps: true,
        strict: true,
        strictQuery: false
    });

const DailyActivity = mongoose.model('DailyActivityCourier', dailyActivitySchema);

module.exports = DailyActivity;
