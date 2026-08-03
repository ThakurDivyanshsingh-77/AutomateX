import './env.js';
import { connectDB } from './config/db.js';
import { Execution } from './models/Execution.js';
import mongoose from 'mongoose';

async function main() {
  await connectDB();
  
  const exec = await Execution.findById('6a702dedbb71a5b6f551012c');
  console.log('Execution Status:', exec?.status);
  console.log('Execution Duration:', exec?.duration);
  console.log('Nodes Executed:', exec?.nodesExecuted);
  console.log('Execution Logs:', JSON.stringify(exec?.logs, null, 2));
  console.log('Execution Output:', JSON.stringify(exec?.output, null, 2));
  console.log('Execution Error:', JSON.stringify(exec?.error, null, 2));

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
