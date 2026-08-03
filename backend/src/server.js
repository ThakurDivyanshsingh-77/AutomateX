import './env.js';  // Must be first — loads dotenv before any other module
import app from './app.js';
import { connectDB } from './config/db.js';
import { CronScheduler } from './runtime/scheduler/CronScheduler.js';

// Connect to MongoDB Database and initialize background Cron Scheduler
connectDB().then(() => {
  CronScheduler.start().catch((err) => {
    console.error('⏰ [CronScheduler]: Failed to start scheduler on server boot:', err.message);
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 [AutomateX Server] Listening on http://localhost:${PORT}`);
  console.log(`🔗 [API Baseline]: http://localhost:${PORT}/`);
  console.log(`🔗 [Health Monitoring]: http://localhost:${PORT}/health\n`);
});
