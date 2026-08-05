import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import mongoose from 'mongoose';

export const protect = async (req, res, next) => {
  let token;

  // 1. Check Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    // 2. Check HttpOnly cookie
    token = req.cookies.token;
  } else if (req.query && req.query.token) {
    // 3. Check query param token
    token = req.query.token;
  }

  console.log(`[AuthMiddleware] 🔍 Path: ${req.method} ${req.originalUrl}`);
  console.log(`[AuthMiddleware] 🍪 Cookies:`, req.cookies || 'None');
  console.log(`[AuthMiddleware] 🔑 Header Authorization:`, req.headers.authorization || 'None');

  if (token) {
    try {
      const secret = process.env.JWT_SECRET || 'workflow_platform_super_secret_key_2026';
      const decoded = jwt.verify(token, secret);
      console.log(`[AuthMiddleware] ✅ Token verified for User ID: ${decoded.id}`);

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
      console.warn(`[AuthMiddleware] ❌ Token validation error on ${req.originalUrl}: ${error.message}`);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token invalid or expired',
      });
    }
  }

  console.warn(`[AuthMiddleware] 🚫 No token provided for ${req.method} ${req.originalUrl}`);
  return res.status(401).json({
    success: false,
    message: 'Not authorized, no token provided',
  });
};

export const authenticate = protect;
