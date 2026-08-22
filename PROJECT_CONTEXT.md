# PROJECT_CONTEXT.md - AI Handoff & Memory Bank

> **Single Source of Truth** for AI agents and developers working on the AutomateX Workflow Automation Platform.

---..

## 🚀 Project Overview

The **AutomateX Workflow Automation Platform** is an enterprise-grade, modular, production-ready visual workflow automation SaaS similar to n8n, Zapier, and Make.

---

## 📅 Platform Milestones & Completed Phases

### **Phase 20 Complete — Public Marketing, Resource Hub & Connected Footer Architecture** — ✅ COMPLETED
- **Shared Public Architecture**:
  - `PublicLayout.jsx`: Master layout wrapper providing sticky `LandingNav`, responsive page container, `ScrollToTop` helper, and interconnected `LandingFooter`.
  - `LandingNav.jsx`: Dynamic navigation routing across marketing subpages (`/features`, `/integrations`, `/solutions/developers`, `/pricing`, `/docs`) with smooth scrolling and responsive mobile drawer.
  - `LandingFooter.jsx`: Fully wired footer links with active routing across 20+ destination pages, external GitHub repository badge, and legal pages.
- **Product Pages (`pages/public/product/`)**:
  - `FeaturesPage.jsx`: Interactive feature category tabs, visual node canvas simulation, capability highlights, and competitive comparison matrix.
  - `IntegrationsPage.jsx`: Searchable & filterable directory of 100+ connectors with category tags, triggers/actions breakdown, and interactive detail modals.
  - `PricingPage.jsx`: Annual/monthly billing switch (Save 20%), 4 comprehensive tiers (Free, Pro, Team, Enterprise), FAQ accordions, and consultation scheduler.
  - `ChangelogPage.jsx`: Chronological release notes (v2.4 AI Engine, v2.3 DLQ Reliability, v2.2 OAuth Vault, v2.0 Launch), version badges, and newsletter subscription.
  - `StatusPage.jsx`: Live platform health dashboard (99.99% uptime), latency gauges, service uptime bars, and 90-day incident log.
- **Solutions Pages (`pages/public/solutions/`)**:
  - `DevelopersPage.jsx`: Code-native features, custom V8/Python sandbox preview with copyable snippets, webhook debugging, and Git sync.
  - `EngineeringTeamsPage.jsx`: Automated PR summaries, Datadog/Sentry incident war rooms, multi-environment promotion, and audit log compliance.
  - `StartupsPage.jsx`: Rapid MVP prototyping, $10,000 startup credits application form, and architecture consultation.
  - `EnterprisesPage.jsx`: Dedicated VPC, SOC2 Type II / HIPAA compliance, SAML SSO, and enterprise architecture demo form.
  - `AIAutomationPage.jsx`: Interactive prompt-to-pipeline synthesizer simulation, multi-LLM router (GPT-4o, Claude 3.5, Gemini 1.5), and autonomous agents.
- **Resources Pages (`pages/public/resources/`)**:
  - `DocsPage.jsx`: Developer documentation hub with interactive module sidebar (Quickstart, Expressions, DLQ, Vault Security) and copyable code examples.
  - `ApiReferencePage.jsx`: Interactive REST API explorer with language tabs (cURL, JavaScript Fetch, Python Requests) and live response payloads.
  - `GuidesPage.jsx`: Curated step-by-step masterclasses with difficulty badges, reading times, and blueprint clone modals.
  - `BlogPage.jsx`: Distributed systems and AI engineering articles, category filter tabs, author cards, and newsletter signup.
  - `SupportPage.jsx`: Multi-channel developer support center and interactive ticket creation form with priority levels.
- **Company & Legal Pages (`pages/public/company/` & `pages/public/legal/`)**:
  - `AboutPage.jsx`: Origin story, core operating values, global platform metrics, and leadership team.
  - `CareersPage.jsx`: Remote-first perks, $5k workspace budget, department filters, and interactive application modal.
  - `ContactPage.jsx`: Inquiries form with live validation and global office hubs.
  - `SecurityPage.jsx`: Trust center with AES-256 vault architecture, compliance badges, and bug bounty disclosure.
  - `PrivacyPage.jsx`, `TermsPage.jsx`, `CookiesPage.jsx`: Full legal and compliance suite with interactive cookie preference toggles.
- **Verification & Visual Canvas Dual-Grid Aesthetic**:
  - Implemented high-end precision dual-grid architecture in `WorkflowCanvas.jsx` (24px minor sub-grid + 120px major section grid + accent intersection dots + smooth ambient studio lighting meshes).
  - Verified production build (`npm run build`) passes cleanly with 0 errors across 2,100 modules.

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

### **Phase 19 Complete — Incremental Node Notes & "⋮" Actions Menu System** — ✅ COMPLETED
- **Reusable Node Notes & More-Actions Component (`NodeNotesAction.jsx`)**:
  - Implemented modular, non-intrusive action dropdown menu ("⋮") on every workflow node header with `nodrag` & `nopan` safety handlers to prevent canvas/node drag interference.
  - **Menu States**: Shows "Add Note" when no note exists; dynamically switches to "Edit Note" and "Delete Note" (rose accent) when a note is configured.
  - **Note Indicator & Hover Preview**: When a note is saved, renders a subtle amber note badge (`StickyNote`) on the node header. Hovering displays an instantaneous preview tooltip (`line-clamp-4`), and clicking opens the popover.
  - **Interactive Popover Dialog**: In-place modal editor with clean text area, auto-focus, keyboard shortcuts (`Ctrl/Cmd + Enter` to save, `Escape` to close), Cancel, Save, and Delete controls.
- **Node Data Model & Persistence**:
  - Stored directly in `node.data.note` (`string`), fully decoupled from execution logic (`WorkflowParser.js`, `WorkflowEngine.js`).
  - Automatically persists with workflow definition in MongoDB (`Workflow.definition.nodes`) and survives page reloads, cloning, and version publishing.
  - Handled whitespace trimming and empty note cleanup (`note: undefined`).
- **All 22 Node Components Integrated**:
  - Trigger Nodes (`TriggerNode`, `CronNode`, `WebhookNode`, `GoogleSheetsTriggerNode`, `DiscordMessageReceivedNode`).
  - Document & AI Nodes (`FileUploadNode`, `DocumentExtractNode`, `GeminiStructureTournamentNode`, `GeminiStructureProductsNode`).
  - Integration Nodes (`WebsiteConnectNode`, `WebsiteCreateTournamentNode`, `WebsiteCreateProductNode`, `GmailNode`, `HttpNode`, `PdfGeneratorNode`).
  - Logic Nodes (`ConditionNode`, `ForEachTournamentNode`, `ForEachProductNode`, `TryCatchNode`, `DelayNode`, `LogNode`, `EndNode`).
- **Right Properties Drawer (`PropertiesPanel.jsx`)**: Added synced "Node Note / Comment" textarea for streamlined editing directly from the properties inspector.
- **Verification**: Verified production build (`npm run build`) compiles cleanly with **0 errors**.

