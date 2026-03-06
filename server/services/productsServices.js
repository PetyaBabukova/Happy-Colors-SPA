// server/services/productsServices.js

import Product from '../models/Product.js';
import { deleteImageFromGCS } from '../helpers/gcsImageHelper.js';

// Helper: нормализира снимките така, че:
// - стар продукт с imageUrl да продължи да работи
// - нов продукт с imageUrls да работи коректно
function normalizeProductImages(product) {
  const normalizedImageUrls = Array.isArray(product.imageUrls)
    ? product.imageUrls.filter(Boolean)
    : [];

  if (normalizedImageUrls.length === 0 && product.imageUrl) {
    normalizedImageUrls.push(product.imageUrl);
  }

  return {
    ...product,
    imageUrls: normalizedImageUrls,
    imageUrl: normalizedImageUrls[0] || product.imageUrl || '',
  };
}

// 🟢 GET
export async function getAllProducts(categoryName) {
  const products = await Product.find()
    .populate('category', 'name')
    .lean();

  const normalizedProducts = products.map(normalizeProductImages);

  if (categoryName) {
    return normalizedProducts.filter((p) => p.category?.name === categoryName);
  }

  return normalizedProducts;
}

// 🟢 CREATE
export async function createProduct(data) {
  const normalizedImageUrls = Array.isArray(data.imageUrls)
    ? data.imageUrls.filter(Boolean)
    : [];

  const fallbackImageUrl = data.imageUrl || normalizedImageUrls[0] || '';

  const productData = {
    ...data,
    imageUrl: fallbackImageUrl,
    imageUrls:
      normalizedImageUrls.length > 0
        ? normalizedImageUrls
        : fallbackImageUrl
          ? [fallbackImageUrl]
          : [],
  };

  const product = new Product(productData);
  const savedProduct = await product.save();

  return normalizeProductImages(savedProduct.toObject());
}

// 🟢 GET BY ID
export async function getProductById(productId) {
  const product = await Product.findById(productId).lean();

  if (!product) {
    return null;
  }

  return normalizeProductImages(product);
}

// 🟢 EDIT – добавяме новите изображения към съществуващите
export async function editProduct(productId, productData, userId) {
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error('Продуктът не съществува.');
  }

  if (product.owner.toString() !== userId) {
    throw new Error('Нямате права да редактирате този продукт.');
  }

  const currentImageUrls = Array.isArray(product.imageUrls)
    ? product.imageUrls.filter(Boolean)
    : product.imageUrl
      ? [product.imageUrl]
      : [];

  const incomingImageUrls = Array.isArray(productData.imageUrls)
    ? productData.imageUrls.filter(Boolean)
    : productData.imageUrl
      ? [productData.imageUrl]
      : [];

  // ✅ Вариант B: новите снимки се добавят към старите
  const mergedImageUrls = [...new Set([...currentImageUrls, ...incomingImageUrls])];

  const normalizedProductData = {
    ...productData,
    imageUrls: mergedImageUrls,
    imageUrl: mergedImageUrls[0] || '',
  };

  Object.assign(product, normalizedProductData);
  await product.save();

  return normalizeProductImages(product.toObject());
}

// 🟢 DELETE – трием всички изображения от GCS
export async function deleteProduct(productId, userId) {
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error('Продуктът не беше намерен');
  }

  if (product.owner.toString() !== userId) {
    throw new Error('Нямате права да изтриете този продукт.');
  }

  const imageUrlsToDelete = Array.isArray(product.imageUrls) && product.imageUrls.length > 0
    ? product.imageUrls.filter(Boolean)
    : product.imageUrl
      ? [product.imageUrl]
      : [];

  for (const imageUrl of imageUrlsToDelete) {
    await deleteImageFromGCS(imageUrl);
  }

  await Product.findByIdAndDelete(productId);

  return { message: 'Продуктът беше изтрит успешно.' };
}
