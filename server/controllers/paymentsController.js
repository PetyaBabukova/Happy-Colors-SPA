// server/controllers/paymentsController.js
import express from 'express';
import { createCardPaymentSession } from '../services/paymentsService.js';

const router = express.Router();

// POST /payments/create-session
router.post('/create-session', async (req, res) => {
  try {
    const { url } = await createCardPaymentSession(req.body);

    if (!url) {
      return res
        .status(500)
        .json({ message: 'Липсва URL за плащане от Stripe.' });
    }

    return res.status(200).json({ url });
  } catch (err) {
    console.error('Грешка при създаване на сесия за картово плащане:', err);
    const message =
      err.message ||
      'Възникна грешка при създаване на сесия за картово плащане.';
    return res.status(500).json({ message });
  }
});

export default router;