### **Phase 18 Complete — Full Platform White & Orange Light Theme Transformation (including Visual Canvas & Node Palette)** — ✅ COMPLETED
- **Theme Rationale & Aesthetic**: Transformed the entire AutomateX UI/UX from the dark obsidian theme into a crisp, high-contrast, modern **White & Orange Light Theme** inspired by Zapier and enterprise automation design systems.
- **Color Palette Tokens (`src/index.css`)**:
  - **Canvas & Shell**: `#f8fafc` (`bg-slate-50`) background.
  - **Cards & Glass Panels**: Pure white `#ffffff` (`bg-white`) cards with crisp slate borders (`border-slate-200`) and soft shadows (`shadow-sm`, `shadow-md`).
  - **Typography**: Deep readable text (`text-slate-900` headings, `text-slate-700` body, `text-slate-500` secondary text).
  - **Brand Accents**: Vibrant Zapier-inspired Orange `#ff4f00` / `#ea580c` (`bg-brand-500`, `text-brand-600`, `bg-orange-50 text-orange-700 border-orange-200`).
- **Core Primitives & Shell Upgraded**:
  - `DashboardLayout.jsx`, `Navbar.jsx`, `Sidebar.jsx`: Clean white navbar/sidebar with active orange badges and ambient background glows.
  - `Button.jsx`, `Card.jsx`, `Input.jsx`, `EmptyState.jsx`: All UI primitive variants updated for light theme.
- **Visual Canvas & Builder Suite Upgraded (`/builder/:id`)**:
  - **High-Visibility Blueprint & Precision Matrix Textures (`src/index.css`)**: 3-layer ReactFlow background featuring crisp blueprint grid lines (`gap={40} color="#cbd5e1" lineWidth={1.2}`), micro-dot matrix (`gap={20} size={1.8} color="#94a3b8"`), and intersection crosshairs (`gap={120} size={8} color="#64748b" lineWidth={1.5}`).
  - **Ambient Studio Mesh Glows**: Enhanced warm orange/amber studio lighting meshes (`blur-[120px]`) across the canvas and global layout for depth and visual richness.
  - **Node Palette Toolbar (`NodeToolbar.jsx`)**: Converted to crisp white container with category headers, search input on `bg-slate-50`, and light draggable node cards with orange hover states.
  - **Node Properties Drawer (`PropertiesPanel.jsx`)**: Converted to white drawer with orange variables explorer button, light status banners, and clean form controls.
  - **Execution Logs Drawer (`ExecutionLogsDrawer.jsx`)**: Converted to white slide-over drawer with light KPI stats cards and structured step logs.
  - **ReactFlow & Edges (`WorkflowCanvas.jsx`)**: Canvas background set to `bg-slate-50` with slate `#cbd5e1` dots, light MiniMap, and vibrant `#ea580c` orange animated connecting edges.
  - **All Custom Canvas Nodes Converted to Light Theme**:
    - `TriggerNode.jsx` (Start Trigger)
    - `FileUploadNode.jsx` (File -> Upload Document)
    - `DocumentExtractNode.jsx` (Document -> Extract Content)
    - `GeminiStructureTournamentNode.jsx` & `GeminiStructureProductsNode.jsx` (AI structure nodes)
    - `WebsiteConnectNode.jsx`, `WebsiteCreateTournamentNode.jsx`, `WebsiteCreateProductNode.jsx` (Integration nodes)
    - `ForEachTournamentNode.jsx` & `ForEachProductNode.jsx` (Loop nodes)
    - `EndNode.jsx` (End Completion)
    - `HttpNode.jsx`, `DelayNode.jsx`, `LogNode.jsx`, `GmailNode.jsx`
    - `ConditionNode.jsx`, `WebhookNode.jsx`, `TryCatchNode.jsx`, `CronNode.jsx`, `PdfGeneratorNode.jsx`, `GoogleSheetsTriggerNode.jsx`, `DiscordMessageReceivedNode.jsx`
- **All Pages Upgraded**:
  - `Dashboard.jsx`, `Workflows.jsx`, `WorkflowFilters.jsx`, `WorkflowCard.jsx`, `CreateWorkflow.jsx`, `EditWorkflow.jsx`, `Executions.jsx`, `AIBuilderPage.jsx`, `Credentials.jsx`, `Templates.jsx`, `ReliabilityDashboard.jsx`, `Profile.jsx`, `Login.jsx`, `Register.jsx`.
- **Verification**: Verified production build (`npm run build`) compiles cleanly with **0 errors**.


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

### **Phase 19 Complete — Full Platform UI/UX Overhaul & Modern Dark Glassmorphic Design System** — ✅ COMPLETED
- **Design System & Tailwind Palette Expansion (`tailwind.config.js` & `index.css`)**:
  - Expanded radiant brand orange palette (`brand-50` to `brand-950`, `brand-electric`) and refined dark slate scale (`slate-850`, `slate-900`, `slate-925`, `slate-950`, `slate-975`).
  - Added custom radiant glow box-shadow utilities (`shadow-glow-brand`, `shadow-glow-indigo`, `shadow-glow-emerald`, `shadow-glow-cyan`, `shadow-glass-card`, `shadow-inner-glow`).
  - Added micro-animation keyframes (`shimmer`, `pulse-slow`, `spin-slow`).
  - Implemented reusable glassmorphic utility classes: `.glass-panel`, `.glass-panel-subtle`, `.glass-card`, `.glass-input`, `.gradient-brand`, `.text-gradient-brand`, `.text-gradient-white`, and dark custom scrollbars.
- **Shell Layout & Global Navigation Overhaul**:
  - **`DashboardLayout.jsx`**: Replaced cream background with unified dark obsidian (`bg-slate-950 text-slate-100`) and ambient background radial glow meshes (`brand-500/5` and `indigo-500/5`).
  - **`Navbar.jsx`**: Glassmorphic sticky header (`bg-slate-950/85 backdrop-blur-xl border-slate-800/80`), radiant brand icon, live engine pulse indicator (`v1.4 Live`), quick action buttons ("AI Prompt Builder", "New Flow"), user avatar profile badge, and clean sign-out button.
  - **`Sidebar.jsx`**: Glassmorphic sidebar (`bg-slate-950/75 backdrop-blur-2xl`), radiant active route highlights, category tags ("Core Platform", "Enterprise"), feature badge pills ("New", "DLQ"), and live Execution Runtime telemetry card.
- **UI Core Components Upgrade**:
  - **`Button.jsx`**: Glowing gradient variants (`primary`, `indigo`, `secondary`, `glass`, `danger`, `outline`, `ghost`) with active scale transitions.
  - **`Card.jsx`**: Glassmorphic background with subtle border glow and hoverable options.
  - **`Input.jsx`**: Unified with `.glass-input` and active brand glow focus rings.
  - **`EmptyState.jsx`**: Modern dark glassmorphic empty state card with gradient icon holder.
- **Platform Pages & Feature Dashboards Overhauled**:
  - **`Dashboard.jsx`**: Dark glassmorphic cockpit with greeting banner, 4 glowing KPI analytics cards, interactive AI Workflow Generator prompt bar, quick filter tabs, 1-click "Run" workflow cards, and live executions stream.
  - **`Workflows.jsx`, `WorkflowFilters.jsx`, `WorkflowCard.jsx`**: Glassmorphic management hub with radiant filter pills, glass search bar, glowing version badges, and action dropdowns.
  - **`CanvasControls.jsx`**: Floating glass island with live save badge indicators, radiant "Run Flow" emerald button, and zoom controls.
  - **`Executions.jsx`**: Glassmorphic execution history with 5 responsive metric cards, status pills, search filters, and JSON export.
  - **`AIBuilderPage.jsx`**: Natural language workflow prompt composer with GPT-4o/Grok status badges, glass card prompts, and generation preview.
  - **`Credentials.jsx`**: Encrypted Credentials Vault with service category badges, verified connection ping indicators, and glassmorphic add modal.
  - **`Templates.jsx`**: Templates marketplace with glowing category filters, featured template cards, and 1-click clone actions.
  - **`ReliabilityDashboard.jsx`**: Reliability & Recovery Engine dashboard with 6 stat metrics, recovery tabs, DLQ re-drive button, and Cron scheduler.
  - **`Profile.jsx`**: Modern user profile and security overview with Pro tier badge and verified session card.
  - **`Login.jsx` & `Register.jsx`**: Modern dark glassmorphic dual-pane auth screens with ambient background glows, floating brand mark, and input validation.
