// server/models/Product.js

import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required!"],
  },
  description: {
    type: String,
    required: [true, "Description is required!"],
  },
  price: {
    type: Number,
    required: [true, "Price is required!"],
  },
  imageUrl: {
    type: String,
    required: [true, "Image URL is required!"],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, "Category is required!"],
  },

  // ✅ НОВО: Наличност (две стойности)
  availability: {
    type: String,
    enum: ['available', 'unavailable'],
    default: 'available',
    required: true,
  },

  feedback: [
    {
      name: String,
      comment: String,
      rating: Number,
    }
  ],
  accessories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Accessory'
    }
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "Owner is required!"],
  },
});

export default mongoose.model('Product', productSchema);
