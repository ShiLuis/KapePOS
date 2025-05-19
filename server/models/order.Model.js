const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  items: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true, min: 1 },
      selectedOptions: { type: Object, default: {} },
      selectedAddons: { type: Array, default: [] },
      itemNotes: { type: String, default: '' }
    }
  ],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['Cash', 'Card']
  },
  date: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Order', orderSchema);