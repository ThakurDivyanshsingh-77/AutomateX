import './env.js';  // Must be first — loads dotenv before any other module
import app from './app.js';
import { connectDB } from './config/db.js';

// Connect to MongoDB Database
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 [Phase 1.2 Auth Server] Listening on http://localhost:${PORT}`);
  console.log(`🔗 [API Baseline]: http://localhost:${PORT}/`);
  console.log(`🔗 [Health Monitoring]: http://localhost:${PORT}/health\n`);
});
