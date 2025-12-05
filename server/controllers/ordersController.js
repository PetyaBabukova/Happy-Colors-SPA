// server/controllers/ordersController.js

import express from 'express';
import { handleOrder } from '../services/ordersServices.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const result = await handleOrder(req.body);
    return res.status(200).json({ message: result.message });
  } catch (err) {
    console.error('Грешка при изпращане на поръчка:', err);

    const statusCode = err.statusCode || 500;
    const message =
      err.message || 'Грешка при обработка на поръчката.';

    return res.status(statusCode).json({ message });
  }
});

export default router;
