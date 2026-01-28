// server/services/paymentsService.js

import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import { getStripeClient } from '../utils/stripeClient.js';

const clientUrl = process.env.CLIENT_URL;

class PaymentError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Създава Stripe Checkout Session за поръчка (card).
 * Важно: НЕ приемаме cartItems/totalPrice от клиента.
 * Всичко се чете от DB (Order + Payment).
 */
export async function createCardPaymentSession(data = {}) {
  const stripe = getStripeClient();

  if (!stripe) {
    throw new PaymentError('Stripe не е конфигуриран на сървъра.', 500);
  }

  if (!clientUrl) {
    throw new PaymentError('CLIENT_URL не е конфигуриран на сървъра.', 500);
  }

  const { orderId } = data;

  if (!orderId) {
    throw new PaymentError('Липсва orderId.', 400);
  }

  // 1) Взимаме поръчката от DB
  const order = await Order.findById(orderId).lean();

  if (!order) {
    throw new PaymentError('Поръчката не беше намерена.', 404);
  }

  if (order.paymentMethod !== 'card') {
    throw new PaymentError('Тази поръчка не е за картово плащане.', 400);
  }

  if (!order.paymentId) {
    throw new PaymentError('Липсва paymentId за тази поръчка.', 400);
  }

  if (!Array.isArray(order.items) || order.items.length === 0) {
    throw new PaymentError('Поръчката няма артикули.', 400);
  }

  // 2) Взимаме Payment документа
  const payment = await Payment.findById(order.paymentId);

  if (!payment) {
    throw new PaymentError('Payment записът не беше намерен.', 404);
  }

  if (payment.status !== 'pending') {
    throw new PaymentError('Плащането не е в състояние "pending".', 400);
  }

  // 3) Създаваме line items от Order (EUR)
  const lineItems = order.items.map((item) => ({
    price_data: {
      currency: 'eur',
      product_data: {
        name: item.title,
      },
      unit_amount: Math.round(Number(item.unitPrice) * 100),
    },
    quantity: Number(item.quantity),
  }));

  // 4) Safety check: сумата от items да е == payment.amount
  const calculatedAmount = order.items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return sum + Math.round(price * 100) * qty;
  }, 0);

  if (calculatedAmount !== payment.amount) {
    throw new PaymentError(
      'Несъответствие в сумата за плащане. Моля, опитайте отново.',
      400
    );
  }

  // 5) Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,

    customer_email: order.customer?.email,

    metadata: {
      orderId: String(order._id),
      paymentId: String(payment._id),
    },

    success_url: `${clientUrl}/checkout/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${clientUrl}/checkout/payment-cancel`,
  });

  // 6) Записваме sessionId в Payment
  payment.stripeSessionId = session.id;
  await payment.save();

  return { url: session.url };
}
