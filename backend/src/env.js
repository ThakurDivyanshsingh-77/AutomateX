// env.js — Loads .env before any other module is initialized.
// This file must be imported FIRST in server.js.
// In ESM, all imports are hoisted, so placing dotenv.config() inline
// in server.js doesn't guarantee it runs before sibling imports.
// Importing this as the first import ensures the module graph resolves
// this side-effect before loading app.js or config modules.
import dotenv from 'dotenv';
dotenv.config();
