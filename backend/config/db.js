import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/workflow_platform';
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`[MongoDB Warning] Could not connect to MongoDB at ${process.env.MONGO_URI || 'mongodb://127.0.0.1:27017'}`);
    console.warn(`[MongoDB Warning] Error: ${error.message}`);
    console.warn(`[MongoDB Warning] Server starting in fallback mode.`);
    return false;
  }
};
