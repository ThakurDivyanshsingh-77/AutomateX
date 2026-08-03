import { workflowService } from '../services/workflowService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import mongoose from 'mongoose';

// Fallback in-memory workflows store for DB offline mode
let inMemoryWorkflows = [
  {
    _id: 'wf_demo_1',
    owner: 'usr_demo_123',
    name: 'Daily Email Report Automation',
    description: 'Automatically collects sales metrics and dispatches summary reports',
    status: 'draft',
    visibility: 'private',
    version: 1,
    tags: ['Email', 'Marketing'],
    definition: { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'wf_demo_2',
    owner: 'usr_demo_123',
    name: 'GitHub Webhook Notifier',
    description: 'Triggers on GitHub push events and routes alerts to team channels',
    status: 'published',
    visibility: 'private',
    version: 1,
    tags: ['Developer', 'Webhook'],
    definition: { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// @desc    Create new workflow
// @route   POST /api/v1/workflows
// @access  Private (JWT)
export const createWorkflow = asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    const workflow = await workflowService.createWorkflow(req.user._id, req.body);
    return res.status(201).json({
      success: true,
      message: 'Workflow created successfully',
      workflow,
    });
  } else {
    // In-memory fallback
    const newWf = {
      _id: 'wf_' + Date.now(),
      owner: req.user?._id || 'usr_demo_123',
      name: req.body.name,
      description: req.body.description || '',
      status: 'draft',
      visibility: req.body.visibility || 'private',
      version: 1,
      tags: req.body.tags || [],
      definition: req.body.definition || { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryWorkflows.unshift(newWf);
    return res.status(201).json({
      success: true,
      message: 'Workflow created successfully',
      workflow: newWf,
    });
  }
});

// @desc    Get all workflows for current user (with search, status filter, sort, pagination)
// @route   GET /api/v1/workflows
// @access  Private (JWT)
export const getWorkflows = asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    const result = await workflowService.getUserWorkflows(req.user._id, req.query);
    return res.status(200).json({
      success: true,
      count: result.count,
      total: result.total,
      page: result.page,
      pages: result.pages,
      data: result.workflows,
    });
  } else {
    let list = [...inMemoryWorkflows];
    const { search, status, sort, page = 1, limit = 10 } = req.query;

    if (status && status !== 'all') {
      list = list.filter((w) => w.status === status);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (sort === 'oldest') list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    else list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = list.length;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const start = (pageNum - 1) * limitNum;
    const paginated = list.slice(start, start + limitNum);

    return res.status(200).json({
      success: true,
      count: paginated.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: paginated,
    });
  }
});

// @desc    Get single workflow by ID
// @route   GET /api/v1/workflows/:id
// @access  Private (JWT)
export const getWorkflowById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (mongoose.connection.readyState === 1) {
    const workflow = await workflowService.getWorkflowById(req.user._id, id);
    if (!workflow) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }
    return res.status(200).json({ success: true, workflow });
  } else {
    const wf = inMemoryWorkflows.find((w) => w._id === id);
    if (!wf) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }
    return res.status(200).json({ success: true, workflow: wf });
  }
});

// @desc    Update workflow
// @route   PUT /api/v1/workflows/:id
// @access  Private (JWT)
export const updateWorkflow = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (mongoose.connection.readyState === 1) {
    const updated = await workflowService.updateWorkflow(req.user._id, id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }
    return res.status(200).json({
      success: true,
      message: 'Workflow updated successfully',
      workflow: updated,
    });
  } else {
    const idx = inMemoryWorkflows.findIndex((w) => w._id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }
    const current = inMemoryWorkflows[idx];
    inMemoryWorkflows[idx] = {
      ...current,
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    return res.status(200).json({
      success: true,
      message: 'Workflow updated successfully',
      workflow: inMemoryWorkflows[idx],
    });
  }
});

// @desc    Delete workflow
// @route   DELETE /api/v1/workflows/:id
// @access  Private (JWT)
export const deleteWorkflow = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (mongoose.connection.readyState === 1) {
    const deleted = await workflowService.deleteWorkflow(req.user._id, id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }
    return res.status(200).json({ success: true, message: 'Workflow deleted successfully' });
  } else {
    const idx = inMemoryWorkflows.findIndex((w) => w._id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }
    inMemoryWorkflows.splice(idx, 1);
    return res.status(200).json({ success: true, message: 'Workflow deleted successfully' });
  }
});

// @desc    Duplicate workflow
// @route   POST /api/v1/workflows/:id/duplicate
// @access  Private (JWT)
export const duplicateWorkflow = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (mongoose.connection.readyState === 1) {
    const duplicate = await workflowService.duplicateWorkflow(req.user._id, id);
    if (!duplicate) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }
    return res.status(201).json({
      success: true,
      message: 'Workflow duplicated successfully',
      workflow: duplicate,
    });
  } else {
    const original = inMemoryWorkflows.find((w) => w._id === id);
    if (!original) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }
    const duplicate = {
      ...original,
      _id: 'wf_' + Date.now(),
      name: `Copy of ${original.name}`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryWorkflows.unshift(duplicate);
    return res.status(201).json({
      success: true,
      message: 'Workflow duplicated successfully',
      workflow: duplicate,
    });
  }
});

// @desc    Publish / Unpublish workflow
// @route   PATCH /api/v1/workflows/:id/publish
// @access  Private (JWT)
export const publishWorkflow = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (mongoose.connection.readyState === 1) {
    const updated = await workflowService.publishWorkflow(req.user._id, id);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }
    return res.status(200).json({
      success: true,
      message: `Workflow ${updated.status === 'published' ? 'published' : 'unpublished'} successfully`,
      workflow: updated,
    });
  } else {
    const idx = inMemoryWorkflows.findIndex((w) => w._id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }
    const current = inMemoryWorkflows[idx];
    current.status = current.status === 'published' ? 'draft' : 'published';
    current.updatedAt = new Date().toISOString();
    return res.status(200).json({
      success: true,
      message: `Workflow ${current.status === 'published' ? 'published' : 'unpublished'} successfully`,
      workflow: current,
    });
  }
});

// @desc    Archive workflow
// @route   PATCH /api/v1/workflows/:id/archive
// @access  Private (JWT)
export const archiveWorkflow = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (mongoose.connection.readyState === 1) {
    const updated = await workflowService.archiveWorkflow(req.user._id, id);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }
    return res.status(200).json({
      success: true,
      message: 'Workflow archived successfully',
      workflow: updated,
    });
  } else {
    const idx = inMemoryWorkflows.findIndex((w) => w._id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }
    inMemoryWorkflows[idx].status = 'archived';
    inMemoryWorkflows[idx].updatedAt = new Date().toISOString();
    return res.status(200).json({
      success: true,
      message: 'Workflow archived successfully',
      workflow: inMemoryWorkflows[idx],
    });
  }
});
