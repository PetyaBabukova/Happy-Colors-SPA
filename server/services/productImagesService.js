import Product from '../models/Product.js';
import { deleteImageFromGCS } from '../helpers/gcsImageHelper.js';

export async function deleteProductImage(productId, imageUrl, userId) {
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error('Продуктът не беше намерен.');
  }

  if (product.owner.toString() !== userId) {
    throw new Error('Нямате права да редактирате този продукт.');
  }

  const currentImageUrls = Array.isArray(product.imageUrls) && product.imageUrls.length > 0
    ? product.imageUrls.filter(Boolean)
    : product.imageUrl
      ? [product.imageUrl]
      : [];

  if (!currentImageUrls.includes(imageUrl)) {
    throw new Error('Изображението не принадлежи на този продукт.');
  }

  const updatedImages = currentImageUrls.filter((img) => img !== imageUrl);

  if (updatedImages.length === 0) {
    throw new Error('Продуктът трябва да има поне едно изображение.');
  }

  product.imageUrls = updatedImages;
  product.imageUrl = updatedImages[0] || '';

  await product.save();
  await deleteImageFromGCS(imageUrl);

  return {
    message: 'Изображението беше изтрито.',
    imageUrls: updatedImages,
    imageUrl: updatedImages[0] || '',
  };
}