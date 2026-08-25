/**
 * CapabilityRegistry.js
 * Source of truth for all real AutomateX nodes, capabilities, credentials, and parameters.
 * Prevents LLM hallucination of nonexistent nodes or integrations.
 */

export const NODE_CAPABILITIES = {
  // ─── Triggers ─────────────────────────────────────────────────────────────
  start: {
    nodeType: 'start',
    category: 'trigger',
    name: 'Manual Trigger',
    description: 'Triggers a workflow manually or via API execution launch.',
    capabilities: ['workflow.trigger.manual', 'workflow.start'],
    inputs: [],
    outputs: ['triggeredAt', 'payload'],
    requiredCredentials: [],
    requiredFields: [],
  },
  webhook: {
    nodeType: 'webhook',
    category: 'trigger',
    name: 'Webhook Trigger',
    description: 'Listens for incoming HTTP POST/GET requests and triggers workflow.',
    capabilities: ['workflow.trigger.webhook', 'http.receive', 'form.receive'],
    inputs: [],
    outputs: ['body', 'headers', 'query', 'method'],
    requiredCredentials: [],
    requiredFields: [],
  },
  cron: {
    nodeType: 'cron',
    category: 'trigger',
    name: 'Cron Schedule Trigger',
    description: 'Triggers workflow on a recurring time schedule or cron expression.',
    capabilities: ['workflow.trigger.schedule', 'workflow.trigger.cron', 'timer.recurring', 'daily.schedule'],
    inputs: [],
    outputs: ['triggeredAt', 'cron'],
    requiredCredentials: [],
    requiredFields: ['expression', 'cronExpression'],
  },
  discordMessageReceived: {
    nodeType: 'discordMessageReceived',
    category: 'trigger',
    name: 'Discord → Message Received',
    description: 'Triggers workflow when a message is posted in a Discord channel.',
    capabilities: ['discord.message.received', 'discord.trigger'],
    inputs: [],
    outputs: ['message', 'content', 'channelId', 'author'],
    requiredCredentials: ['discord'],
    requiredFields: ['channelId'],
  },
  googleSheetsTriggerWatchRows: {
    nodeType: 'googleSheetsTriggerWatchRows',
    category: 'trigger',
    name: 'Google Sheets → Watch New Rows',
    description: 'Triggers workflow when new rows are added to a Google Spreadsheet.',
    capabilities: ['googlesheets.trigger.watch_rows', 'sheets.watch'],
    inputs: [],
    outputs: ['rows', 'spreadsheetId', 'sheetName'],
    requiredCredentials: ['google'],
    requiredFields: ['spreadsheetId'],
  },

  // ─── Actions: Messaging & Notifications ──────────────────────────────────
  discordSendMessage: {
    nodeType: 'discordSendMessage',
    category: 'action',
    name: 'Discord → Send Message',
    description: 'Sends a text message to a designated Discord channel.',
    capabilities: ['discord.message.send', 'notify.discord', 'message.send'],
    inputs: ['content', 'message'],
    outputs: ['messageId', 'status'],
    requiredCredentials: ['discord'],
    requiredFields: ['channelId', 'content'],
  },
  discordSendEmbed: {
    nodeType: 'discordSendEmbed',
    category: 'action',
    name: 'Discord → Send Embed',
    description: 'Sends a formatted rich embed message with color and fields to Discord.',
    capabilities: ['discord.embed.send', 'notify.discord.embed', 'discord.message.send'],
    inputs: ['title', 'description', 'color', 'url'],
    outputs: ['messageId', 'status'],
    requiredCredentials: ['discord'],
    requiredFields: ['channelId', 'title'],
  },
  gmail: {
    nodeType: 'gmail',
    category: 'action',
    name: 'Gmail → Send Email',
    description: 'Sends an email via Gmail API.',
    capabilities: ['email.send', 'gmail.send', 'notify.email'],
    inputs: ['to', 'subject', 'body'],
    outputs: ['messageId', 'status'],
    requiredCredentials: ['google', 'gmail'],
    requiredFields: ['to', 'subject', 'body'],
  },

  // ─── Actions: GitHub Integrations ─────────────────────────────────────────
  githubSyncProfileReadme: {
    nodeType: 'githubSyncProfileReadme',
    category: 'action',
    name: 'GitHub → Sync Profile README',
    description: 'Synchronizes public repositories with user GitHub profile README inside managed markers.',
    capabilities: ['github.sync.profile_readme', 'github.update.readme', 'github.readme.sync'],
    inputs: ['repository', 'branch', 'maxRepositories'],
    outputs: ['changed', 'committed', 'repository', 'projectsSynced'],
    requiredCredentials: ['github'],
    requiredFields: [],
  },
  githubDailyActivityCommit: {
    nodeType: 'githubDailyActivityCommit',
    category: 'action',
    name: 'GitHub → Daily Activity Commit',
    description: 'Creates a daily automation heartbeat commit in a designated repository.',
    capabilities: ['github.activity.commit', 'github.commit.daily', 'github.heartbeat'],
    inputs: ['repository', 'activityFile', 'commitMessage'],
    outputs: ['changed', 'committed', 'date', 'commitSha'],
    requiredCredentials: ['github'],
    requiredFields: ['repository'],
  },

  // ─── Actions: Google Sheets ──────────────────────────────────────────────
  googleSheetsAppendRow: {
    nodeType: 'googleSheetsAppendRow',
    category: 'action',
    name: 'Google Sheets → Append Row',
    description: 'Appends a new row of values to a Google Sheet.',
    capabilities: ['googlesheets.row.append', 'sheets.write', 'table.append'],
    inputs: ['spreadsheetId', 'sheetName', 'values'],
    outputs: ['updatedRange', 'updatedRows'],
    requiredCredentials: ['google'],
    requiredFields: ['spreadsheetId', 'sheetName'],
  },
  googleSheetsReadRows: {
    nodeType: 'googleSheetsReadRows',
    category: 'action',
    name: 'Google Sheets → Read Rows',
    description: 'Reads data rows from a Google Sheet range.',
    capabilities: ['googlesheets.row.read', 'sheets.read', 'table.read'],
    inputs: ['spreadsheetId', 'range'],
    outputs: ['rows', 'rowCount'],
    requiredCredentials: ['google'],
    requiredFields: ['spreadsheetId', 'range'],
  },

  // ─── Actions: Databases ──────────────────────────────────────────────────
  mongoInsertOne: {
    nodeType: 'mongoInsertOne',
    category: 'action',
    name: 'MongoDB → Insert Document',
    description: 'Inserts a single JSON document into a MongoDB collection.',
    capabilities: ['database.insert', 'mongodb.insert', 'db.save'],
    inputs: ['document', 'collection', 'database'],
    outputs: ['insertedId', 'acknowledged'],
    requiredCredentials: ['mongodb'],
    requiredFields: ['database', 'collection', 'document'],
  },
  mongoFind: {
    nodeType: 'mongoFind',
    category: 'action',
    name: 'MongoDB → Find Documents',
    description: 'Queries documents in a MongoDB collection with filters.',
    capabilities: ['database.query', 'mongodb.find', 'db.read'],
    inputs: ['query', 'collection', 'database'],
    outputs: ['documents', 'count'],
    requiredCredentials: ['mongodb'],
    requiredFields: ['database', 'collection'],
  },

  // ─── Actions: AI & Intelligence ──────────────────────────────────────────
  aiGenerateText: {
    nodeType: 'aiGenerateText',
    category: 'action',
    name: 'AI → Generate Text',
    description: 'Generates text, summaries, or structured extraction using AI models (Gemini / Grok / OpenAI).',
    capabilities: ['ai.text.generate', 'ai.summarize', 'ai.extract', 'llm.prompt'],
    inputs: ['prompt', 'model'],
    outputs: ['text', 'usage'],
    requiredCredentials: ['ai', 'openai', 'gemini'],
    requiredFields: ['prompt'],
  },

  // ─── Core Logic & Flow Control ───────────────────────────────────────────
  http: {
    nodeType: 'http',
    category: 'action',
    name: 'HTTP Request',
    description: 'Makes an external REST API call (GET, POST, PUT, DELETE).',
    capabilities: ['http.request', 'api.call', 'webhook.send', 'rest.call'],
    inputs: ['url', 'method', 'headers', 'body'],
    outputs: ['status', 'data', 'headers'],
    requiredCredentials: [],
    requiredFields: ['url'],
  },
  condition: {
    nodeType: 'condition',
    category: 'action',
    name: 'Condition Filter',
    description: 'Evaluates logical conditions and branches workflow execution (True / False).',
    capabilities: ['flow.condition', 'flow.branch', 'logic.filter'],
    inputs: ['expression', 'leftOperand', 'operator', 'rightOperand'],
    outputs: ['result'],
    requiredCredentials: [],
    requiredFields: [],
  },
  delay: {
    nodeType: 'delay',
    category: 'action',
    name: 'Delay Timer',
    description: 'Pauses workflow execution for a specified duration in seconds or minutes.',
    capabilities: ['flow.delay', 'timer.wait', 'sleep'],
    inputs: ['duration', 'unit'],
    outputs: ['resumedAt'],
    requiredCredentials: [],
    requiredFields: ['duration'],
  },
  log: {
    nodeType: 'log',
    category: 'action',
    name: 'Log Message',
    description: 'Logs data or custom messages into execution logs.',
    capabilities: ['log.message', 'debug.log'],
    inputs: ['message'],
    outputs: ['loggedAt'],
    requiredCredentials: [],
    requiredFields: [],
  },
  pdfGenerator: {
    nodeType: 'pdfGenerator',
    category: 'action',
    name: 'PDF Generator',
    description: 'Generates a PDF document from HTML or markdown templates.',
    capabilities: ['document.pdf.generate', 'pdf.create'],
    inputs: ['template', 'data'],
    outputs: ['pdfUrl', 'pdfBuffer'],
    requiredCredentials: [],
    requiredFields: [],
  },
  documentExtractContent: {
    nodeType: 'documentExtractContent',
    category: 'action',
    name: 'Document → Extract Content',
    description: 'Parses and extracts textual content from PDF, DOCX, or text files.',
    capabilities: ['document.extract', 'file.parse'],
    inputs: ['fileUrl'],
    outputs: ['content', 'pageCount'],
    requiredCredentials: [],
    requiredFields: [],
  },
  end: {
    nodeType: 'end',
    category: 'action',
    name: 'End Completion',
    description: 'Terminates the workflow successfully and returns the final payload.',
    capabilities: ['workflow.end', 'workflow.terminate'],
    inputs: [],
    outputs: ['completedAt', 'finalPayload'],
    requiredCredentials: [],
    requiredFields: [],
  },
};

export class CapabilityRegistry {
  /**
   * Get all registered node definitions
   */
  static getAllNodes() {
    return Object.values(NODE_CAPABILITIES);
  }

  /**
   * Find node by capability tag
   */
  static findNodeByCapability(capabilityTag) {
    const tag = String(capabilityTag).toLowerCase().trim();
    for (const node of Object.values(NODE_CAPABILITIES)) {
      if (node.capabilities.some((c) => c.toLowerCase() === tag || c.toLowerCase().includes(tag))) {
        return node;
      }
    }
    return null;
  }

  /**
   * Check if a nodeType is registered
   */
  static hasNodeType(nodeType) {
    return Boolean(NODE_CAPABILITIES[nodeType]);
  }

  /**
   * Get node specification by nodeType
   */
  static getNodeSpec(nodeType) {
    return NODE_CAPABILITIES[nodeType] || null;
  }
}
