# PROJECT_CONTEXT.md - AI Handoff & Memory Bank

> **Single Source of Truth** for AI agents and developers working on the AutomateX Workflow Automation Platform.

---..

## 🚀 Project Overview

The **AutomateX Workflow Automation Platform** is an enterprise-grade, modular, production-ready visual workflow automation SaaS similar to n8n, Zapier, and Make.

---

## 📅 Platform Milestones & Completed Phases

### **Phase 1 Complete — Authentication & Foundation** — ✅ COMPLETED
- Phase 1.1: Project Setup, Layered Architecture, Express Bootstrap.
- Phase 1.2: Backend Authentication System (`User` model, bcrypt, JWT).
- Phase 1.3: Frontend Authentication & State Management (`AuthContext`, `api.js` interceptor, Toast alerts, `ProtectedRoute`).

### **Phase 2 Complete — Workflow Management System** — ✅ COMPLETED
- CRUD REST APIs, Search, Filter, Sort, Pagination, Duplicate, Publish, Archive, and User Ownership Guards.

### **Phase 3 Complete — Visual Workflow Builder** — ✅ COMPLETED
- Visual canvas editor with `@xyflow/react`, drag-and-drop, connection validation rules, debounced auto-save (2s delay), manual `Ctrl+S` shortcut, and definition graph JSON persistence.

### **Phase 4 Complete — Node System & Configuration Engine** — ✅ COMPLETED
- Central Node Registry system, modular node definitions (`trigger`, `http`, `delay`, `log`, `end`), form primitives, `AutoForm`, client-side node validators, live error badges, live search bar, and category palette grouping.

### **Phase 5 Complete — Standalone Workflow Execution Engine** — ✅ COMPLETED
- Standalone Graph Engine, Adjacency List Traversal, Node `fetch()` HTTP Executor, `ExecutionContext` RAM state, step logger, and execution history persistence.

### **Phase 6 Complete — Runtime, Trigger System & Queue Architecture** — ✅ COMPLETED
- Runtime Event Bus & Entry Point (`RuntimeEventBus.js`, `RuntimeManager.js`), Trigger Registry (`ManualTrigger`, `WebhookTrigger`, `CronTrigger`), Public Webhook API (`POST /api/v1/webhooks/:token`), Queue System & Background Worker (`QueueProducer.js`, `ExecutionWorker.js`), `RetryManager`, `TimeoutManager`, and `CronScheduler`.

### **Phase 7 Complete — Integration Framework & Plugin Architecture** — ✅ COMPLETED
- AES-256-CBC Encrypted Credentials Vault, `ConnectorClient` layer, `PluginRegistry.js` (`gmail`, `slack`, `discord`, `telegram`, `http`), Workflow Templates Marketplace, and frontend Vault (`/credentials`) & Store (`/templates`) pages.

### **Phase 7.2 Complete — Real Gmail OAuth 2.0 Integration** — ✅ COMPLETED
- **Google OAuth 2.0 Flow**: `GoogleOAuthClient.js`, backend routes (`/api/v1/oauth/google`, `/api/v1/oauth/google/callback`), auto-refreshing access tokens, and encrypted OAuth vault storage.
- **Production Gmail Executor**: `googleapis` `gmail.users.messages.send()`. Supports To, CC, BCC, Subject, Plain Text & HTML body types, and search/read operations.
- **Frontend Properties Panel**: Custom `GmailProperties.jsx` with credential dropdown, **Connect Gmail** OAuth popup flow, **Test Connection** button (`gmail.users.getProfile`), and `/oauth/callback` landing page.

### **Phase 8.1 Complete — Condition (IF) Node & Branching Engine** — ✅ COMPLETED
- **Frontend Package** (`features/workflow/nodes/condition/`): `ConditionNode.jsx` with dual `TRUE` & `FALSE` output handles, `ConditionProperties.jsx` with 13 boolean operators, client-side validator, and registered under `Logic` category in Node Palette.
- **Backend Condition Executor** (`ConditionExecutor.js`): Expression evaluation engine resolving variables/mustache templates from `context` and returning `{ result, selectedBranch: 'true'|'false' }`. Registered in `ExecutorRegistry.js`.
- **Graph Traversal Branching** (`WorkflowEngine.js`): Graph orchestrator evaluating `sourceHandle` (`'true'` vs `'false'`), ensuring single-branch execution routing for condition nodes.

### **Phase 8.2 Complete — Expression Engine (Production Implementation)** — ✅ COMPLETED
- **Expression Engine Package** (`backend/src/engine/expression/`): `ExpressionEngine.js`, `ExpressionParser.js` (with LRU token caching), `ExpressionResolver.js` (supporting nested paths & `items[0]` array syntax), and `helpers.js`.
- **Runtime & Executor Integration**: Integrated automatically in `WorkflowEngine.js` before every node executes. Passed 13/13 unit tests.

### **Phase 8.3 Complete — Variable Picker & Data Explorer** — ✅ COMPLETED
- **Expression Components Package** (`frontend/src/components/expression/`): `ExpressionInput.jsx` (with **Insert Variable** button, `Ctrl + Space` shortcut, and live sample preview), `VariablePickerModal.jsx`, `VariableTree.jsx` (with type badges), `VariableSearch.jsx`, and `VariablePreview.jsx`.
- **Form Properties Integration**: Updated `TextField.jsx`, `TextareaField.jsx`, and `ConditionProperties.jsx`.

