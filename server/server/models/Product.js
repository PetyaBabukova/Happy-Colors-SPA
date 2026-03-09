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
  /*
   * accessories
   *
   * Полето за аксесоари се добавя като референции към бъдещ модел Accessory.
   * Тъй като функционалността за аксесоари е временно отложена,
   * закоментираме това поле, за да не създава проблеми при валидиране
   * или попълване на модели. При нужда може лесно да бъде върнато.
   */
  // accessories: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: 'Accessory',
  //   },
  // ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "Owner is required!"],
  },
});

export default mongoose.model('Product', productSchema);
