import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import routes from './routes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = path.resolve(__dirname, '../../Happy-Colors-SECRETS/.env');
dotenv.config({ path: envPath });

const app = express();
const PORT = process.env.PORT || 3030;
const MONGO_URI = process.env.MONGO_URI;

function getAllowedOrigins() {
  const configuredOrigins = String(process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const fallbackClientUrl = String(process.env.CLIENT_URL || '').trim();

  const defaults = [
    fallbackClientUrl,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
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

// ⚠️ Stripe webhook raw body must stay before express.json()
app.use('/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without Origin:
      // - server-to-server
      // - curl / Postman
      // - some local/dev scenarios
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(routes);

app.get('/', (req, res) => {
  res.send('Restful service');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});