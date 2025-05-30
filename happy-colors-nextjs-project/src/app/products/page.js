import { getProducts } from '@/managers/productsManager';
import Shop from './Shop';

export const metadata = {
  title: 'Магазин | Happy Colors',
  description: 'Разгледайте нашите ръчно изработени продукти по категории.',
};

export default async function ProductsPage({ searchParams }) {
  const category = searchParams?.category || null;

  const allProducts = await getProducts(category);

  return <Shop products={allProducts} />;
}
