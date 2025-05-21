import Product from '../models/Product.js';

export async function createProduct(data) {
  const product = new Product(data);
  return await product.save(); // ако има валидационна грешка, ще хвърли
}
