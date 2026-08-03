# PROJECT_CONTEXT.md - AI Handoff & Memory Bank

> **Single Source of Truth** for AI agents and developers working on the Workflow Automation Platform.

---

## 🚀 Project Overview

The **Workflow Automation Platform** is a scalable, modular, production-ready SaaS application designed for visual workflow automation.

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
- **Production Gmail Executor**: Replaced mock with `googleapis` `gmail.users.messages.send()`. Supports To, CC, BCC, Subject, Plain Text & HTML body types, and search/read operations.
- **Frontend Properties Panel**: Custom `GmailProperties.jsx` with credential dropdown, **Connect Gmail** OAuth popup flow, **Test Connection** button (`gmail.users.getProfile`), and `/oauth/callback` landing page.

### **Phase 8.1 Complete — Condition (IF) Node & Branching Engine** — ✅ COMPLETED
- **Frontend Package** (`features/workflow/nodes/condition/`): `ConditionNode.jsx` with dual `TRUE` & `FALSE` output handles, `ConditionProperties.jsx` with 13 boolean operators, client-side validator, and registered under `Logic` category in Node Palette.
- **Backend Condition Executor** ([ConditionExecutor.js](file:///c:/Users/divya/OneDrive/Desktop/Workflow%20Automation%20Platform/backend/src/engine/executors/ConditionExecutor.js)): Expression evaluation engine resolving variables/mustache templates from `context` and returning `{ result, selectedBranch: 'true'|'false' }`. Registered in `ExecutorRegistry.js`.
- **Graph Traversal Branching** ([WorkflowEngine.js](file:///c:/Users/divya/OneDrive/Desktop/Workflow%20Automation%20Platform/backend/src/engine/WorkflowEngine.js)): Updated graph orchestrator to evaluate `sourceHandle` (`'true'` vs `'false'`), ensuring single-branch execution routing for condition nodes while normal linear nodes remain 100% unaffected.

### **Phase 8.2 Complete — Expression Engine (Production Implementation)** — ✅ COMPLETED
- **Expression Engine Package** (`backend/src/engine/expression/`): `ExpressionEngine.js`, `ExpressionParser.js` (with LRU token caching), `ExpressionResolver.js` (supporting nested paths & `items[0]` array syntax), and `helpers.js`.
- **Runtime & Executor Integration**: Integrated automatically in `WorkflowEngine.js` before every node executes. Passed 13/13 unit tests.

### **Phase 8.3 Complete — Variable Picker & Data Explorer** — ✅ COMPLETED
- **Expression Components Package** (`frontend/src/components/expression/`): `ExpressionInput.jsx` (with **Insert Variable** button, `Ctrl + Space` shortcut, and live sample preview), `VariablePickerModal.jsx`, `VariableTree.jsx` (with type badges), `VariableSearch.jsx`, and `VariablePreview.jsx`.
- **Form Properties Integration**: Updated `TextField.jsx`, `TextareaField.jsx`, and `ConditionProperties.jsx`.

### **Phase 8.4 Complete — Webhook Trigger (Production Grade)** — ✅ COMPLETED
- **Backend Webhook Subsystem** (`backend/src/webhooks/`): `WebhookAuth.js` (Bearer/API Key/Secret), `WebhookValidator.js` (100 req/min Rate Limiter), `WebhookService.js`, `WebhookReplay.js`, `WebhookController.js`, and `WebhookRouter.js`.
- **Frontend Webhook Package** (`features/workflow/nodes/webhook/`): `WebhookNode.jsx`, `WebhookProperties.jsx`, `WebhookURL.jsx`, and `WebhookTester.jsx`. Passed 12/12 unit tests.

### **Phase 8.5 Complete — Execution Debugger & Inspector** — ✅ COMPLETED
- **Backend Debugger Subsystem** (`backend/src/debugger/`): `ExecutionSnapshot.js`, `ExecutionInspector.js`, `ExecutionMetrics.js`, `ExecutionReplay.js`, and `ExecutionDebuggerService.js`.
- **Frontend Debugger Package** (`frontend/src/components/debugger/`): `ExecutionDebugger.jsx`, `ExecutionTimeline.jsx`, `ExecutionInspector.jsx`, `NodeInspector.jsx`, `ExpressionInspector.jsx`, `PerformancePanel.jsx`, and `ExecutionReplay.jsx`.

### **Phase 9 Complete — Error Handling & Retry Engine** — ✅ COMPLETED
- **Backend Retry Package** (`backend/src/engine/retry/`):
  - [RetryPolicy.js](file:///c:/Users/divya/OneDrive/Desktop/Workflow%20Automation%20Platform/backend/src/engine/retry/RetryPolicy.js): Strategy delay calculator supporting `Immediate` (0ms), `Fixed`, `Exponential Backoff` ($1\text{s}, 2\text{s}, 4\text{s}...$), and `Linear Backoff` ($1\text{s}, 2\text{s}, 3\text{s}...$).
  - [RetryEngine.js](file:///c:/Users/divya/OneDrive/Desktop/Workflow%20Automation%20Platform/backend/src/engine/retry/RetryEngine.js): Wraps node execution with automatic retry attempts, records attempt history, and flags `recovered` status on success after retries.
  - [TryCatchExecutor.js](file:///c:/Users/divya/OneDrive/Desktop/Workflow%20Automation%20Platform/backend/src/engine/executors/TryCatchExecutor.js): Try/Catch flow control executor registered in `ExecutorRegistry.js`.
  - [WorkflowEngine.js](file:///c:/Users/divya/OneDrive/Desktop/Workflow%20Automation%20Platform/backend/src/engine/WorkflowEngine.js): Orchestrator loop upgraded for retry handling, dedicated `error` branch handle routing, and `continueOnError` fallback.
- **Frontend Error & Retry Features**:
  - [RetryConfigFields.jsx](file:///c:/Users/divya/OneDrive/Desktop/Workflow%20Automation%20Platform/frontend/src/features/workflow/nodes/properties/fields/RetryConfigFields.jsx): Config section in `AutoForm.jsx` allowing users to configure Retry Attempts ($0-10$), Delay (ms), Strategy (Fixed/Immediate/Exponential/Linear), and Continue On Error checkbox.
  - [TryCatchNode.jsx](file:///c:/Users/divya/OneDrive/Desktop/Workflow%20Automation%20Platform/frontend/src/features/workflow/nodes/tryCatch/TryCatchNode.jsx): Try/Catch canvas node with `TRY` (green) and `CATCH` (red) handles.
- **Unit Test Suite**: Passed 13/13 unit tests in `RetryEngine.test.js`.

---

## 🛠️ Complete Tech Stack

### **Backend (`/backend`)**
- **Runtime**: Node.js (ES Modules `"type": "module"`)
- **Framework**: Express.js
- **Database**: MongoDB & Mongoose ORM
- **Security & Vault**: `bcryptjs`, `jsonwebtoken`, `crypto` (AES-256-CBC Encryption)
- **Expression Engine**: `ExpressionEngine`, `ExpressionParser`, `ExpressionResolver` (nested paths & `items[0]` array syntax)
- **Webhook Subsystem**: `WebhookService`, `WebhookAuth` (Bearer/API Key/Secret), `WebhookValidator` (100 req/min Rate Limiter), `WebhookReplay`
- **Execution Debugger**: `ExecutionSnapshot`, `ExecutionInspector`, `ExecutionMetrics`, `ExecutionReplay`, `ExecutionDebuggerService`
- **Retry Engine**: `RetryEngine`, `RetryPolicy` (Immediate/Fixed/Exponential/Linear), `TryCatchExecutor`, Error Branch Handles
- **Google Integration**: `googleapis` (OAuth2 & Gmail v1 REST API)
- **Executors & Plugins**: `ExecutorRegistry` (`start`, `http`, `delay`, `log`, `end`, `gmail`, `condition`, `webhook`, `tryCatch`), `ConditionExecutor`, `GmailPlugin`, `PluginRegistry`, `ConnectorClient`
- **Engine & Runtime**: Standalone Graph Engine, Adjacency List Traversal, Dual-Branch Handle Router, `RuntimeEventBus`, `RuntimeManager`, `ExecutionWorker`, `RetryManager`, `TimeoutManager`, `CronScheduler`, Public Webhook Receiver Endpoint

### **Frontend (`/frontend`)**
- **Framework**: React 18 (Vite, running on port 3000)
- **Visual Canvas Engine**: `@xyflow/react` v12
- **Custom Nodes**: `TriggerNode`, `HttpNode`, `DelayNode`, `LogNode`, `EndNode`, `GmailNode`, `ConditionNode`, `WebhookNode`, `TryCatchNode`
- **Expression Components**: `ExpressionInput`, `VariablePickerModal`, `VariableTree`, `VariableSearch`, `VariablePreview`
- **Webhook Components**: `WebhookURL`, `WebhookTester`, `WebhookProperties`
- **Debugger Components**: `ExecutionDebugger`, `ExecutionTimeline`, `ExecutionInspector`, `NodeInspector`, `ExpressionInspector`, `PerformancePanel`, `ExecutionReplay`
- **Retry Components**: `RetryConfigFields`, `TryCatchNode`, `tryCatchManifest`
- **Routing**: `react-router-dom` v6
- **State & Context**: React Context API (`AuthContext.jsx`) + custom hooks (`useWorkflow.js`, `useNodeOperations.js`)
- **API Interceptor**: Centralized Axios client (`api.js`) with Bearer token injector and `401 Unauthorized` redirect handler.
- **Forms & Validation**: `react-hook-form` + custom `AutoForm`, `GmailProperties`, `ConditionProperties`, `WebhookProperties`
- **Notifications**: `react-hot-toast`
- **Styling**: Tailwind CSS v3 (Linear / Vercel modern SaaS dark theme)
- **Icons**: Lucide React (`lucide-react`)
