import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Зареждаме .env променливи
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Примерен тестов маршрут
app.get('/api/test', (req, res) => {
  res.json({ message: 'Сървърът работи 🎉' });
});

// Стартиране на сървъра СЛЕД връзка с MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('🟢 Свързано с MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Сървърът работи на http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('🔴 Грешка при връзка с MongoDB:', err);
  });
