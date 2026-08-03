import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import mongoose from 'mongoose';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const secret = process.env.JWT_SECRET || 'workflow_automation_super_secret_key_2026';
      const decoded = jwt.verify(token, secret);

      if (mongoose.connection.readyState === 1) {
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          req.user = user;
          return next();
        }
      }

      // Fallback user object if DB offline or demo token
      req.user = {
        _id: decoded.id,
        name: 'Divyansh User',
        email: 'user@workflow.internal',
        role: 'user',
        avatar: '',
        isVerified: true,
        createdAt: new Date().toISOString()
      };
      return next();

    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};
