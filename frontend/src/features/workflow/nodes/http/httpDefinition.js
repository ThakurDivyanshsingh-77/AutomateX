import { Globe } from 'lucide-react';
import { validateHttpNode } from '../validators/httpValidator';

export const httpDefinition = {
  type: 'http',
  label: 'HTTP Request',
  category: 'Action',
  description: 'Executes REST API calls (GET, POST, PUT, DELETE)',
  icon: Globe,
  color: 'blue',
  badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  hasInputHandle: true,
  hasOutputHandle: true,
  defaultConfig: {
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/todos/1',
    headers: [{ key: 'Content-Type', value: 'application/json' }],
    body: '',
  },
  configSchema: [
    {
      name: 'method',
      label: 'HTTP Method',
      type: 'select',
      options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      description: 'Select request protocol method',
    },
    {
      name: 'url',
      label: 'Request URL',
      type: 'text',
      placeholder: 'https://api.example.com/v1/resource',
      description: 'Destination API endpoint URL',
    },
    {
      name: 'headers',
      label: 'Request Headers',
      type: 'keyvalue',
      description: 'HTTP headers key-value list',
    },
    {
      name: 'body',
      label: 'Request Body (JSON)',
      type: 'textarea',
      placeholder: '{\n  "key": "value"\n}',
      rows: 4,
      description: 'JSON payload sent with POST/PUT requests',
    },
  ],
  validate: (config) => validateHttpNode(config),
};
