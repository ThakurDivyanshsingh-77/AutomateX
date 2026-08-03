import express from 'express';
import { getCronStatus, reloadCronJobs } from '../controllers/cronController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/v1/runtime/cron/status (Health monitoring endpoint)
router.get('/status', getCronStatus);

// POST /api/v1/runtime/cron/reload (Protected manual reload)
router.post('/reload', protect, reloadCronJobs);

export default router;
