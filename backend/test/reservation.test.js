const { expect } = require('chai');
const sinon = require('sinon');
const Reservation = require('../models/Reservation');

const {
    createReservation,
    getMyReservations,
    cancelMyReservation
} = require('../controllers/reservationController');

const {
    getCustomerReservations,
    updateReservationStatus
} = require('../controllers/staffReservationController');



describe('Table Reservation Functional Testing', function () {

    const reservationId = '507f1f77bcf86cd799439011';

    const mockResponse = () => ({
        status: sinon.stub().returnsThis(),
        json: sinon.stub().returnsThis()
    });

    const validBooking = () => ({
        fullName: 'Test User',
        phoneNumber: '0123456789',
        email: 'Tester1@636.com',
        reservationDate: '2099-10-20',
        reservationTime: '18:00',
        numberOfGuests: 2,
        specialRequests: ''
    });

    afterEach(function () {
        sinon.restore();
    });

    // US19 - Create Table Reservation
    describe('US19: Create Table Reservation', function () {

        it('RT-01: should create a reservation successfully', async function () {
            const savedReservation = {
                _id: reservationId,
                ...validBooking(),
                status: 'Pending'
            };

            const createStub = sinon.stub(Reservation, 'create')
                .resolves(savedReservation);

            const req = {
                user: { _id: 'customer1', role: 'customer' },
                body: validBooking()
            };

            const res = mockResponse();

            await createReservation(req, res);

            sinon.assert.calledOnce(createStub);
            sinon.assert.calledOnceWithExactly(res.status, 201);
            sinon.assert.calledOnceWithExactly(res.json, {
                message: 'Reservation created successfully.',
                reservation: savedReservation
            });
        });

        it('RT-02: should reject missing required fields', async function () {
            const createStub = sinon.stub(Reservation, 'create');

            const req = {
                user: { _id: 'customer1', role: 'customer' },
                body: {
                    fullName: 'Test User',
                    phoneNumber: '0123456789'
                }
            };

            const res = mockResponse();

            await createReservation(req, res);

            sinon.assert.calledOnceWithExactly(res.status, 400);
            sinon.assert.calledOnceWithExactly(res.json, {
                message: 'Please complete all required fields.'
            });
            sinon.assert.notCalled(createStub);
        });
    });

    // US20 - Manage Own Reservation
    describe('US20: Manage Own Reservation', function () {

        it('RT-03: should view own reservations successfully', async function () {
            const reservations = [{
                _id: reservationId,
                customer: 'customer1',
                status: 'Pending'
            }];

            const query = {
                sort: sinon.stub().resolves(reservations)
            };

            const findStub = sinon.stub(Reservation, 'find')
                .returns(query);

            const req = {
                user: { _id: 'customer1', role: 'customer' }
            };

            const res = mockResponse();

            await getMyReservations(req, res);

            sinon.assert.calledOnceWithExactly(findStub, {
                customer: 'customer1'
            });
            sinon.assert.calledOnceWithExactly(res.status, 200);
            sinon.assert.calledOnceWithExactly(res.json, {
                message: 'Reservations retrieved successfully.',
                reservations
            });
        });

        it('RT-04: should cancel own reservation successfully', async function () {
            const reservation = {
                status: 'Pending',
                canCustomerCancel: sinon.stub().returns({
                    allowed: true
                }),
                save: sinon.stub()
            };

            reservation.save.callsFake(async () => reservation);

            const req = { reservation };
            const res = mockResponse();

            await cancelMyReservation(req, res);

            sinon.assert.calledOnce(reservation.canCustomerCancel);
            sinon.assert.calledOnce(reservation.save);
            expect(reservation.status).to.equal('Cancelled');
            sinon.assert.calledOnceWithExactly(res.status, 200);
            sinon.assert.calledOnceWithExactly(res.json, {
                message: 'Reservation cancelled successfully.',
                reservation
            });
        });
    });

    // US21 - View Customer Reservations
    describe('US21: View Customer Reservations', function () {

        it('RT-05: should allow restaurant staff to view reservations', async function () {
            const reservations = [{
                _id: reservationId,
                fullName: 'John Smith',
                status: 'Pending'
            }];

            const query = {
                select: sinon.stub().returnsThis(),
                sort: sinon.stub().resolves(reservations)
            };

            sinon.stub(Reservation, 'find').returns(query);

            const req = {
                user: { role: 'restaurant' }
            };

            const res = mockResponse();

            await getCustomerReservations(req, res);

            sinon.assert.calledOnceWithExactly(res.status, 200);
            sinon.assert.calledOnceWithExactly(res.json, {
                message: 'Customer reservations retrieved successfully.',
                reservations
            });
        });

        it('RT-06: should return empty list when no reservations exist', async function () {
            const query = {
                select: sinon.stub().returnsThis(),
                sort: sinon.stub().resolves([])
            };

            sinon.stub(Reservation, 'find').returns(query);

            const req = {
                user: { role: 'restaurant' }
            };

            const res = mockResponse();

            await getCustomerReservations(req, res);

            sinon.assert.calledOnceWithExactly(res.status, 200);
            sinon.assert.calledOnceWithExactly(res.json, {
                message: 'No customer reservations found.',
                reservations: []
            });
        });
    });

    // US22 - Update Reservation Status
    describe('US22: Update Reservation Status', function () {

        it('RT-07: should confirm a reservation successfully', async function () {
            const reservation = {
                _id: reservationId,
                status: 'Pending',
                save: sinon.stub()
            };

            reservation.save.callsFake(async () => reservation);

            const findStub = sinon.stub(Reservation, 'findById')
                .resolves(reservation);

            const req = {
                user: { role: 'restaurant' },
                params: { id: reservationId },
                body: { status: 'Confirmed' }
            };

            const res = mockResponse();

            await updateReservationStatus(req, res);

            sinon.assert.calledOnceWithExactly(findStub, reservationId);
            sinon.assert.calledOnce(reservation.save);
            expect(reservation.status).to.equal('Confirmed');
            sinon.assert.calledOnceWithExactly(res.status, 200);
            sinon.assert.calledOnceWithExactly(res.json, {
                message: 'Reservation status updated successfully.',
                reservation
            });
        });

        it('RT-08: should reject customers updating reservation status', async function () {
            const findStub = sinon.stub(Reservation, 'findById');

            const req = {
                user: { role: 'customer' },
                params: { id: reservationId },
                body: { status: 'Confirmed' }
            };

            const res = mockResponse();

            await updateReservationStatus(req, res);

            sinon.assert.calledOnceWithExactly(res.status, 403);
            sinon.assert.calledOnceWithExactly(res.json, {
                message: 'Only restaurant staff can update reservation status.'
            });
            sinon.assert.notCalled(findStub);
        });
    });
});
