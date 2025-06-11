import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { slugify } from '../utils/slugify.js';

// 👉 Създаване на категория със slug
export async function createCategory(data) {
  const slug = slugify(data.name);
  const category = new Category({ ...data, slug });
  return await category.save();
}

// 👉 Връща всички категории (за create/edit форми)
export async function getAllCategories() {
  return await Category.find().lean();
}

// 👉 Връща само категориите, които имат поне 1 продукт (за хедър/shop)
export async function getVisibleCategories() {
  const categories = await Category.find().lean();

  const visibleCategories = [];

  for (const category of categories) {
    const productCount = await Product.countDocuments({ category: category._id });
    if (productCount > 0) {
      visibleCategories.push(category);
    }
  }

  return visibleCategories;
}
