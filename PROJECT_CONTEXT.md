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
- **Frontend Properties Panel**: Integrated `isGetSpreadsheetInfoNode` in `GoogleSheetsProperties.jsx` with automatic spreadsheet selector, dynamic tab fetching, and a dedicated `handleTestGetInfo` handler connecting to the "Test Connection & Retrieve Metadata" button.
- **Automated Verification**: Passed 7/7 assertions in `test_get_spreadsheet_info.js` (verified single & multi-worksheet metadata retrieval, hidden tab state, grid properties, cache invalidation after worksheet creation/deletion, and 404/403 error handling).

### **Phase 18 Step 1 Complete — Production-Grade Discord Integration Module (Bot Token Authentication & Vault Storage)** — ✅ COMPLETED
- **TypeScript Module Architecture (`backend/src/discord/`)**:
  - `DiscordTypes.ts`: Strict TypeScript interfaces for Bot credentials, `GET /users/@me` user profiles, API responses, rate limits, and error shapes (zero `any` types).
  - `DiscordUtils.ts`: Pure utilities formatting `Bot <token>` auth headers, building CDN avatar URLs (`https://cdn.discordapp.com/avatars/...`), parsing rate limit headers, and normalizing HTTP errors (401, 403, 404, 429, 500).
  - `DiscordValidators.ts`: Strict input validator routines for Connection Name and Bot Token format.
  - `DiscordApiClient.ts`: Production Discord REST API v10 HTTP client with `GET /users/@me` endpoint, 429 rate limit backoff handling, and 5xx exponential backoff retries.
  - `DiscordCredentialService.ts`: Core service validating bot tokens via API client, formatting bot metadata (`botName`, `botId`, `avatar`, `username`, `discriminator`), encrypting credentials with AES-256 in AutomateX vault (`credentialService`), and providing token decryption.
  - `DiscordController.ts` & `DiscordRoutes.ts`: Mounted Express endpoints (`POST /api/v1/discord/credentials/verify` & `POST /api/v1/discord/credentials`) protected by JWT `protect` middleware.
  - Architectural stubs: `DiscordNodeExecutor.ts` & `DiscordDynamicOptions.ts` ready for subsequent steps.
- **Tooling & Strict Verification**:
  - Added `typescript`, `tsx`, `@types/node`, `@types/express` to devDependencies and created `backend/tsconfig.json` (`strict: true`).
  - `npx tsc --noEmit` passed with 0 errors.
  - Passed 5/5 automated test assertions in `test_discord_step1.js`.

### **Phase 18 Step 2 Complete — Load Servers / Guilds (`GET /users/@me/guilds`)** — ✅ COMPLETED
- **Reusable Service (`DiscordGuildService.ts` & `.js`)**:
  - `DiscordGuildService.getGuilds(ownerId, credentialId, bypassCache)`: Calls Discord REST API v10 `GET /users/@me/guilds`.
  - `DiscordGuildService.refreshGuilds(ownerId, credentialId)`: Invalidates cache and re-queries Discord API.
  - `DiscordGuildService.validateGuild(ownerId, credentialId, guildId)`: Validates bot access to a specific server.
  - Execution logging: `Discord Credential Loaded: ...`, `Loading Guilds...`, `Found N Guilds`, `Guild: ...`.
  - In-memory cache: 60s TTL per credential ID (`ownerId:credentialId`) with manual refresh support.
  - Formatted output: `{ success: true, guilds: [ { id, name, icon } ] }`.
- **Express REST Endpoints (`DiscordController.ts` & `.js` & `DiscordRoutes.ts` & `.js`)**:
  - Mounted `GET /api/v1/discord/guilds`, `POST /api/v1/discord/guilds/refresh`, and `POST /api/v1/discord/guilds/validate` protected by `protect` middleware.
