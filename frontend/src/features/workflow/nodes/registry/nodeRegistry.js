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
import { mongoCrudManifest } from '../database/mongoCrudManifest';
import { pdfGeneratorManifest } from '../pdf/pdfGeneratorManifest';

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
  MONGO_INSERT_ONE: 'mongoInsertOne',
  MONGO_FIND: 'mongoFind',
  MONGO_FIND_ONE: 'mongoFindOne',
  MONGO_UPDATE_ONE: 'mongoUpdateOne',
  MONGO_DELETE_ONE: 'mongoDeleteOne',
  MONGO_COUNT: 'mongoCount',
  MONGO_AGGREGATE: 'mongoAggregate',
  PDF_GENERATOR: 'pdfGenerator',
};

const databaseValidator = (nodeData) => {
  const config = nodeData?.config || {};
  const errors = [];
  if (!config.credentialId) errors.push('MongoDB Credential is required.');
  if (!config.database) errors.push('Database name is required.');
  if (!config.collection) errors.push('Collection name is required.');
  return { isValid: errors.length === 0, errors };
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
  [NODE_TYPES.MONGO_INSERT_ONE]: mongoCrudManifest.mongoInsertOne,
  [NODE_TYPES.MONGO_FIND]: mongoCrudManifest.mongoFind,
  [NODE_TYPES.MONGO_FIND_ONE]: mongoCrudManifest.mongoFindOne,
  [NODE_TYPES.MONGO_UPDATE_ONE]: mongoCrudManifest.mongoUpdateOne,
  [NODE_TYPES.MONGO_DELETE_ONE]: mongoCrudManifest.mongoDeleteOne,
  [NODE_TYPES.MONGO_COUNT]: mongoCrudManifest.mongoCount,
  [NODE_TYPES.MONGO_AGGREGATE]: mongoCrudManifest.mongoAggregate,
  [NODE_TYPES.PDF_GENERATOR]: pdfGeneratorManifest,
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
  [NODE_TYPES.MONGODB]: databaseValidator,
  [NODE_TYPES.MYSQL]: databaseValidator,
  [NODE_TYPES.POSTGRES]: databaseValidator,
  [NODE_TYPES.DATABASE_QUERY]: databaseValidator,
  [NODE_TYPES.MONGO_INSERT_ONE]: databaseValidator,
  [NODE_TYPES.MONGO_FIND]: databaseValidator,
  [NODE_TYPES.MONGO_FIND_ONE]: databaseValidator,
  [NODE_TYPES.MONGO_UPDATE_ONE]: databaseValidator,
  [NODE_TYPES.MONGO_DELETE_ONE]: databaseValidator,
  [NODE_TYPES.MONGO_COUNT]: databaseValidator,
  [NODE_TYPES.MONGO_AGGREGATE]: databaseValidator,
  [NODE_TYPES.PDF_GENERATOR]: pdfGeneratorManifest.validate,
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