- **Verification**:
  - Production build `npm run build` completed successfully with 0 errors across 2,075 modules.

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
- **Automated Test Suite**: Passed **7/7** dynamic model discovery & priority fallback tests in `test_gemini_generate_text.js` and **10/10** tests in `test_openai_generate_text.js`.
  - Added `GeminiProvider.validateModelAvailability()` and `listAvailableModels()` querying `GET /v1beta/models?key={apiKey}`.
  - Implemented priority fallback resolution (`gemini-3.6-flash`, `gemini-3.5-flash`, `gemini-3.5-flash-lite`, `gemini-2.5-flash`, `gemini-2.5-flash-lite`, `gemini-2.0-flash`, `gemini-1.5-flash`, `gemini-1.5-pro`, `gemini-1.0-pro`) when a requested model is unavailable for the authenticated API key.
  - Added `GET /api/v1/ai/gemini-models` backend endpoint (`AiController.getGeminiModels`) for dynamic frontend model options fetching.
  - Added "Auto Select Best Available Model from API" toggle (`autoSelectModel`) in `GeminiGenerateTextProperties.jsx`.

---



### **Design System Phase Complete — Zapier-Inspired Visual Identity** — ✅ COMPLETED

**Scope**: Replaced the dark slate/indigo Linear-style palette across the public-facing pages with a confident-warm Zapier-inspired design language.

- **Design Token System (`frontend/src/index.css`)**:
  - CSS custom properties for the full Zapier-inspired palette: canvas `#fffefb`, canvas-soft `#f8f4f0`, ink `#201515`, ink-soft/mid, body/body-mid/mute, primary orange `#ff4f00`, on-primary `#fffefb`.
  - Border radius tokens: `--rounded-sm` (6px), `--rounded-md` (12px), `--rounded-pill`.
  - Spacing tokens: `--space-xxs` through `--space-4xl`.
  - Typography utility classes: `zap-display-xl` (56px/500), `zap-display-lg`, `zap-display-md`, `zap-display-sub-sm`, `zap-display-xs`, `zap-body-lg`, `zap-body-md`, `zap-body-sm`, `zap-eyebrow`, `zap-btn-md`, `zap-btn-sm`, `zap-caption`.
  - Component primitives: `zap-btn-primary` (orange fill), `zap-btn-secondary` (coffee ink), `zap-btn-tertiary` (outline), `zap-card`, `zap-card-dark`, `zap-pricing-card`, `zap-pricing-card-featured`, `zap-badge`, `zap-input` (with orange focus ring), `zap-auth-card`, `zap-nav`, `zap-footer`, `zap-surface`.
  - Micro-animations: `zapFadeUp` (staggered entrance, 5 delay levels), `zapPulse` (live indicator).
  - Google Fonts: Inter (400, 500, 600, 700) imported at CSS root. Dashboard dark theme untouched (Tailwind dark classes retained).

- **Landing Page (`frontend/src/pages/Landing.jsx`)** — Full redesign:
  - **Sticky Navbar**: cream canvas with coffee ink brand/links and orange CTA buttons.
  - **Hero Section**: animated badge, 56px display headline with orange accent, body copy, dual CTAs, star rating trust signal, SVG workflow canvas illustration with live pulse animation.
  - **Stats Band**: coffee-ink dark band — 12K+ users, 2.4M runs/month, 50+ integrations, 4.9★.
  - **Integrations Grid**: 6 integration tiles (Gmail, Discord, Webhooks, AI/LLM, MongoDB, Conditions) on cream-soft panel.
  - **Features Grid**: 6 feature cards (alternating cream / dark coffee) with hover lift: Visual Builder, AI Nodes, 50+ Node Types, Credential Vault, Cron/Webhook Triggers, Execution History.
  - **Orange CTA Band**: Full-width saturated orange with white CTA button.
  - **Pricing Section**: 3-tier cards (Starter/Free, Pro/$29, Enterprise/Custom) — outlined, dark featured, outlined. Most Popular badge on Pro tier.
  - **FAQ Accordion**: 4 FAQs with animated chevron expand/collapse.
  - **Footer**: Dark coffee footer with brand, 3-column link grid, copyright.

- **Login Page (`frontend/src/pages/Login.jsx`)** — Full redesign:
  - Single cream-soft auth card (max-w-440px, 12px radius).
  - Inline icon inputs (Mail, Lock) with coffee ink border and orange focus ring.
  - Orange primary submit button with ArrowRight icon.
  - No external UI library dependency — pure `zap-*` CSS classes.

- **Register Page (`frontend/src/pages/Register.jsx`)** — Full redesign:
  - Split-panel layout on desktop: cream-soft brand/perks sidebar (420px) + cream form panel.
  - Perks list with orange CheckCircle2 icons.
  - 4-field form (name, email, password, confirm password) with inline validation.
  - Fully consistent with Login design language.

**Design Language Note**: Inter 500 used as Degular Display substitute at hero scale. Dashboard pages retain their existing dark slate-950 theme. No Tailwind utilities were removed; the `zap-*` classes extend alongside the existing dark-mode utilities.

---




### **Premium SaaS Landing Page Phase — Full Redesign** — ✅ COMPLETED

**Scope**: Complete rebuild of the public-facing landing page into a production-quality, multi-section SaaS marketing site. Zero impact on dashboard, auth, or any existing application routes.

**Architecture**: Self-contained feature module at `frontend/src/pages/landing/`. New `LandingPage.jsx` imported directly into `App.jsx` route `"/"`.

**New Files Created**:

