const mongoose = require('mongoose');

// Define review schema
const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be an integer'
    }
  },

  comment: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

// Export Review model
module.exports = mongoose.model('Review', reviewSchema);
