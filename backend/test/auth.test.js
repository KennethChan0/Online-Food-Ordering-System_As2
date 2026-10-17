
const { expect } = require('chai');
const sinon = require('sinon');
const User = require('../models/User');

const {
    getProfile,
    updateUserProfile,
    deleteUserProfile
} = require('../controllers/authController');

// User Profile Management Functional Testing
describe('User Profile Management Functional Testing', function () {

    // Simulate Express response
    const mockResponse = () => ({
        status: sinon.stub().returnsThis(),
        json: sinon.stub().returnsThis()
    });

    // Simulate a MongoDB user
    const mockUser = () => ({
        id: 'user1',
        name: 'John',
        email: 'john@example.com',
        phone: '0412345678',
        role: 'customer',
        save: sinon.stub()
    });

    // Restore database stubs after each test
    afterEach(function () {
        sinon.restore();
    });

    // =====================================================
    // US16: View User Profile (IA1OFOS-95)
    // =====================================================
    describe('US16: View User Profile', function () {

        // AT-01: Positive Test
        it('AT-01: should view own profile successfully', async function () {
            const user = mockUser();

            const query = {
                select: sinon.stub().resolves(user)
            };

            const findStub = sinon.stub(User, 'findById')
                .returns(query);

            const req = {
                user: { id: 'user1' },
                query: {}
            };

            const res = mockResponse();

            await getProfile(req, res);

            sinon.assert.calledOnceWithExactly(findStub, 'user1');
            sinon.assert.calledOnceWithExactly(query.select, '-password');
            sinon.assert.calledOnceWithExactly(res.status, 200);
            sinon.assert.calledOnceWithExactly(res.json, {
                name: 'John',
                email: 'john@example.com',
                phone: '0412345678',
                role: 'customer'
            });
        });

        // AT-03: Negative Test
        it('AT-03: should return 404 if profile is missing', async function () {
            const query = {
                select: sinon.stub().resolves(null)
            };

            sinon.stub(User, 'findById').returns(query);

            const req = {
                user: { id: 'missingUser' },
                query: {}
            };

            const res = mockResponse();

            await getProfile(req, res);

            sinon.assert.calledOnceWithExactly(res.status, 404);
            sinon.assert.calledOnceWithExactly(res.json, {
                message: 'User not found'
            });
        });
    });

    // =====================================================
    // US17: Update User Profile (IA1OFOS-114)
    // =====================================================
    describe('US17: Update User Profile', function () {

        // AT-04: Positive Test
        it('AT-04: should update own profile successfully', async function () {
            const user = mockUser();

            user.save.callsFake(async () => user);

            const findStub = sinon.stub(User, 'findById')
                .resolves(user);

            const req = {
                user: { id: 'user1' },
                query: {},
                body: {
                    name: 'John Updated',
                    phone: '0411111111'
                }
            };

            const res = mockResponse();

            await updateUserProfile(req, res);

            sinon.assert.calledOnceWithExactly(findStub, 'user1');
            expect(user.name).to.equal('John Updated');
            expect(user.phone).to.equal('0411111111');
            sinon.assert.calledOnce(user.save);
            sinon.assert.calledOnceWithExactly(res.status, 200);
            sinon.assert.calledOnceWithExactly(res.json, {
                message: 'Profile updated successfully',
                profile: {
                    name: 'John Updated',
                    email: 'john@example.com',
                    phone: '0411111111',
                    role: 'customer'
                }
            });
        });

        // AT-05: Negative Test
        it('AT-05: should reject changes to protected fields', async function () {
            const user = mockUser();

            sinon.stub(User, 'findById').resolves(user);

            const req = {
                user: { id: 'user1' },
                query: {},
                body: {
                    name: 'John',
                    phone: '0412345678',
                    role: 'restaurant'
                }
            };

            const res = mockResponse();

            await updateUserProfile(req, res);

            sinon.assert.calledOnceWithExactly(res.status, 400);
            sinon.assert.calledOnceWithExactly(res.json, {
                message: 'Only editable profile fields can be updated'
            });
            sinon.assert.notCalled(user.save);
            expect(user.role).to.equal('customer');
        });

        // AT-06: Negative Test
        it('AT-06: should reject invalid phone number', async function () {
            const user = mockUser();

            sinon.stub(User, 'findById').resolves(user);

            const req = {
                user: { id: 'user1' },
                query: {},
                body: {
                    name: 'John',
                    phone: 'abc'
                }
            };

            const res = mockResponse();

            await updateUserProfile(req, res);

            sinon.assert.calledOnceWithExactly(res.status, 400);
            sinon.assert.calledOnceWithExactly(res.json, {
                message: 'Please enter a valid phone number'
            });
            sinon.assert.notCalled(user.save);
        });
    });

    // =====================================================
    // US18: Delete User Profile (IA1OFOS-115)
    // =====================================================
    describe('US18: Delete User Profile', function () {

        // AT-07: Positive Test
        it('AT-07: should delete own account successfully', async function () {
            const deleteStub = sinon.stub(User, 'findByIdAndDelete')
                .resolves(mockUser());

            const req = {
                user: { id: 'user1' },
                query: {},
                body: { confirmDelete: true }
            };

            const res = mockResponse();

            await deleteUserProfile(req, res);

            sinon.assert.calledOnceWithExactly(deleteStub, 'user1');
            sinon.assert.calledOnceWithExactly(res.status, 200);
            sinon.assert.calledOnceWithExactly(res.json, {
                message: 'Account deleted successfully'
            });
        });

        // AT-08: Negative Test
        it('AT-08: should reject deleting another account', async function () {
            const deleteStub = sinon.stub(User, 'findByIdAndDelete');

            const req = {
                user: { id: 'user1' },
                query: { userId: 'user2' },
                body: { confirmDelete: true }
            };

            const res = mockResponse();

            await deleteUserProfile(req, res);

            sinon.assert.calledOnceWithExactly(res.status, 400);
            sinon.assert.calledOnceWithExactly(res.json, {
                message: 'You can only delete your own account'
            });
            sinon.assert.notCalled(deleteStub);
        });
    });
});
