// server/services/paymentsWebhookService.js
import { getStripeClient } from '../utils/stripeClient.js';
import { finalizePaidCheckoutSession } from './paymentsService.js';

class WebhookError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Stripe Webhook handler:
 * - Верифицира подписа
 * - При paid събитие: вика finalizePaidCheckoutSession(session)
 * - Идемпотентно: Stripe може да retry-ва
 */
export async function handleStripeWebhook({ rawBody, signature }) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe) {
    throw new WebhookError('Stripe не е конфигуриран на сървъра.', 500);
  }

  if (!webhookSecret) {
    throw new WebhookError(
      'STRIPE_WEBHOOK_SECRET липсва. Webhook-ът не може да се верифицира.',
      500
    );
  }

  if (!signature) {
    throw new WebhookError('Липсва stripe-signature header.', 400);
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    throw new WebhookError('Невалиден webhook подпис.', 400);
  }

  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      const session = event.data.object;

      // Важно: при webhook session вече е “истина”.
      // Ако finalize хвърли грешка (напр. сума mismatch) -> 400/500 ще накара Stripe да retry-ва.
      // Това е добре за reliability.
      await finalizePaidCheckoutSession(session);

      return { received: true };
    }

    case 'checkout.session.async_payment_failed':
    case 'checkout.session.expired':
      // По желание: можеш да маркираш draft/payment като failed/expired,
      // но не е критично за “без загуба на поръчки”.
      return { received: true };

    default:
      return { received: true };
  }
}
