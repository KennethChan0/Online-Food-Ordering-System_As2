// Middleware to validate restaurant review input
const validateReview = (req, res, next) => {
  const { rating, comment } = req.body;

  // Validate rating (must be an integer between 1 and 5)
  if (
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return res.status(400).json({
      message: 'Rating must be an integer between 1 and 5'
    });
  }

  // Validate comment (must not be empty)
  if (
    typeof comment !== 'string' ||
    comment.trim().length === 0
  ) {
    return res.status(400).json({
      message: 'Comment cannot be empty'
    });
  }

  // Validation passed, continue to the controller
  next();
};

// Middleware to validate updates to an existing review
const validateReviewUpdate = (req, res, next) => {
  const { rating, comment } = req.body;

  // Require at least one field to update
  if (rating === undefined && comment === undefined) {
    return res.status(400).json({
      message: 'Provide a rating or comment to update'
    });
  }

  // Validate rating only if provided
  if (
    rating !== undefined &&
    (!Number.isInteger(rating) || rating < 1 || rating > 5)
  ) {
    return res.status(400).json({
      message: 'Rating must be an integer between 1 and 5'
    });
  }

  // Validate comment only if provided
  if (
    comment !== undefined &&
    (typeof comment !== 'string' || comment.trim().length === 0)
  ) {
    return res.status(400).json({
      message: 'Comment cannot be empty'
    });
  }

  // Validation passed, continue to the controller
  next();
};

module.exports = {
  validateReview,
  validateReviewUpdate
};
