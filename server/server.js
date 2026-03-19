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
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

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

app.use('/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  cors({
    origin: CLIENT_URL,
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