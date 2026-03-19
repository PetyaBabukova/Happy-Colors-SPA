// server/controllers/productsController.js

import express from 'express';
import jwt from 'jsonwebtoken';
import {
  createProduct,
  getAllProducts,
  getProductById,
  deleteProduct,
  editProduct,
} from '../services/productsServices.js';
import { deleteProductImage } from '../services/productImagesService.js';

const router = express.Router();
const COOKIE_NAME = 'token';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || String(secret).trim() === '') {
    throw new Error('JWT_SECRET липсва в environment variables.');
  }

  return secret;
}

function getAuthenticatedUserId(req) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    const error = new Error('Missing authentication token');
    error.statusCode = 401;
    throw error;
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    return decoded._id;
  } catch (err) {
    const error = new Error('Invalid token');
    error.statusCode = 401;
    throw error;
  }
}

router.get('/', async (req, res) => {
  try {
    const category = req.query.category;
    const products = await getAllProducts(category);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Грешка при зареждане на продуктите' });
  }
});

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

router.post('/', async (req, res) => {
  try {
    const ownerId = getAuthenticatedUserId(req);
    const productData = {
      ...req.body,
      owner: ownerId,
    };

    const product = await createProduct(productData);
    res.status(201).json(product);
  } catch (err) {
    let message = err.message;
    let statusCode = err.statusCode || 400;

    if (err.name === 'ValidationError') {
      const firstError = Object.values(err.errors)[0];
      message = firstError?.message || 'Invalid input';
    }

    if (err.message === 'JWT_SECRET липсва в environment variables.') {
      statusCode = 500;
      message = 'Проблем в конфигурацията на сървъра.';
    }

    res.status(statusCode).json({ message });
  }
});

router.delete('/:productId', async (req, res) => {
  try {
    const ownerId = getAuthenticatedUserId(req);
    await deleteProduct(req.params.productId, ownerId);
    res.status(204).end();
  } catch (err) {
    const statusCode = err.statusCode || 403;
    const message =
      err.message === 'JWT_SECRET липсва в environment variables.'
        ? 'Проблем в конфигурацията на сървъра.'
        : err.message;

    res.status(statusCode).json({ message });
  }
});

router.put('/:productId', async (req, res) => {
  try {
    const ownerId = getAuthenticatedUserId(req);
    const updatedProduct = await editProduct(
      req.params.productId,
      req.body,
      ownerId
    );

    res.status(200).json(updatedProduct);
  } catch (err) {
    const statusCode = err.statusCode || 403;
    const message =
      err.message === 'JWT_SECRET липсва в environment variables.'
        ? 'Проблем в конфигурацията на сървъра.'
        : err.message;

    res.status(statusCode).json({ message });
  }
});

router.delete('/:productId/image', async (req, res) => {
  try {
    const ownerId = getAuthenticatedUserId(req);
    const { imageUrl } = req.body;

    const result = await deleteProductImage(
      req.params.productId,
      imageUrl,
      ownerId
    );

    res.status(200).json(result);
  } catch (err) {
    const statusCode = err.statusCode || 403;
    const message =
      err.message === 'JWT_SECRET липсва в environment variables.'
        ? 'Проблем в конфигурацията на сървъра.'
        : err.message;

    res.status(statusCode).json({ message });
  }
});

export default router;