- **Frontend Dropdown UI Component (`DiscordServerDropdown.jsx`)**:
  - Searchable dropdown displaying Guild Icon (CDN thumbnail or fallback icon), Guild Name, and Guild ID as value.
  - Automatic guild loading upon credential selection.
  - Live refresh button with spin animation, loading state (`Loading servers...`), empty state (`No servers found`), and error handling for 401, 403, 404, 429, and network failures.
### **Phase 18 Step 3 Complete — Load Discord Channels (`GET /guilds/{guild.id}/channels`)** — ✅ COMPLETED
- **Channel Mapper & Type Filtering (`DiscordChannelMapper.ts` & `.js`)**:
  - `DiscordChannelMapper`: Strictly filters raw channels to only include message-supported types: `GUILD_TEXT` (0), `GUILD_ANNOUNCEMENT` (5), and `GUILD_FORUM` (15).
  - Ignores unsupported types: Voice channels (2), Categories (4), Stage channels (13), and Threads (10, 11, 12).
  - Maps to clean DTO format: `{ id, name, type, typeId, parentId, position }`.
- **Reusable Channel Service (`DiscordChannelService.ts` & `.js`)**:
  - `DiscordChannelService.getChannels(ownerId, credentialId, guildId, bypassCache)`: Queries Discord REST API v10 `GET /guilds/{guildId}/channels`.
  - `DiscordChannelService.refreshChannels(ownerId, credentialId, guildId)`: Invalidate cache & force re-fetch.
  - `DiscordChannelService.validateChannel(ownerId, credentialId, guildId, channelId)`: Validates existence of selected channel.
  - Short-term in-memory cache: 60s TTL per `${ownerId}:${credentialId}:${guildId}`.
  - Structured logging: `Discord Credential Loaded`, `Guild Selected`, `Loading Channels...`, `Found N Channels`, `Loaded: ...`.
  - Standardized JSON response format: `{ success: true, channels: [ { id, name, type } ] }`.
- **Express REST Endpoints (`DiscordChannelController` & `DiscordChannelRoutes`)**:
  - Mounted `GET /api/v1/discord/channels`, `POST /api/v1/discord/channels/refresh`, and `POST /api/v1/discord/channels/validate` protected by `protect` middleware.
- **Searchable UI Dropdown Component (`DiscordChannelDropdown.jsx`)**:
  - Searchable dropdown filtering channels by name (`Search channels...`).
  - Auto-loads channels upon Guild selection. Disables dropdown and displays `"Loading channels..."` while fetching.
  - Live refresh button with spin animation, warning message when selected channel no longer exists (`"Selected channel no longer exists."`), type badges (`TEXT`, `ANNOUNCEMENT`, `FORUM`), and user-friendly error messages for 401, 403, 404, 429, and network timeouts.
### **Phase 18 Step 4 Complete — Discord Send Message Node (`discordSendMessage` / `POST /channels/{channelId}/messages`)** — ✅ COMPLETED
- **Message Service Layer (`DiscordMessageService.ts` & `.js`)**:
  - `DiscordMessageService.sendMessage(ownerId, credentialId, input)`: Posts messages via Discord REST API v10 `POST /channels/{channelId}/messages`.
  - Supports plain text, markdown, mentions (`@user`, `@role`), rich JSON embeds array, Text-To-Speech (`tts`), message reply reference (`replyToMessageId`), and embed suppression (`suppressEmbeds`).
  - Validation: Requires `credentialId`, `guildId`, `channelId`, non-empty content/embeds, and enforces 2000 character limit on message content.
  - Standardized JSON Response format:
    `{ success: true, messageId, channelId, guildId, timestamp, messageUrl: "https://discord.com/channels/{guildId}/{channelId}/{messageId}" }`.
  - Execution logging: `Discord Credential Loaded`, `Guild Selected`, `Channel Selected`, `Sending Message...`, `Message Sent Successfully`, `Message ID`, `Execution Finished`.
- **Workflow Engine Executor (`DiscordNodeExecutor.ts` & `.js`)**:
  - Registered `discordSendMessage` and `discord` in `ExecutorRegistry.js`. Resolves workflow expression variables (`{{items}}`, `{{trigger...}}`) and dispatches to `DiscordMessageService`.
