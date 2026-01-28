// server/services/paymentsWebhookService.js

import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import { sendEmail } from '../helpers/sendEmail.js';
import { getStripeClient } from '../utils/stripeClient.js';

class WebhookError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

function safeString(val) {
  return typeof val === 'string' ? val : '';
}

/**
 * Stripe Webhook handler (business logic).
 * - Верифицира подписа
 * - Обновява Payment.status
 * - Праща имейл при успех (card)
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
    throw new WebhookError('Липсва Stripe-Signature header.', 400);
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    throw new WebhookError('Невалиден webhook подпис.', 400);
  }

  // ✅ Checkout базиран flow: най-важните събития
  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      const session = event.data.object;

      const orderId = safeString(session?.metadata?.orderId);
      const paymentId = safeString(session?.metadata?.paymentId);
      const sessionId = safeString(session?.id);
      const paymentIntentId = safeString(session?.payment_intent);

      if (!paymentId || !orderId || !sessionId) {
        // не спираме Stripe retry механизма със 500
        // но логиката няма как да продължи
        return { received: true };
      }

      const payment = await Payment.findById(paymentId);
      if (!payment) return { received: true };

      // Idempotency: Stripe може да прати event-а повече от веднъж
      if (payment.status === 'paid') return { received: true };

      // sanity: ако sessionId не съвпада с нашето
      if (payment.stripeSessionId && payment.stripeSessionId !== sessionId) {
        // не правим update, но не искаме да хвърляме 500 към Stripe
        return { received: true };
      }

      payment.status = 'paid';
      payment.stripeSessionId = sessionId;
      if (paymentIntentId) payment.stripePaymentIntentId = paymentIntentId;
      await payment.save();

      // Имейл при успешно платено (card)
      const order = await Order.findById(orderId).lean();
      if (order) {
        const itemsText = (order.items || [])
          .map(
            (i) =>
              `- ${i.title} | количество: ${i.quantity} | цена: ${Number(
                i.unitPrice
              ).toFixed(2)} €`
          )
          .join('\n');

        const subject = `Платена поръчка (карта) от ${order.customer?.name} (Happy Colors)`;

        const text = `
Платена поръчка (Stripe)

Име: ${order.customer?.name}
Имейл: ${order.customer?.email}
Телефон: ${order.customer?.phone}
Град: ${order.customer?.city}
Адрес: ${order.customer?.address}

Начин на плащане: Карта (Stripe)
Stripe Session ID: ${sessionId}
PaymentIntent ID: ${paymentIntentId || '-'}

Поръчани продукти:
${itemsText || '(няма продукти)'}

Обща сума: ${Number(order.totalPrice || 0).toFixed(2)} €
`.trim();

        await sendEmail({ subject, text });
      }

      return { received: true };
    }

    case 'checkout.session.async_payment_failed':
    case 'checkout.session.expired': {
      const session = event.data.object;

      const paymentId = safeString(session?.metadata?.paymentId);
      const sessionId = safeString(session?.id);

      if (!paymentId) return { received: true };

      const payment = await Payment.findById(paymentId);
      if (!payment) return { received: true };

      if (payment.status === 'paid') return { received: true };

      payment.status = event.type === 'checkout.session.expired' ? 'canceled' : 'failed';
      if (sessionId) payment.stripeSessionId = sessionId;
      await payment.save();

      return { received: true };
    }

    default:
      // за момента игнорираме останалите
      return { received: true };
  }
}
