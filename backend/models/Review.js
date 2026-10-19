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

// OOP Encapsulation: Review manages its own update logic
reviewSchema.methods.updateDetails = function (rating, comment) {

  if (rating !== undefined) {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error('Invalid rating');
    }
    this.rating = rating;
  }

  if (comment !== undefined) {
    if (typeof comment !== 'string' || !comment.trim()) {
      throw new Error('Invalid comment');
    }
    this.comment = comment.trim();
  }
};

// Export Review model
module.exports = mongoose.model('Review', reviewSchema);
