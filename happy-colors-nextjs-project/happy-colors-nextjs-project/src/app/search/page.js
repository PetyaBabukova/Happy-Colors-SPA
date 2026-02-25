import Shop from '../products/Shop';
import baseURL from '@/config';

export default async function SearchPage({ searchParams }) {
  const query = searchParams?.q?.trim();

  let products = [];
  if (query) {
    try {
      const res = await fetch(`${baseURL}/search?q=${encodeURIComponent(query)}`, {
        cache: 'no-store',
      });

      if (res.ok) {
        products = await res.json();
      }
    } catch (err) {
      console.error('Грешка при търсенето:', err.message);
    }
  }

  return (
    <section>
      {query && <h4 style={{ textAlign: 'center', marginTop: '2rem' }}>Резултати от търсенето на: <i>{query}</i></h4>}
      <Shop products={products} />
    </section>
  );
}
// Compare this snippet from server/routes/products.js: