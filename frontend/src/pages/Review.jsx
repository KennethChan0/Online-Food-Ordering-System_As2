

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const Review = () => {
  const { user } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load all restaurant reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/reviews');
      setReviews(response.data);
      setError('');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load reviews'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Create or update a review
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const reviewData = {
        rating: Number(rating),
        comment: comment.trim()
      };

      if (editingId) {
        await axiosInstance.put(
          `/api/reviews/${editingId}`,
          reviewData
        );
        setSuccess('Review updated successfully!');
      } else {
        await axiosInstance.post('/api/reviews', reviewData);
        setSuccess('Review submitted successfully!');
      }

      setRating(5);
      setComment('');
      setEditingId(null);

      await fetchReviews();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to save review'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Load an existing review into the form
  const handleEdit = (review) => {
    setEditingId(review._id);
    setRating(review.rating);
    setComment(review.comment);
    setError('');
    setSuccess('');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete a review after confirmation
  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');

      await axiosInstance.delete(`/api/reviews/${reviewId}`);

      if (editingId === reviewId) {
        setEditingId(null);
        setRating(5);
        setComment('');
      }

      setSuccess('Review deleted successfully!');
      await fetchReviews();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to delete review'
      );
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setRating(5);
    setComment('');
    setError('');
  };

  // Compare IDs to decide whether the current user owns a review
  const isOwner = (review) => {
    const currentUserId = user?._id || user?.id;
    const reviewUserId =
      review.user?._id || review.user;

    return Boolean(
      currentUserId &&
      reviewUserId &&
      String(currentUserId) === String(reviewUserId)
    );
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Restaurant Reviews
      </h1>

      {/* Review form */}
      {user && user.role === 'customer' && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 shadow-md rounded mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">
            {editingId ? 'Edit Your Review' : 'Write a Review'}
          </h2>

          <label className="block mb-2 font-semibold">
            Your Rating
          </label>

          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                aria-label={`Rate ${star} stars`}
                className={`text-3xl ${
                  star <= rating
                    ? 'text-yellow-500'
                    : 'text-gray-300'
                }`}
              >
                ★
              </button>
            ))}
          </div>

          <label
            htmlFor="review-comment"
            className="block mb-2 font-semibold"
          >
            Your Comment
          </label>

          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your restaurant experience..."
            className="w-full mb-4 p-2 border rounded"
            rows="4"
            required
          />

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting
                ? 'Saving...'
                : editingId
                ? 'Update Review'
                : 'Submit Review'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {/* Feedback messages */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Reviews list */}
      <h2 className="text-2xl font-bold mb-4">
        Customer Reviews
      </h2>

        {loading ? (
        <p>Loading reviews...</p>
        ) : error ? (
        <p className="text-gray-600">
            Reviews are currently unavailable.
        </p>
        ) : reviews.length === 0 ? (
        <div className="bg-white p-6 shadow-md rounded">
          <p className="text-gray-600">
            No reviews yet. Be the first to share your experience!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white p-6 shadow-md rounded"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg">
                    {review.user?.name || 'Customer'}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString()
                      : ''}
                  </p>
                </div>

                <div className="text-yellow-500 text-xl">
                  {'★'.repeat(review.rating)}
                  <span className="text-gray-300">
                    {'★'.repeat(5 - review.rating)}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                {review.comment}
              </p>

              {isOwner(review) && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleEdit(review)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(review._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Review;

