import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes.js';

// Зареждаме .env променливи
dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/happycolors')
    .then(() => console.log('DB Connected!'))
    .catch(err => console.log(err));

app.use(express.urlencoded({ extended: false }));
app.use(express.json()); //This is for 'Content-type: application/json!!!
app.use(cors());
app.use(routes);


app.get('/', (req, res) => {
    res.send('Restful service');
});

app.listen(3030, () => console.log("Restfull server is listening on port 3030..."));

