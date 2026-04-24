const User = require('../models/User');
const Resource = require('../models/Resource');
const Notification = require('../models/Notification');

// ─────────────────────────────────────────────────────────
//  @desc    Get own profile
//  @route   GET /api/users/profile
//  @access  Private
// ─────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('getProfile error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─────────────────────────────────────────────────────────
//  @desc    Update own profile
//  @route   PUT /api/users/profile
//  @access  Private
// ─────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { name, course, semester, interests } = req.body;

    if (name) user.name = name;
    if (course !== undefined) user.course = course;
    if (semester) user.semester = Number(semester);
    if (interests) {
      user.interests = Array.isArray(interests)
        ? interests
        : interests.split(',').map((i) => i.trim());
    }

    // Handle password update
    if (req.body.password) {
      if (req.body.password.length < 6) {
        return res
          .status(400)
          .json({ success: false, message: 'Password must be at least 6 characters.' });
      }
      user.password = req.body.password; // pre-save hook will hash it
    }

    const updated = await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated.',
      user: {
        _id: updated._id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        course: updated.course,
        semester: updated.semester,
        interests: updated.interests,
      },
    });
  } catch (error) {
    console.error('updateProfile error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─────────────────────────────────────────────────────────
//  @desc    Get resources uploaded by current user
//  @route   GET /api/users/uploads
//  @access  Private
// ─────────────────────────────────────────────────────────
const getMyUploads = async (req, res) => {
  try {
    const resources = await Resource.find({ uploadedBy: req.user._id }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ success: true, count: resources.length, resources });
  } catch (error) {
    console.error('getMyUploads error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─────────────────────────────────────────────────────────
//  @desc    Get notifications for current user
//  @route   GET /api/users/notifications
//  @access  Private
// ─────────────────────────────────────────────────────────
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [{ isBroadcast: true }, { recipients: req.user._id }],
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('createdBy', 'name');

    // Mark as read for this user
    await Notification.updateMany(
      {
        $or: [{ isBroadcast: true }, { recipients: req.user._id }],
        readBy: { $ne: req.user._id },
      },
      { $addToSet: { readBy: req.user._id } }
    );

    return res.status(200).json({ success: true, count: notifications.length, notifications });
  } catch (error) {
    console.error('getNotifications error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─────────────────────────────────────────────────────────
//  @desc    Get student dashboard overview
//  @route   GET /api/users/dashboard
//  @access  Private
// ─────────────────────────────────────────────────────────
const getDashboard = async (req, res) => {
  try {
    const [recentResources, myUploadsCount, unreadCount] = await Promise.all([
      Resource.find({ isApproved: true })
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('uploadedBy', 'name'),
      Resource.countDocuments({ uploadedBy: req.user._id }),
      Notification.countDocuments({
        $or: [{ isBroadcast: true }, { recipients: req.user._id }],
        readBy: { $ne: req.user._id },
      }),
    ]);

    return res.status(200).json({
      success: true,
      dashboard: {
        recentResources,
        myUploadsCount,
        unreadNotifications: unreadCount,
      },
    });
  } catch (error) {
    console.error('getDashboard error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getProfile, updateProfile, getMyUploads, getNotifications, getDashboard };
