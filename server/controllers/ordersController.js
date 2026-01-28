// server/controllers/ordersController.js

import express from 'express';
import { handleOrder } from '../services/ordersServices.js';

const router = express.Router();

// POST /orders
router.post('/', async (req, res) => {
  try {
    const result = await handleOrder(req.body);

    // result съдържа:
    // { message, orderId, paymentId }
    return res.status(201).json(result);
  } catch (err) {
    console.error('Грешка при създаване на поръчка:', err);

    const statusCode = err.statusCode || 500;
    const message =
      err.message || 'Грешка при обработка на поръчката.';

    return res.status(statusCode).json({ message });
  }
});

export default router;
