const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { validateOrderInput } = require('../middleware/orderMiddleware');
const { addOrder,getOrders,updateOrderStatus } = require('../controllers/orderController');

const router = express.Router();

router.get('/', protect, getOrders);
router.post('/', protect, validateOrderInput, addOrder);
router.patch('/:id/status',protect,updateOrderStatus);

module.exports = router;