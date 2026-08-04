import express from 'express';
import {
  getDatabaseProviders,
  getDatabaseConnections,
  testDatabaseConnection,
  testMongoConnection,
  getMongoStatus,
  executeDatabaseQuery,
} from '../../controllers/databaseController.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/providers', getDatabaseProviders);
router.get('/connections', getDatabaseConnections);
router.post('/test', testDatabaseConnection);
router.post('/mongodb/test', testMongoConnection);
router.get('/mongodb/status', getMongoStatus);
router.post('/query', executeDatabaseQuery);

export default router;