- `frontend/src/pages/landing/LandingPage.jsx` — Root assembler (12 sections in editorial order)
- `frontend/src/pages/landing/hooks/useInView.js` — IntersectionObserver hook (threshold 0.12, trigger-once)
- `frontend/src/pages/landing/hooks/useCounter.js` — requestAnimationFrame animated number counter with cubic ease-out
- `frontend/src/pages/landing/components/LandingNav.jsx` — Sticky navbar with scroll-blur, smooth-scroll anchor links, mobile hamburger overlay
- `frontend/src/pages/landing/components/Hero.jsx` — 80–88px clamp headline, eyebrow pulse badge, staggered CTA animations
- `frontend/src/pages/landing/components/HeroProductPreview.jsx` — Fully JSX/CSS dashboard mockup: sidebar + workflow canvas (4 animated nodes cycling every 1.8s) + execution log + ambient orange glow
- `frontend/src/pages/landing/components/LogoCloud.jsx` — Infinite CSS marquee with gradient fade edges, 10 monochrome text logos
- `frontend/src/pages/landing/components/FeatureShowcase.jsx` — 3 alternating text/product-mockup blocks (Visual Builder, AI Nodes, Execution History) with scroll-triggered slide animations
- `frontend/src/pages/landing/components/WorkflowDemo.jsx` — Animated vertical 5-step node chain cycling every 1.6s, SVG connector lines, left description panel synced with active node
- `frontend/src/pages/landing/components/StatsSection.jsx` — Dark ink background, 593M+ animated counter (rAF + IntersectionObserver), 4 supporting stat tiles
- `frontend/src/pages/landing/components/TestimonialsSection.jsx` — 1 featured dark card (2-column span) + 3 cream supporting cards, hover-lift, staggered fade-up
- `frontend/src/pages/landing/components/CaseStudy.jsx` — Dark workflow panel with live status badges + 3 live metric cards
- `frontend/src/pages/landing/components/BenefitsSection.jsx` — Sticky label + 4 numbered scrollable benefit rows, right-slide-in animation
- `frontend/src/pages/landing/components/SecuritySection.jsx` — 5 bordered security cards on cream background with hover lift
- `frontend/src/pages/landing/components/FinalCTA.jsx` — Combined pricing (3 tiers) + final CTA, dark ink bg, subtle node-pattern SVG background
- `frontend/src/pages/landing/components/LandingFooter.jsx` — 4-column footer (Product / Solutions / Resources / Company) + legal bar

**Modified Files**:
- `frontend/index.html` — Removed global `overflow-hidden` utility class from `<body>` tag so full-page scrolling is enabled across public marketing pages.
- `frontend/src/pages/landing/LandingPage.jsx` — Configured `overflowX: 'clip'` to prevent horizontal overflow without trapping vertical page scroll.
- `frontend/tailwind.config.js` — Added `orange`, `cream`, `ink` color token families + 9 Tailwind animation/keyframe entries
- `frontend/src/index.css` — Added `html { scroll-behavior: smooth }` + base body default reset
- `frontend/src/App.jsx` — Swapped `Landing` import for `LandingPage`

**Animation Strategy**: CSS keyframes + native IntersectionObserver API. No new npm dependencies added. Keyframes: `fadeUp`, `fadeIn`, `slideLeft`, `slideRight`, `marquee`, `nodePulse`, `dashFlow`, `counterFadeUp`, `float`.

**Design Tokens Used**: Primary `#ff4f00` (orange), canvas `#F7F5F0` (cream), ink `#1A1012` (dark brown-black), Inter 400/500/600/700.

### **Gemini Provider Model Selection Bug Fix — ReferenceError Resolution** — ✅ COMPLETED

**Scope**: Resolved JavaScript `ReferenceError: selectedModel is not defined` bug in `GeminiProvider.js` during Gemini text generation execution.

- **Variable Scoping & Declaration (`GeminiProvider.js`)**:
  - Declared `const requestedModel = GeminiProvider.normalizeModelName(model);` and `let selectedModel = requestedModel;` at the start of `generateText()`.
  - Guaranteed `selectedModel` is in scope across auto-select branch, manual selection branch, model normalization, URL endpoint construction (`/v1beta/models/${selectedModel}:generateContent`), error handling (HTTP 404/403/401/429), and success return payload (`{ success: true, text, provider: 'gemini', model: selectedModel, usage }`).

- **Logging & Validation Requirements**:
  - Added safe required logging:
    - `[Gemini] Requested model: ${requestedModel}`
    - `[Gemini] Selected model: ${selectedModel}`
    - `[Gemini] Auto select: ${autoSelect}`
  - Handled custom model inputs (e.g. `gemini-2.5-flash`) via `GeminiProvider.normalizeModelName()` stripping leading `models/` prefix and trimming whitespace.
  - Returned clear 404 error when auto-select finds no compatible model: `"No available Gemini model supports generateContent for this credential."`
  - Returned clear 404 error when user-specified model is unavailable: `"Selected Gemini model \"${requestedModel}\" is unavailable or invalid for this credential."`

- **Service & Validator Integration (`AiGenerateTextService.js` & `AiGenerateTextValidator.js`)**:
  - Updated `AiGenerateTextService.js` to extract `requestedModel` from `config.model || config.modelIdentifier || validation.model` and pass `autoSelectModel` explicitly to `providerImpl.generateText()`.
  - Updated `AiGenerateTextValidator.js` to support `config.modelIdentifier` and fallback to provider-specific defaults (`gemini-1.5-flash` for Gemini vs `gpt-4o-mini` for OpenAI).

- **Automatic Deprecated Model Fallback & 404 Auto-Retry (`GeminiProvider.js` & `GeminiGenerateTextProperties.jsx`)**:
  - Added text-model filter (`findBestFallback()`) that excludes image, audio, robotics, and tts preview models, prioritizing active text generation models (`gemini-3.6-flash`, `gemini-3.5-flash`, `gemini-2.0-flash`, `gemini-1.5-flash`).
  - Added automatic 404/400 retry: If Google returns `404/400` ("is no longer available to new users" / "not found") on the requested model, `GeminiProvider` automatically retries with the top available text model for that API key, ensuring workflow execution succeeds seamlessly without failing.
  - Added `gemini-3.5-flash` and `gemini-3.6-flash` options to `GeminiGenerateTextProperties.jsx`.

---

### **Discord → Message Received Trigger Node Implementation** — ✅ COMPLETED

**Scope**: Built and integrated the real-time `Discord → Message Received` trigger node powered by Discord's WebSocket Gateway v10 (`wss://gateway.discord.gg/?v=10&encoding=json`).

- **Server-Side WebSocket Gateway Manager (`DiscordGatewayManager.js`)**:
  - Implemented single-connection-per-credential Gateway WebSocket client.
  - Receives Opcode 10 `Hello` and maintains heartbeat loop at `heartbeat_interval`.
  - Identifies with intents `37377` (`GUILDS` | `GUILD_MESSAGES` | `DIRECT_MESSAGES` | `MESSAGE_CONTENT`).
  - Automatically catches Opcode 4014 missing Message Content intent error and displays setup guidance.
  - Implemented LRU message ID deduplication cache (1000 items, 10 min TTL).
  - Ignores bot messages by default (`ignoreBotMessages !== false`) to prevent infinite loop recursion.

- **Backend Runtime & Registries (`TriggerRegistry.js` & `ExecutorRegistry.js`)**:
  - Registered `DiscordMessageReceivedTrigger` in `TriggerRegistry`.
  - Registered `DiscordMessageReceivedTriggerExecutor` in `ExecutorRegistry`.
  - Created `DiscordMessageReceivedService.js` for trigger activation, deactivation, and test payload generation.

- **Frontend UI & Node Palette (`DiscordMessageReceivedProperties.jsx` & `DiscordMessageReceivedNode.jsx`)**:
  - Registered under **Category: Triggers**, **Provider: Discord**.
  - Searchable by keywords: `Discord`, `Message Received`, `Message`, `Trigger`.
  - Custom canvas node with right output handle.
  - Inspector panel allowing credential selection, server/channel filtering, and `ignoreBotMessages` / `onlyBotMentioned` toggles.

