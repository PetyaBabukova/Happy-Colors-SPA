// server/server.js

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import routes from './routes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ESM еквивалент на __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Зареждаме .env от външната папка със secrets
const envPath = path.resolve(__dirname, '../../Happy-Colors-SECRETS/.env');
dotenv.config({ path: envPath });

console.log('🔐 ENV loaded from:', envPath);
console.log('CLIENT_URL:', process.env.CLIENT_URL);
console.log('STRIPE_SECRET_KEY exists:', Boolean(process.env.STRIPE_SECRET_KEY));

const app = express();
const PORT = process.env.PORT || 3030;
const MONGO_URI = process.env.MONGO_URI;

// Проверка дали имаме MONGO_URI
if (!MONGO_URI) {
  console.error('❌ MONGO_URI is missing. Please check your .env configuration.');
  process.exit(1);
}

// Свързваме се с MongoDB Atlas
mongoose.set('strictQuery', true);

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => {
    console.error('❌ Error connecting to MongoDB:', err.message);
    process.exit(1);
  });

app.use(cookieParser());

// ⚠️ КРИТИЧНО за Stripe webhook: raw body трябва да е ПРЕДИ express.json()
app.use('/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Routes
app.use(routes);

app.get('/', (req, res) => {
  res.send('Restful service');
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}...`);
});