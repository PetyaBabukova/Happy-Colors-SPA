import express from 'express';
import jwt from 'jsonwebtoken';
import {
  createProduct,
  getAllProducts,
  getProductById,
} from '../services/productsServices.js';

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'secret';

// 🟢 GET /products – всички продукти
router.get('/', async (req, res) => {
  try {
    const products = await getAllProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Грешка при зареждане на продуктите' });
  }
});

// 🟢 GET /products/:productId – детайлен изглед
router.get('/:productId', async (req, res) => {
  try {
    const product = await getProductById(req.params.productId);

    if (!product) {
      return res.status(404).json({ message: 'Продуктът не беше намерен' });
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({ message: 'Невалиден ID или грешка при заявката' });
  }
});

// 🟢 POST /products – създаване на нов продукт
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
