import express from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
  deleteProduct,
  editProduct,
} from '../services/productsServices.js';
import { deleteProductImage } from '../services/productImagesService.js';
import { requireAuth } from '../middlewares/auth.js';

const router = express.Router();

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

router.post('/', requireAuth, async (req, res) => {
  try {
    const productData = {
      ...req.body,
      owner: req.user._id,
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

    res.status(statusCode).json({ message });
  }
});

router.delete('/:productId', requireAuth, async (req, res) => {
  try {
    await deleteProduct(req.params.productId, req.user._id);
    res.status(204).end();
  } catch (err) {
    const statusCode = err.statusCode || 403;
    res.status(statusCode).json({ message: err.message });
  }
});

router.put('/:productId', requireAuth, async (req, res) => {
  try {
    const updatedProduct = await editProduct(
      req.params.productId,
      req.body,
      req.user._id
    );

    res.status(200).json(updatedProduct);
  } catch (err) {
    const statusCode = err.statusCode || 403;
    res.status(statusCode).json({ message: err.message });
  }
});

router.delete('/:productId/image', requireAuth, async (req, res) => {
  try {
    const { imageUrl } = req.body;

    const result = await deleteProductImage(
      req.params.productId,
      imageUrl,
      req.user._id
    );

    res.status(200).json(result);
  } catch (err) {
    const statusCode = err.statusCode || 403;
    res.status(statusCode).json({ message: err.message });
  }
});

export default router;