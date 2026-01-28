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
    unitPrice: { type: Number, required: true, min: 0 }, // очакваме EUR price
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

    // Бизнес статут на поръчката (различен от payment status)
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

    // Референция към Payment документа (само ако е card; при cod може да е null)
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },

    items: { type: [orderItemSchema], required: true },

    // totalPrice държим като EUR (в decimal), но плащането ще ползва amount в cents от Payment
    totalPrice: { type: Number, required: true, min: 0 },

    orderNumber: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
