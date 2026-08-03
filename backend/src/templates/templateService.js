import { Template } from './Template.js';
import { Workflow } from '../models/Workflow.js';
import mongoose from 'mongoose';

const DEFAULT_TEMPLATES = [
  {
    _id: '6a6ad9592c13435dff71d101',
    name: 'GitHub Issue Alert to Slack',
    description: 'Triggers on incoming GitHub issue webhooks and routes alerts to Slack team channels.',
    category: 'Development',
    icon: 'GitFork',
    isFeatured: true,
    definition: {
      nodes: [
        { id: 'n1', type: 'start', position: { x: 100, y: 100 }, data: { label: 'Start Trigger' } },
        { id: 'n2', type: 'http', position: { x: 350, y: 100 }, data: { label: 'Fetch GitHub Event', config: { method: 'GET', url: 'https://api.github.com/events' } } },
        { id: 'n3', type: 'log', position: { x: 600, y: 100 }, data: { label: 'Log Event Payload', config: { message: 'New GitHub Issue Event' } } },
        { id: 'n4', type: 'end', position: { x: 850, y: 100 }, data: { label: 'End Completion' } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
        { id: 'e3', source: 'n3', target: 'n4' },
      ],
      viewport: { x: 0, y: 0, zoom: 1 },
    },
  },
  {
    _id: '6a6ad9592c13435dff71d102',
    name: 'Public Webhook to OpenAI & Discord',
    description: 'Receives external webhooks, processes payload with AI, and dispatches message to Discord.',
    category: 'AI',
    icon: 'Zap',
    isFeatured: true,
    definition: {
      nodes: [
        { id: 'n1', type: 'start', position: { x: 100, y: 100 }, data: { label: 'Start Trigger' } },
        { id: 'n2', type: 'http', position: { x: 350, y: 100 }, data: { label: 'OpenAI Prompt Call', config: { method: 'POST', url: 'https://api.openai.com/v1/chat/completions' } } },
        { id: 'n3', type: 'delay', position: { x: 600, y: 100 }, data: { label: 'Delay 1s', config: { seconds: 1 } } },
        { id: 'n4', type: 'end', position: { x: 850, y: 100 }, data: { label: 'End Completion' } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
        { id: 'e3', source: 'n3', target: 'n4' },
      ],
      viewport: { x: 0, y: 0, zoom: 1 },
    },
  },
  {
    _id: '6a6ad9592c13435dff71d103',
    name: 'Daily Sales Summary Email Report',
    description: 'Collects metrics and dispatches daily reports to team managers.',
    category: 'Communication',
    icon: 'Mail',
    isFeatured: false,
    definition: {
      nodes: [
        { id: 'n1', type: 'start', position: { x: 100, y: 100 }, data: { label: 'Start Trigger' } },
        { id: 'n2', type: 'log', position: { x: 350, y: 100 }, data: { label: 'Gather Sales Payload', config: { message: 'Collecting daily sales metrics' } } },
        { id: 'n3', type: 'end', position: { x: 600, y: 100 }, data: { label: 'End Completion' } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
      ],
      viewport: { x: 0, y: 0, zoom: 1 },
    },
  },
];

export const templateService = {
  getTemplates: async (category = 'all') => {
    if (mongoose.connection.readyState === 1) {
      const query = category && category !== 'all' ? { category } : {};
      const templates = await Template.find(query);
      if (templates.length > 0) return templates;
    }
    if (category && category !== 'all') {
      return DEFAULT_TEMPLATES.filter((t) => t.category === category);
    }
    return DEFAULT_TEMPLATES;
  },

  getTemplateById: async (id) => {
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const template = await Template.findById(id);
      if (template) return template;
    }
    return DEFAULT_TEMPLATES.find((t) => t._id.toString() === id.toString()) || null;
  },

  instantiateTemplate: async (ownerId, templateId) => {
    const template = await templateService.getTemplateById(templateId);
    if (!template) throw new Error('Template not found');

    if (mongoose.connection.readyState === 1) {
      const newWorkflow = await Workflow.create({
        owner: ownerId,
        name: `My ${template.name}`,
        description: template.description,
        status: 'draft',
        tags: [template.category],
        definition: template.definition,
      });
      return newWorkflow;
    } else {
      return {
        _id: 'wf_tpl_' + Date.now(),
        owner: ownerId,
        name: `My ${template.name}`,
        description: template.description,
        status: 'draft',
        tags: [template.category],
        definition: template.definition,
        createdAt: new Date().toISOString(),
      };
    }
  },
};
