# PROJECT_CONTEXT.md - AI Handoff & Memory Bank

> **Single Source of Truth** for AI agents and developers working on the AutomateX Workflow Automation Platform.

---

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
  - `DeadLetterItem.js` & `DeadLetterQueue.js`: Stores permanently failed executions for inspection and single-click replay.
  - `FailureRecovery.js`: Service to inspect failed executions (`getLastSuccessfulNode`) and resume workflows from the point of failure.
  - `NotificationManager.js`: Dispatches structured failure alerts to console logs and outbound webhooks.
  - `reliabilityController.js` & `reliabilityRoutes.js`: Mounted at `/api/v1/reliability`.
- **Frontend Reliability Dashboard** (`/reliability`):
  - `ReliabilityDashboard.jsx`: Dedicated dashboard page with metrics summary cards, failed execution table with **Retry** and **Resume** buttons, and a **Dead Letter Queue** tab with replay capabilities.
  - `RetryConfigFields.jsx`: Added **Timeout (ms)** input field to node properties.
  - `ExecutionDetailsDrawer.jsx`: Visualizes per-attempt retry duration, status, and timeout badges in execution timeline.

### **Phase 12 Complete — AI Workflow Builder (Natural Language → Workflow)** — ✅ COMPLETED
- **Grok / Groq AI Integration**:
  - `GrokClient.js`: Multi-provider LLM API client supporting **Groq API** (`gsk_...` keys using `https://api.groq.com/openai/v1/chat/completions` with `llama-3.3-70b-versatile`), **xAI Grok** (`xai-...` keys with `grok-2-latest`), and **OpenAI**. Uses structured JSON prompt engineering.
  - `HeuristicWorkflowGenerator.js`: Built-in offline rule-based NLP workflow generator. Parses prompt intents, detects triggers (`webhook`, `cron`, `start`) and actions (`gmail`, `http`, `slack`, `discord`, `telegram`, `delay`, `log`, `condition`), auto-calculates horizontal layout grids.
  - `AIWorkflowService.js`: High-level orchestrator providing 4 core operations: `generate`, `explain`, `optimize`, and `fix`.
  - `aiController.js` & `aiRoutes.js`: REST endpoints mounted under `/api/v1/ai`.
- **Frontend AI Builder Workspaces**:
  - `AIBuilderPage.jsx`: Dedicated prompt workspace page at `/ai-builder` with natural language textarea, template inspiration pills, live pipeline node preview, step-by-step breakdown, and 1-click canvas launch.
  - `AIAssistantDrawer.jsx`: Floating drawer in visual canvas builder with 4 AI modes (**Generate**, **Explain**, **Optimize**, **Auto-Fix**).
  - `WorkflowCanvas.jsx` & `Sidebar.jsx`: Added **AI Assistant** button (Sparkles icon) to canvas header and **AI Builder** link to navigation sidebar.

