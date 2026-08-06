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

const googleSheetsExecutor = new GoogleSheetsExecutor();
const googleSheetsTriggerExecutor = new GoogleSheetsTriggerExecutor();

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
    ['googleSheetsCreateSpreadsheet', googleSheetsExecutor],
    ['googleSheetsCreateWorksheet', googleSheetsExecutor],
    ['googleSheetsDuplicateWorksheet', googleSheetsExecutor],
    ['googleSheetsDeleteWorksheet', googleSheetsExecutor],
    ['googleSheetsGetSpreadsheetInfo', googleSheetsExecutor],
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