- **Express REST Endpoint (`DiscordController.ts` & `.js`)**:
  - Mounted `POST /api/v1/discord/send-message` and `POST /api/v1/discord/messages/send` protected by `protect` middleware.
- **Frontend Registrations & Properties Panel (`DiscordProperties.jsx`)**:
  - Registered node in `nodeRegistry.js` under category `Communication` with label `Discord → Send Message` and icon `MessageSquare`.
  - Built `DiscordEmbedPreview.jsx`: Pixel-perfect, live Discord dark-theme preview card with dynamic color accent strip, author, multiline description, fields grid, thumbnail, hero image, footer, and timestamp.
  - Built `DiscordEmbedProperties.jsx`: Node properties panel with color picker, field array editor (Add/Remove fields, Name, Value, Inline grid toggle), live preview, and **Send Test Embed Message** button with live Discord jump URL output.
  - Registered `discordSendEmbed` and `discordEmbed` in `nodeRegistry.js`, `ExecutorRegistry.js`, and `PropertiesPanel.jsx`.



























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

### **Phase 20 Complete — Discord → Create Channel Workflow Node & Bot Permission Resolution** — ✅ COMPLETED
- **Backend Subsystem (`backend/src/discord/`)**:
  - `DiscordCreateChannelTypes.js` & `DiscordCreateChannelTypes.ts`: Channel type constants (`TEXT = 0`, `VOICE = 2`, `CATEGORY = 4`), validation limits (Name 1-100, Slowmode 0-21600, Bitrate 8000-384000, User limit 0-99).
  - `DiscordCreateChannelValidator.js`: Input validation for Discord credentials, Guild, Channel Type, trimmed Channel Name, Topic, Slowmode, Bitrate, and User limit.
  - `DiscordApiClient.js`: Added `getBotMember(guildId)`, `getGuildRoles(guildId)`, and `createChannel(guildId, payload)` targeting `POST /guilds/{guildId}/channels`.
  - `DiscordCreateChannelService.js`: Full channel creation service with robust BigInt bitfield permission resolution:
    1. Resolves bot's effective permissions in selected Guild via `GET /guilds/{guildId}/members/@me` (or calculated from assigned guild roles).
    2. Safely evaluates `(permissions & MANAGE_CHANNELS) === MANAGE_CHANNELS` (`16n`) or `(permissions & ADMINISTRATOR) === ADMINISTRATOR` (`8n`).
    3. Throws friendly permission error `"Bot requires Manage Channels permission in this server."` if missing.
    4. Dynamically builds channel creation payload (omitting empty optional properties).
    5. Dispatches `POST /guilds/{guildId}/channels` via Discord REST API v10 and automatically invalidates `DiscordChannelService` cache for that guild.
  - `DiscordController.js` & `DiscordRoutes.js`: Mounted `POST /api/v1/discord/create-channel` & `POST /api/v1/discord/channels/create`.
  - `DiscordNodeExecutor.js` & `ExecutorRegistry.js`: Wired `discordCreateChannel` node type to `DiscordCreateChannelService.createChannel()`.
- **Frontend Subsystem (`frontend/src/features/workflow/`)**:
  - `DiscordCategoryDropdown.jsx`: Searchable dropdown component to select existing parent category (`type === 4`) with a 1-click **Refresh Categories** button.
  - `DiscordCreateChannelProperties.jsx`: Production properties panel featuring credential selector, guild picker, channel type dropdown (Text, Voice, Category), channel name input with live character counter & validation errors, conditional fields (Topic, NSFW, Slowmode, Category for Text; Category, Bitrate, User Limit for Voice; Name only for Category), and a **Create Channel** manual test execution button with success result card and clickable Discord link.
  - Node Registries (`DiscordNodeRegistry.js`, `nodeRegistry.js`, `builder/nodeRegistry.js`, `PropertiesPanel.jsx`): Registered `Discord → Create Channel` under **Communication → Discord** category, searchable by `Discord` and `Create Channel`.
