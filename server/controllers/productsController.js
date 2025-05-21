import express from 'express';
import jwt from 'jsonwebtoken';
import { createProduct } from '../services/productsServices.js'; // Импорт на createProduct функцията

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'secret';

// 🟢 POST /products – създаване на продукт
router.post('/', async (req, res) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: 'Missing authentication token' });
  }

  try {
    const decoded = jwt.verify(token, SECRET);

    const productData = {
      ...req.body,
      owner: decoded._id,
    };

    const product = await createProduct(productData);

    res.status(201).json(product);
  } catch (err) {
    let message = err.message;

    if (err.name === 'ValidationError') {
      const firstError = Object.values(err.errors)[0];
      message = firstError?.message || 'Invalid input';
    }

    res.status(400).json({ message });
  }
});

export default router;
