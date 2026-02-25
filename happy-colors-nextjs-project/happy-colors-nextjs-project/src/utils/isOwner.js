export function isOwner(product, user) {
  if (!product || !user) return false;
  return product.owner === user._id;
}
