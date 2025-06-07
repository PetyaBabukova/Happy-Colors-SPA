import express from 'express';
import { createCategory, getAllCategoriesWithProducts } from '../services/categoryServices.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const categories = await getAllCategoriesWithProducts();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Грешка при зареждане на категориите.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const created = await createCategory(req.body);
    res.status(201).json(created);
  } catch (err) {
    let message = err.message;

    if (err.name === 'ValidationError') {
      const first = Object.values(err.errors)[0];
      message = first?.message || 'Невалиден вход';
    }

    res.status(400).json({ message });
  }
});

export default router;
