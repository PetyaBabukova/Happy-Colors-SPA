import Product from '../models/Product.js';

// 🟢 GET /products – получаване на всички продукти
export async function getAllProducts() {
  return await Product.find().lean();
}

export async function createProduct(data) {
  const product = new Product(data);
  return await product.save();
}

export async function getProductById(productId) {
  return await Product.findById(productId).lean();
}

export async function deleteProduct(productId, userId) {
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error('Продуктът не съществува.');
  }

  if (product.owner.toString() !== userId) {
    throw new Error('Нямате права да изтриете този продукт.');
  }

  await Product.findByIdAndDelete(productId);
}

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
