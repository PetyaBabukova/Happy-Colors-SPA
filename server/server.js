import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import routes from './routes.js';

dotenv.config();

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
