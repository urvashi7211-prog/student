const express = require('express');
const {
  getProfile,
  updateProfile,
  getMyUploads,
  getNotifications,
  getDashboard,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/uploads', getMyUploads);
router.get('/notifications', getNotifications);

module.exports = router;