### **Phase 8.4 Complete — Webhook Trigger (Production Grade)** — ✅ COMPLETED
- **Backend Webhook Subsystem** (`backend/src/webhooks/`): `WebhookAuth.js` (Bearer/API Key/Secret), `WebhookValidator.js` (100 req/min Rate Limiter), `WebhookService.js`, `WebhookReplay.js`, `WebhookController.js`, and `WebhookRouter.js`.
- **Frontend Webhook Package** (`features/workflow/nodes/webhook/`): `WebhookNode.jsx`, `WebhookProperties.jsx`, `WebhookURL.jsx`, and `WebhookTester.jsx`.

### **Phase 8.5 Complete — Execution Debugger & Inspector** — ✅ COMPLETED
- **Backend Debugger Subsystem** (`backend/src/debugger/`): `ExecutionSnapshot.js`, `ExecutionInspector.js`, `ExecutionMetrics.js`, `ExecutionReplay.js`, and `ExecutionDebuggerService.js`.
- **Frontend Debugger Package** (`frontend/src/components/debugger/`): `ExecutionDebugger.jsx`, `ExecutionTimeline.jsx`, `ExecutionInspector.jsx`, `NodeInspector.jsx`, `ExpressionInspector.jsx`, `PerformancePanel.jsx`, and `ExecutionReplay.jsx`.

### **Phase 9.1 Complete — Error Handling & Retry Engine** — ✅ COMPLETED
- **Backend Retry Package** (`backend/src/engine/retry/`):
  - `RetryPolicy.js`: Strategy delay calculator supporting `Immediate` (0ms), `Fixed`, `Exponential Backoff`, and `Linear Backoff`.
  - `RetryEngine.js`: Wraps node execution with automatic retry attempts, records attempt history, and flags `recovered` status on success after retries.
  - `TryCatchExecutor.js`: Try/Catch flow control executor registered in `ExecutorRegistry.js`.
  - `WorkflowEngine.js`: Orchestrator loop upgraded for retry handling, dedicated `error` branch handle routing, and `continueOnError` fallback.
- **Frontend Error & Retry Features**:
  - `RetryConfigFields.jsx`: Config section in `AutoForm.jsx` allowing users to configure Retry Attempts ($0-10$), Delay (ms), Strategy, and Continue On Error.
  - `TryCatchNode.jsx`: Try/Catch canvas node with `TRY` (green) and `CATCH` (red) handles.

### **Phase 9.2 Complete — Workflow History & Execution Logging System** — ✅ COMPLETED
- **Backend History Subsystem**: `ExecutionStep.js` & `Execution.js` Mongoose models, `ExecutionLogger.js` structured logger service, `executionController.js` & `executionRoutes.js` APIs (`GET /stats`, `GET /executions`, `GET /:id`, `POST /:id/replay`, `DELETE /:id`).
- **Frontend History Dashboard** (`/executions`): `Executions.jsx` dark SaaS dashboard with 5 metric summary cards, search & filter toolbar, paginated table, log replay, and `ExecutionDetailsDrawer.jsx` slide-over inspector (Timeline Trace, Data Explorer, Raw Log Payload).

### **Phase 10 Complete — Workflow Versioning System** — ✅ COMPLETED
- **Backend Versioning Infrastructure**:
  - `WorkflowVersion.js`: Mongoose schema for version snapshots — `workflowId`, `version` (semver `v1.0.0`), `versionNumber`, `definition`, `createdBy`, `status`, `isRollback`, `parentVersion`, `changeSummary`, `publishedAt`.
  - `VersionManager.js`: Git-style core service — `createInitialVersion`, `saveDraft`, `publish`, `restore`, `getVersions`, `getVersionByTag`, `deleteDraft`.
  - `VersionComparator.js`: Structured diff engine comparing nodes and edges, generating human-readable change summaries (`+ Gmail Added`, `* IF Updated`).
  - `PublishManager.js`: Orchestration layer ensuring execution engine always resolves the published snapshot.
  - `workflowVersionController.js`: Handlers for all 7 version endpoints (`/versions`, `/publish`, `/restore/:version`, `/compare`, `/draft`).
- **Frontend Versioning Components**:
  - `VersionHistoryPanel.jsx`: Slide-over version timeline panel with LIVE/DRAFT/ROLLBACK badges, multi-select compare, restore button, and delete draft.
  - `PublishDialog.jsx`: Publish modal with Patch/Minor/Major bump selector, live next-version preview, and change summary editor.
  - `CompareVersionsModal.jsx`: Side-by-side diff viewer modal with node/edge diff cards and stats summary.
  - `WorkflowCanvas.jsx` & `WorkflowCard.jsx`: Integrated **Version History** button, **Publish** button, version tag badge (`v1.2.0`), and draft indicator.

