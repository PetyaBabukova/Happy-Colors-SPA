import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Името е задължително.'],
    minlength: [2, 'Минимална дължина: 2 знака.'],
    unique: [true, 'Категорията вече съществува.'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
});

export default mongoose.model('Category', categorySchema);
