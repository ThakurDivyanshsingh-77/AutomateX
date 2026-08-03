# Workflow Automation Platform

A scalable, modular, production-ready SaaS application designed for visual workflow automation.

---

## 📌 Project Overview

The **Workflow Automation Platform** allows users to visually design automation workflows by connecting triggers and actions on a drag-and-drop canvas. Built with a modular architecture following modern software engineering principles, layered separation of concerns, and clean REST APIs.

---

## 🚀 Tech Stack

- **Frontend**: React 18, Vite, React Router DOM, Tailwind CSS, Lucide Icons, Axios.
- **Backend**: Node.js, Express.js (ES Modules), JWT Authentication, bcryptjs, express-validator.
- **Database**: MongoDB (Mongoose ORM).

---

## 📂 Folder Architecture

```
workflow-automation-platform/
├── frontend/             # React Vite client application
├── backend/              # Node.js Express REST API server
├── docs/                 # Platform documentation
├── README.md             # Project handbook
├── PROJECT_CONTEXT.md    # AI handoff memory bank
├── .gitignore            # Git exclusion rules
└── LICENSE               # MIT License
```

---

## 🔌 API Summary & Versioning

Base API Prefix: `/api/v1`

- `GET /` — Returns `Workflow Automation API Running`
- `GET /health` — Returns `{ "status": "OK" }` (Deployment health monitoring)
- `POST /api/v1/auth/register` — User registration endpoint
- `POST /api/v1/auth/login` — User authentication endpoint
- `GET /api/v1/auth/me` — Protected user profile endpoint

---

## ⚡ Installation & Local Setup

### 1. Clone & Setup Environment
```powershell
# Backend setup
cd backend
npm install
npm run dev

# Frontend setup
cd frontend
npm install
npm run dev
```

---

## 🗺️ Future Roadmap

- **Phase 1.1**: Project Setup & Architecture (Completed)
- **Phase 1.2**: Database Schemas & Authentication System (Completed)
- **Phase 2**: Visual Workflow Canvas Builder
- **Phase 3**: Topological Execution Engine & Executor Registry
- **Phase 4**: Real-time Execution Debugger & Webhook Listeners
- **Phase 5**: Asynchronous Queue Workers (BullMQ + Redis)
