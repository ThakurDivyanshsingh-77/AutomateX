import { templateService } from '../templates/templateService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getTemplates = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const templates = await templateService.getTemplates(category);
  return res.status(200).json({
    success: true,
    count: templates.length,
    data: templates,
  });
});

export const getTemplateById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const template = await templateService.getTemplateById(id);
  if (!template) {
    return res.status(404).json({ success: false, message: 'Template not found' });
  }
  return res.status(200).json({ success: true, template });
});

export const instantiateTemplate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const workflow = await templateService.instantiateTemplate(req.user._id, id);
  return res.status(201).json({
    success: true,
    message: 'Workflow template instantiated successfully',
    workflow,
  });
});
