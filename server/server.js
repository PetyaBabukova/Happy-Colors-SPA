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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Зареждаме .env от същата директория
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3030;
const MONGO_URI = process.env.MONGO_URI;

// Проверка дали имаме MONGO_URI
if (!MONGO_URI) {
  console.error('❌ MONGO_URI is missing. Please check your .env file.');
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

// ✅ КРИТИЧНО за Stripe webhook: raw body (трябва да е ПРЕДИ express.json())
app.use('/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  cors({
    origin: 'http://localhost:3000', // или добави прод адреса по-късно
    credentials: true,
  })
);

app.use(routes);

app.get('/', (req, res) => {
  res.send('Restful service');
});

app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}...`));
