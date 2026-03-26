// Express server configuration for Happy Colors
// This version improves CORS handling and environment loading.
// It attempts to load a custom .env file from a sibling secrets directory
// when present and falls back to default process.env values otherwise.

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import routes from './routes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// Resolve current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Attempt to load environment variables from a neighbouring secrets repo.
// This path will exist in local development but not in production on Render.
const customEnvPath = path.resolve(__dirname, '../../Happy-Colors-SECRETS/.env');
if (fs.existsSync(customEnvPath)) {
  // Load variables from the secrets file
  dotenv.config({ path: customEnvPath });
} else {
  // Fall back to default .env behaviour
  dotenv.config();
}

const app = express();

// Port and database configuration
const PORT = process.env.PORT || 3030;
const MONGO_URI = process.env.MONGO_URI;

// Validate presence of the Mongo connection URI
if (!MONGO_URI) {
  console.error('❌ MONGO_URI is missing.');
  process.exit(1);
}

// Configure Mongoose
mongoose.set('strictQuery', true);
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => {
    console.error('❌ Error connecting to MongoDB:', err.message);
    process.exit(1);
  });

// Basic Express settings
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(cookieParser());

// Stripe webhook raw body must stay before express.json()
app.use('/payments/webhook', express.raw({ type: 'application/json' }));

// Parse incoming requests
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// CORS configuration: allow requests from any origin.
// Mobile browsers sometimes omit or modify the Origin header; allowing all
// origins ensures the API remains accessible from both desktop and mobile
// clients. Credentials are enabled to allow cookie transmission.
app.use(
  cors({
    origin: (origin, callback) => {
      // Always allow the request regardless of the Origin header
      callback(null, true);
    },
    credentials: true,
  }),
);

// Register application routes
app.use(routes);

// Simple health-check route
app.get('/', (req, res) => {
  res.send('Restful service');
});

// Start listening for requests
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});