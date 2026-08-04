import express from 'express';
import {
  getDatabaseProviders,
  getDatabaseConnections,
  testDatabaseConnection,
  executeDatabaseQuery,
} from '../../controllers/databaseController.js';
import { authenticate } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/providers', getDatabaseProviders);
router.get('/connections', getDatabaseConnections);
router.post('/test', testDatabaseConnection);
router.post('/query', executeDatabaseQuery);

export default router;
