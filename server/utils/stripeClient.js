// server/utils/stripeClient.js
import Stripe from 'stripe';

let stripe = null;

export function getStripeClient() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    return null;
  }

  if (!stripe) {
    stripe = new Stripe(stripeSecretKey);
  }

  return stripe;
}
