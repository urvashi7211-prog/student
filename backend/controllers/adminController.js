const User = require('../models/User');
const Resource = require('../models/Resource');
const Notification = require('../models/Notification');

// ─────────────────────────────────────────────────────────
//  @desc    Get all users
//  @route   GET /api/admin/users
//  @access  Admin
// ─────────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    console.error('getAllUsers error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─────────────────────────────────────────────────────────
//  @desc    Delete a user
//  @route   DELETE /api/admin/users/:id
//  @access  Admin
// ─────────────────────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account.' });
    }

    await user.deleteOne();
    return res.status(200).json({ success: true, message: 'User deleted.' });
  } catch (error) {
    console.error('deleteUser error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─────────────────────────────────────────────────────────
//  @desc    Get all resources (admin view)
//  @route   GET /api/admin/resources
//  @access  Admin
// ─────────────────────────────────────────────────────────
const getAllResources = async (req, res) => {
  try {
    const resources = await Resource.find()
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: resources.length, resources });
  } catch (error) {
    console.error('getAllResources error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─────────────────────────────────────────────────────────
//  @desc    Approve or reject a resource
//  @route   PUT /api/admin/resources/:id/approve
//  @access  Admin
// ─────────────────────────────────────────────────────────
const toggleResourceApproval = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    resource.isApproved = !resource.isApproved;
    await resource.save();

    return res.status(200).json({
      success: true,
      message: `Resource ${resource.isApproved ? 'approved' : 'rejected'}.`,
      resource,
    });
  } catch (error) {
    console.error('toggleResourceApproval error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─────────────────────────────────────────────────────────
//  @desc    Broadcast a notification to all users
//  @route   POST /api/admin/notifications
//  @access  Admin
// ─────────────────────────────────────────────────────────
const broadcastNotification = async (req, res) => {
  const { title, message, type } = req.body;

  if (!title || !message) {
    return res
      .status(400)
      .json({ success: false, message: 'Title and message are required.' });
  }

  try {
    const notification = await Notification.create({
      title,
      message,
      type: type || 'info',
      isBroadcast: true,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Notification broadcasted.',
      notification,
    });
  } catch (error) {
    console.error('broadcastNotification error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─────────────────────────────────────────────────────────
//  @desc    Get dashboard stats for admin
//  @route   GET /api/admin/stats
//  @access  Admin
// ─────────────────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalResources, totalNotifications, recentResources] =
      await Promise.all([
        User.countDocuments({ role: 'student' }),
        Resource.countDocuments(),
        Notification.countDocuments(),
        Resource.find({ isApproved: true })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('uploadedBy', 'name'),
      ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalResources,
        totalNotifications,
        recentResources,
      },
    });
  } catch (error) {
    console.error('getDashboardStats error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
  getAllResources,
  toggleResourceApproval,
  broadcastNotification,
  getDashboardStats,
};
