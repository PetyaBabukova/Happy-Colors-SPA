// server/models/Order.js

import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
    title: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 }, // EUR
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

    status: {
      type: String,
      enum: ['new', 'processing', 'shipped', 'delivered', 'canceled'],
      required: true,
      default: 'new',
    },

    paymentMethod: {
      type: String,
      enum: ['card', 'cod'],
      required: true,
    },

    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },

    items: { type: [orderItemSchema], required: true },

    totalPrice: { type: Number, required: true, min: 0 },

    orderNumber: { type: String, default: '' },
  },
  { timestamps: true }
);

// ✅ КЛЮЧОВО: 1 payment → 1 order (COD няма paymentId → затова sparse)
orderSchema.index(
  { paymentId: 1 },
  { unique: true, sparse: true }
);

export default mongoose.model('Order', orderSchema);