- **Data Mapper & Downstream Workflow Integration**:
  - Formats output structure containing `messageId`, `channelId`, `guildId`, `authorId`, `authorName`, `content`, `timestamp`, `message.id`, `message.content`, `message.channelId`, `message.guildId`, `message.author`.
  - Implemented **Response Mode** user configuration (`responseMode: 'all'` vs `responseMode: 'mention'`) with segmented control UI in `DiscordMessageReceivedProperties.jsx`.
  - Backend `DiscordGatewayManager` captures Gateway `READY` bot user ID and enforces mention detection (`<@BOT_ID>` & `<@!BOT_ID>` and `msg.mentions` array) when `responseMode === 'mention'`.
  - Created `DiscordTriggerScheduler.js` background service that automatically scans DB for published workflows on server boot and subscribes Gateway connections seamlessly.
  - Added trigger lifecycle hooks in `workflowService.js` and `PublishManager.js` to automatically register/unregister Discord Gateway connections when workflows are published, updated, deleted, or archived.
  - End-to-end verified with `Discord → Message Received` → `Gemini → Generate Text` → `Discord → Send Message` (6/6 unit tests passed).

### **Phase 28 Complete — Product Import Automation (Phase 1: Document Input / File Upload Foundation)** — ✅ COMPLETED
- **Backend Subsystem & File Storage Architecture (`backend/src/`)**:
  - `File.js`: Mongoose model tracking file metadata (`id`, `ownerId`, `originalName`, `storedName`, `storagePath`, `mimeType`, `extension`, `size`, `storageProvider`, `status`, timestamps).
  - `FileStorageService.js`: Modular storage service abstraction supporting local storage, format & size security validations (`.docx`, `.doc`, `.pdf`, `.xlsx`, `.xls`, max size limit via `MAX_FILE_SIZE_MB` env var), antivirus malware scan hook interface (`scanFile`), owner isolation enforcement, and safe random storage key generation.
  - `fileController.js` & `fileRoutes.js`: Mounted REST API endpoints under `/api/v1/files` (`POST /upload`, `GET /:id`, `DELETE /:id`) using `multer` for streaming multipart uploads.
  - `FileUploadExecutor.js` & `ExecutorRegistry.js`: Registered `fileUpload` and `fileUploadDocument` node executor returning structured output metadata (`{ success: true, file: { id, name, mimeType, size, extension, status } }`).
- **Frontend Subsystem (`frontend/src/`)**:
  - `fileUploadManifest.js`: Node definition, `INPUT` category, `UploadCloud` icon, default config, client-side validator.
  - `FileUploadNode.jsx`: Custom visual canvas component displaying `File → Upload Document`, `INPUT` badge, file name/type status, input & output handles, selection state, and execution state highlights.
  - `FileUploadProperties.jsx`: Production properties panel featuring drag & drop dropzone with click-to-browse file picker, upload progress indicator bar, uploaded document card with `[Replace]` and `[Remove]` controls, format policy note, and validation error banners.
  - `fileService.js`: API helper supporting progress callbacks for file uploads.
  - Node Registries (`nodeRegistry.js`, `modules/builder/nodeRegistry.js`, `PropertiesPanel.jsx`, `WorkflowCanvas.jsx`, `NodeSidebar.jsx`): Registered `File → Upload Document` under `INPUT` category, searchable by `file`, `upload`, `document`, `docx`, `pdf`, `excel`.
- **Automated Verification**:
  - Passed **24/24** assertions in `test_file_upload.js` (verified `.docx`, `.pdf`, `.xlsx` uploads, rejected `.exe`, rejected unauthenticated requests, verified user isolation HTTP 403, workflow save/reload persistence, execution engine metadata output, and file deletion).

### **Phase 29 Complete — Product Import Automation (Phase 2: Document → Extract Content)** — ✅ COMPLETED
- **Backend Parser Architecture & Subsystem (`backend/src/engine/parser/`)**:
  - `DocumentParserService.js`: Central factory resolving format parsers based on extension and MIME type.
  - `BaseParser.js`: Base parser interface defining text/cell normalization routines.
  - `DOCXParser.js`: DOCX document parser powered by `mammoth` & `cheerio` extracting clean text, paragraphs (`index`, `text`), headings (`level`, `text`), structured tables (`headers`, `rows`), and top-to-bottom ordered blocks (`blocks`).
  - `PDFParser.js`: PDF document parser using `pdf-parse` extracting plain text, paragraphs, and page bounds.
  - `XLSXParser.js`: Excel spreadsheet parser using `xlsx` (SheetJS) extracting worksheets into structured tables and formatted text rows.
  - `DOCParser.js`: Legacy `.doc` binary file parser safely extracting plain text streams without macro execution.
  - `DocumentExtractContentExecutor.js` & `ExecutorRegistry.js`: Registered `documentExtractContent` and `documentExtract` node executor resolving Mustache variables (`{{steps["File → Upload Document"].file.id}}`), enforcing owner security isolation, and returning structured JSON payloads (`text`, `paragraphs`, `headings`, `tables`, `blocks`, `stats`).
- **Frontend Subsystem (`frontend/src/`)**:
  - `documentExtractManifest.js`: Node definition under `DOCUMENT / DATA` category, `FileSearch` icon, default config, client-side validator.
  - `DocumentExtractNode.jsx`: Custom visual canvas component displaying `Document → Extract Content`, `DOCUMENT` badge, source file variable reference, and execution stats (`chars`, `paras`, `tables`).
  - `DocumentExtractProperties.jsx`: Production properties panel featuring Document Source variable expression input with **Insert Variable** support, Extraction Mode selector (`Full Document`, `Text Only`, `Tables Only`), and output variables path reference guide.
  - Node Registries (`nodeRegistry.js`, `modules/builder/nodeRegistry.js`, `PropertiesPanel.jsx`, `WorkflowCanvas.jsx`, `NodeSidebar.jsx`): Registered `Document → Extract Content` under `Document / Data` category, searchable by `Document`, `Extract`, `Text`, `DOCX`, `PDF`, `Excel`, `Parser`.
- **Automated Verification**:
  - Passed **30/30** assertions in `test_document_extract.js` (verified `.docx` product catalog parsing with Nike Air Max text, headings, and product table extraction, `.xlsx` spreadsheet table parsing, `ACCESS_DENIED` user isolation enforcement, `FILE_NOT_FOUND` error handling, and end-to-end workflow variable interpolation execution).

### **Phase 30 Complete — Dynamic Variables & Data Explorer Infrastructure System** — ✅ COMPLETED
- **Variable Engine & Schema Subsystem (`frontend/src/engine/variable/`)**:
  - `VariableEngine.js`: Expanded `NODE_SCHEMA_REGISTRY` to register outputs for `fileUpload`, `fileUploadDocument`, `documentExtractContent`, `documentExtract`, `googleSheets`, `discordMessageReceived`, `aiGenerateText`, `geminiGenerateText`, `openaiGenerateText`, `start`, `manual_trigger`, etc.
  - Dynamically builds output tree prefix as `steps["Node Label"]` (e.g. `steps["File → Upload Document"].file.id`, `steps["File → Upload Document"].fileId`), matching backend `ExpressionResolver.js`.
  - Prioritizes live execution outputs from `executionSnapshot.steps` and `executionSnapshot.outputs`. Eliminated static fallback to HTTP request schema for non-HTTP nodes.
  - Enhanced search to filter nodes and output properties across node labels, types, property names, variable paths, and sample values.
