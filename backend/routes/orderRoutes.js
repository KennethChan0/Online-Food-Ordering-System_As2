const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { validateOrderInput } = require('../middleware/orderMiddleware');
const { addOrder,getOrders,updateOrderStatus,deleteOrder } = require('../controllers/orderController');

const router = express.Router();

//Validation check for HTTP viewing order request
router.get('/', protect, getOrders);
//Validation check for HTTP adding order request 
router.post('/', protect, validateOrderInput, addOrder);
//Validation check for HTTP updating order request, :id--> order ID
router.patch('/:id/status',protect,updateOrderStatus);
//Validation check for HTTP deleting order request 
router.delete('/:id', protect, deleteOrder);

module.exports = router;