### **Phase 17 Complete — Production-Grade Google Sheets Integration & Batch Update Node Overhaul** — ✅ COMPLETED
- **Google Sheets Batch Update Node Overhaul (n8n/Zapier Parity)**:
  - **Dynamic UI Section Controls (`GoogleSheetsProperties.jsx`)**:
    1. **Update Mode Dropdown**: Options for `Update by Row Number` vs `Update by Search Column`.
    2. **Dynamic UI Rendering**:
       - When `Update by Row Number` is selected: Hides search fields and displays `Row Numbers` input (supports `2, 5, 8` or `{{items}}`).
       - When `Update by Search Column` is selected: Hides row number fields and displays `Search Column` header dropdown and `Search Value` input (`{{item.email}}`).
    3. **Batch Size & Error Policy**: Configurable `Batch Size` (default 100) and `Continue On Error` toggle.
    4. **Column Auto-Mapper**: Auto-detects headers and maps fields (`Name → {{item.name}}`, `Email → {{item.email}}`, `City → {{item.city}}`).
  - **High-Performance Batch Updating (`GoogleSheetsService.js`)**:
    1. `GoogleSheetsService.batchUpdateRows()` builds a single `spreadsheets.values.batchUpdate` request payload containing range vectors (`'Sheet1'!A2`, `'Sheet1'!A5`, `'Sheet1'!A8`) with `USER_ENTERED` formatting.
    2. Does NOT call `update()` in a loop; uses single batch HTTP requests.
    3. Respects `batchSize` limits and `continueOnError` error policies.
    4. Outputs structured workflow summaries:
       `{ success: true, count: 3, updatedRows: 3, rows: [2, 5, 8], updatedRowStatusList: [{ row: 2, status: 'success' }, { row: 5, status: 'success' }, { row: 8, status: 'success' }], executionTime: 42 }`.
  - **REST API & HTTP Status Mappings (`googleSheetsRoutes.js`)**:
    - Mounted `POST /api/v1/google/sheets/batch-update` with explicit HTTP status code error handling (400, 401, 404, 500).
  - **Workflow Engine & Executor (`GoogleSheetsExecutor.js` & `ExecutorRegistry.js`)**:
    - Resolves expression variables (`{{items}}`, `{{item.email}}`, `{{trigger.city}}`).
    - Fully registered under node type `googleSheetsBatchUpdate`.
- **Backend Subsystem & REST APIs** (`backend/src/engine/googleSheets/` & `backend/src/routes/googleSheetsRoutes.js`):
  - `GoogleSheetsService.js`: Full Google Sheets v4 & Drive v3 API implementation. Features Drive API spreadsheet list picker (`listSpreadsheets`), sheet tabs loader (`getWorksheets`), auto-header detector (`getHeaders`), and n8n/Zapier-style data operations (`readRows`, `appendRow`, `updateRow`, `findRow`, `deleteRow`, `clearRows`, `batchUpdateRows`).
  - `googleSheetsRoutes.js`: Mounted REST API endpoints under `/api/v1/google` & `/api/v1/google-sheets` (`GET /sheets`, `GET /spreadsheets`, `GET /sheets/:id/worksheets`, `GET /sheets/:id/headers`, `POST /sheets/read`, `POST /sheets/append`, `POST /sheets/update`, `POST /sheets/find`, `POST /sheets/delete`, `POST /sheets/clear`, `POST /sheets/batch-update`).
  - `GoogleSheetsExecutor.js`: Integrated workflow executor resolving AES-256 encrypted vault tokens.
- **Automated Verification & UI Polish**:
  - Passed automated test suite in `test_google_sheets.js` (25/25 assertions passed).
  - Fixed JSX text node syntax & runtime errors in `GoogleSheetsProperties.jsx` by wrapping unescaped `{{items}}` and `{{item.email}}` variable placeholders in JavaScript string expressions (`{"{{items}}"}`).

### **Phase 17.3 Complete — Production-Grade Google Sheets Trigger Node (`googleSheetsTrigger`)** — ✅ COMPLETED
- **Database Snapshot Persistence (`TriggerSnapshot.js`)**: Mongoose schema storing row snapshots per `(workflowId, nodeId)` so polling state is persisted across server restarts.
- **Change Detection Engine (`GoogleSheetsTriggerExecutor.js`)**: Production change detection algorithms supporting `newRow`, `updatedRow`, and `anyChange` (new, updated, deleted) events with `ignoreExistingRows` baseline handling and test trigger API `POST /api/v1/google-sheets/trigger/test`.
- **Background Polling Scheduler (`GoogleSheetsTriggerScheduler.js`)**: Background polling service with overlap protection, configurable intervals (`30s` to `1h`), and auto-registration on workflow publication.
- **Frontend Components & Canvas**: `GoogleSheetsTriggerNode.jsx` canvas component and `GoogleSheetsTriggerProperties.jsx` properties panel with Google Account, Spreadsheet, Worksheet, Trigger Event, Polling Interval, Ignore Existing Rows, Max Rows, and **Save Trigger** & **Test Trigger** buttons.
- **Registrations & Verification**: Registered across `TriggerRegistry.js`, `ExecutorRegistry.js`, `googleSheetsRoutes.js`, `server.js`, `PublishManager.js`, `workflowService.js`, `nodeRegistry.js`, `WorkflowCanvas.jsx`, and `PropertiesPanel.jsx`. Passed 7/7 automated assertions in `test_google_sheets_trigger.js`.
- **Bug Fix — Test Trigger ObjectId Validation**: Fixed `Cast to ObjectId failed` bug by passing `workflowId={workflowId}` from `PropertiesPanel.jsx` to `GoogleSheetsTriggerProperties.jsx` and adding `mongoose.Types.ObjectId.isValid(workflowId)` validation in `GoogleSheetsTriggerExecutor.js`.
- **Bug Fix — Google OAuth Account Dropdown**: Updated `GoogleSheetsTriggerProperties.jsx` to use the shared `credentialService.getGoogleOAuthCredentials()` API (`GET /api/v1/credentials/google`) matching Append Row / GoogleSheetsProperties, ensuring all connected Google OAuth accounts are loaded and displayed cleanly in the dropdown.
- **Backend Audit & Fix — Automatic Execution & Trigger Labeling**: Fixed `RuntimeManager.js` where `Execution.create` omitted `triggerType` (causing executions to default to `MANUAL` in execution history). Added `isGoogleSheetsTriggerNode()` helper in `GoogleSheetsTriggerScheduler.js` to match all node type variants (`googleSheetsTrigger`, `googleSheetsTriggerWatchRows`, operation `watchRows`) and merged node configs safely across `node.data`, `node.data.config`, and `node.config`. Passed 9/9 backend audit assertions in `test_google_sheets_trigger.js`.
- **Backend Audit & Fix — Snapshot Read/Write Order & GOOGLE_SHEETS Labeling**: Updated `GoogleSheetsTriggerExecutor.js` and `GoogleSheetsTriggerScheduler.js` so that `TriggerSnapshot` baseline is committed **ONLY AFTER** automatic execution dispatch finishes, ensuring zero lost changes. Configured `triggerType` as `GOOGLE_SHEETS` so executions are correctly labeled in Execution History.

