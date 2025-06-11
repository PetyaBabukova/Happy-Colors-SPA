import express from 'express';
import {
  createCategory,
  getAllCategories,
  getVisibleCategories,
  deleteCategory, // 🟢 ново
} from '../services/categoryServices.js';

const router = express.Router();

// 🟢 Всички категории (за create/edit форми)
router.get('/', async (req, res) => {
  try {
    const categories = await getAllCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Грешка при зареждане на категориите.' });
  }
});

// 🟢 Само категории с продукти (за хедъра и shop страницата)
router.get('/visible', async (req, res) => {
  try {
    const visibleCategories = await getVisibleCategories();
    res.json(visibleCategories);
  } catch (err) {
    res.status(500).json({ message: 'Грешка при зареждане на видимите категории.' });
  }
});

// 🟢 Създаване на категория
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

router.delete('/:id', async (req, res) => {
  try {
    const result = await deleteCategory(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Неуспешно изтриване на категория.' });
  }
});

export default router;
