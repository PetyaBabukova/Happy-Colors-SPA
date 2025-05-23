import Product from '../models/Product.js';

// 🟢 GET /products – получаване на всички продукти
export async function getAllProducts() {
  return await Product.find().lean(); 
}



export async function createProduct(data) {
  const product = new Product(data);
  return await product.save(); 
}
