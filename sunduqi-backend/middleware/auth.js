const jwt = require('jsonwebtoken'); // Add this at the top
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    // Check if Authorization header exists
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        message: 'Authorization header missing' 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ 
      success: false,
      message: error.name === 'JsonWebTokenError' ? 'Invalid token' : 'Please authenticate'
    });
  }
};

module.exports = auth;