- **Automated Test Suite**: Passed **12/12** automated unit and integration tests in `test_discord_create_channel.js`.



### **Phase 21 Complete — Discord → Delete Channel Workflow Node** — ✅ COMPLETED
- **Backend Subsystem (`backend/src/discord/`)**:
  - `DiscordDeleteChannelTypes.js` & `DiscordDeleteChannelTypes.ts`: Interface structures for channel deletion payloads.
  - `DiscordDeleteChannelValidator.js`: Input validator checking required credential, channel ID, and mandatory `confirmDelete === true` confirmation checkbox.
  - `DiscordApiClient.js`: Added `deleteChannel(channelId)` targeting `DELETE /channels/{channelId}`.
  - `DiscordDeleteChannelService.js`: Full channel deletion service resolving decrypted bot token, validating mandatory user confirmation, executing `DELETE /channels/{channelId}`, clearing guild channel cache in `DiscordChannelService`, and returning normalized `{ success: true, channel: { id, name, guildId }, deleted: true }`.
  - `DiscordController.js` & `DiscordRoutes.js`: Mounted `POST /api/v1/discord/delete-channel` & `POST /api/v1/discord/channels/delete`.
  - `DiscordNodeExecutor.js` & `ExecutorRegistry.js`: Wired `discordDeleteChannel` node type to `DiscordDeleteChannelService.deleteChannel()`.
- **Frontend Subsystem (`frontend/src/features/workflow/`)**:
  - `DiscordDeleteChannelProperties.jsx`: Production properties panel with credential selector, guild picker, channel picker (supporting channel dropdown or dynamic variable expressions e.g. `{{steps["Discord → Create Channel"].channel.id}}`), red permanent deletion warning banner, mandatory confirmation checkbox, and a **Delete Channel** manual test execution button.
  - Node Registries (`DiscordNodeRegistry.js`, `nodeRegistry.js`, `builder/nodeRegistry.js`, `PropertiesPanel.jsx`): Registered `Discord → Delete Channel` under **Communication → Discord** category, searchable by `Discord` and `Delete Channel`.
### **Phase 22 Complete — Discord → Create Role Workflow Node** — ✅ COMPLETED
- **Backend Subsystem (`backend/src/discord/`)**:
  - `DiscordCreateRoleTypes.js` & `DiscordCreateRoleTypes.ts`: Interface structures for role creation payloads.
  - `DiscordCreateRoleValidator.js`: Input validator checking required credential, guild ID, role name (1-100 characters), HEX to integer color conversion (`#5865F2` -> `5793266`), hoist, mentionable, and audit log reason.
  - `DiscordApiClient.js`: Added `createRole(guildId, payload, reason)` targeting `POST /guilds/{guildId}/roles` with optional `X-Audit-Log-Reason` header.
  - `DiscordCreateRoleService.js`: Full role creation service resolving decrypted bot token, converting HEX colors, executing `POST /guilds/{guildId}/roles`, and returning normalized `{ success: true, role: { id, name, guildId, color, hoist, mentionable }, created: true }`.
  - `DiscordController.js` & `DiscordRoutes.js`: Mounted `POST /api/v1/discord/create-role` & `POST /api/v1/discord/roles/create`.
  - `DiscordNodeExecutor.js` & `ExecutorRegistry.js`: Wired `discordCreateRole` node type to `DiscordCreateRoleService.createRole()`.
- **Frontend Subsystem (`frontend/src/features/workflow/`)**:
  - `DiscordCreateRoleProperties.jsx`: Production properties panel with credential selector, guild picker, role name input (with live character counter), role color picker/HEX text input (with live color preview badge), hoist toggle, mentionable toggle, audit log reason input, and a **Create Role** manual test execution button.
  - Node Registries (`DiscordNodeRegistry.js`, `nodeRegistry.js`, `builder/nodeRegistry.js`, `PropertiesPanel.jsx`): Registered `Discord → Create Role` under **Communication → Discord** category, searchable by `Discord` and `Create Role`.
