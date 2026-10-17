
const { expect } = require('chai');
const sinon = require('sinon');

const Order = require('../models/Order');
const Task = require('../models/Task');

const {
    addOrder,
    getOrders,
    updateOrderStatus,
    deleteOrder
} = require('../controllers/orderController');

describe('Order Management Functional Testing', function () {

    const orderId = '507f1f77bcf86cd799439011';
    const menuItemId = '507f1f77bcf86cd799439012';

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
    // US7: Order Creation (IA1OFOS-81)
    // =====================================================
    describe('US7: Order Creation', function () {

        // OT-01: Positive Test
        it('OT-01: should allow a customer to create an order', async function () {

            const menuItem = {
                _id: menuItemId,
                title: 'Burger',
                price: 15
            };

            const savedOrder = {
                _id: orderId,
                customer: 'customer1',
                totalAmount: 30
            };

            const menuStub = sinon.stub(Task, 'findById')
                .resolves(menuItem);

            const createStub = sinon.stub(Order, 'create')
                .resolves(savedOrder);

            const req = {
                user: {
                    id: 'customer1',
                    role: 'customer'
                },
                body: {
                    items: [
                        {
                            menuItem: menuItemId,
                            quantity: 2
                        }
                    ]
                }
            };

            const res = mockResponse();

            await addOrder(req, res);

            sinon.assert.calledOnceWithExactly(menuStub, menuItemId);

            sinon.assert.calledOnceWithExactly(createStub, {
                customer: 'customer1',
                items: [{
                    menuItem: menuItemId,
                    name: 'Burger',
                    quantity: 2,
                    unitPrice: 15,
                    subtotal: 30
                }],
                totalAmount: 30
            });

            sinon.assert.calledOnceWithExactly(res.status, 201);
            sinon.assert.calledOnceWithExactly(res.json, {
                message: 'Order created successfully.',
                order: savedOrder
            });
        });

        // OT-02: Negative Test
        it('OT-02: should reject an order with a missing menu item', async function () {

            sinon.stub(Task, 'findById').resolves(null);

            const createStub = sinon.stub(Order, 'create');

            const req = {
                user: {
                    id: 'customer1',
                    role: 'customer'
                },
                body: {
                    items: [{
                        menuItem: menuItemId,
                        quantity: 1
                    }]
                }
            };

            const res = mockResponse();

            await addOrder(req, res);

            sinon.assert.calledOnceWithExactly(res.status, 404);
            sinon.assert.calledOnceWithExactly(res.json, {
                message: 'A selected menu item was not found.'
            });

            sinon.assert.notCalled(createStub);
        });
    });

    // =====================================================
    // US8: Order Update (IA1OFOS-50)
    // =====================================================
    describe('US8: Order Update', function () {

        // OT-03: Positive Test
        it('OT-03: should allow restaurant staff to update order status', async function () {

            // Use a valid status from the Order model
            const allowedStatuses = Order.schema.path('status').enumValues;
            const newStatus = allowedStatuses.find(
                status => status !== 'Pending'
            ) || allowedStatuses[0];

            const order = {
                _id: orderId,
                status: 'Pending',
                save: sinon.stub().resolves(),
                populate: sinon.stub().resolves()
            };

            const findStub = sinon.stub(Order, 'findById')
                .resolves(order);

            const req = {
                user: { role: 'restaurant' },
                params: { id: orderId },
                body: { status: newStatus }
            };

            const res = mockResponse();

            await updateOrderStatus(req, res);

            sinon.assert.calledOnceWithExactly(findStub, orderId);

            expect(order.status).to.equal(newStatus);

            sinon.assert.calledOnce(order.save);

            sinon.assert.calledOnceWithExactly(
                order.populate,
                'customer',
                'name email'
            );

            sinon.assert.calledOnceWithExactly(res.status, 200);
            sinon.assert.calledOnceWithExactly(res.json, {
                message: 'Order status updated successfully',
                order
            });
        });

        // OT-04: Negative Test
        it('OT-04: should reject customers updating order status', async function () {

            const findStub = sinon.stub(Order, 'findById');

            const req = {
                user: { role: 'customer' },
                params: { id: orderId },
                body: { status: 'Confirmed' }
            };

            const res = mockResponse();

            await updateOrderStatus(req, res);

            sinon.assert.calledOnceWithExactly(res.status, 403);
            sinon.assert.calledOnceWithExactly(res.json, {
                message: 'Only restaurant staff can update order status.'
            });

            sinon.assert.notCalled(findStub);
        });
    });

    // =====================================================
    // US9: Order Viewing (IA1OFOS-55)
    // =====================================================
    describe('US9: Order Viewing', function () {

        // OT-05: Positive Test
        it('OT-05: should allow customers to view their own orders', async function () {

            const orders = [{
                _id: orderId,
                customer: 'customer1',
                totalAmount: 30
            }];

            const query = {
                sort: sinon.stub().resolves(orders)
            };

            const findStub = sinon.stub(Order, 'find')
                .returns(query);

            const req = {
                user: {
                    id: 'customer1',
                    role: 'customer'
                }
            };

            const res = mockResponse();

            await getOrders(req, res);

            sinon.assert.calledOnceWithExactly(findStub, {
                customer: 'customer1'
            });

            sinon.assert.calledOnceWithExactly(
                query.sort,
                { createdAt: -1 }
            );

            sinon.assert.calledOnceWithExactly(res.status, 200);
            sinon.assert.calledOnceWithExactly(res.json, orders);
        });

        // OT-06: Positive Test
        it('OT-06: should allow restaurant staff to view all orders', async function () {

            const orders = [{
                _id: orderId,
                customer: {
                    name: 'John',
                    email: 'john@example.com'
                },
                totalAmount: 30
            }];

            const query = {
                sort: sinon.stub().returnsThis(),
                populate: sinon.stub().resolves(orders)
            };

            const findStub = sinon.stub(Order, 'find')
                .returns(query);

            const req = {
                user: { role: 'restaurant' }
            };

            const res = mockResponse();

            await getOrders(req, res);

            sinon.assert.calledOnceWithExactly(findStub, {});

            sinon.assert.calledOnceWithExactly(
                query.sort,
                { createdAt: -1 }
            );

            sinon.assert.calledOnceWithExactly(
                query.populate,
                'customer',
                'name email'
            );

            sinon.assert.calledOnceWithExactly(res.status, 200);
            sinon.assert.calledOnceWithExactly(res.json, orders);
        });
    });

    // =====================================================
    // US10: Order Cancellation (IA1OFOS-89)
    // =====================================================
    describe('US10: Order Cancellation', function () {

        // OT-07: Positive Test
        it('OT-07: should allow restaurant staff to delete an order', async function () {

            const deleteStub = sinon.stub(Order, 'findByIdAndDelete')
                .resolves({ _id: orderId });

            const req = {
                user: { role: 'restaurant' },
                params: { id: orderId }
            };

            const res = mockResponse();

            await deleteOrder(req, res);

            sinon.assert.calledOnceWithExactly(deleteStub, orderId);

            sinon.assert.calledOnceWithExactly(res.status, 200);
            sinon.assert.calledOnceWithExactly(res.json, {
                message: 'Order deleted successfully.'
            });
        });

        // OT-08: Negative Test
        it('OT-08: should reject customers deleting orders', async function () {

            const deleteStub = sinon.stub(Order, 'findByIdAndDelete');

            const req = {
                user: { role: 'customer' },
                params: { id: orderId }
            };

            const res = mockResponse();

            await deleteOrder(req, res);

            sinon.assert.calledOnceWithExactly(res.status, 403);
            sinon.assert.calledOnceWithExactly(res.json, {
                message: 'Only restaurant staff can delete orders.'
            });

            sinon.assert.notCalled(deleteStub);
        });
    });
});
