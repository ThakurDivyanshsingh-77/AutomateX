import { executionService } from '../services/executionService.js';
import { ExecutionDebuggerService } from '../debugger/ExecutionDebuggerService.js';
import { ExecutionReplay } from '../debugger/ExecutionReplay.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Run workflow execution
// @route   POST /api/v1/workflows/:id/run
// @access  Private (JWT)
export const runWorkflowExecution = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await executionService.runWorkflow(req.user._id, id);
  return res.status(200).json({
    success: true,
    message: `Workflow execution ${result.status}`,
    execution: result,
  });
});

// @desc    Get execution history with search & filters
// @route   GET /api/v1/executions
// @access  Private (JWT)
export const getUserExecutions = asyncHandler(async (req, res) => {
  const executions = await ExecutionDebuggerService.searchExecutions(req.user._id, req.query);
  return res.status(200).json({
    success: true,
    count: executions.length,
    data: executions,
  });
});

// @desc    Get single execution summary by ID
// @route   GET /api/v1/executions/:id
// @access  Private (JWT)
export const getExecutionById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const execution = await executionService.getExecutionById(req.user._id, id);
  if (!execution) {
    return res.status(404).json({ success: false, message: 'Execution record not found' });
  }
  return res.status(200).json({ success: true, execution });
});

// @desc    Get full Debug Snapshot for Execution Inspector
// @route   GET /api/v1/executions/:id/debug
// @access  Private (JWT)
export const getExecutionDebugSnapshot = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const debugSnapshot = await ExecutionDebuggerService.getDebugSnapshot(id);
  return res.status(200).json({
    success: true,
    snapshot: debugSnapshot,
  });
});

// @desc    Replay execution
// @route   POST /api/v1/executions/:id/replay
// @access  Private (JWT)
export const replayExecution = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await ExecutionReplay.replay(id);
  return res.status(200).json(result);
});

// @desc    Delete execution history record
// @route   DELETE /api/v1/executions/:id
// @access  Private (JWT)
export const deleteExecutionRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await ExecutionDebuggerService.deleteExecution(req.user._id, id);
  return res.status(200).json(result);
});

// @desc    Get execution history for specific workflow
// @route   GET /api/v1/workflows/:id/executions
// @access  Private (JWT)
export const getWorkflowExecutions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const executions = await executionService.getWorkflowExecutions(req.user._id, id);
  return res.status(200).json({
    success: true,
    count: executions.length,
    data: executions,
  });
});
