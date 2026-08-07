import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import workflowRoutes from './routes/workflowRoutes.js';
import executionRoutes from './routes/executionRoutes.js';
import webhookRoutes from './webhooks/WebhookRouter.js';
import credentialRoutes from './routes/credentialRoutes.js';
import pluginRoutes from './routes/pluginRoutes.js';
import templateRoutes from './routes/templateRoutes.js';
import oauthRoutes from './routes/oauthRoutes.js';
import reliabilityRoutes from './routes/reliabilityRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import cronRoutes from './routes/cronRoutes.js';
import databaseRoutes from './routes/v1/databaseRoutes.js';
import googleSheetsRoutes from './routes/googleSheetsRoutes.js';
import discordRoutes from './discord/routes/DiscordRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// Express Middleware
app.use(cors({
  origin: (origin, callback) => callback(null, true), // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Baseline API Endpoint
app.get('/', (req, res) => {
  res.send('Workflow Automation API Running');
});

// Deployment Health Monitoring Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Versioned API Routes (/api/v1)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/workflows', workflowRoutes);
app.use('/api/v1/executions', executionRoutes);
app.use('/api/v1/webhooks', webhookRoutes);
app.use('/api/v1/credentials', credentialRoutes);
app.use('/api/v1/plugins', pluginRoutes);
app.use('/api/v1/templates', templateRoutes);
app.use('/api/v1/oauth', oauthRoutes);
app.use('/api/v1/reliability', reliabilityRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/runtime/cron', cronRoutes);
app.use('/api/v1/database', databaseRoutes);
app.use('/api/v1/google', googleSheetsRoutes);
app.use('/api/v1/google-sheets', googleSheetsRoutes);
app.use('/api/v1/discord', discordRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

export default app;