### Phase 23 Complete — Discord → Delete Role Workflow Node — ✅ COMPLETED
- **Backend Subsystem (`backend/src/discord/`)**:
  - `DiscordDeleteRoleTypes.js` & `DiscordDeleteRoleTypes.ts`: Interface structures for role deletion payloads.
  - `DiscordDeleteRoleValidator.js`: Input validator checking required credential, guild ID (optional if dynamic expression), role ID (optional if dynamic expression), mandatory `confirmDelete === true` checkbox, and `@everyone` role protection (`roleId === guildId` or name `@everyone` -> blocked with `"The @everyone role cannot be deleted."`).
  - `DiscordApiClient.js`: Added `deleteRole(guildId, roleId, reason)` targeting `DELETE /guilds/{guildId}/roles/{roleId}` with `X-Audit-Log-Reason` header and explicit HTTP 204 No Content success handling.
  - `DiscordRoleService.js` & `DiscordRoleService.ts`: Full role fetching & caching service executing `GET /guilds/{guildId}/roles` with TTL memory caching, forced refresh support, and cache invalidation.
  - `DiscordDeleteRoleService.js` & `DiscordDeleteRoleService.ts`: Full role deletion service resolving decrypted bot token, validating mandatory user confirmation, checking `@everyone` restriction, executing `DELETE /guilds/{guildId}/roles/{roleId}`, invalidating role cache in `DiscordRoleService`, and returning normalized output `{ success: true, deleted: true, role: { id, name, guildId } }`.
  - `DiscordController.js` & `DiscordRoutes.js`: Mounted `GET /api/v1/discord/roles`, `POST /api/v1/discord/roles/refresh`, `POST /api/v1/discord/delete-role`, and `POST /api/v1/discord/roles/delete`.
  - `DiscordNodeExecutor.js` & `ExecutorRegistry.js`: Wired `discordDeleteRole` node type to `DiscordDeleteRoleService.deleteRole()`.
- **Frontend Subsystem (`frontend/src/features/workflow/`)**:
  - `DiscordRoleDropdown.jsx`: Searchable role picker component fetching roles via `GET /discord/roles`, displaying role name, color badge, role ID, marking protected `@everyone` role, and providing manual refresh support.
  - `DiscordDeleteRoleProperties.jsx`: Production properties panel featuring credential selector, guild picker, role selector (supporting searchable role dropdown or dynamic variable expressions e.g. `{{steps["Discord → Create Role"].role.id}}`), optional audit log reason, red permanent deletion warning banner, mandatory confirmation checkbox, and a **Delete Role** manual test execution button.
  - Node Registries (`DiscordNodeRegistry.js`, `nodeRegistry.js`, `builder/nodeRegistry.js`, `PropertiesPanel.jsx`): Registered `Discord → Delete Role` under **Communication → Discord** category.
- **Automated Test Suite**: Passed **12/12** unit and integration tests in `test_discord_delete_role.js`.

