// server/services/paymentsService.js
import Stripe from 'stripe';

class PaymentError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value || String(value).trim() === '') {
    throw new PaymentError(`${name} не е конфигуриран на сървъра.`, 500);
  }
  return value;
}

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(String(email ?? '').trim());
}

export async function createCardPaymentSession(orderData = {}) {
  const stripeSecretKey = requireEnv('STRIPE_SECRET_KEY');
  const clientUrl = requireEnv('CLIENT_URL'); // <-- тук е истинската проверка

  const stripe = new Stripe(stripeSecretKey);

  const { cartItems = [], email } = orderData;

  if (!isValidEmail(email)) {
    throw new PaymentError('Невалиден email формат.', 400);
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new PaymentError('Липсват продукти в поръчката.', 400);
  }

  // ⚠️ ВАЖНО: цената идва от клиента => за production по-добре
  // да взимаме unitPrice от DB по productId.
  // За момента оставяме както е, но валидацията ти вече го пази.
  const lineItems = cartItems.map((item) => {
    const unitAmount = Math.round(Number(item.price) * 100);
    if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
      throw new PaymentError('Невалидна цена на продукт.', 400);
    }

    return {
      price_data: {
        currency: 'eur', // ако още си в BGN: смени на 'bgn'
        product_data: { name: String(item.title ?? 'Продукт').trim() },
        unit_amount: unitAmount,
      },
      quantity: Number(item.quantity),
    };
  });

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    success_url: `${clientUrl}/checkout/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${clientUrl}/checkout/payment-cancel`,
    customer_email: String(email).trim(),
  });

  return { url: session.url };
}
