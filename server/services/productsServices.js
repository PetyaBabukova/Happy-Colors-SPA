import Product from '../models/Product.js';
import { deleteImageFromGCS } from '../helpers/gcsImageHelper.js';

// 🟢 GET
export async function getAllProducts(categoryName) {
  const products = await Product.find()
    .populate('category', 'name')
    .lean();

  if (categoryName) {
    return products.filter(p => p.category?.name === categoryName);
  }

  return products;
}

// 🟢 CREATE
export async function createProduct(data) {
  const product = new Product(data);
  return await product.save();
}

// 🟢 GET BY ID
export async function getProductById(productId) {
  return await Product.findById(productId).lean();
}

// 🟢 EDIT
export async function editProduct(productId, productData, userId) {
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error('Продуктът не съществува.');
  }

  if (product.owner.toString() !== userId) {
    throw new Error('Нямате права да редактирате този продукт.');
  }

  Object.assign(product, productData);
  await product.save();
  return product;
}

// 🟢 DELETE
export async function deleteProduct(productId, userId) {
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error('Продуктът не беше намерен');
  }

  if (product.owner.toString() !== userId) {
    throw new Error('Нямате права да изтриете този продукт.');
  }

  // 1) изтриваме изображението (НЕ хвърля грешки нагоре)
  if (product.imageUrl) {
    await deleteImageFromGCS(product.imageUrl);
  }

  // 2) изтриваме продукта
  await Product.findByIdAndDelete(productId);

  return { message: 'Продуктът беше изтрит успешно.' };
}
