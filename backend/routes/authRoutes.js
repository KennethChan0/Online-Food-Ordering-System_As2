const express = require('express');
const {registerUser, loginUser, updateUserProfile, getProfile, deleteUserProfile} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
//GET /PUT DELETE /api/auth/profile
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateUserProfile);
router.delete('/profile', protect, deleteUserProfile);

module.exports = router;