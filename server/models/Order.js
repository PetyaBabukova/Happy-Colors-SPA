// server/models/Order.js

import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
    title: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      city: { type: String, required: true },
      address: { type: String, required: true },
      note: { type: String, default: '' },
    },

    shipping: {
      shippingMethod: { type: String, default: '' }, // econt/speedy/boxnow
      econtOffice: { type: String, default: '' },
      speedyOffice: { type: String, default: '' },
      boxNow: { type: Boolean, default: false },
    },

    payment: {
      method: { type: String, enum: ['card', 'cod'], required: true },
      status: {
        type: String,
        enum: ['cod_pending', 'pending_payment', 'paid', 'failed', 'canceled'],
        required: true,
      },
      stripePaymentIntentId: { type: String, default: '' },
    },

    items: { type: [orderItemSchema], required: true },
    totalPrice: { type: Number, required: true, min: 0 },

    // по желание: за вътрешен номер
    orderNumber: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
