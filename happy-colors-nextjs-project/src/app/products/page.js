import baseURL from '@/config';
import Shop from './Shop';

export const metadata = {
  title: 'Магазин | Happy Colors',
  description: 'Разгледайте нашите ръчно изработени продукти по категории.',
};

export default async function ProductsPage() {
  const res = await fetch(`${baseURL}/products`, { cache: 'no-store' });

  if (!res.ok) {
    return <div>Неуспешно зареждане на продуктите.</div>;
  }

  const allProducts = await res.json();

  return <Shop products={allProducts} />;
}