- **Workflow State & Context Infrastructure (`frontend/src/`)**:
  - `WorkflowBuilderContext.jsx`: Created React Context providing `{ workflowNodes, executionSnapshot, updateNodeData, workflowId }`.
  - `PropertiesPanel.jsx`: Wrapped properties panel in `WorkflowBuilderContext.Provider` and forwarded `workflowNodes` & `executionSnapshot` props directly to child property panels (`DocumentExtractProperties`, `FileUploadProperties`, `AutoForm`, `ConditionProperties`, etc.).
  - `UniversalVariableInput.jsx` & `VariablePickerDrawer.jsx`: Consumed `WorkflowBuilderContext` to automatically acquire current workflow nodes and execution outputs, preventing fallbacks to static demo nodes.
  - `handleInsertExpression(exprText)`: Fixed insertion to place expressions at exact cursor position on input controls, trigger `onChange(nextVal)` for React controlled state updates, mark workflow dirty, and close the drawer.
- **Automated Verification**:
  - Passed **10/10** assertions in `test_variable_explorer_resolution.js` (verified resolution of `steps["File → Upload Document"].file.id`, `steps["File → Upload Document"].fileId`, `steps["Document → Extract Content"].content.text`, `steps["Document → Extract Content"].content.tables[0].rows[0][0]`, `$execution.id`, `upper()`, and `length()`).

### **Phase 31 Complete — Runtime File Resolution System Fix** — ✅ COMPLETED
- **Backend Subsystem (`backend/src/engine/`)**:
  - `FileUploadExecutor.js`: Exposed top-level shortcut properties (`fileId`, `fileName`, `mimeType`, `size`) alongside structured `file` object in returned output payload.
  - `DocumentExtractContentExecutor.js`: Replaced broken `this.interpolate` call with `ExpressionEngine.resolve(rawFileId, context)`. Extracted file ID string from parsed JSON, object `id`, or nested `file.id`. Added detailed diagnostic resolution logging and descriptive error messages for unresolvable variables or missing physical files.
  - `ExecutionEngine.js` & `WorkflowEngine.js`: Configured pre-execution resolution using `ExpressionEngine.resolve(rawConfig, context)` before invoking node executors. Registered step output in `context.setNodeOutput` for `node.id`, `node.type`, `node.data.label`, and `node.label`.
- **Frontend Canvas Subsystem (`frontend/src/features/workflow/nodes/`)**:
  - `DocumentExtractNode.jsx`: Updated canvas node file indicator (`displayFileRef`) to dynamically show executed file name `outputData.file?.name`, configured variable reference, or `'No file selected'`.
- **Automated Verification**:
  - Passed **9/9** assertions in `test_document_extract_pipeline.js` (verified end-to-end DAG execution: `Start Trigger` → `File → Upload Document` → `Document → Extract Content` → `AI → Generate Text` → `End`, tested `{{steps["File → Upload Document"].file.id}}`, `{{steps["File → Upload Document"].fileId}}`, static file ID, and downstream AI node variable resolution `{{steps["Document → Extract Content"].content.text}}`).

### **Phase 32 Complete — File Upload Backend Executor Registration** — ✅ COMPLETED
- **Backend Registry Subsystem (`backend/src/engine/`)**:
  - `registry/ExecutorRegistry.js`: Imported `FileUploadExecutor` and `DocumentExtractContentExecutor` and registered canonical string keys (`fileUpload`, `fileUploadDocument`, `documentUpload`, `document_upload`, `documentExtractContent`, `documentExtract`, `document_extract`) in `ExecutorRegistry.executors` Map used by `WorkflowEngine.js`.
  - `ExecutorRegistry.js`: Added alias registrations for `documentUpload`, `document_upload`, `document_extract` to `executorRegistry` instance used by `ExecutionEngine.js`.
- **Automated Verification**:
  - Verified startup initialization log: `[ExecutorRegistry] Registered node executor: "fileUpload" -> FileUploadExecutor` across 65 total registered node executors.
  - Executed `test_document_extract_pipeline.js` passing 9/9 assertions for full end-to-end execution.

### **Phase 33 Complete — Canonical File ID Normalization & Document Extract Duplication Fix** — ✅ COMPLETED
- **Canonical File ID Normalization (`backend/src/utils/fileUtils.js`)**:
  - Implemented single canonical `normalizeFileId(input)` utility function.
  - Recursively extracts string file ID from primitive strings, JSON objects, nested `file.id` objects, and deduplicates repeated substrings or duplicated prefixes (e.g. `"file_ABC123file_ABC123"` -> `"file_ABC123"`, `{ id: "file_ABC123" }` -> `"file_ABC123"`).
- **Backend Document Extract Executor Overhaul (`backend/src/engine/executors/DocumentExtractContentExecutor.js`)**:
  - Integrated `normalizeFileId` into `DocumentExtractContentExecutor` and `FileUploadExecutor`.
  - Added 5 mandatory execution debug traces:
    1. Raw variable expression
    2. Resolved variable value
    3. Document Extract received value
    4. Normalized file ID
    5. Final file lookup ID
- **Executor & Base Executor Enhancements (`backend/src/engine/executors/BaseExecutor.js` & `ExecutorRegistry.js`)**:
  - Added `interpolate(template, context)` method on `BaseExecutor` using `ExpressionEngine.resolve`.
  - Registered `start`, `manual`, and `end` node type aliases in `ExecutorRegistry.js`.
- **Automated Verification**:
  - Passed **23/23** assertions in `test_storage_lifecycle.js` verifying `StorageService.save/get/getBuffer/exists`, full workflow graph execution (`Start Trigger` → `File → Upload Document` → `Document → Extract Content` → `End Completion`), Render ephemeral disk wipe recovery simulation, and downstream variable interpolation `{{steps["Document → Extract Content"].content.text}}`.

### **Phase 3A Complete — Website Connection & Authentication Infrastructure** — ✅ COMPLETED
- **Backend Architecture & Credential Vault**:
  - `WebsiteConnection.js` Mongoose model storing `connectionId` (e.g. `conn_7f82a91c`), `ownerId`, `websiteUrl`, `apiBaseUrl`, `connectionMethod` (`restApi`, `apiKey`, `bearerToken`, `basicAuth`, `browserSession`), `authType`, `customHeaders`, `status`, `lastTestedAt`, `lastResponseTimeMs`, `lastError`, and encrypted credentials (`select: false`).
  - `WebsiteConnectionService.js`: Implemented URL normalization (auto-protocol and trailing slash stripping), AES-256-CBC credential encryption at rest, masked credentials generator (`••••••••7F2A`), and safe connection testing with latency benchmarking and humanized error responses.
  - `websiteConnectionController.js` and `websiteConnectionRoutes.js`: Exposes REST endpoints (`POST /api/v1/connections/websites`, `GET /api/v1/connections/websites`, `GET /api/v1/connections/websites/:id`, `POST /api/v1/connections/websites/:id/test`, `POST /api/v1/connections/websites/test-raw`, `DELETE /api/v1/connections/websites/:id`).
  - `WebsiteConnectExecutor.js`: Workflow node executor resolving connection credentials safely, verifying user ownership, logging connection diagnostics without secrets, and outputting `{ success: true, connectionId, website: { url, method, status } }`.
- **Frontend Visual Canvas & Properties Panel**:
  - `websiteConnectManifest.js`: Registered in node registries with `cyan` theme, `Globe` icon, and `INTEGRATIONS / WEBSITE` category.
  - `WebsiteConnectNode.jsx`: Custom React Flow canvas card displaying connection state badges (`Connected` with domain and method badge, `Not Connected`, or `Connection Error`).
  - `WebsiteConnectProperties.jsx`: Comprehensive property panel supporting saved connection selection, 5 dynamic authentication method configurations, custom header key-value editor, inline live `[ Test Connection ]` tester, and output variable helper cards.
  - `NodeSidebar.jsx` & `VariableEngine.js`: Added category group and auto-completion schema for `{{steps["Website → Connect"].connectionId}}`, `{{steps["Website → Connect"].website.url}}`, `{{steps["Website → Connect"].website.status}}`.
