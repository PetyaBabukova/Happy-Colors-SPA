// server/controllers/deliveryController.js

import express from 'express';
import {
  getEcontOfficesByCityName,
  getSpeedyOfficesByCityName,
} from '../services/deliveryService.js';

const router = express.Router();

// GET /delivery/econt/offices?city=София
router.get('/econt/offices', async (req, res) => {
  try {
    const city = String(req.query.city || '').trim();

    if (!city) {
      return res.status(200).json({ offices: [] });
    }

    const offices = await getEcontOfficesByCityName(city);
    return res.status(200).json({ offices });
  } catch (err) {
    console.error('Econt offices error:', err);

    const statusCode = err.statusCode || 500;
    const message =
      err.message || 'Грешка при зареждане на офисите на Еконт.';

    return res.status(statusCode).json({ message, offices: [] });
  }
});

// GET /delivery/speedy/offices?city=София
router.get('/speedy/offices', async (req, res) => {
  try {
    const city = String(req.query.city || '').trim();

    if (!city) {
      return res.status(200).json({ offices: [] });
    }

    const offices = await getSpeedyOfficesByCityName(city);
    return res.status(200).json({ offices });
  } catch (err) {
    console.error('Speedy offices error:', err);

    const statusCode = err.statusCode || 500;
    const message =
      err.message || 'Грешка при зареждане на офисите на Спиди.';

    return res.status(statusCode).json({ message, offices: [] });
  }
});

export default router;