import { ManualTriggerExecutor, WebhookTriggerExecutor, ScheduleTriggerExecutor } from '../executors/TriggerExecutors.js';
import { HttpExecutor } from '../executors/HttpExecutor.js';
import { DelayExecutor } from '../executors/DelayExecutor.js';
import { LogExecutor } from '../executors/LogExecutor.js';
import { EndExecutor } from '../executors/EndExecutor.js';
import { GmailExecutor } from '../executors/GmailExecutor.js';
import { ConditionExecutor } from '../executors/ConditionExecutor.js';
import { TryCatchExecutor } from '../executors/TryCatchExecutor.js';
import { DatabaseExecutor } from '../database/DatabaseExecutor.js';
import { PdfGeneratorExecutor } from '../executors/PdfGeneratorExecutor.js';
import { GoogleSheetsExecutor } from '../googleSheets/GoogleSheetsExecutor.js';
import { GoogleSheetsTriggerExecutor } from '../googleSheets/GoogleSheetsTriggerExecutor.js';
import { GoogleSheetsCreateSpreadsheetExecutor } from '../googleSheets/GoogleSheetsCreateSpreadsheetExecutor.js';
import { GoogleSheetsCreateWorksheetExecutor } from '../googleSheets/GoogleSheetsCreateWorksheetExecutor.js';
import { GoogleSheetsDeleteWorksheetExecutor } from '../googleSheets/GoogleSheetsDeleteWorksheetExecutor.js';
import { GoogleSheetsGetSpreadsheetInfoExecutor } from '../googleSheets/GoogleSheetsGetSpreadsheetInfoExecutor.js';
import { DiscordNodeExecutor } from '../../discord/executors/DiscordNodeExecutor.js';
import { AiNodeExecutor } from '../../ai/executors/AiNodeExecutor.js';

const googleSheetsExecutor = new GoogleSheetsExecutor();
const googleSheetsTriggerExecutor = new GoogleSheetsTriggerExecutor();
const googleSheetsCreateSpreadsheetExecutor = new GoogleSheetsCreateSpreadsheetExecutor();
const googleSheetsCreateWorksheetExecutor = new GoogleSheetsCreateWorksheetExecutor();
const googleSheetsDeleteWorksheetExecutor = new GoogleSheetsDeleteWorksheetExecutor();
const googleSheetsGetSpreadsheetInfoExecutor = new GoogleSheetsGetSpreadsheetInfoExecutor();
const discordNodeExecutor = new DiscordNodeExecutor();
const aiNodeExecutor = new AiNodeExecutor();

export class ExecutorRegistry {
  static executors = new Map([
    ['start', new ManualTriggerExecutor()],
    ['webhook', new WebhookTriggerExecutor()],
    ['cron', new ScheduleTriggerExecutor()],
    ['schedule', new ScheduleTriggerExecutor()],
    ['http', new HttpExecutor()],
    ['delay', new DelayExecutor()],
    ['log', new LogExecutor()],
    ['end', new EndExecutor()],
    ['gmail', new GmailExecutor()],
    ['condition', new ConditionExecutor()],
    ['tryCatch', new TryCatchExecutor()],
    ['mongodb', DatabaseExecutor],
    ['mysql', DatabaseExecutor],
    ['postgres', DatabaseExecutor],
    ['databaseQuery', DatabaseExecutor],
    ['database', DatabaseExecutor],
    ['mongoInsertOne', DatabaseExecutor],
    ['mongoFind', DatabaseExecutor],
    ['mongoFindOne', DatabaseExecutor],
    ['mongoUpdateOne', DatabaseExecutor],
    ['mongoDeleteOne', DatabaseExecutor],
    ['mongoCount', DatabaseExecutor],
    ['mongoAggregate', DatabaseExecutor],
    ['pdfGenerator', new PdfGeneratorExecutor()],

    // Discord Node Executors
    ['discordSendMessage', discordNodeExecutor],
    ['discordSendEmbed', discordNodeExecutor],
    ['discordEmbed', discordNodeExecutor],
    ['discordCreateChannel', discordNodeExecutor],
    ['discordDeleteChannel', discordNodeExecutor],
    ['discordCreateRole', discordNodeExecutor],
    ['discordDeleteRole', discordNodeExecutor],
    ['discordAddRoleToMember', discordNodeExecutor],
    ['discordRemoveRoleFromMember', discordNodeExecutor],
    ['discord', discordNodeExecutor],

    // AI Node Executors
    ['aiGenerateText', aiNodeExecutor],
    ['ai', aiNodeExecutor],
    ['openaiGenerateText', aiNodeExecutor],
    ['openAiGenerateText', aiNodeExecutor],
    ['geminiGenerateText', aiNodeExecutor],
    ['googleGeminiGenerateText', aiNodeExecutor],




    // Google Sheets Node Executors (Exact matching string registration)
    ['googleSheets', googleSheetsExecutor],
    ['googleSheetsTrigger', googleSheetsTriggerExecutor],
    ['googleSheetsTriggerWatchRows', googleSheetsTriggerExecutor],
    ['googleSheetsReadRows', googleSheetsExecutor],
    ['googleSheetsFindRow', googleSheetsExecutor],
    ['googleSheetsAppendRow', googleSheetsExecutor],
    ['googleSheetsUpdateRow', googleSheetsExecutor],
    ['googleSheetsDeleteRow', googleSheetsExecutor],
    ['googleSheetsClearRange', googleSheetsExecutor],
    ['googleSheetsBatchUpdate', googleSheetsExecutor],
    ['googleSheetsCreateSpreadsheet', googleSheetsCreateSpreadsheetExecutor],
    ['googleSheetsCreateWorksheet', googleSheetsCreateWorksheetExecutor],
    ['googleSheetsDuplicateWorksheet', googleSheetsExecutor],
    ['googleSheetsDeleteWorksheet', googleSheetsDeleteWorksheetExecutor],
    ['googleSheetsGetSpreadsheetInfo', googleSheetsGetSpreadsheetInfoExecutor],
  ]);

  static getExecutor(nodeType) {
    const executor = this.executors.get(nodeType);
    if (!executor) {
      throw new Error(`No executor registered for node type: "${nodeType}"`);
    }
    return executor;
  }

  static registerExecutor(nodeType, executorInstance) {
    this.executors.set(nodeType, executorInstance);
  }
}

try {
  console.log('[ExecutorRegistry] Initializing backend executor registry...');
  for (const [nodeType, executor] of ExecutorRegistry.executors.entries()) {
    if (!executor) {
      throw new Error(`Executor handler for node type "${nodeType}" is undefined or missing.`);
    }
    const name = executor.name || executor.constructor?.name || typeof executor;
    console.log(`[ExecutorRegistry] Registered node executor: "${nodeType}" -> ${name}`);
  }
  console.log(`[ExecutorRegistry] Successfully registered ${ExecutorRegistry.executors.size} node executors.`);
} catch (err) {
  console.error('[ExecutorRegistry] Backend executor registration failed:', err);
}