### Phase 24 Complete — Discord → Add Role to Member Workflow Node — ✅ COMPLETED
- **Backend Subsystem (`backend/src/discord/`)**:
  - `DiscordAddRoleToMemberTypes.js` & `DiscordAddRoleToMemberTypes.ts`: Interface structures for role assignment payloads.
  - `DiscordAddRoleToMemberValidator.js`: Input validator checking required credential, member/user ID (optional if dynamic expression), role ID (optional if dynamic expression), and `@everyone` role protection (`roleId === guildId` or name `@everyone` -> blocked with `"The @everyone role cannot be assigned."`).
  - `DiscordApiClient.js`: Added `getGuildMembers(guildId, limit)` targeting `GET /guilds/{guildId}/members?limit=1000` and `addRoleToMember(guildId, userId, roleId, reason)` targeting `PUT /guilds/{guildId}/members/{userId}/roles/{roleId}` with `X-Audit-Log-Reason` header and explicit HTTP 204 No Content success handling.
  - `DiscordMemberService.js` & `DiscordMemberService.ts`: Full member fetching & caching service executing `GET /guilds/{guildId}/members?limit=1000` with TTL memory caching, normalized avatar/displayName/bot objects, forced refresh support, and cache invalidation.
  - `DiscordAddRoleToMemberService.js` & `DiscordAddRoleToMemberService.ts`: Full role assignment service resolving decrypted bot token, checking `@everyone` restriction, executing `PUT /guilds/{guildId}/members/{userId}/roles/{roleId}`, invalidating member cache in `DiscordMemberService`, and returning normalized output `{ success: true, added: true, guildId, userId, roleId }`.
  - `DiscordController.js` & `DiscordRoutes.js`: Mounted `GET /api/v1/discord/members`, `POST /api/v1/discord/members/refresh`, `POST /api/v1/discord/add-role-to-member`, and `POST /api/v1/discord/members/add-role`.
  - `DiscordNodeExecutor.js` & `ExecutorRegistry.js`: Wired `discordAddRoleToMember` node type to `DiscordAddRoleToMemberService.addRoleToMember()`.
- **Frontend Subsystem (`frontend/src/features/workflow/`)**:
  - `DiscordMemberDropdown.jsx`: Searchable member picker component fetching members via `GET /discord/members`, displaying avatar, display name, username, ID, bot badge, and providing manual refresh support.
  - `DiscordAddRoleToMemberProperties.jsx`: Production properties panel featuring credential selector, guild picker, member selector (supporting searchable member dropdown or dynamic variable expressions e.g. `{{steps["Previous Node"].user.id}}`), role selector (supporting searchable role dropdown or dynamic variable expressions e.g. `{{steps["Previous Node"].role.id}}`), optional audit log reason, and an **Add Role to Member** manual test execution button.
  - Node Registries (`DiscordNodeRegistry.js`, `nodeRegistry.js`, `builder/nodeRegistry.js`, `PropertiesPanel.jsx`): Registered `Discord → Add Role to Member` under **Communication → Discord** category with `UserPlus` icon and `indigo` badge.
- **Automated Test Suite**: Passed **12/12** unit and integration tests in `test_discord_add_role_to_member.js`.

### Phase 25 Complete — Discord → Remove Role from Member Workflow Node — ✅ COMPLETED
- **Backend Subsystem (`backend/src/discord/`)**:
  - `DiscordRemoveRoleFromMemberTypes.js` & `DiscordRemoveRoleFromMemberTypes.ts`: Interface structures for role removal payloads.
  - `DiscordRemoveRoleFromMemberValidator.js`: Input validator checking required credential, member/user ID (optional if dynamic expression), role ID (optional if dynamic expression), and `@everyone` role protection (`roleId === guildId` or name `@everyone` -> blocked with `"The @everyone role cannot be removed."`).
  - `DiscordApiClient.js`: Added `removeRoleFromMember(guildId, userId, roleId, reason)` targeting `DELETE /guilds/{guildId}/members/{userId}/roles/{roleId}` with `X-Audit-Log-Reason` header and explicit HTTP 204 No Content success handling.
  - `DiscordRemoveRoleFromMemberService.js` & `DiscordRemoveRoleFromMemberService.ts`: Full role removal service resolving decrypted bot token, checking `@everyone` restriction, executing `DELETE /guilds/{guildId}/members/{userId}/roles/{roleId}`, invalidating member cache in `DiscordMemberService`, and returning normalized output `{ success: true, removed: true, guildId, userId, roleId }`.
  - `DiscordController.js` & `DiscordRoutes.js`: Mounted `POST /api/v1/discord/remove-role-from-member` and `POST /api/v1/discord/members/remove-role`.
  - `DiscordNodeExecutor.js` & `ExecutorRegistry.js`: Wired `discordRemoveRoleFromMember` node type to `DiscordRemoveRoleFromMemberService.removeRoleFromMember()`.
