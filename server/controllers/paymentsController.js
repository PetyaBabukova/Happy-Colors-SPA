// server/controllers/paymentsController.js

import express from 'express';
import { createCardPaymentSession } from '../services/paymentsService.js';
import { validateCreatePaymentSession } from '../middlewares/paymentValidations.js';
import { handleStripeWebhook } from '../services/paymentsWebhookService.js';

const router = express.Router();

// POST /payments/create-session
router.post('/create-session', validateCreatePaymentSession, async (req, res) => {
  try {
    const { url } = await createCardPaymentSession(req.body);
    return res.status(200).json({ url });
  } catch (err) {
    console.error('Грешка при създаване на Stripe сесия:', err);

    const statusCode = err.statusCode || 500;
    const message =
      err.message || 'Възникна грешка при създаване на сесия за плащане.';

    return res.status(statusCode).json({ message });
  }
});

// POST /payments/webhook
// ⚠ raw body идва от server.js: app.use('/payments/webhook', express.raw(...))
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];

    await handleStripeWebhook({
      rawBody: req.body, // тук е Buffer (raw)
      signature,
    });

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Stripe webhook error:', err);

    const statusCode = err.statusCode || 400;
    const message = err.message || 'Webhook error';

    // Stripe очаква 2xx ако е ОК; при signature/format грешки връщаме 400
    return res.status(statusCode).json({ message });
  }
});

export default router;
