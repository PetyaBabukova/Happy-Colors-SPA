import Product from '../models/Product.js';

// 🟢 GET /products – получаване на всички продукти
export async function getAllProducts(categoryName) {
  const products = await Product.find()
    .populate('category', 'name')
    .lean();

  // Ако има зададено categoryName – филтрирай по него
  if (categoryName) {
    return products.filter(p => p.category?.name === categoryName);
  }

  return products;
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


export async function searchProducts(query) {
  const regex = new RegExp(query, 'i'); // case-insensitive

  return await Product.find({
    $or: [
      { name: regex },
      { 'category.name': regex },
    ]
  }).lean();
}