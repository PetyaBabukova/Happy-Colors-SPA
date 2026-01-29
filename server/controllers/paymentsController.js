// server/controllers/paymentsController.js
import express from 'express';
import {
  createCardPaymentSession,
  confirmCardPaymentSession,
} from '../services/paymentsService.js';
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

// GET /payments/confirm?session_id=...
router.get('/confirm', async (req, res) => {
  try {
    const sessionId = req.query.session_id;
    const result = await confirmCardPaymentSession(sessionId);
    return res.status(200).json(result);
  } catch (err) {
    console.error('Грешка при confirm на Stripe сесия:', err);
    const statusCode = err.statusCode || 500;
    const message =
      err.message || 'Възникна грешка при потвърждение на плащането.';
    return res.status(statusCode).json({ message });
  }
});

// POST /payments/webhook
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    if (!signature) {
      return res.status(400).json({ message: 'Missing stripe-signature header.' });
    }

    await handleStripeWebhook({
      rawBody: req.body,
      signature,
    });

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Stripe webhook error:', err);
    const statusCode = err.statusCode || 400;
    const message = err.message || 'Webhook error';
    return res.status(statusCode).json({ message });
  }
});

export default router;
