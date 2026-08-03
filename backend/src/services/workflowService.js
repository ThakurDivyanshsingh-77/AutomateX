import { Workflow } from '../models/Workflow.js';

export const workflowService = {
  createWorkflow: async (ownerId, data) => {
    const workflow = await Workflow.create({
      owner: ownerId,
      name: data.name,
      description: data.description || '',
      tags: data.tags || [],
      status: 'draft',
      visibility: data.visibility || 'private',
      definition: data.definition || {
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
      },
    });
    return workflow;
  },

  getUserWorkflows: async (ownerId, queryOptions = {}) => {
    const {
      search = '',
      status = 'all',
      sort = 'newest',
      page = 1,
      limit = 10,
    } = queryOptions;

    // Filter condition enforcing owner = req.user._id
    const query = { owner: ownerId };

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Search filter across name or tags
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Sorting options
    let sortOptions = { createdAt: -1 };
    if (sort === 'oldest') sortOptions = { createdAt: 1 };
    if (sort === 'updated') sortOptions = { updatedAt: -1 };
    if (sort === 'name') sortOptions = { name: 1 };

    // Pagination math
    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Math.max(Number(limit) || 10, 1), 50);
    const skip = (pageNum - 1) * limitNum;

    const total = await Workflow.countDocuments(query);
    const workflows = await Workflow.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const pages = Math.ceil(total / limitNum) || 1;

    return {
      workflows,
      count: workflows.length,
      total,
      page: pageNum,
      pages,
    };
  },

  getWorkflowById: async (ownerId, workflowId) => {
    const workflow = await Workflow.findOne({ _id: workflowId, owner: ownerId });
    return workflow;
  },

  updateWorkflow: async (ownerId, workflowId, updateData) => {
    const workflow = await Workflow.findOne({ _id: workflowId, owner: ownerId });
    if (!workflow) return null;

    if (updateData.name !== undefined) workflow.name = updateData.name;
    if (updateData.description !== undefined) workflow.description = updateData.description;
    if (updateData.tags !== undefined) workflow.tags = updateData.tags;
    if (updateData.status !== undefined) workflow.status = updateData.status;
    if (updateData.visibility !== undefined) workflow.visibility = updateData.visibility;
    if (updateData.definition !== undefined) workflow.definition = updateData.definition;

    const updated = await workflow.save();
    return updated;
  },

  deleteWorkflow: async (ownerId, workflowId) => {
    const workflow = await Workflow.findOne({ _id: workflowId, owner: ownerId });
    if (!workflow) return false;

    await workflow.deleteOne();
    return true;
  },

  duplicateWorkflow: async (ownerId, workflowId) => {
    const original = await Workflow.findOne({ _id: workflowId, owner: ownerId });
    if (!original) return null;

    const duplicate = await Workflow.create({
      owner: ownerId,
      name: `Copy of ${original.name}`,
      description: original.description,
      tags: original.tags,
      status: 'draft',
      visibility: original.visibility,
      definition: original.definition || { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
    });

    return duplicate;
  },

  publishWorkflow: async (ownerId, workflowId) => {
    const workflow = await Workflow.findOne({ _id: workflowId, owner: ownerId });
    if (!workflow) return null;

    workflow.status = workflow.status === 'published' ? 'draft' : 'published';
    const updated = await workflow.save();
    return updated;
  },

  archiveWorkflow: async (ownerId, workflowId) => {
    const workflow = await Workflow.findOne({ _id: workflowId, owner: ownerId });
    if (!workflow) return null;

    workflow.status = 'archived';
    const updated = await workflow.save();
    return updated;
  },
};
