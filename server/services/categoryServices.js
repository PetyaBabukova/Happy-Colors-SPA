import Category from '../models/Category.js';
import { slugify } from '../utils/slugify.js';
import Product from '../models/Product.js';


export async function createCategory(data) {
  const slug = slugify(data.name);
  const category = new Category({ ...data, slug });
  return await category.save();
}


export async function getAllCategories() {
  return await Category.find().lean();
}

export async function getAllCategoriesWithProducts() {
  // Групира продуктите по category, после намира всички съвпадащи категории
  const usedCategoryIds = await Product.distinct('category');

  return await Category.find({ _id: { $in: usedCategoryIds } }).lean();
}
