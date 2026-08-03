import express from 'express';
import {
  getTemplates,
  getTemplateById,
  instantiateTemplate,
} from '../controllers/templateController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getTemplates);
router.get('/:id', getTemplateById);
router.post('/:id/instantiate', instantiateTemplate);

export default router;