### **Phase 17.4 Complete — Google Sheets Create Spreadsheet Node (`googleSheetsCreateSpreadsheet`)** — ✅ COMPLETED
- **Service Layer (`GoogleSheetsService.createSpreadsheet`)**: Google Sheets API v4 integration creating a new spreadsheet in Google Drive with initial worksheet name formatting and automatic OAuth access token refresh.
- **Dedicated Node Executor (`GoogleSheetsCreateSpreadsheetExecutor.js`)**: Resolves expression variables (e.g. `{{steps.http.title}}`, `{{now}}`), validates required inputs, invokes service layer, and captures step-by-step execution logs (`[CreateSpreadsheet] ...`).
- **Registrations & REST Routes**: Registered `googleSheetsCreateSpreadsheet` in `ExecutorRegistry.js` and `nodeRegistry.js`. Mounted `POST /api/v1/google/sheets/create` & `POST /api/v1/google-sheets/spreadsheets/create` in `googleSheetsRoutes.js`.
- **Frontend Properties Panel**: Added dynamic form fields in `GoogleSheetsProperties.jsx` for **Spreadsheet Name** and **Initial Worksheet Name**.
- **Automated Verification**: Passed 3/3 assertions in `test_create_spreadsheet.js`.
- **UI & Header Detection Fix**: Guarded `fetchSpreadsheets`, `fetchWorksheets`, and `fetchHeaders` in `GoogleSheetsProperties.jsx` with `isCreateSpreadsheetNode` check. Hidden Column Auto-Mapper and Test Read controls so header auto-detection runs exclusively on existing worksheet nodes (`Append Row`, `Read Rows`, `Update Row`, `Delete Row`, `Find Row`).
- **Independent Parameter Fix**: Updated `GoogleSheetsService.js`, `GoogleSheetsCreateSpreadsheetExecutor.js`, and `GoogleSheetsProperties.jsx` so `spreadsheetName` controls `spreadsheet.properties.title` (file title) and `initialWorksheetName` controls `sheets[0].properties.title` (first tab title, defaulting to `'Sheet1'` if empty). Passed 4/4 assertions in `test_create_spreadsheet.js`.
- **Worksheet Rename Verification**: Included `{ sheetId: 0, title: finalWorksheet }` inside `requestBody.sheets` of `spreadsheets.create` call and added automated `batchUpdate` `updateSheetProperties` fallback verification to guarantee initial worksheet tab is named as requested in Google Drive.

### **Phase 17.5 Complete — Google Sheets Create Worksheet Node (`googleSheetsCreateWorksheet`)** — ✅ COMPLETED
- **Service Layer (`GoogleSheetsService.createWorksheet`)**: Google Sheets API v4 `spreadsheets.batchUpdate()` integration with `addSheet` request payload (supporting custom `rowCount` and `columnCount`). Includes duplicate tab name validation returning `"Worksheet '<name>' already exists."`.
- **Dedicated Node Executor (`GoogleSheetsCreateWorksheetExecutor.js`)**: Resolves expression variables, validates required inputs, invokes service layer, and outputs structured logs (`Loading credentials...`, `Validating spreadsheet...`, `Creating worksheet...`, `Worksheet created successfully.`, `Finished.`).
- **Registrations & REST Routes**: Registered `googleSheetsCreateWorksheet` in `ExecutorRegistry.js` and `nodeRegistry.js`. Mounted `POST /api/v1/google/sheets/worksheets/create` & `POST /api/v1/google-sheets/worksheets/create` in `googleSheetsRoutes.js`.
- **Frontend Properties Panel**: Added UI input fields in `GoogleSheetsProperties.jsx` for **New Worksheet Name** (required), **Row Count** (optional, default: 1000), and **Column Count** (optional, default: 26).
- **UI Scoping & Cleanup**: Guarded `isCreateWorksheetNode` across `useEffect` (preventing unwanted `fetchWorksheets` execution) and `updateConfig` (pruning `worksheet`, `range`, `headerRow`, and `mappings` from node config). Removed existing Worksheet selector, Column Auto-Mapper, and Live Test buttons for Create Worksheet node.
- **Automated Verification**: Passed 7/7 assertions in `test_create_worksheet.js` (verified creation of "Orders", "Customers", and exact error on duplicate "Orders").

