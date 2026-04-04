// happy-colors-nextjs-project/src/app/products/[productId]/page.js

import ProductDetails from './ProductDetails';
import baseURL from '@/config';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params: paramsPromise }) {
  const { productId } = await paramsPromise;

  const res = await fetch(`${baseURL}/products/${productId}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    return {
      title: 'Продуктът не е намерен',
      description: 'Опитайте отново или изберете друг продукт.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const product = await res.json();

  const categoryName = product.category?.name;
  const titleParts = [product.title, categoryName].filter(Boolean);

  return {
    title: titleParts.join(' | '),
    description: categoryName
      ? `${product.title} – ${categoryName.toLowerCase()} от Happy Colors. Ръчно изработено изделие с внимание към детайла, подходящо за подарък, декорация за дома или специален повод.`
      : `${product.title} от Happy Colors. Ръчно изработено изделие с внимание към детайла, подходящо за подарък, декорация за дома или специален повод.`,
    alternates: {
      canonical: `/products/${productId}`,
    },
  };
}

export default async function ProductDetailsPage({ params: paramsPromise }) {
  const { productId } = await paramsPromise;

  const res = await fetch(`${baseURL}/products/${productId}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    notFound();
  }

  const product = await res.json();

  return <ProductDetails product={product} />;
}