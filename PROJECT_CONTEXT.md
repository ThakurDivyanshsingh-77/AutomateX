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

### **Phase 11 Complete — Reliability Engine (Retry, Error Handling & Failure Recovery)** — ✅ COMPLETED
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

---

## 🛠️ Complete Tech Stack

### **Backend (`/backend`)**
- **Runtime**: Node.js (ES Modules `"type": "module"`)
- **Framework**: Express.js
- **Database Engine Framework**: `DatabaseProvider`, `MongoProvider` (with in-memory fallback), `MongoConnectionPool`, `MySQLProvider`, `PostgresProvider`, `DatabaseRegistry`, `DatabaseCredentialManager`, `DatabaseValidator`, `DatabaseExecutor`
- **Database ORM & Drivers**: MongoDB & Mongoose ORM
- **Executors & Plugins**: `ExecutorRegistry` (`start`, `http`, `delay`, `log`, `end`, `gmail`, `condition`, `webhook`, `tryCatch`, `mongodb`, `mysql`, `postgres`, `databaseQuery`, `mongoInsertOne`, `mongoFind`, `mongoFindOne`, `mongoUpdateOne`, `mongoDeleteOne`, `mongoCount`, `mongoAggregate`), `ConditionExecutor`, `GmailPlugin`, `PluginRegistry`, `ConnectorClient`
- **Engine & Runtime**: Standalone Graph Engine, Adjacency List Traversal, Dual-Branch Handle Router, `RuntimeEventBus`, `RuntimeManager`, `ExecutionWorker`, `RetryManager`, `TimeoutManager`, `CronScheduler`

### **Frontend (`/frontend`)**
- **Framework**: React 18 (Vite, port 3000)
- **Visual Canvas Engine**: `@xyflow/react` v12
- **Custom Nodes & Properties**: `TriggerNode`, `HttpNode`, `DelayNode`, `LogNode`, `EndNode`, `GmailNode`, `ConditionNode`, `WebhookNode`, `TryCatchNode`, `Database` nodes (`mongodb`, `mysql`, `postgres`, `databaseQuery`, `mongoInsertOne`, `mongoFind`, `mongoFindOne`, `mongoUpdateOne`, `mongoDeleteOne`, `mongoCount`, `mongoAggregate`)
- **Node Palette**: Categorized Node Palette under **Database** category with Lucide React icons
