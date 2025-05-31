import { getSearchResults } from '@/managers/searchManager';
import Shop from '../products/Shop';

export const metadata = {
  title: 'Резултати от търсене | Happy Colors',
  description: 'Вижте продуктите, които съответстват на вашето търсене.',
};

export default async function SearchPage({ searchParams }) {
  const query = searchParams?.q || '';
  const results = await getSearchResults(query);

  return (
  <>
    <h1 style={{ textAlign: 'center', marginTop: '2rem' }}>
      Резултати от търсенето за: <em>{query}</em>
    </h1>
    {results.length > 0 ? (
      <Shop products={results} />
    ) : (
      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        Няма намерени продукти, отговарящи на вашето търсене.
      </p>
    )}
  </>
);

}
