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

    amount: { type: Number, required: true, min: 0 }, // cents
    currency: { type: String, required: true, default: 'eur' },

    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'canceled'],
      required: true,
      default: 'pending',
    },

    stripeSessionId: { type: String, default: '' },

    stripePaymentIntentId: { type: String, default: '' },
  },
  { timestamps: true }
);

// ✅ 1 Stripe session → 1 Payment
paymentSchema.index(
  { stripeSessionId: 1 },
  { unique: true, sparse: true }
);

export default mongoose.model('Payment', paymentSchema);
