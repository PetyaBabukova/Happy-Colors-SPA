import { searchProductsByQuery } from '../services/searchService.js';

export async function searchProducts(req, res) {
  const query = req.query.q?.trim();

  if (!query) {
    return res.status(400).json({ message: 'Моля, въведете текст за търсене' });
  }

  try {
    const results = await searchProductsByQuery(query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Грешка при търсене', error: err.message });
  }
}