### **Phase 17.6 Complete — Google Sheets Delete Worksheet Node (`googleSheetsDeleteWorksheet`)** — ✅ COMPLETED
- **Service Layer (`GoogleSheetsService.deleteWorksheet`)**: Google Sheets API v4 `spreadsheets.batchUpdate()` integration with `deleteSheet` request payload. Includes `getWorksheets()` metadata pre-flight check to resolve `sheetId` by title. Enforces safety rules: non-existent tab validation (`"Worksheet '<name>' not found."`) and single remaining worksheet tab protection (`"Cannot delete the last worksheet in a spreadsheet."`).
- **Dedicated Node Executor (`GoogleSheetsDeleteWorksheetExecutor.js`)**: Resolves expression variables, validates required inputs, invokes service layer, and outputs structured execution logs (`Loading credentials...`, `Fetching spreadsheet...`, `Locating worksheet...`, `Deleting worksheet...`, `Worksheet deleted successfully.`, `Finished.`).
- **Registrations & REST Routes**: Registered `googleSheetsDeleteWorksheet` in `ExecutorRegistry.js` and `nodeRegistry.js`. Mounted `POST /api/v1/google/sheets/worksheets/delete` & `POST /api/v1/google-sheets/worksheets/delete` in `googleSheetsRoutes.js`.
- **Frontend Properties Panel**: Integrated `isDeleteWorksheetNode` in `GoogleSheetsProperties.jsx` to render Google Account picker, Spreadsheet picker, and Worksheet dropdown selector while hiding Column Auto-Mapper and Live Test controls.
- **Node Validation & Metadata Fix**: Updated `googleSheetsValidator.js`, `GoogleSheetsNodeRegistry.js`, and `modules/builder/nodeRegistry.js` with dedicated validation requiring ONLY `credentialId`, `spreadsheetId`, and `worksheet` (marking `requiresColumns: false`, `supportsColumnMapping: false`). Node becomes valid immediately upon selecting required fields without requiring column mappings.
- **Live Metadata Fetch & Cache Invalidation**: Updated `GoogleSheetsService.getWorksheets` to eliminate static `Sheet1 (100 rows)` error fallback and log live sheet tabs directly from Google Sheets API v4. Updated `fetchWorksheets` in `GoogleSheetsProperties.jsx` with timestamp cache-busting (`_t=${Date.now()}`), mandatory live logging (`Fetching worksheets...`, `Worksheets loaded: N`, `Sheet: - <title>`), and automatic dropdown refresh after worksheet creation and selection changes.
- **Backend OAuth Auto-Resolution Fix**: Updated `GoogleSheetsService.getAuthClient` to auto-resolve user Google OAuth credentials from MongoDB if `credentialId` is omitted or uninitialized during initial form load, preventing `Failed to load worksheets from Google Sheets API` 401/500 errors.
- **Fail-Safe HTTP 500 Prevention**: Hardened `googleSheetsRoutes.js` and `GoogleSheetsService.getWorksheets` to sanitize input IDs (`undefined`/`null`), log API errors, and return structured fallback worksheet definitions (`Sheet1`) without throwing uncaught route errors or returning HTTP 500 status codes.
- **DTO Mapping & React Key Audit**: Updated `GoogleSheetsService.getWorksheets`, `GoogleSheetsProperties.jsx`, and `GoogleSheetsTriggerProperties.jsx` to map worksheet metadata strictly from `sheets.properties.sheetId` and `sheets.properties.title` without appending row count strings `({rowCount} rows)`. Fixed React option key evaluation (`w.sheetId ?? w.id ?? idx`), resolving falsy `0` key collisions that previously prevented rendering second/newly created worksheet tabs in the dropdown.
- **Full-Stack End-to-End Tracing & Debug Logging**: Invoked `spreadsheets.get({ spreadsheetId })` directly without restrictive `fields` parameters. Added comprehensive debug logging across all 10 layers (Frontend Selected ID, API URL, Backend Request, User/Cred IDs, Raw Google API response, Mapped DTO, Controller response, Frontend state update, Dropdown render items). Re-thrown raw API errors to eliminate silent fallback masking.
- **Direct Live Metadata Pre-Flight Validation**: Updated `GoogleSheetsService.deleteWorksheet` to call `sheetsClient.spreadsheets.get({ spreadsheetId })` directly before deletion. Added mandatory live logging (`Spreadsheet ID`, `Spreadsheet title`, `Number of sheets`, `sheetId`, `title`, `index`, and `Total worksheets: N`) and validated `rawSheets.length <= 1` against true live API count, resolving false-positive single tab errors.
- **Automated Verification**: Passed 6/6 assertions in `test_delete_worksheet.js` (verified Test 1: deleting tab from multi-tab sheet, Test 2: non-existent tab error, and Test 3: sole remaining tab safety error).

