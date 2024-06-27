const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: true
  },
  phone_num: {
    type: String,
    required: true
  },
},
  {
    timestamps: true,
    strict: true,
    strictQuery: false
  });

const Warehouse = mongoose.model('Warehouse', warehouseSchema);

module.exports = Warehouse;