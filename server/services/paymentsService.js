// server/services/paymentsService.js
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

let stripe = null;

if (!stripeSecretKey) {
  console.warn(
    '⚠ STRIPE_SECRET_KEY не е зададен. Картовите плащания са изключени.'
  );
} else {
  stripe = new Stripe(stripeSecretKey);
}

export async function createCardPaymentSession(orderData = {}) {
  if (!stripe) {
    throw new Error('Stripe не е конфигуриран на сървъра.');
  }

  const {
    cartItems = [],
    totalPrice = 0,
    email,
  } = orderData;

  if (!cartItems.length) {
    throw new Error('Липсват продукти в поръчката.');
  }

  const lineItems = cartItems.map((item) => ({
    price_data: {
      currency: 'bgn',
      product_data: {
        name: item.title,
      },
      unit_amount: Math.round(item.price * 100), // в стотинки
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    success_url: `${process.env.CLIENT_URL}/checkout/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/checkout/payment-cancel`,
    customer_email: email,
  });

  return { url: session.url };
}
