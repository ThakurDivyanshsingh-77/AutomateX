import { ManualTriggerExecutor, WebhookTriggerExecutor, ScheduleTriggerExecutor, DiscordMessageReceivedTriggerExecutor } from '../executors/TriggerExecutors.js';
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
import { FileUploadExecutor } from '../executors/FileUploadExecutor.js';
import { DocumentExtractContentExecutor } from '../executors/DocumentExtractContentExecutor.js';
import { WebsiteConnectExecutor } from '../executors/WebsiteConnectExecutor.js';
import { GeminiStructureProductsExecutor } from '../executors/GeminiStructureProductsExecutor.js';
import { ForEachProductExecutor } from '../executors/ForEachProductExecutor.js';
import { WebsiteCreateProductExecutor } from '../executors/WebsiteCreateProductExecutor.js';
import { WebsiteCreateTournamentExecutor } from '../executors/WebsiteCreateTournamentExecutor.js';
import { GeminiStructureTournamentExecutor } from '../executors/GeminiStructureTournamentExecutor.js';
import { ForEachTournamentExecutor } from '../executors/ForEachTournamentExecutor.js';
import { GitHubSyncReadmeExecutor } from '../executors/GitHubSyncReadmeExecutor.js';
import { GitHubDailyActivityCommitExecutor } from '../executors/GitHubDailyActivityCommitExecutor.js';

const googleSheetsExecutor = new GoogleSheetsExecutor();
const googleSheetsTriggerExecutor = new GoogleSheetsTriggerExecutor();
const googleSheetsCreateSpreadsheetExecutor = new GoogleSheetsCreateSpreadsheetExecutor();
const googleSheetsCreateWorksheetExecutor = new GoogleSheetsCreateWorksheetExecutor();
const googleSheetsDeleteWorksheetExecutor = new GoogleSheetsDeleteWorksheetExecutor();
const googleSheetsGetSpreadsheetInfoExecutor = new GoogleSheetsGetSpreadsheetInfoExecutor();
const discordNodeExecutor = new DiscordNodeExecutor();
const aiNodeExecutor = new AiNodeExecutor();
const discordMessageReceivedExecutor = new DiscordMessageReceivedTriggerExecutor();
const fileUploadExecutor = new FileUploadExecutor();
const documentExtractContentExecutor = new DocumentExtractContentExecutor();
const websiteConnectExecutor = new WebsiteConnectExecutor();
const geminiStructureProductsExecutor = new GeminiStructureProductsExecutor();
const forEachProductExecutor = new ForEachProductExecutor();
const websiteCreateProductExecutor = new WebsiteCreateProductExecutor();
const websiteCreateTournamentExecutor = new WebsiteCreateTournamentExecutor();
const geminiStructureTournamentExecutor = new GeminiStructureTournamentExecutor();
const forEachTournamentExecutor = new ForEachTournamentExecutor();
const githubSyncReadmeExecutor = new GitHubSyncReadmeExecutor();
const githubDailyActivityCommitExecutor = new GitHubDailyActivityCommitExecutor();

export class ExecutorRegistry {
  static executors = new Map([
    ['start', new ManualTriggerExecutor()],
    ['webhook', new WebhookTriggerExecutor()],
    ['cron', new ScheduleTriggerExecutor()],
    ['schedule', new ScheduleTriggerExecutor()],
    ['discordMessageReceived', discordMessageReceivedExecutor],
    ['discordMessageReceivedTrigger', discordMessageReceivedExecutor],
    ['discord_message_received', discordMessageReceivedExecutor],
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

    // File & Document Processing Executors
    ['fileUpload', fileUploadExecutor],
    ['fileUploadDocument', fileUploadExecutor],
    ['documentUpload', fileUploadExecutor],
    ['document_upload', fileUploadExecutor],
    ['documentExtractContent', documentExtractContentExecutor],
    ['documentExtract', documentExtractContentExecutor],
    ['document_extract', documentExtractContentExecutor],

    // Website & Integration Executors
    ['websiteConnect', websiteConnectExecutor],
    ['website_connect', websiteConnectExecutor],
    ['website', websiteConnectExecutor],
    ['connectWebsite', websiteConnectExecutor],

    // Phase 3B Multi-Product & Loop Executors
    ['geminiStructureProducts', geminiStructureProductsExecutor],
    ['gemini_structure_products', geminiStructureProductsExecutor],
    ['structureProducts', geminiStructureProductsExecutor],
    ['aiStructureProducts', geminiStructureProductsExecutor],
    ['forEachProduct', forEachProductExecutor],
    ['for_each_product', forEachProductExecutor],
    ['forEach', forEachProductExecutor],
    ['websiteCreateProduct', websiteCreateProductExecutor],
    ['website_create_product', websiteCreateProductExecutor],
    ['createProduct', websiteCreateProductExecutor],
    ['websiteCreateTournament', websiteCreateTournamentExecutor],
    ['website_create_tournament', websiteCreateTournamentExecutor],
    ['createTournament', websiteCreateTournamentExecutor],
    ['geminiStructureTournament', geminiStructureTournamentExecutor],
    ['gemini_structure_tournament', geminiStructureTournamentExecutor],
    ['structureTournament', geminiStructureTournamentExecutor],
    ['forEachTournament', forEachTournamentExecutor],
    ['for_each_tournament', forEachTournamentExecutor],

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

    // GitHub Node Executors
    ['githubSyncProfileReadme', githubSyncReadmeExecutor],
    ['github_sync_profile_readme', githubSyncReadmeExecutor],
    ['githubSyncReadme', githubSyncReadmeExecutor],
    ['github', githubSyncReadmeExecutor],
    ['githubDailyActivityCommit', githubDailyActivityCommitExecutor],
    ['github_daily_activity_commit', githubDailyActivityCommitExecutor],
    ['githubDailyActivity', githubDailyActivityCommitExecutor],
    ['githubActivityCommit', githubDailyActivityCommitExecutor],
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
