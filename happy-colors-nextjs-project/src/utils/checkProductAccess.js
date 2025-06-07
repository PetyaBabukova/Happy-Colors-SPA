import baseURL from '@/config';
import { isOwner } from './isOwner';

export async function checkProductAccess(productId, user) {
  try {
    const res = await fetch(`${baseURL}/products/${productId}`, {
      cache: 'no-store',
      credentials: 'include',
    });

    if (!res.ok) {
      return { product: null, unauthorized: true };
    }

    const product = await res.json();

    if (!user || !isOwner(product, user)) {
      return { product, unauthorized: true };
    }

    return { product, unauthorized: false };
  } catch {
    return { product: null, unauthorized: true };
  }
}
