
const { expect } = require('chai');
const sinon = require('sinon');
const Review = require('../models/Review');

const {
    createReview,
    getReviews,
    getReviewById,
    updateReview,
    deleteReview
} = require('../controllers/reviewController');

describe('Review Management Functional Testing', function () {

    const reviewId = '507f1f77bcf86cd799439011';

    // Simulate Express response
    const mockResponse = () => ({
        status: sinon.stub().returnsThis(),
        json: sinon.stub().returnsThis()
    });

    // Restore mocked functions after each test
    afterEach(function () {
        sinon.restore();
    });

    // =====================================================
    // US12: Submit Restaurant Review (IA1OFOS-105)
    // =====================================================
    describe('US12: Submit Restaurant Review', function () {

        // VT-01: Positive Test
        it('VT-01: should allow a customer to submit a review', async function () {

            const savedReview = {
                _id: reviewId,
                user: 'customer1',
                rating: 5,
                comment: 'Excellent food!'
            };

            const createStub = sinon.stub(Review, 'create')
                .resolves(savedReview);

            const req = {
                user: {
                    _id: 'customer1',
                    role: 'customer'
                },
                body: {
                    rating: 5,
                    comment: 'Excellent food!'
                }
            };

            const res = mockResponse();

            await createReview(req, res);

            sinon.assert.calledOnceWithExactly(createStub, {
                user: 'customer1',
                rating: 5,
                comment: 'Excellent food!'
            });

            sinon.assert.calledOnceWithExactly(res.status, 201);
            sinon.assert.calledOnceWithExactly(res.json, savedReview);
        });

        // VT-02: Negative Test
        it('VT-02: should reject an invalid rating', async function () {

            const createStub = sinon.stub(Review, 'create');

            const req = {
                user: {
                    _id: 'customer1',
                    role: 'customer'
                },
                body: {
                    rating: 6,
                    comment: 'Good food'
                }
            };

            const res = mockResponse();

            await createReview(req, res);

            sinon.assert.calledOnceWithExactly(res.status, 400);
            sinon.assert.calledOnceWithExactly(res.json, {
                message: 'Rating must be an integer between 1 and 5'
            });

            sinon.assert.notCalled(createStub);
        });
    });

    // =====================================================
    // US13: View Restaurant Review (IA1OFOS-106)
    // =====================================================
    describe('US13: View Restaurant Review', function () {

        // VT-03: Positive Test
        it('VT-03: should retrieve all reviews successfully', async function () {

            const reviews = [{
                _id: reviewId,
                rating: 5,
                comment: 'Excellent food!'
            }];

            const query = {
                populate: sinon.stub().returnsThis(),
                sort: sinon.stub().resolves(reviews)
            };

            const findStub = sinon.stub(Review, 'find')
                .returns(query);

            const req = {};
            const res = mockResponse();

            await getReviews(req, res);

            sinon.assert.calledOnce(findStub);

            sinon.assert.calledOnceWithExactly(
                query.populate,
                'user',
                'name'
            );

            sinon.assert.calledOnceWithExactly(
                query.sort,
                { createdAt: -1 }
            );

            sinon.assert.calledOnceWithExactly(res.status, 200);
            sinon.assert.calledOnceWithExactly(res.json, reviews);
        });

        // VT-04: Negative Test
        it('VT-04: should return 404 when review is not found', async function () {

            const query = {
                populate: sinon.stub().resolves(null)
            };

            sinon.stub(Review, 'findById').returns(query);

            const req = {
                params: { id: reviewId }
            };

            const res = mockResponse();

            await getReviewById(req, res);

            sinon.assert.calledOnceWithExactly(res.status, 404);
            sinon.assert.calledOnceWithExactly(res.json, {
                message: 'Review not found'
            });
        });
    });

    // =====================================================
    // US14: Edit Reviews (IA1OFOS-107)
    // =====================================================
    describe('US14: Edit Reviews', function () {

        // VT-05: Positive Test
        it('VT-05: should allow a customer to edit their own review', async function () {

            const review = {
                _id: reviewId,
                user: 'customer1',
                rating: 4,
                comment: 'Good food',
                save: sinon.stub()
            };

            review.save.callsFake(async () => review);

            const findStub = sinon.stub(Review, 'findById')
                .resolves(review);

            const req = {
                user: { _id: 'customer1' },
                params: { id: reviewId },
                body: {
                    rating: 5,
                    comment: 'Excellent food!'
                }
            };

            const res = mockResponse();

            await updateReview(req, res);

            sinon.assert.calledOnceWithExactly(findStub, reviewId);

            expect(review.rating).to.equal(5);
            expect(review.comment).to.equal('Excellent food!');

            sinon.assert.calledOnce(review.save);
            sinon.assert.calledOnceWithExactly(res.status, 200);
            sinon.assert.calledOnceWithExactly(res.json, review);
        });

        // VT-06: Negative Test
        it('VT-06: should prevent editing another user review', async function () {

            const review = {
                _id: reviewId,
                user: 'customer2',
                rating: 4,
                comment: 'Good food',
                save: sinon.stub()
            };

            sinon.stub(Review, 'findById').resolves(review);

            const req = {
                user: { _id: 'customer1' },
                params: { id: reviewId },
                body: {
                    rating: 5,
                    comment: 'Updated comment'
                }
            };

            const res = mockResponse();

            await updateReview(req, res);

            sinon.assert.calledOnceWithExactly(res.status, 403);
            sinon.assert.calledOnceWithExactly(res.json, {
                message: 'Not authorized to update this review'
            });

            sinon.assert.notCalled(review.save);
        });
    });

    // =====================================================
    // US15: Delete Restaurant Reviews (IA1OFOS-108)
    // =====================================================
    describe('US15: Delete Restaurant Reviews', function () {

        // VT-07: Positive Test
        it('VT-07: should allow a customer to delete their own review', async function () {

            const review = {
                _id: reviewId,
                user: 'customer1',
                deleteOne: sinon.stub().resolves()
            };

            const findStub = sinon.stub(Review, 'findById')
                .resolves(review);

            const req = {
                user: { _id: 'customer1' },
                params: { id: reviewId }
            };

            const res = mockResponse();

            await deleteReview(req, res);

            sinon.assert.calledOnceWithExactly(findStub, reviewId);
            sinon.assert.calledOnce(review.deleteOne);

            sinon.assert.calledOnceWithExactly(res.status, 200);
            sinon.assert.calledOnceWithExactly(res.json, {
                message: 'Review deleted successfully'
            });
        });

        // VT-08: Negative Test
        it('VT-08: should prevent deleting another user review', async function () {

            const review = {
                _id: reviewId,
                user: 'customer2',
                deleteOne: sinon.stub()
            };

            sinon.stub(Review, 'findById').resolves(review);

            const req = {
                user: { _id: 'customer1' },
                params: { id: reviewId }
            };

            const res = mockResponse();

            await deleteReview(req, res);

            sinon.assert.calledOnceWithExactly(res.status, 403);
            sinon.assert.calledOnceWithExactly(res.json, {
                message: 'Not authorized to delete this review'
            });

            sinon.assert.notCalled(review.deleteOne);
        });
    });
});
