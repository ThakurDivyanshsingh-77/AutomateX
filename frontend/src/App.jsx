import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';

import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { NotFound } from './pages/NotFound';
import { OAuthCallback } from './pages/OAuthCallback';

import { Workflows } from './features/workflow/pages/Workflows';
import { CreateWorkflow } from './features/workflow/pages/CreateWorkflow';
import { EditWorkflow } from './features/workflow/pages/EditWorkflow';
import { WorkflowCanvas } from './features/workflow/builder/WorkflowCanvas';

import { Credentials } from './features/credentials/pages/Credentials';
import { Templates } from './features/templates/pages/Templates';

export function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #334155',
            fontSize: '12px',
            borderRadius: '12px',
          },
        }}
      />
      <Routes>
        {/* Public Landing & Authentication Pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* OAuth Callback — public, no auth required */}
        <Route path="/oauth/callback" element={<OAuthCallback />} />

        {/* Protected Dashboard Shell Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />

            {/* Workflow Management Routes */}
            <Route path="/workflows" element={<Workflows />} />
            <Route path="/workflows/create" element={<CreateWorkflow />} />
            <Route path="/workflows/edit/:id" element={<EditWorkflow />} />

            {/* Phase 7 Integrations Vault & Marketplace Routes */}
            <Route path="/credentials" element={<Credentials />} />
            <Route path="/templates" element={<Templates />} />
          </Route>

          {/* Fullscreen Visual Builder Route */}
          <Route path="/builder/:id" element={<WorkflowCanvas />} />
        </Route>

        {/* Fallback 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
