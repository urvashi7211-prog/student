const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT and attaches it as an HTTP-only cookie.
 * @param {object} res  - Express response object
 * @param {string} userId - MongoDB _id of the user
 * @returns {string} token
 */
const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  // Send token as HTTP-only cookie (XSS protection)
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });

  return token;
};

module.exports = generateToken;
