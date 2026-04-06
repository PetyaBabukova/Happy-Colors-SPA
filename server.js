import dotenv from 'dotenv';
import mongoose from 'mongoose';
import next from 'next';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── 1. Environment ──────────────────────────────────────────────
const envCandidates = [
  path.resolve(__dirname, '.env'),
  path.resolve(__dirname, 'server/.env'),
  path.resolve(__dirname, '../Happy-Colors-SECRETS/.env'),
];

const envPath = envCandidates.find((p) => fs.existsSync(p));

if (envPath) {
  dotenv.config({ path: envPath });
  console.log(`✅ ENV loaded from: ${envPath}`);
} else {
  dotenv.config();
  console.warn('⚠️ No .env file found. Using environment variables.');
}

const dev = process.env.NODE_ENV !== 'production';
const PORT = Number(process.env.PORT) || 3000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is missing.');
  process.exit(1);
}

// ── 2. Database ─────────────────────────────────────────────────
mongoose.set('strictQuery', true);

try {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB Atlas');
} catch (err) {
  console.error('❌ Error connecting to MongoDB:', err.message);
  process.exit(1);
}

// ── 3. Express (dynamic import — after env is loaded) ───────────
const { createExpressApp } = await import('./server/server.js');
const expressApp = createExpressApp();

// ── 4. Next.js ──────────────────────────────────────────────────
const nextApp = next({ dev, dir: './happy-colors-nextjs-project' });
await nextApp.prepare();
const nextHandler = nextApp.getRequestHandler();

// ── 5. Unified app ─────────────────────────────────────────────
const app = express();

app.use('/api', expressApp);

app.use((req, res) => nextHandler(req, res));

// ── 6. Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Unified server listening on port ${PORT}`);
});