### **Phase 13 Complete — Production Cron Scheduler (Enterprise Grade)** — ✅ COMPLETED
- **Production Cron Scheduler Service** ([CronScheduler.js](file:///c:/Users/divya/OneDrive/Desktop/Workflow%20Automation%20Platform/backend/src/runtime/scheduler/CronScheduler.js)): Background scheduling engine powered by `node-cron` & `cron-parser`. Key capabilities:
  - Automatic DB published workflow scanning and job registration on server boot (`server.js`).
  - Dynamic publish/unpublish/update/delete hooks (`PublishManager.js` & `workflowService.js`).
  - Overlap protection (prevents concurrent execution if previous run is still active).
  - Timezone support (`Asia/Kolkata`, `America/New_York`, `UTC`, etc.).
  - Execution routing through `RuntimeManager` → Queue → Worker → History (tagged as `triggerType: 'cron'`).
- **REST Status API**: `GET /api/v1/runtime/cron/status` & `POST /api/v1/runtime/cron/reload`.
- **Frontend UI & Node Properties**:
  - `CronProperties.jsx`: Cron Node property inspector with presets (`Every 5m`, `Every 20m`, `Daily at 9 AM`), custom syntax input, timezone selector, enable/disable toggle, and human-readable preview text powered by `cronstrue`.
  - `ReliabilityDashboard.jsx`: Added **Cron Scheduler** status card and active jobs inspection table tab.

---

## 🛠️ Complete Tech Stack

### **Backend (`/backend`)**
- **Runtime**: Node.js (ES Modules `"type": "module"`)
- **Framework**: Express.js
- **Database**: MongoDB & Mongoose ORM
- **Security & Vault**: `bcryptjs`, `jsonwebtoken`, `crypto` (AES-256-CBC Encryption)
- **AI Engine**: Groq API (`gsk_...` key, `llama-3.3-70b-versatile`), xAI Grok API (`grok-2-latest`), `HeuristicWorkflowGenerator` offline fallback engine
- **Versioning Engine**: `WorkflowVersion` model, `VersionManager`, `VersionComparator` (structured node/edge diff), `PublishManager`
- **Reliability Engine**: `TimeoutManager`, `RetryEngine`, `ErrorHandler` (7 error categories), `DeadLetterQueue`, `FailureRecovery`, `NotificationManager`
- **Expression Engine**: `ExpressionEngine`, `ExpressionParser`, `ExpressionResolver` (nested paths & `items[0]` array syntax)
- **Webhook Subsystem**: `WebhookService`, `WebhookAuth`, `WebhookValidator` (100 req/min Rate Limiter), `WebhookReplay`
- **Execution Debugger**: `ExecutionSnapshot`, `ExecutionInspector`, `ExecutionMetrics`, `ExecutionReplay`, `ExecutionDebuggerService`
- **Google Integration**: `googleapis` (OAuth2 & Gmail v1 REST API)
- **Executors & Plugins**: `ExecutorRegistry` (`start`, `http`, `delay`, `log`, `end`, `gmail`, `condition`, `webhook`, `tryCatch`), `ConditionExecutor`, `GmailPlugin`, `PluginRegistry`, `ConnectorClient`
- **Engine & Runtime**: Standalone Graph Engine, Adjacency List Traversal, Dual-Branch Handle Router, `RuntimeEventBus`, `RuntimeManager`, `ExecutionWorker`, `RetryManager`, `TimeoutManager`, `CronScheduler`, Public Webhook Receiver Endpoint

### **Frontend (`/frontend`)**
- **Framework**: React 18 (Vite, port 3000)
- **Visual Canvas Engine**: `@xyflow/react` v12
- **AI Workspace**: `AIBuilderPage.jsx` (`/ai-builder`), `AIAssistantDrawer.jsx` (Generate, Explain, Optimize, Auto-Fix)
- **Versioning UI**: `VersionHistoryPanel.jsx`, `PublishDialog.jsx`, `CompareVersionsModal.jsx`
- **Reliability UI**: `ReliabilityDashboard.jsx` (`/reliability`), Dead Letter Queue inspector
- **Custom Nodes**: `TriggerNode`, `HttpNode`, `DelayNode`, `LogNode`, `EndNode`, `GmailNode`, `ConditionNode`, `WebhookNode`, `TryCatchNode`
- **Expression Components**: `ExpressionInput`, `VariablePickerModal`, `VariableTree`, `VariableSearch`, `VariablePreview`
- **Webhook Components**: `WebhookURL`, `WebhookTester`, `WebhookProperties`
- **Debugger Components**: `ExecutionDebugger`, `ExecutionTimeline`, `ExecutionInspector`, `NodeInspector`, `ExpressionInspector`, `PerformancePanel`, `ExecutionReplay`
- **Retry & Timeout Components**: `RetryConfigFields` (Attempts, Delay, Strategy, Timeout ms, Continue On Error), `TryCatchNode`
- **Routing**: `react-router-dom` v6
- **State & Context**: React Context API (`AuthContext.jsx`) + custom hooks (`useWorkflow.js`, `useNodeOperations.js`)
- **API Interceptor**: Centralized Axios client (`api.js`) with Bearer token injector and `401 Unauthorized` redirect handler.
- **Forms & Validation**: `react-hook-form` + custom `AutoForm`, `GmailProperties`, `ConditionProperties`, `WebhookProperties`
- **Notifications**: `react-hot-toast`
- **Styling**: Tailwind CSS v3 (Linear / Vercel modern SaaS dark theme)
- **Icons**: Lucide React (`lucide-react`)
