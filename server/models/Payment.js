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

    // ✅ без default '' (да може полето да липсва)
    stripeSessionId: { type: String, required: false },
    stripePaymentIntentId: { type: String, required: false },
  },
  { timestamps: true }
);

// ✅ 1 Stripe session → 1 Payment (само ако е реален непразен string)
paymentSchema.index(
  { stripeSessionId: 1 },
  {
    unique: true,
    partialFilterExpression: { stripeSessionId: { $type: 'string', $ne: '' } },
  }
);

export default mongoose.model('Payment', paymentSchema);
