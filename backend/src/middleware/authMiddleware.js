import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import mongoose from 'mongoose';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const secret = process.env.JWT_SECRET || 'workflow_platform_super_secret_key_2026';
      const decoded = jwt.verify(token, secret);

      if (mongoose.connection.readyState === 1) {
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          req.user = user;
          return next();
        }
      }

      // Demo/Fallback user object if DB offline
      req.user = {
        _id: decoded.id,
        name: 'Divyansh',
        email: 'abc@gmail.com',
        role: decoded.role || 'user',
        avatar: '',
        isVerified: true,
      };
      return next();

    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token invalid or expired',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }
};
