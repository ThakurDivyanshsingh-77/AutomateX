import { AIWorkflowService } from '../services/ai/AIWorkflowService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Generate workflow definition from natural language prompt
// @route   POST /api/v1/ai/generate
// @access  Private (JWT)
export const generateWorkflow = asyncHandler(async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Prompt string is required',
    });
  }

  const result = await AIWorkflowService.generate(prompt.trim(), req.user._id);

  return res.status(200).json(result);
});

// @desc    Explain a workflow definition in natural language
// @route   POST /api/v1/ai/explain
// @access  Private (JWT)
export const explainWorkflow = asyncHandler(async (req, res) => {
  const { definition } = req.body;

  if (!definition) {
    return res.status(400).json({
      success: false,
      message: 'Workflow definition object is required',
    });
  }

  const result = await AIWorkflowService.explain(definition);
  return res.status(200).json(result);
});

// @desc    Optimize a workflow definition
// @route   POST /api/v1/ai/optimize
// @access  Private (JWT)
export const optimizeWorkflow = asyncHandler(async (req, res) => {
  const { definition } = req.body;

  if (!definition) {
    return res.status(400).json({
      success: false,
      message: 'Workflow definition object is required',
    });
  }

  const result = await AIWorkflowService.optimize(definition);
  return res.status(200).json(result);
});

// @desc    Auto-fix an invalid workflow graph
// @route   POST /api/v1/ai/fix
// @access  Private (JWT)
export const fixWorkflow = asyncHandler(async (req, res) => {
  const { definition } = req.body;

  if (!definition) {
    return res.status(400).json({
      success: false,
      message: 'Workflow definition object is required',
    });
  }

  const result = await AIWorkflowService.fix(definition);
  return res.status(200).json(result);
});
