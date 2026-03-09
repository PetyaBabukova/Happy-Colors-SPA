// server/services/productsServices.js

import Product from '../models/Product.js';
import { deleteImageFromGCS } from '../helpers/gcsImageHelper.js';

// Санитира входните текстови полета чрез премахване на HTML тагове.
function sanitizeString(input) {
  return String(input ?? '')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .trim();
}

// 🟢 GET
export async function getAllProducts(categoryName) {
  const products = await Product.find()
    .populate('category', 'name')
    .lean();

  if (categoryName) {
    return products.filter((p) => p.category?.name === categoryName);
  }

  return products;
}

// 🟢 CREATE
export async function createProduct(data) {
  // Валидираме и санитираме входните данни преди създаване на продукта.
  const sanitized = {
    ...data,
    title: sanitizeString(data.title),
    description: sanitizeString(data.description),
    imageUrl: sanitizeString(data.imageUrl),
    availability: data.availability || 'available',
  };

  // Конвертиране и проверка на цената
  const price = Number(data.price);
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error('Невалидна цена.');
  }
  sanitized.price = price;

  const product = new Product(sanitized);
  return await product.save();
}

// 🟢 GET BY ID
export async function getProductById(productId) {
  return await Product.findById(productId).lean();
}

// 🟢 EDIT – тук добавяме логика за триене на старото изображение
export async function editProduct(productId, productData, userId) {
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error('Продуктът не съществува.');
  }

  if (product.owner.toString() !== userId) {
    throw new Error('Нямате права да редактирате този продукт.');
  }

  const oldImageUrl = product.imageUrl;
  const newImageUrl = productData.imageUrl;

  // Ако в заявката има imageUrl и то е различно от текущото – трием старото изображение
  if (newImageUrl && oldImageUrl && oldImageUrl !== newImageUrl) {
    await deleteImageFromGCS(oldImageUrl);
  }

  // Санитираме входните полета преди присвояване
  const updates = { ...productData };
  if (updates.title !== undefined) {
    updates.title = sanitizeString(updates.title);
  }
  if (updates.description !== undefined) {
    updates.description = sanitizeString(updates.description);
  }
  if (updates.imageUrl !== undefined) {
    updates.imageUrl = sanitizeString(updates.imageUrl);
  }
  if (updates.price !== undefined) {
    const newPrice = Number(updates.price);
    if (!Number.isFinite(newPrice) || newPrice <= 0) {
      throw new Error('Невалидна цена.');
    }
    updates.price = newPrice;
  }

  Object.assign(product, updates);
  await product.save();

  return product;
}

// 🟢 DELETE – вече работи с триене и в GCS
export async function deleteProduct(productId, userId) {
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error('Продуктът не беше намерен');
  }

  if (product.owner.toString() !== userId) {
    throw new Error('Нямате права да изтриете този продукт.');
  }

  // 1) трием изображението, ако има такова
  if (product.imageUrl) {
    await deleteImageFromGCS(product.imageUrl);
  }

  // 2) трием продукта от базата
  await Product.findByIdAndDelete(productId);

  return { message: 'Продуктът беше изтрит успешно.' };
}
