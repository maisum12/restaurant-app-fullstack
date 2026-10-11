const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true, unique: true },
  capacity: { type: Number, required: true, min: 1 },
  isAvailable: { type: Boolean, default: true }
});

module.exports = mongoose.model('Table', tableSchema);