### **Phase 17.7 Complete — Google Sheets Get Spreadsheet Info Node (`googleSheetsGetSpreadsheetInfo`)** — ✅ COMPLETED
- **Reusable Service Method (`GoogleSheetsService.getSpreadsheetInfo`)**: Retrieves complete spreadsheet metadata, grid properties, frozen rows/cols, hidden tab status, locale, time zone, and drive owner/modified timestamp using Google Sheets API v4 `spreadsheets.get` and Google Drive API v3 `files.get`. Includes short-lived in-memory cache (10s TTL) with automatic cache invalidation (`invalidateCache`) on worksheet creation and deletion.
- **Dedicated Executor (`GoogleSheetsGetSpreadsheetInfoExecutor.js`)**: Resolves expression variables (`{{steps...}}`), invokes service layer with `bypassCache: true` during node execution, and outputs structured execution logs (`Loading spreadsheet`, `Fetching metadata`, `Fetching worksheets`, `Metadata loaded successfully.`).
- **Registrations, Validation & REST Routes**: Registered `googleSheetsGetSpreadsheetInfo` in `ExecutorRegistry.js`, `GoogleSheetsNodeRegistry.js`, `googleSheetsValidator.js`, and `modules/builder/nodeRegistry.js` (`requiresColumns: false`, `supportsColumnMapping: false`). Mounted `GET /api/v1/google/sheets/:id/info` and `POST /api/v1/google/sheets/info` in `googleSheetsRoutes.js`.
- **Frontend Properties Panel**: Integrated `isGetSpreadsheetInfoNode` in `GoogleSheetsProperties.jsx` with automatic spreadsheet selector, dynamic tab fetching, and a dedicated "Test Connection & Retrieve Metadata" button.
- **Automated Verification**: Passed 7/7 assertions in `test_get_spreadsheet_info.js` (verified single & multi-worksheet metadata retrieval, hidden tab state, grid properties, cache invalidation after worksheet creation/deletion, and 404/403 error handling).



























- **Backend Core Loop Subsystem** (`backend/src/engine/loop/`):
  - `LoopTypes.js`: Execution modes (`sequential`, `parallel`), error policies (`stop`, `skip`, `continue`, `retry`), and default limits (`maxIterations: 10000`, `concurrency: 5`, `batchSize: 1`).
  - `LoopScopeStack.js`: Hierarchical variable scope stack for nested loops. Supports `item`, `index`, `isFirst`, `isLast`, `total`, `remaining`, `parent.item`, `root.item`, and custom variable names.
  - `LoopStreamManager.js`: Memory-optimized lazy batch iterator processing raw JSON arrays, MongoDB documents, SQL rows, HTTP response payloads, CSV lines, Google Sheets, and Airtable records for 100,000+ item payloads.
  - `LoopExecutionEngine.js`: Core execution orchestrator supporting Sequential and Parallel concurrency (1-20 worker pool) with configurable error policies (stop/skip).
  - `LoopExecutor.js`: Executor registered under `loop` node type in `ExecutorRegistry.js`.
- **Frontend Custom Node & Inspector**:
  - `loopManifest.js`: Registered under **Control Flow** category with cyan theme (`#06b6d4`), dual `Loop Body` & `Completed` output handles.
  - `LoopNode.jsx`: Canvas component with SVG Progress Ring, iteration counter (`7/100`), and `⚡ 5x Parallel` concurrency badge.
  - `LoopProgressInspector.jsx`: Debugger slide-over progress bar and live iteration trace panel.
- **Automated Verification**:
  - Passed **20/20** automated tests in `test_loop_engine.js`.

- **Backend Modular Architecture** (`backend/src/engine/retry/`):
  - `RetryTypes.js`: Enums (`fixed`, `linear`, `exponential`, `none`, `random`, `full`), default error/status codes, and standard `DEFAULT_RETRY_CONFIG`.
  - Strategy Pattern (`strategies/`): `IRetryStrategy.js`, `FixedDelayStrategy`, `LinearBackoffStrategy`, `ExponentialBackoffStrategy`, `JitterUtility` (Random & AWS Full Jitter), and `RetryStrategyFactory`.
  - Evaluator & Classifier (`evaluators/RetryEvaluator.js`): Evaluates retryability based on HTTP status codes (`408`, `429`, `500`, `502`, `503`, `504`), non-retryable codes (`400`, `401`, `403`, `404`, `422`), and error code patterns (`Network Error`, `Timeout`, `ECONNRESET`, `ETIMEDOUT`, `DNS Error`, `Rate Limit`). Fast-fails non-retryable errors like credentials failure.
  - `RetryEngine.js`: Refactored core execution wrapper integrating strategies, jitter, per-attempt timeouts, logger, and returning formatted execution result `{ success, retryAttempts, finalError, executionTime, result, attempts, recovered, timedOut, continueOnError }`.
  - Middleware (`middleware/RetryMiddleware.js`): Reusable wrapper for node execution functions.
- **Database & Execution History**:
  - `ExecutionStep.js`: Mongoose model updated with `retryAttempts` schema array and `retrySummary` metadata.
  - `ExecutionLogger.js` & `WorkflowEngine.js`: Integrated step history recording attempt timelines.
- **Frontend Inspector & Configuration Schema**:
  - `RetryConfigSchema.js`: Inspector form schema definition for node properties panels.
  - `RetryTimelineInspector.jsx`: Visual execution timeline displaying attempts (`Attempt #1 Failed 500 -> Retry in 5s -> Attempt #2 Success`).
