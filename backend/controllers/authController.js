const { validationResult } = require('express-validator');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// ─────────────────────────────────────────────────────────
//  @desc    Register a new student
//  @route   POST /api/auth/register
//  @access  Public
// ─────────────────────────────────────────────────────────
const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, email, password, course, semester } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(409)
        .json({ success: false, message: 'Email already registered.' });
    }

    const user = await User.create({ name, email, password, course, semester });

    const token = generateToken(res, user._id);

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        course: user.course,
        semester: user.semester,
      },
    });
  } catch (error) {
    console.error('Register error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─────────────────────────────────────────────────────────
//  @desc    Authenticate user & get token
//  @route   POST /api/auth/login
//  @access  Public
// ─────────────────────────────────────────────────────────
const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Explicitly select password (it has select:false in schema)
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(res, user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        course: user.course,
        semester: user.semester,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─────────────────────────────────────────────────────────
//  @desc    Logout user (clear cookie)
//  @route   POST /api/auth/logout
//  @access  Private
// ─────────────────────────────────────────────────────────
const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  return res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

// ─────────────────────────────────────────────────────────
//  @desc    Get current logged-in user
//  @route   GET /api/auth/me
//  @access  Private
// ─────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('GetMe error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { registerUser, loginUser, logoutUser, getMe };
