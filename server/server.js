import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

import routes from './routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envCandidates = [
  path.resolve(__dirname, '../../Happy-Colors-SECRETS/.env'),
  path.resolve(__dirname, '.env'),
];

const existingEnvPath = envCandidates.find((envPath) => fs.existsSync(envPath));

if (existingEnvPath) {
  dotenv.config({ path: existingEnvPath });
} else {
  dotenv.config();
}

const app = express();
const PORT = Number(process.env.PORT) || 3030;
const MONGO_URI = process.env.MONGO_URI;
const isProduction = process.env.NODE_ENV === 'production';

function isLocalOrigin(origin = '') {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
}

function getAllowedOrigins() {
  const configuredOrigins = String(process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const clientUrl = String(process.env.CLIENT_URL || '').trim();

  const defaults = [
    clientUrl,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'http://localhost:3002',
    'http://127.0.0.1:3002',
  ].filter(Boolean);

  return [...new Set([...configuredOrigins, ...defaults])];
}

const allowedOrigins = getAllowedOrigins();

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is missing.');
  process.exit(1);
}

mongoose.set('strictQuery', true);

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => {
    console.error('❌ Error connecting to MongoDB:', err.message);
    process.exit(1);
  });

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(cookieParser());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (!isProduction && isLocalOrigin(origin)) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);

// Stripe webhook raw body must stay before express.json()
app.use('/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(routes);

app.get('/', (req, res) => {
  res.send('Restful service');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});