const jwt = require('jsonwebtoken');

// IMPORTANT: Hardcoded JWT secret as a workaround for a tool bug.
// This should be moved to process.env.JWT_SECRET
const JWT_SECRET = 'averysecretkeythatshouldbeverylongandrandom';

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
