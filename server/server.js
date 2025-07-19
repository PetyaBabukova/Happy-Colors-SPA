import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import routes from './routes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

console.log('📦 EMAIL =', process.env.CONTACT_EMAIL);
console.log('📦 PASS  =', process.env.CONTACT_EMAIL_PASS);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// dotenv.config();
dotenv.config({ path: path.join(__dirname, '.env') });


const app = express();
const PORT = process.env.PORT || 3030;

mongoose.connect('mongodb://127.0.0.1:27017/happycolors')
  .then(() => console.log('DB Connected!'))
  .catch(err => console.log(err));

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(routes);

app.get('/', (req, res) => {
  res.send('Restful service');
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}...`));
