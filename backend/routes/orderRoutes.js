const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { validateOrderInput } = require('../middleware/orderMiddleware');
const { addOrder } = require('../controllers/orderController');

const router = express.Router();

router.post('/', protect, validateOrderInput, addOrder);

module.exports = router;