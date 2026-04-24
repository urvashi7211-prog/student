const express = require('express');
const {
  getAllUsers,
  deleteUser,
  getAllResources,
  toggleResourceApproval,
  broadcastNotification,
  getDashboardStats,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// All routes require authentication AND admin role
router.use(protect, authorizeRoles('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/resources', getAllResources);
router.put('/resources/:id/approve', toggleResourceApproval);
router.post('/notifications', broadcastNotification);

module.exports = router;
