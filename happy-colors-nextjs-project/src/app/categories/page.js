'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import baseURL from '@/config';

export default function CategoriesManagerPage() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch(`${baseURL}/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError('Грешка при зареждане на категориите.');
    }
  }

  async function handleDelete(id, name) {
    const confirm = window.confirm(
      `Сигурни ли сте, че искате да изтриете категория "${name}"?`
    );
    if (!confirm) return;

    try {
      const res = await fetch(`${baseURL}/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.message);
      alert(result.message);
      fetchCategories();
    } catch (err) {
      setError(err.message || 'Неуспешно изтриване.');
    }
  }

  return (
    <div className="flex justify-center mt-12">
      <div className="w-full max-w-xl px-4">
        <h2 className="text-center text-2xl font-bold mb-8">Управление на категории</h2>

        {error && <p className="text-center text-red-600 mb-4">{error}</p>}

        <ul className="space-y-8">
          {categories.map((cat) => (
            <li
              key={cat._id}
              className="flex justify-between items-center px-3 py-2 rounded-md hover:bg-[rgba(75,208,174,0.15)] transition"
            >
              <span className="text-lg">{cat.name}</span>
              <div className="flex gap-4">
                <Link
                  href={`/categories/edit/${cat._id}`}
                  className="text-green-700 hover:text-green-800 text-2xl cursor-pointer transition"
                  title="Редактирай"
                >
                  🖉
                </Link>
                {cat.name !== 'Други' && (
                  <a
                    onClick={() => handleDelete(cat._id, cat.name)}
                    title="Изтрий"
                    className="text-2xl cursor-pointer hover:opacity-80 transition"
                    style={{ color: '#FF6F61' }}
                  >
                    🞩
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