### **Phase 3B Complete — Multi-Product Parsing & Product Creation Pipeline** — ✅ COMPLETED
- **Backend Architecture & Multi-Product Engine**:
  - `GeminiStructureProductsExecutor.js`: AI multi-product boundary detector and schema structurer. Extracts standardized product schema (`name`, `casNumber`, `urlSlug`, `primaryKeyword`, `titleTag`, `metaDescription`, `h1`, `description`, `sections`, `applications`, `benefits`, `safetyInformation`, `packagingInformation`, `faqs`, `schemaMarkup`). Enforces zero hallucination (`null` or `[]` for missing attributes) and includes automatic JSON repair retries.
  - `ForEachProductExecutor.js`: Sequential item loop iterator exposing `currentItem`, `currentIndex`, and `totalItems` into execution context.
  - `WebsiteCreateProductExecutor.js`: Generic REST API product creator consuming `connectionId` with server-side credential decryption. Supports configurable field mapping (`name` → `product_name`, `casNumber` → `cas_number`, `urlSlug` → `slug`, `titleTag` → `seo_title`, `metaDescription` → `seo_description`, `h1`, `description`, `faqs`, `schemaMarkup`).
  - **Dry Run Mode**: Validates payload mapping without dispatching real HTTP requests.
  - **Duplicate Protection**: Configurable duplicate handling strategies (`skip`, `update`, `create`, `stop`).
  - **Rate Limiting & Retries**: Configurable request delay ($0-5000\text{ ms}$) and automatic $3\times$ exponential backoff retries for $408/429/5\text{xx}$ transient errors.
  - **Fault Tolerance**: Isolates per-product failures, continuing execution across remaining items and generating comprehensive `{ total, created, failed, skipped }` execution summaries.
- **Frontend Visual Builder & Properties Panels**:
  - `geminiStructureProducts`: Manifest, custom node card, and property panel with model selection and temperature controls.
  - `forEachProduct`: Manifest, custom node card, and loop configuration panel.
  - `websiteCreateProduct`: Manifest, custom node card, and property panel with connection dropdown, field mapping table, Dry Run toggle, duplicate strategy selector, rate limiting dropdown, and `[ Test Product Creation ]` button.
  - Registered across `nodeRegistry.js`, `NodeToolbar.jsx`, `NodeSidebar.jsx`, `WorkflowCanvas.jsx`, `PropertiesPanel.jsx`, `NodeInspector.jsx`, and `VariableEngine.js`.
- **Automated Verification**:
  - Executed `test_multi_product_phase3b.js`: **9/9** tests passed verifying multi-product parsing (Beta-citronellol, Geraniol, Nerol), zero-hallucination rules, loop context variables, Dry Run mode, Live REST API creation, partial failure isolation, duplicate skipping, and end-to-end workflow execution (`Start Trigger` → `Gemini → Structure Products` → `For Each Product` → `Website → Create Product` → `End Completion`).
  - Ran Phase 3A regression test suite `test_website_connect_phase3a.js`: **15/15** passed.

### **Phase 3C Complete — Website → Create Tournament Integration Node (Apex Esports REST)** — ✅ COMPLETED
- **Backend Architecture & Tournament Execution Engine**:
  - `WebsiteCreateTournamentExecutor.js`: Generic REST API tournament creation executor consuming `Website → Connect` connection credentials without token re-entry.
  - **Dynamic Field Mapping Engine**: Maps source fields or mustache expressions (`{{item.title}}`) to API JSON keys with full support for deep nested dot-notation (`prizeBreakdown.first`, `prizeBreakdown.second`, `prizeBreakdown.third`).
  - **Dry Run Mode**: Validates payload schemas and mappings locally without dispatching network calls.
  - **Fault Tolerance & Duplicate Protection**: Configurable duplicate handling (`skip`, `update`, `create`, `stop`), configurable rate limiting delay ($0-5000\text{ ms}$), and automatic $3\times$ exponential backoff retries on $408/429/5\text{xx}$ transient errors.
  - **API Status Handling**: Graceful error formatting for HTTP 201, 400, 401, 403, 409, and 500 responses.
- **Frontend Visual Builder & Configuration Panel**:
  - `websiteCreateTournamentManifest.js`: Manifest registered under `Integrations / Website` with violet theme and `Trophy` icon.
  - `WebsiteCreateTournamentNode.jsx`: Custom React Flow canvas card displaying endpoint, HTTP method badge, and connection status.
  - `WebsiteCreateTournamentProperties.jsx`: Full interactive properties panel with Website Connection selector, Tournament Source expression input, Method/Endpoint inputs, **Editable Field Mapping Table** (Add Field, Remove Field, Edit Source/Target keys), **Live Request Preview JSON Box**, **Test Tournament Creation** validation button, duplicate strategy dropdown, and Dry Run toggle.
  - Wired into `nodeRegistry.js`, `NodeToolbar.jsx`, `NodeSidebar.jsx`, `WorkflowCanvas.jsx`, `PropertiesPanel.jsx`, `NodeInspector.jsx`, and `VariableEngine.js`.
- **Automated Verification**:
  - Executed `test_create_tournament.js`: **6/6** tests passed verifying dynamic nested dot-notation payload construction, Dry Run mode, live REST API dispatch with decrypted Bearer authentication, duplicate protection, HTTP 403 Forbidden handling, and full `WorkflowEngine.run` graph execution.
  - Ran regression test suites `test_multi_product_phase3b.js` (**9/9** passed) and `test_website_connect_phase3a.js` (**15/15** passed).
### **Phase 3D Complete — Direct Tournament Document-to-Website Automation Pipeline (Apex Esports REST)** — ✅ COMPLETED
- **Document Content Extraction & DOCX Table Normalization**:
  - `DOCXParser.js`: Enhanced DOCX extraction engine to preserve headings, paragraphs, lists, and tables without dropping cells or columns. Implemented `_formatTableAsText` which normalizes 2-column tables (`Field | Value`, `Game | Valorant`, `Mode | SQUAD`, `Total Prize Pool (₹) | ₹10000`, `Entry Fee (₹) | ₹0`) into clean key-value text pairs (`Game: Valorant\nMode: SQUAD\nTotal Prize Pool (₹): ₹10000`) and multi-column tables into pipe tables.
- **Workflow Pipeline Simplification (Direct 6-Node Architecture)**:
  - Removed `For Each Product` / `For Each Tournament` node requirement from single-document tournament publishing flows.
  - Standardized direct 6-node pipeline: `Start Trigger` → `File → Upload Document` → `Document → Extract Content` → `Gemini → Structure Tournament` → `Website → Connect` → `Website → Create Tournament` → `End Completion`.
