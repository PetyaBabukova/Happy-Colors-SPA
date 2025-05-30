import Category from '../models/Category.js';
import { slugify } from '../utils/slugify.js';

export async function createCategory(data) {
  const slug = slugify(data.name);
  const category = new Category({ ...data, slug });
  return await category.save();
}


export async function getAllCategories() {
  return await Category.find().lean();
}