- **Frontend Subsystem (`frontend/src/features/workflow/`)**:
  - `DiscordRemoveRoleFromMemberProperties.jsx`: Production properties panel featuring credential selector, guild picker, member selector (supporting searchable member dropdown or dynamic variable expressions e.g. `{{steps["Discord → Add Role to Member"].userId}}`), role selector (supporting searchable role dropdown or dynamic variable expressions e.g. `{{steps["Discord → Add Role to Member"].roleId}}`), optional audit log reason, and a **Remove Role from Member** manual test execution button.
  - Node Registries (`DiscordNodeRegistry.js`, `nodeRegistry.js`, `builder/nodeRegistry.js`, `PropertiesPanel.jsx`): Registered `Discord → Remove Role from Member` under **Communication → Discord** category with `UserMinus` icon and `rose` badge.
- **Automated Test Suite**: Passed **12/12** unit and integration tests in `test_discord_remove_role_from_member.js`.

### Phase 26 Complete — AI → Generate Text Workflow Node — ✅ COMPLETED
- **Backend Subsystem (`backend/src/ai/`)**:
  - `AIProvider.js` & `AIProvider.ts`: Base abstract AI Provider interface (`generateText(options)`).
  - `OpenAIProvider.js` & `OpenAIProvider.ts`: OpenAI client implementation targeting `https://api.openai.com/v1/chat/completions` with 60s abort timeout, error code normalization (401 invalid API key, 404 invalid model, 429 rate limit, 400 bad prompt/payload), and choice/usage payload normalization.
  - `AiGenerateTextTypes.js` & `AiGenerateTextTypes.ts`: TypeScript/JavaScript interfaces for input (`IAiGenerateTextInput`) and output (`IAiGenerateTextResult`).
  - `AiGenerateTextValidator.js`: Input validator checking required credential, provider (`openai`), model, prompt (non-empty), temperature ($0 \le T \le 2$), and maxTokens ($1 \le \text{tokens} \le 128000$).
  - `AiGenerateTextService.js` & `AiGenerateTextService.ts`: Core text generation service performing server-side credential decryption from vault, masked key audit logging, ExpressionEngine variable resolution in prompts, provider dispatching, error normalization, and returning output `{ success: true, text, provider, model, usage: { promptTokens, completionTokens, totalTokens } }`.
  - `AiController.js` & `AiRoutes.js` / `.ts`: Mounted `POST /api/v1/ai/generate-text` and `POST /api/v1/ai/text/generate` endpoints protected by auth middleware.
  - `AiNodeExecutor.js` & `ExecutorRegistry.js`: Wired `aiGenerateText` and `ai` node types to `AiGenerateTextService.generateText()`.
- **Frontend Subsystem (`frontend/src/features/workflow/`)**:
  - `AiGenerateTextProperties.jsx`: Production Node Properties panel featuring AI credential selector (display name & masked value only, missing credential alert), provider selector (`OpenAI`), model dropdown (`gpt-4o-mini`, `gpt-4o`, `gpt-4-turbo`, `gpt-3.5-turbo`, `o3-mini`, custom model text input), prompt textarea with character counter & dynamic variable insertion guidance, temperature slider & input, max tokens input, and a **Test Generate** execution button displaying live generated response and usage metrics badges.
  - Node Registries (`AiNodeRegistry.js`, `nodeRegistry.js`, `builder/nodeRegistry.js`, `PropertiesPanel.jsx`, `NodeSidebar.jsx`): Registered `AI → Generate Text` under **AI / Artificial Intelligence** category with `Sparkles` icon and `purple` badge.
- **Automated Test Suite**: Passed **12/12** unit and integration tests in `test_ai_generate_text.js`.

