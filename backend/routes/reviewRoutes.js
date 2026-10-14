
const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const reviewController = require('../controllers/reviewController');

const {
  validateReview,
  validateReviewUpdate
} = require('../middleware/reviewValidation');

router.route('/')
  .post(protect, validateReview, reviewController.createReview)
  .get(protect, reviewController.getReviews);

router.route('/:id')
  .get(protect, reviewController.getReviewById)
  .put(protect, validateReviewUpdate, reviewController.updateReview)
  .delete(protect, reviewController.deleteReview);

module.exports = router;
