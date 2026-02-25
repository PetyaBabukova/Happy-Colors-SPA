export function isOwner(product, userId) {
  if (!product || !userId) return false;
  return product.owner?.toString() === userId.toString();
}
