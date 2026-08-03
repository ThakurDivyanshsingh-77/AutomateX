import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// Express Middleware
app.use(cors());
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

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

export default app;
