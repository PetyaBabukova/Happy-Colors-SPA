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

console.log('ENV FILE PATH =>', path.join(__dirname, '.env'));
console.log('CLIENT_URL =>', process.env.CLIENT_URL);
console.log('STRIPE_SECRET_KEY exists =>', Boolean(process.env.STRIPE_SECRET_KEY));


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

// Конфигурация на CORS
//
// За да не е твърдо дефиниран само localhost, разрешаваме множество
// домейни чрез променлива на средата CLIENT_URL. Ако CLIENT_URL е
// дефинирана, тя може да съдържа един или няколко домейна,
// разделени със запетаи (например "http://localhost:3000,https://example.com").
// Ако няма зададена стойност, приемаме по подразбиране само localhost.
app.use(
  cors({
    origin: (origin, callback) => {
      // Прочитаме списъка от позволени домейни
      const envList = process.env.CLIENT_URL || '';
      const allowedOrigins = envList
        .split(',')
        .map((o) => o.trim())
        .filter((o) => o.length > 0);

      // Ако няма origin (напр. при сървър към сървър заявка) – позволяваме
      if (!origin) {
        return callback(null, true);
      }

      // Ако няма конфигурирани домейни, разрешаваме localhost
      if (allowedOrigins.length === 0) {
        if (origin === 'http://localhost:3000') {
          return callback(null, true);
        }
        return callback(new Error('CORS не е позволен за този домейн'), false);
      }

      // Ако origin присъства в списъка – позволяваме
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // В противен случай – отказ
      return callback(new Error('CORS не е позволен за този домейн'), false);
    },
    credentials: true,
  })
);

app.use(routes);

app.get('/', (req, res) => {
  res.send('Restful service');
});

app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}...`));
