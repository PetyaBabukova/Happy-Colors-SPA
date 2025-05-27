import ProductDetails from './ProductDetails';
import baseURL from '@/config';

export async function generateMetadata({ params: paramsPromise }) {
  const { productId } = await paramsPromise;

  const res = await fetch(`${baseURL}/products/${productId}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    return {
      title: 'Продуктът не е намерен | Happy Colors',
      description: 'Опитайте отново или изберете друг продукт.',
    };
  }

  const product = await res.json();

  return {
    title: `${product.title} | Happy Colors`,
    description: product.description?.slice(0, 150) || '',
  };
}

export default async function ProductDetailsPage({ params: paramsPromise }) {
  const { productId } = await paramsPromise;

  const res = await fetch(`${baseURL}/products/${productId}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    return <div>Продуктът не беше намерен</div>;
  }

  const product = await res.json();

  return <ProductDetails product={product} />;
}
