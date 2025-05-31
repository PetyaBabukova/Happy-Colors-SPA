import Product from '../models/Product.js';
import Category from '../models/Category.js';

export async function searchProductsByQuery(query) {
  const searchRegex = new RegExp(query, 'i');

  // Намираме съвпадения по заглавие на продукт или име на категория
  const matchingCategories = await Category.find({ name: searchRegex }).lean();
  const categoryIds = matchingCategories.map(cat => cat._id);

  return Product.find({
    $or: [
      { title: searchRegex },
      { category: { $in: categoryIds } },
    ],
  }).populate('category').lean();
}
