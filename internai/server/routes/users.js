const express = require('express');
const { getProfile, updateProfile, changePassword, getStats } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/stats', protect, getStats);

module.exports = router;
