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
import { fileUploadManifest } from '../fileUpload/fileUploadManifest';
import { documentExtractManifest } from '../documentExtract/documentExtractManifest';
import { websiteConnectManifest } from '../websiteConnect/websiteConnectManifest';

import { validateHttpNode } from '../validators/httpValidator';
import { validateDelayNode } from '../validators/delayValidator';
import { validateLogNode } from '../validators/logValidator';
import { gmailValidator } from '../validators/gmailValidator';
import { googleSheetsValidator } from '../googleSheets/googleSheetsValidator';

import { GOOGLE_SHEETS_NODE_TYPES, googleSheetsNodeDefinitions } from '../googleSheets/GoogleSheetsNodeRegistry';
import { DISCORD_NODE_TYPES, discordNodeDefinitions, discordValidator, discordCreateChannelValidator, discordDeleteChannelValidator, discordCreateRoleValidator, discordDeleteRoleValidator, discordAddRoleToMemberValidator, discordRemoveRoleFromMemberValidator, discordMessageReceivedValidator } from '../discord/DiscordNodeRegistry';
import { AI_NODE_TYPES, aiNodeDefinitions, aiGenerateTextValidator } from '../ai/AiNodeRegistry';

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
  FILE_UPLOAD: 'fileUpload',
  DOCUMENT_EXTRACT: 'documentExtractContent',
  WEBSITE_CONNECT: 'websiteConnect',
  ...GOOGLE_SHEETS_NODE_TYPES,
  ...DISCORD_NODE_TYPES,
  ...AI_NODE_TYPES,
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
  [NODE_TYPES.FILE_UPLOAD]: fileUploadManifest,
  fileUploadDocument: fileUploadManifest,
  [NODE_TYPES.DOCUMENT_EXTRACT]: documentExtractManifest,
  documentExtract: documentExtractManifest,
  [NODE_TYPES.WEBSITE_CONNECT]: websiteConnectManifest,
  websiteConnect: websiteConnectManifest,
  website_connect: websiteConnectManifest,
  googleSheets: googleSheetsNodeDefinitions.googleSheetsAppendRow,
  ...googleSheetsNodeDefinitions,
  discordMessageReceived: discordNodeDefinitions.discordMessageReceived,
  discordMessageReceivedTrigger: discordNodeDefinitions.discordMessageReceived,
  discordSendMessage: discordNodeDefinitions.discordSendMessage,
  discord: discordNodeDefinitions.discord,
  ...discordNodeDefinitions,
  aiGenerateText: aiNodeDefinitions.aiGenerateText,
  ai: aiNodeDefinitions.ai,
  ...aiNodeDefinitions,
};

export const NODE_REGISTRY = nodeDefinitions;

try {
  console.log('[NodeRegistry] Initializing node registry during application startup...');
  Object.entries(nodeDefinitions).forEach(([type, def]) => {
    if (!def) {
      throw new Error(`Node definition for type "${type}" is undefined or missing.`);
    }
    console.log(`[NodeRegistry] Registered node: "${def.label || type}" (type: ${type}, category: ${def.category || 'N/A'})`);
  });
  console.log(`[NodeRegistry] Successfully registered ${Object.keys(nodeDefinitions).length} nodes.`);
} catch (err) {
  console.error('[NodeRegistry] Node registration failed during startup:', err);
}

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
  [NODE_TYPES.FILE_UPLOAD]: fileUploadManifest.validate,
  fileUploadDocument: fileUploadManifest.validate,
  [NODE_TYPES.DOCUMENT_EXTRACT]: documentExtractManifest.validate,
  documentExtract: documentExtractManifest.validate,
  [NODE_TYPES.WEBSITE_CONNECT]: websiteConnectManifest.validate,
  websiteConnect: websiteConnectManifest.validate,
  website_connect: websiteConnectManifest.validate,
  [GOOGLE_SHEETS_NODE_TYPES.TRIGGER_WATCH_ROWS]: googleSheetsValidator,
  [GOOGLE_SHEETS_NODE_TYPES.READ_ROWS]: googleSheetsValidator,
  [GOOGLE_SHEETS_NODE_TYPES.FIND_ROW]: googleSheetsValidator,
  [GOOGLE_SHEETS_NODE_TYPES.APPEND_ROW]: googleSheetsValidator,
  [GOOGLE_SHEETS_NODE_TYPES.UPDATE_ROW]: googleSheetsValidator,
  [GOOGLE_SHEETS_NODE_TYPES.DELETE_ROW]: googleSheetsValidator,
  [GOOGLE_SHEETS_NODE_TYPES.CLEAR_RANGE]: googleSheetsValidator,
  [GOOGLE_SHEETS_NODE_TYPES.BATCH_UPDATE]: googleSheetsValidator,
  [GOOGLE_SHEETS_NODE_TYPES.CREATE_SPREADSHEET]: googleSheetsValidator,
  [GOOGLE_SHEETS_NODE_TYPES.CREATE_WORKSHEET]: googleSheetsValidator,
  [GOOGLE_SHEETS_NODE_TYPES.DUPLICATE_WORKSHEET]: googleSheetsValidator,
  [GOOGLE_SHEETS_NODE_TYPES.DELETE_WORKSHEET]: googleSheetsValidator,
  [GOOGLE_SHEETS_NODE_TYPES.GET_SPREADSHEET_INFO]: googleSheetsValidator,
  googleSheets: googleSheetsValidator,
  discordMessageReceived: discordMessageReceivedValidator,
  discordMessageReceivedTrigger: discordMessageReceivedValidator,
  discordSendMessage: discordValidator,
  discordSendEmbed: discordValidator,
  discordEmbed: discordValidator,
  discordCreateChannel: discordCreateChannelValidator,
  discordDeleteChannel: discordDeleteChannelValidator,
  discordCreateRole: discordCreateRoleValidator,
  discordDeleteRole: discordDeleteRoleValidator,
  discordAddRoleToMember: discordAddRoleToMemberValidator,
  discordRemoveRoleFromMember: discordRemoveRoleFromMemberValidator,
  discord: discordValidator,
  aiGenerateText: aiGenerateTextValidator,
  openaiGenerateText: aiGenerateTextValidator,
  openAiGenerateText: aiGenerateTextValidator,
  geminiGenerateText: aiGenerateTextValidator,
  googleGeminiGenerateText: aiGenerateTextValidator,
  ai: aiGenerateTextValidator,
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