- **Automated Verification**:
  - Passed **41/41** automated tests in `test_retry_engine.js`.

- **Backend Reliability System**:
  - `TimeoutManager.js`: Enforces per-node timeout bounds using `Promise.race()` and `ExecutionTimeoutError`.
  - `RetryEngine.js`: Updated to wrap node executions in `TimeoutManager.raceWithTimeout(..., config.timeoutMs)` while preserving backoff strategies.
  - `ErrorHandler.js`: Central error classifier supporting 7 error categories (`TIMEOUT`, `NETWORK`, `AUTH`, `RATE_LIMIT`, `SERVER_ERROR`, `CLIENT_ERROR`, `VALIDATION`) with severity ratings and recommendations.
  - `DeadLetterItem.js`: Stores permanently failed executions for inspection and single-click replay.
  - `FailureRecovery.js`: Service to inspect failed executions (`getLastSuccessfulNode`) and resume workflows from the point of failure.
  - `NotificationManager.js`: Dispatches structured failure alerts to console logs and outbound webhooks.
  - `reliabilityController.js` & `reliabilityRoutes.js`: Mounted at `/api/v1/reliability`.
- **Frontend Reliability Dashboard** (`/reliability`):
  - `ReliabilityDashboard.jsx`: Fixed DLQ state declarations (`dlqPage`, `dlqItems`, `dlqPages`, `replayingDlqId`, `deletingDlqId`), resolving `ReferenceError: dlqPage is not defined`. Dedicated dashboard page with metrics summary cards, failed execution table with **Retry** and **Resume** buttons, and a Dead Letter Queue tab.

### **Phase 12 & AI Intent Validation Complete — AI Workflow Builder & Intent System** — ✅ COMPLETED
- **AI Intent Classification Subsystem** (`IntentClassifier.js`): Classifies prompts into 5 categories before generating nodes (`automation`, `conversation`, `knowledge`, `physical_action`, `unsupported_automation`). Rejects non-automation requests ("Make me coffee", "Tell me a joke") with 0 nodes generated and structured guidance messages. Enforces 70% confidence threshold. Passed 12/12 automated unit tests in `test_ai_intent.js`.
- **Grok / Groq AI Integration**: `GrokClient.js` (Groq API `llama-3.3-70b-versatile`, xAI Grok `grok-2-latest`), `HeuristicWorkflowGenerator.js`, `AIWorkflowService.js` (`generate`, `explain`, `optimize`, `fix`).

### **Phase 13, 13.1, 13.2 & 13.3 Complete — Advanced Universal Variable System & Visual Data Mapper** — ✅ COMPLETED
- **Advanced Developer API** (`VariableEngine.js`): `VariableEngine.evaluate()`, `VariableEngine.executeFunction()`, `VariableEngine.resolve()`, `VariableEngine.search()`, `VariableEngine.validate()`, `VariableEngine.register()`, and `VariableEngine.getMetadata()`. Passed 13/13 automated unit tests in `VariableEngine.test.js`.
- **Visual Data Mapper Interface** (`DataMapperPanel.jsx`): Split-screen drag & drop visual mapping canvas (Left: Source Node Outputs tree vs Right: Target Destination Fields). Connects `Webhook.email ──► Gmail.To`, `Webhook.name ──► Email Body`, `HTTP.temp ──► Slack Message` visually.

### **Phase 14, 14.1 & 14.2 Complete — Universal Database Framework & MongoDB CRUD Nodes** — ✅ COMPLETED
- **7 MongoDB CRUD Nodes** (`mongoCrudManifest.js` & `MongoCrudProperties.jsx`):
  1. `MongoDB Insert One` (`mongoInsertOne`) ──► Outputs: `insertedId`, `acknowledged`
  2. `MongoDB Find` (`mongoFind`) ──► Outputs: `documents[]`, `count`
  3. `MongoDB Find One` (`mongoFindOne`) ──► Outputs: `document`
  4. `MongoDB Update One` (`mongoUpdateOne`) ──► Outputs: `matchedCount`, `modifiedCount`
  5. `MongoDB Delete One` (`mongoDeleteOne`) ──► Outputs: `deletedCount`
  6. `MongoDB Count` (`mongoCount`) ──► Outputs: `count`
  7. `MongoDB Aggregate` (`mongoAggregate`) ──► Outputs: `results[]`
- **Node Palette & Registry**: All 7 nodes registered under a dedicated **Database** category in left Node Palette (`nodeRegistry.js`).
- **Variable Engine Integration**: Registered output schemas in `VariableEngine.js` (`NODE_SCHEMA_REGISTRY`).
- **Backend Execution Engine**: `DatabaseExecutor.js` registered in `ExecutorRegistry.js`, mapping all 7 node types to official MongoDB driver calls.
- **Automated Test Suite**: Passed **14/14** automated unit and workflow execution tests in `test_phase14_2_mongo_crud.js`, including the demo pipeline (`Start ──► MongoDB Insert One ──► MongoDB Find One ──► Log ──► End`).

