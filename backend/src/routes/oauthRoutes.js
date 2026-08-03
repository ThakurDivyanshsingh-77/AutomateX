import express from 'express';
import { initiateGoogleOAuth, handleGoogleCallback } from '../oauth/oauthController.js';


const router = express.Router();

// GET /api/v1/oauth/google?name=My+Gmail&userId=<id>
router.get('/google', initiateGoogleOAuth);

// GET /api/v1/oauth/google/callback
router.get('/google/callback', handleGoogleCallback);

export default router;
