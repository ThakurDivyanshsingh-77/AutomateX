import express from 'express';
import { listPlugins, getPluginByName } from '../controllers/pluginController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', listPlugins);
router.get('/:name', getPluginByName);

export default router;
