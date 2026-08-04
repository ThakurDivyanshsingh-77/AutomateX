import { triggerDefinition } from '../trigger/triggerDefinition';
import { httpDefinition } from '../http/httpDefinition';
import { delayDefinition } from '../delay/delayDefinition';
import { logDefinition } from '../log/logDefinition';
import { endDefinition } from '../end/endDefinition';
import { gmailDefinition } from '../definitions/gmailDefinition';
import { conditionManifest, validateConditionNode } from '../condition';
import { webhookManifest } from '../webhook';
import { tryCatchManifest } from '../tryCatch';
import { cronManifest } from '../cron/cronManifest';
import { databaseManifest } from '../database/databaseManifest';

import { validateHttpNode } from '../validators/httpValidator';
import { validateDelayNode } from '../validators/delayValidator';
import { validateLogNode } from '../validators/logValidator';
import { gmailValidator } from '../validators/gmailValidator';

export const NODE_TYPES = {
  START: 'start',
  HTTP: 'http',
  DELAY: 'delay',
  LOG: 'log',
  END: 'end',
  GMAIL: 'gmail',
  CONDITION: 'condition',
  WEBHOOK: 'webhook',
  TRY_CATCH: 'tryCatch',
  CRON: 'cron',
  MONGODB: 'mongodb',
  MYSQL: 'mysql',
  POSTGRES: 'postgres',
  DATABASE_QUERY: 'databaseQuery',
};

// Central Registry of Node Definitions
export const nodeDefinitions = {
  [NODE_TYPES.START]: triggerDefinition,
  [NODE_TYPES.HTTP]: httpDefinition,
  [NODE_TYPES.DELAY]: delayDefinition,
  [NODE_TYPES.LOG]: logDefinition,
  [NODE_TYPES.END]: endDefinition,
  [NODE_TYPES.GMAIL]: gmailDefinition,
  [NODE_TYPES.CONDITION]: conditionManifest,
  [NODE_TYPES.WEBHOOK]: webhookManifest,
  [NODE_TYPES.TRY_CATCH]: tryCatchManifest,
  [NODE_TYPES.CRON]: cronManifest,
  [NODE_TYPES.MONGODB]: databaseManifest.mongodb,
  [NODE_TYPES.MYSQL]: databaseManifest.mysql,
  [NODE_TYPES.POSTGRES]: databaseManifest.postgres,
  [NODE_TYPES.DATABASE_QUERY]: databaseManifest.databaseQuery,
};

export const NODE_REGISTRY = nodeDefinitions;

// Central Registry of Client-side Node Validators
export const nodeValidators = {
  [NODE_TYPES.START]: () => ({ isValid: true, errors: [] }),
  [NODE_TYPES.HTTP]: validateHttpNode,
  [NODE_TYPES.DELAY]: validateDelayNode,
  [NODE_TYPES.LOG]: validateLogNode,
  [NODE_TYPES.END]: () => ({ isValid: true, errors: [] }),
  [NODE_TYPES.GMAIL]: gmailValidator,
  [NODE_TYPES.CONDITION]: validateConditionNode,
  [NODE_TYPES.WEBHOOK]: () => ({ isValid: true, errors: [] }),
  [NODE_TYPES.CRON]: cronManifest.validate,
  [NODE_TYPES.MONGODB]: () => ({ isValid: true, errors: [] }),
  [NODE_TYPES.MYSQL]: () => ({ isValid: true, errors: [] }),
  [NODE_TYPES.POSTGRES]: () => ({ isValid: true, errors: [] }),
  [NODE_TYPES.DATABASE_QUERY]: () => ({ isValid: true, errors: [] }),
};

// Helper: Get definition by node type
export const getNodeDefinition = (type) => {
  return nodeDefinitions[type] || null;
};

// Helper: Get validator by node type
export const getNodeValidator = (type) => {
  return nodeValidators[type] || (() => ({ isValid: true, errors: [] }));
};

// Helper: Check if a node type is a trigger node using registry metadata
export const isTriggerNode = (type) => {
  const def = getNodeDefinition(type);
  if (def && String(def.category).toLowerCase() === 'trigger') return true;
  return type === 'start' || type === 'webhook' || type === 'cron' || type === 'manual';
};