### Phase 27 Complete — OpenAI → Generate Text Workflow Node — ✅ COMPLETED
- **Backend Subsystem (`backend/src/ai/`)**:
  - Wired `openaiGenerateText` and `openAiGenerateText` node types in `AiNodeExecutor.js` and `ExecutorRegistry.js` to `AiGenerateTextService.generateText()`.
  - Reused vault credential decryption, secret masking, ExpressionEngine variable resolution, and `OpenAIProvider` chat completion integration (`/v1/chat/completions`).
- **Frontend Subsystem (`frontend/src/features/workflow/`)**:
  - `OpenAiIcon.jsx`: SVG component representing official OpenAI logo mark.
  - `OpenAiGenerateTextProperties.jsx`: Provider-specific Node Properties panel featuring official OpenAI branding header badge, OpenAI credential selector (strictly filtered for `service === 'openai'` displaying `My OpenAI (••••••••)` and showing `"No OpenAI credentials found. Add an OpenAI credential first."` when missing), model selector (`gpt-4o-mini`, `gpt-4o`, `gpt-4-turbo`, `gpt-3.5-turbo`, `o3-mini`, custom model text input), prompt textarea with placeholder `"Write your prompt here..."` supporting AutomateX dynamic variables (`{{projectName}}` or `{{steps["Previous Node"].text}}`), temperature slider ($0 - 2$, default $0.7$), max tokens input (default $500$), and **Test Generate** button with loading state (`Generating...`) and live output display.
  - Node Registries (`AiNodeRegistry.js`, `nodeRegistry.js`, `builder/nodeRegistry.js`, `PropertiesPanel.jsx`): Registered `OpenAI → Generate Text` under category `AI` with `OpenAiIcon` / `Sparkles` icon and `emerald` badge.
- **Automated Test Suite**: Passed **10/10** unit and integration tests in `test_openai_generate_text.js`.

### Phase 28 Complete — Gemini → Generate Text Workflow Node — ✅ COMPLETED
- **Backend Subsystem (`backend/src/ai/`)**:
  - `GeminiProvider.js` & `GeminiProvider.ts`: Subclassed `AIProvider` to integrate Google Gemini v1beta REST API (`POST /v1beta/models/{model}:generateContent?key={apiKey}`). Maps `maxTokens` to `generationConfig.maxOutputTokens`, normalizes candidate responses, and extracts `usageMetadata` (`promptTokenCount`, `candidatesTokenCount`, `totalTokenCount`).
  - `Credential.js`: Added `'gemini'` to credential service enum.
  - `AiGenerateTextService.js`: Added provider dispatch for `provider === 'gemini'` or `'google'`.
  - `AiNodeExecutor.js` & `ExecutorRegistry.js`: Wired `geminiGenerateText` and `googleGeminiGenerateText` node types to `AiGenerateTextService.generateText()`.
- **Frontend Subsystem (`frontend/src/features/workflow/`)**:
  - `GeminiIcon.jsx`: SVG component representing official Google Gemini logo mark.
  - `GeminiGenerateTextProperties.jsx`: Provider-specific Node Properties panel featuring official Gemini branding header badge, Gemini credential selector (strictly filtered for `service === 'gemini'` or `'google'` displaying `My Gemini (••••••••)` and showing `"No Gemini credentials found. Add a Gemini credential first."` when missing), model selector (`gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-pro`, `gemini-1.5-flash`, custom model text input), prompt textarea with placeholder `"Write your prompt here..."` supporting AutomateX dynamic variables (`{{projectName}}` or `{{steps["Previous Node"].text}}`), temperature slider ($0 - 2$, default $0.7$), max tokens input (default $500$), and **Test Generate** button with loading state (`Generating...`) and live output display.
  - `Credentials.jsx`: Added Google Gemini option to vault credential creation form.
  - Node Registries (`AiNodeRegistry.js`, `nodeRegistry.js`, `builder/nodeRegistry.js`, `PropertiesPanel.jsx`): Registered `Gemini → Generate Text` under category `AI` with `GeminiIcon` / `Sparkles` icon and `sky` badge.
- **Automated Test Suite**: Passed **11/11** unit and integration tests in `test_gemini_generate_text.js`.

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

