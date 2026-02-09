// server/models/CheckoutDraft.js
import mongoose from 'mongoose';

const CheckoutDraftSchema = new mongoose.Schema(
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
      shippingMethod: { type: String, required: true }, // econt|speedy|boxnow
      econtOffice: { type: String, default: '' },
      speedyOffice: { type: String, default: '' },
      boxNow: { type: Boolean, default: false },
    },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, required: true },
        title: { type: String, required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true }, // EUR
      },
    ],
    totalPrice: { type: Number, required: true }, // EUR
    currency: { type: String, default: 'eur' },
    status: { type: String, default: 'open' }, // open|used|expired
  },
  { timestamps: true }
);

export default mongoose.model('CheckoutDraft', CheckoutDraftSchema);
