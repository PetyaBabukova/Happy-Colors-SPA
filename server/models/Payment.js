// server/models/Payment.js

import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    draftId: { type: mongoose.Schema.Types.ObjectId, ref: 'CheckoutDraft' },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },

    provider: {
      type: String,
      enum: ['stripe'],
      default: 'stripe',
      required: true,
    },

    // Важно: amount е в "най-малката единица" (центове), за да няма floating грешки
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: 'eur' },

    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'canceled'],
      required: true,
      default: 'pending',
    },

    // Stripe identifiers (за Stripe Checkout)
    stripeSessionId: { type: String, default: '' },

    // Ако някога минем към PaymentIntent flow:
    stripePaymentIntentId: { type: String, default: '' },
  },
  { timestamps: true },

);

export default mongoose.model('Payment', paymentSchema);
