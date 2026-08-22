import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { PublicLayout } from './layouts/PublicLayout';

// Landing & Auth Pages
import { LandingPage } from './pages/landing/LandingPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { NotFound } from './pages/NotFound';
import { OAuthCallback } from './pages/OAuthCallback';

// Public Product Pages
import { FeaturesPage } from './pages/public/product/FeaturesPage';
import { IntegrationsPage } from './pages/public/product/IntegrationsPage';
import { PricingPage } from './pages/public/product/PricingPage';
import { ChangelogPage } from './pages/public/product/ChangelogPage';
import { StatusPage } from './pages/public/product/StatusPage';

// Public Solutions Pages
import { DevelopersPage } from './pages/public/solutions/DevelopersPage';
import { EngineeringTeamsPage } from './pages/public/solutions/EngineeringTeamsPage';
import { StartupsPage } from './pages/public/solutions/StartupsPage';
import { EnterprisesPage } from './pages/public/solutions/EnterprisesPage';
import { AIAutomationPage } from './pages/public/solutions/AIAutomationPage';

// Public Resources Pages
import { DocsPage } from './pages/public/resources/DocsPage';
import { ApiReferencePage } from './pages/public/resources/ApiReferencePage';
import { GuidesPage } from './pages/public/resources/GuidesPage';
import { BlogPage } from './pages/public/resources/BlogPage';
import { SupportPage } from './pages/public/resources/SupportPage';

// Public Company Pages
import { AboutPage } from './pages/public/company/AboutPage';
import { CareersPage } from './pages/public/company/CareersPage';
import { ContactPage } from './pages/public/company/ContactPage';
import { SecurityPage } from './pages/public/company/SecurityPage';

// Public Legal Pages
import { PrivacyPage } from './pages/public/legal/PrivacyPage';
import { TermsPage } from './pages/public/legal/TermsPage';
import { CookiesPage } from './pages/public/legal/CookiesPage';

// Workflows & Core Platform
import { Workflows } from './features/workflow/pages/Workflows';
import { CreateWorkflow } from './features/workflow/pages/CreateWorkflow';
import { EditWorkflow } from './features/workflow/pages/EditWorkflow';
import { WorkflowCanvas } from './features/workflow/builder/WorkflowCanvas';

import { Credentials } from './features/credentials/pages/Credentials';
import { Templates } from './features/templates/pages/Templates';
import { Executions } from './features/executions/pages/Executions';
import { ReliabilityDashboard } from './features/reliability/pages/ReliabilityDashboard';
import { AIBuilderPage } from './features/ai/pages/AIBuilderPage';

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
        {/* Public Marketing & Resources Routes (Wrapped with PublicLayout) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          
          {/* Product Routes */}
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/integrations" element={<IntegrationsPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/changelog" element={<ChangelogPage />} />
          <Route path="/status" element={<StatusPage />} />

          {/* Solutions Routes */}
          <Route path="/solutions/developers" element={<DevelopersPage />} />
          <Route path="/solutions/engineering" element={<EngineeringTeamsPage />} />
          <Route path="/solutions/startups" element={<StartupsPage />} />
          <Route path="/solutions/enterprises" element={<EnterprisesPage />} />
          <Route path="/solutions/ai-automation" element={<AIAutomationPage />} />

          {/* Resources Routes */}
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/api-docs" element={<ApiReferencePage />} />
          <Route path="/guides" element={<GuidesPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/support" element={<SupportPage />} />

          {/* Company Routes */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/security" element={<SecurityPage />} />

          {/* Legal Routes */}
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/cookies" element={<CookiesPage />} />
        </Route>

        {/* Authentication Pages */}
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

            {/* Workflow History & Execution Logging System Route */}
            <Route path="/executions" element={<Executions />} />

            {/* Reliability Engine & Dead Letter Queue Route */}
            <Route path="/reliability" element={<ReliabilityDashboard />} />

            {/* AI Workflow Builder Route */}
            <Route path="/ai-builder" element={<AIBuilderPage />} />

            {/* Integrations Vault & Marketplace Routes */}
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
