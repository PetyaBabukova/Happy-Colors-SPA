import baseURL from '@/config';

export async function getSearchResults(query) {
  if (!query) return [];

  try {
    const res = await fetch(`${baseURL}/search?q=${encodeURIComponent(query)}`, {
      cache: 'no-store',
    });

    if (!res.ok) throw new Error('Неуспешно търсене');

    return await res.json();
  } catch (err) {
    console.error(err.message);
    return [];
  }
}