### **Phase 15.1 Complete — PDF Generator Node & Production Puppeteer Engine** — ✅ COMPLETED
- **Backend PDF Generation & Gmail Integration Subsystem**:
  - `PdfService.js`: Production PDF generation service powered by Handlebars HTML templating & Puppeteer headless Chrome renderer. Ensures custom user HTML (`htmlContent`, `customHtml`, `bodyHtml`, `content`) overrides built-in report fallback, pre-compiles templates with Handlebars using structured runtime variables (`{ now, gmail, mongodb, http, workflow, vars }`), and injects debug logging for request inspection.
  - `PdfGeneratorExecutor.js`: Execution handler passing raw user HTML content (`htmlContent`, `customHtml`, `bodyHtml`, `content`) to `PdfService`, populating standard runtime variables (`now`, `gmail`, `mongodb`, `http`, `workflow`, `vars`), root-level aliases (`messages`, `count`), and returning full execution payload `{ success, fileName, mimeType, size, base64, attachment, downloadUrl }`.
  - `GmailPlugin.js`: Upgraded `_searchEmails` and `_readEmails` with batched `_enrichMessages()` (chunk size 5 with exponential backoff on 429 rate limits) to fetch `format: 'full'` message details via `gmail.users.messages.get()`, populating `from`, `to`, `subject`, `date`, `cc`, `bcc`, `snippet`, `labelIds`, `hasAttachments`, `attachments`, `bodyText`, and `bodyHtml` for Handlebars template compatibility (`{{#each gmail.messages}}` / `{{#each messages}}`). Also upgraded RFC 2822 MIME builder (`buildRawEmail`) for `multipart/mixed` PDF attachments.
  - `.puppeteerrc.cjs` & Render Deployment Fix: Redirected Puppeteer cache directory to `backend/.cache/puppeteer` inside project root to ensure Chromium/Chrome binaries persist across Render deployment steps.
- **Frontend PDF Generator & Live Preview Engine**:
  - `PdfGeneratorProperties.jsx`: Synchronized Live Preview iframe rendering engine with backend Handlebars compiler using sample runtime variables (`gmail`, `mongodb`, `http`, `workflow`, `now`).
  - `pdfGeneratorManifest.js`: Defined under **Output** category with purple theme (`#8b5cf6`), default inputs/outputs, and client-side validator.
  - `GmailProperties.jsx`: Added Attachment input field with 1-click **📄 Attach PDF** shortcut button (`{{pdfGenerator.attachment}}`).
- **Automated Test Suite**: Passed **36/36** automated unit and integration tests in `test_phase15_1_pdf_generator.js`, including dedicated Handlebars compilation and custom HTML override tests.

### **Bug Fix — Google Sheets Properties JSX Syntax Error** — ✅ COMPLETED
- **Frontend Syntax Repair**: Fixed `',' expected` JSX parsing error in [GoogleSheetsProperties.jsx](file:///c:/Users/divya/OneDrive/Desktop/Workflow%20Automation%20Platform/frontend/src/features/workflow/nodes/googleSheets/GoogleSheetsProperties.jsx#L430) where unquoted double curly braces (`e.g. {{item.email}}`) were improperly evaluated by JSX parser as an invalid JavaScript object literal instead of literal string expression (`e.g. {"{{item.email}}"}`).

---

## 🛠️ Complete Tech Stack

### **Backend (`/backend`)**
- **Runtime**: Node.js (ES Modules `"type": "module"`)
- **Framework**: Express.js
- **Database Engine Framework**: `DatabaseProvider`, `MongoProvider` (with in-memory fallback), `MongoConnectionPool`, `MySQLProvider`, `PostgresProvider`, `DatabaseRegistry`, `DatabaseCredentialManager`, `DatabaseValidator`, `DatabaseExecutor`
- **Database ORM & Drivers**: MongoDB & Mongoose ORM
- **PDF Generation Engine**: Handlebars.js templating, Puppeteer headless Chrome, QRCode generator, `.puppeteerrc.cjs` cache management
- **Executors & Plugins**: `ExecutorRegistry` (`start`, `http`, `delay`, `log`, `end`, `gmail`, `condition`, `webhook`, `tryCatch`, `mongodb`, `mysql`, `postgres`, `databaseQuery`, `mongoInsertOne`, `mongoFind`, `mongoFindOne`, `mongoUpdateOne`, `mongoDeleteOne`, `mongoCount`, `mongoAggregate`, `pdfGenerator`), `PdfGeneratorExecutor`, `ConditionExecutor`, `GmailPlugin`, `PluginRegistry`, `ConnectorClient`
- **Engine & Runtime**: Standalone Graph Engine, Adjacency List Traversal, Dual-Branch Handle Router, `RuntimeEventBus`, `RuntimeManager`, `ExecutionWorker`, `RetryManager`, `TimeoutManager`, `CronScheduler`

### **Frontend (`/frontend`)**
- **Framework**: React 18 (Vite, port 3000)
- **Visual Canvas Engine**: `@xyflow/react` v12
- **Custom Nodes & Properties**: `TriggerNode`, `HttpNode`, `DelayNode`, `LogNode`, `EndNode`, `GmailNode`, `ConditionNode`, `WebhookNode`, `TryCatchNode`, `PdfGeneratorNode`, `Database` nodes (`mongodb`, `mysql`, `postgres`, `databaseQuery`, `mongoInsertOne`, `mongoFind`, `mongoFindOne`, `mongoUpdateOne`, `mongoDeleteOne`, `mongoCount`, `mongoAggregate`)
- **Node Palette**: Categorized Node Palette under **Output** and **Database** categories with Lucide React icons