- **Backend Architecture, Currency Normalization & AI Zero-Hallucination Pipeline**:
  - `GeminiStructureTournamentExecutor.js`: Dedicated AI document structurer tailored specifically for esports tournament documents. Enforces strict zero-hallucination rules (never invents or guesses values; missing attributes return `null`). Standardizes currency values into plain numeric values (`prizePool: 10000`, `entryFee: 0`, `firstPrize: 5000`, `secondPrize: 3000`, `thirdPrize: 2000`, `slots: 64`, `winnerCount: 3`), stripping currency symbols (`₹`, `$`, etc.), parentheses, and commas (`parseNumber`). Maps `"Total Prize Pool"` strictly to `prizePool` (plain number) and NOT to `prizeBreakdown`. Automatically builds `prizeBreakdown: { first: 5000, second: 3000, third: 2000 }`.
  - **Deterministic Extraction & Regex Robustness**: `deterministicExtract` handles currency qualifiers and parentheses in labels (e.g. `Total Prize Pool (₹):`, `Entry Fee (₹):`, `1st Place Prize (₹):`, `Max Capacity Slots:`).
  - **Extraction Debugging & Required Fields Guard**: Exposes `extractionDebug` payload (`rawTextReceived`, `textLength`, `linesCount`). Pre-validates required extraction fields (`game`, `mode`, `title`) and halts immediately with descriptive error (`Required tournament field 'game' could not be extracted from the uploaded document.`) if missing.
  - `WebsiteCreateTournamentExecutor.js`: Direct single-tournament and batch-tournament consumer with automatic upstream discovery (`context.steps['Gemini → Structure Tournament'].tournament`, `currentData`, `variables`). Evaluates field expressions only when mustache braces (`{{...}}`) are present to prevent plain key names from leaking as values. Normalizes numeric and currency values (`normalizeTournamentFieldValue`) for `prizePool`, `entryFee` (`0` is valid!), `slots`, `winnerCount`, and `prizeBreakdown`. Maps source aliases (`Total Prize Pool`, `Total Prize Pool (₹)`, `totalPrizePool`, `totalPrize`, `Prize Pool`) directly to `prizePool`. Implements `cleanFinalPayload` to strip internal executor metadata and avoid duplicate root properties (`firstPrize`, `secondPrize`, `thirdPrize`) when `prizeBreakdown` is used. Implements smart URL deduplication (`buildTargetUrl`) ensuring `https://apex-esports.onrender.com/api/v1/tournaments` resolves cleanly from `/tournaments`.
  - **Strict Pre-Validation & Execution Lifecycle**: Validates required payload fields (`title`, `game`, `mode`, `prizePool`, `entryFee`, `slots`, `date`, `time`, `map`) before API dispatch. Distinguishes execution states: `validated`, `requested`, `created`, `failed`.
  - **Dry Run & Live API Modes**: Provides structured Dry Run validation responses (`{ success: true, dryRun: true, validated: true, requested: false, wouldCreate: 1, created: 0, failed: 0 }`) and live REST dispatch (`{ success: true, dryRun: false, validated: true, requested: true, created: 1, failed: 0, tournamentId, response }`).
  - **Detailed HTTP Error & Validation Surfacing**: Full validation responses on HTTP 400/401/403/404/409/422/500 with complete diagnostics (`httpStatus`, `statusText`, `responseBody`, `validationMessage`, `requestPayload`, `targetUrl`) logged and returned without converting to success or hiding backend errors.
- **Frontend Visual Builder & Configuration Panels**:
  - `geminiStructureTournament`: Manifest, custom React Flow canvas card with Trophy icon & amber theme, and properties panel (`GeminiStructureTournamentProperties.jsx`) with model selection, temperature slider, dynamic document text expression input (`{{steps["Document → Extract Content"].content.text}}`), strict zero-placeholder system prompt editor, and interactive **Test Tournament Extraction** button.
  - `websiteCreateTournament`: Manifest, custom React Flow canvas card with Trophy icon & violet theme, and properties panel (`WebsiteCreateTournamentProperties.jsx`) with Website Connection selector, default Tournament Source expression (`{{steps["Gemini → Structure Tournament"].tournament}}`), default endpoint (`/tournaments`), 16-field editable mapping table, **Live Request Body Preview with REAL sample values**, **Test Tournament Creation** validation button, duplicate strategy dropdown, and Dry Run toggle.
- **Automated Verification**:
  - Executed `test_tournament_workflow_e2e.js`: **7/7** tests passed verifying DOCX table normalization (Total Prize Pool (₹) | ₹10000 -> Total Prize Pool (₹): ₹10000), exact tournament extraction with normalized numbers (`prizePool: 10000`, `entryFee: 0`, `prizeBreakdown: { first: 5000, second: 3000, third: 2000 }`), required field missing halting, Dry Run mode, live REST API creation on Apex Esports backend, pre-validation failure halting, and direct 6-node workflow execution.
  - Executed regression suites: `test_create_tournament.js` (**6/6** passed), `test_multi_product_phase3b.js` (**9/9** passed), and `test_website_connect_phase3a.js` (**15/15** passed) — total **37/37** automated tests passing across the workspace.
### **Phase 18 Complete — Modern White & Orange Dashboard UI/UX System** — ✅ COMPLETED
- **Modern Clean White & Orange Theme**:
  - `Dashboard.jsx`: Redesigned with a crisp, high-clarity white canvas (`#faf9f5` / `bg-white`) and warm saturated orange (`#ff4f00` / `orange-500` / `orange-600`) aesthetic with warm ambient gradients and subtle shadows.
  - **Dynamic Welcome & Status Hero**: Displays time-of-day greeting (`Good morning/afternoon/evening`), authenticated user name, operational badge (`DAG Engine Operational`), and quick action buttons (**AI Workflow Builder**, **Create Workflow**, and **Refresh**).
  - **Executive KPI Analytics Grid**: 4 clean white metric cards with soft borders, hover effects, and live stats:
    - *Total Workflows*: Real-time count, active vs draft breakdown, and direct link to workflow management.
    - *Execution Volume & Success Rate*: Total executions, percentage success gauge, and successful/failed run tallies in orange & emerald.
    - *Engine Latency*: Execution latency telemetry (ms) indicating topological DAG engine speed.
    - *Encrypted Vault*: Count of active AES-256 encrypted credentials with direct jump to integration vault.
  - **AI Automation Generator Prompt Bar**:
    - Integrated natural language prompt input directly on the dashboard with orange accent border.
    - 1-click popular prompt suggestions (*"Sheets ➔ Discord Alert"*, *"Webhook ➔ Gmail Dispatch"*, *"Scheduled API Healthcheck"*) with seamless preloading and auto-run in `AIBuilderPage.jsx`.
  - **Workflows Workspace Hub**:
    - Search bar and filter tabs (*All*, *Active*, *Draft*) with vibrant orange active pill.
    - Clean workflow cards with status badges, node counts, direct "Run" button with loading spinner & feedback toast, "Duplicate" button, and "Edit Canvas" link.
  - **Real-Time Execution Stream Feed**:
    - Live feed displaying latest execution runs across workflows with status pills, trigger badges (manual, webhook, cron), duration (ms), timestamps, and direct link to execution logs.
  - **Prebuilt Templates Starter Launcher**:
    - Top templates showcase with 1-click instantiation directly into the visual builder.
  - **Connected Ecosystem Rail**:
    - Visual integration cards for Google Sheets, Gmail OAuth, Discord Bot, Slack API, Webhooks Gateway, and MongoDB/SQL.
  - **Layout & Shell Harmony**: Updated `Sidebar.jsx`, `Navbar.jsx`, and `DashboardLayout.jsx` to adopt cohesive white and warm orange styling.

---







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

