
const Review = require('../models/Review');

// @desc    Create a new restaurant review
// @route   POST /api/reviews
// @access  Private - Customer
const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // Only customers can submit reviews
    if (req.user.role !== 'customer') {
      return res.status(403).json({
        message: 'Only customers can submit reviews'
      });
    }

    // Validate rating
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: 'Rating must be an integer between 1 and 5'
      });
    }

    // Validate comment
    if (typeof comment !== 'string' || !comment.trim()) {
      return res.status(400).json({
        message: 'Comment cannot be empty'
      });
    }

    // Create review using the authenticated user's ID
    const review = await Review.create({
      user: req.user._id,
      rating,
      comment: comment.trim()
    });

    return res.status(201).json(review);

  } catch (error) {
    return res.status(500).json({
      message: 'Failed to create review'
    });
  }
};

// @desc    Get all restaurant reviews
// @route   GET /api/reviews
// @access  Private
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json(reviews);

  } catch (error) {
    return res.status(500).json({
      message: 'Failed to retrieve reviews'
    });
  }
};

// @desc    Get a restaurant review by ID
// @route   GET /api/reviews/:id
// @access  Private
const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'name');

    if (!review) {
      return res.status(404).json({
        message: 'Review not found'
      });
    }

    return res.status(200).json(review);

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid review ID'
      });
    }

    return res.status(500).json({
      message: 'Failed to retrieve review'
    });
  }
};

// @desc    Update own restaurant review
// @route   PUT /api/reviews/:id
// @access  Private - Review Owner
const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // Find review
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: 'Review not found'
      });
    }

    // Check review ownership
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorized to update this review'
      });
    }

    // Validate rating if provided
    if (rating !== undefined) {
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({
          message: 'Rating must be an integer between 1 and 5'
        });
      }
    }

    // Validate comment if provided
    if (comment !== undefined) {
      if (typeof comment !== 'string' || !comment.trim()) {
        return res.status(400).json({
          message: 'Comment cannot be empty'
        });
      }
    }

    // OOP Encapsulation:
    // Delegate review updates to the Review model's instance method
    review.updateDetails(rating, comment);

    // Save updated review
    const updatedReview = await review.save();

    return res.status(200).json(updatedReview);

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid review ID'
      });
    }

    if (error.message === 'Invalid rating') {
      return res.status(400).json({
        message: 'Rating must be an integer between 1 and 5'
      });
    }

    if (error.message === 'Invalid comment') {
      return res.status(400).json({
        message: 'Comment cannot be empty'
      });
    }

    return res.status(500).json({
      message: 'Failed to update review'
    });
  }
};

// @desc    Delete own restaurant review
// @route   DELETE /api/reviews/:id
// @access  Private - Review Owner
const deleteReview = async (req, res) => {
  try {
    // Find review
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: 'Review not found'
      });
    }

    // Check review ownership
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorized to delete this review'
      });
    }

    // Delete review
    await review.deleteOne();

    return res.status(200).json({
      message: 'Review deleted successfully'
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid review ID'
      });
    }

    return res.status(500).json({
      message: 'Failed to delete review'
    });
  }
};

// Export all controller functions
module.exports = {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview
};
