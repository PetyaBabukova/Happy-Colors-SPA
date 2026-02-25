import express from 'express';
import { searchProducts } from '../services/searchService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const query = req.query.q;
    const results = await searchProducts(query);
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: 'Грешка при търсене' });
  }
});

export default router;
