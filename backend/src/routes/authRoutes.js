import express from 'express';
import { registerUser, loginUser, getMe } from '../controllers/authController.js';
import { registerValidation, loginValidation } from '../validations/authValidation.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);
router.get('/me', protect, getMe);

export default router;
