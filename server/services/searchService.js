import Product from '../models/Product.js';
import Category from '../models/Category.js';

export async function searchProducts(query) {
  if (!query || query.trim() === '') return [];

  const normalizedQuery = query.trim().toLowerCase();

  // Намираме всички категории, чиито имена съдържат търсения текст
  const matchingCategories = await Category.find({
    name: { $regex: normalizedQuery, $options: 'i' },
  }).select('_id');

  const categoryIds = matchingCategories.map((cat) => cat._id);

  // Търсим продукти, при които:
  // – заглавието съдържа текста
  // – или категорията съвпада с една от намерените
  const products = await Product.find({
    $or: [
      { title: { $regex: normalizedQuery, $options: 'i' } },
      { category: { $in: categoryIds } },
    ],
  })
    .populate('category', 'name')
    .lean();

  return products;
}
