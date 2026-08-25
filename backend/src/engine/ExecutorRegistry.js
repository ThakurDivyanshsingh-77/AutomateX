import { NODE_TYPES } from '../constants/status.js';
import { ManualTriggerExecutor, WebhookTriggerExecutor, ScheduleTriggerExecutor } from './executors/TriggerExecutors.js';
import { HttpRequestExecutor, DelayExecutor, CodeTransformExecutor, ConditionExecutor, LogActionExecutor } from './executors/ActionExecutors.js';

import { LoopExecutor } from './executors/LoopExecutor.js';
import { GoogleSheetsExecutor } from './googleSheets/GoogleSheetsExecutor.js';
import { FileUploadExecutor } from './executors/FileUploadExecutor.js';
import { DocumentExtractContentExecutor } from './executors/DocumentExtractContentExecutor.js';
import { WebsiteConnectExecutor } from './executors/WebsiteConnectExecutor.js';
import { GeminiStructureProductsExecutor } from './executors/GeminiStructureProductsExecutor.js';
import { ForEachProductExecutor } from './executors/ForEachProductExecutor.js';
import { WebsiteCreateProductExecutor } from './executors/WebsiteCreateProductExecutor.js';
import { WebsiteCreateTournamentExecutor } from './executors/WebsiteCreateTournamentExecutor.js';
import { GeminiStructureTournamentExecutor } from './executors/GeminiStructureTournamentExecutor.js';
import { ForEachTournamentExecutor } from './executors/ForEachTournamentExecutor.js';
import { GitHubSyncReadmeExecutor } from './executors/GitHubSyncReadmeExecutor.js';

class ExecutorRegistry {
  constructor() {
    this.executors = new Map();
    this.registerDefaults();
  }

  registerDefaults() {
    // Triggers
    this.register(NODE_TYPES.MANUAL_TRIGGER, new ManualTriggerExecutor());
    this.register('start', new ManualTriggerExecutor());
    this.register('manual', new ManualTriggerExecutor());
    this.register(NODE_TYPES.WEBHOOK_TRIGGER, new WebhookTriggerExecutor());
    this.register(NODE_TYPES.SCHEDULE_TRIGGER, new ScheduleTriggerExecutor());
    this.register('end', new LogActionExecutor());

    // Actions
    this.register(NODE_TYPES.HTTP_REQUEST, new HttpRequestExecutor());
    this.register(NODE_TYPES.DELAY, new DelayExecutor());
    this.register(NODE_TYPES.CODE_TRANSFORM, new CodeTransformExecutor());
    this.register(NODE_TYPES.CONDITION, new ConditionExecutor());
    this.register(NODE_TYPES.LOG_ACTION, new LogActionExecutor());
    this.register('loop', new LoopExecutor());
    this.register('googleSheets', new GoogleSheetsExecutor());
    this.register('fileUpload', new FileUploadExecutor());
    this.register('fileUploadDocument', new FileUploadExecutor());
    this.register('documentUpload', new FileUploadExecutor());
    this.register('document_upload', new FileUploadExecutor());
    this.register('documentExtractContent', new DocumentExtractContentExecutor());
    this.register('documentExtract', new DocumentExtractContentExecutor());
    this.register('document_extract', new DocumentExtractContentExecutor());
    this.register('websiteConnect', new WebsiteConnectExecutor());
    this.register('website_connect', new WebsiteConnectExecutor());
    this.register('website', new WebsiteConnectExecutor());
    this.register('connectWebsite', new WebsiteConnectExecutor());
    this.register('geminiStructureProducts', new GeminiStructureProductsExecutor());
    this.register('gemini_structure_products', new GeminiStructureProductsExecutor());
    this.register('structureProducts', new GeminiStructureProductsExecutor());
    this.register('aiStructureProducts', new GeminiStructureProductsExecutor());
    this.register('forEachProduct', new ForEachProductExecutor());
    this.register('for_each_product', new ForEachProductExecutor());
    this.register('forEach', new ForEachProductExecutor());
    this.register('websiteCreateProduct', new WebsiteCreateProductExecutor());
    this.register('website_create_product', new WebsiteCreateProductExecutor());
    this.register('createProduct', new WebsiteCreateProductExecutor());
    this.register('websiteCreateTournament', new WebsiteCreateTournamentExecutor());
    this.register('website_create_tournament', new WebsiteCreateTournamentExecutor());
    this.register('createTournament', new WebsiteCreateTournamentExecutor());
    this.register('geminiStructureTournament', new GeminiStructureTournamentExecutor());
    this.register('gemini_structure_tournament', new GeminiStructureTournamentExecutor());
    this.register('structureTournament', new GeminiStructureTournamentExecutor());
    this.register('forEachTournament', new ForEachTournamentExecutor());
    this.register('for_each_tournament', new ForEachTournamentExecutor());
    this.register('githubSyncProfileReadme', new GitHubSyncReadmeExecutor());
    this.register('github_sync_profile_readme', new GitHubSyncReadmeExecutor());
    this.register('githubSyncReadme', new GitHubSyncReadmeExecutor());
    this.register('github', new GitHubSyncReadmeExecutor());
  }

  register(nodeType, executorInstance) {
    this.executors.set(nodeType, executorInstance);
  }

  getExecutor(nodeType) {
    const executor = this.executors.get(nodeType);
    if (!executor) {
      throw new Error(`No executor registered for node type: '${nodeType}'`);
    }
    return executor;
  }
}

export const executorRegistry = new ExecutorRegistry();
