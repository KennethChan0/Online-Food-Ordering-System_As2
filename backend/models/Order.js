const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  // reference to menu item (task model) and get itemID, name, price
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
  },

  name: { type: String, required: true, trim: true },

  //setting up for quantity to be atleast one and integer
  quantity: {
    type: Number,
    required: true,
    min: 1,
    validate: {
      validator: Number.isInteger,
      message: 'Quantity must be a whole number.',
    },
  },

  //each unit price and subtotal is unit times quantity
  unitPrice: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, required: true, min: 0 },
}, { _id: false });


// order requires customer Id
const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  //order list to have at least one item
  items: {
    type: [orderItemSchema],
    validate: {
      validator: (items) => items.length > 0,
      message: 'An order must contain at least one menu item.',
    },
  },
  // total pay for whole order list
  totalAmount: { type: Number, required: true, min: 0 },

  //order status, default to be Pending
  status: {
    type: String,
    enum: ['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'],
    default: 'Pending',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
