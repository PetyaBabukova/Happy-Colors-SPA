'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import baseUrl from '@/config'; // 🟢 използваме правилната променлива

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [categoriesUpdated, setCategoriesUpdated] = useState(false);
  const [loading, setLoading] = useState(true); // 🟢 добавено

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(`${baseUrl}/categories`);
        const data = await res.json();
        const categoryNames = data.map(cat => cat.name).filter(Boolean);
        setCategories(categoryNames);
      } catch (err) {
        console.error('Грешка при зареждане на категориите', err);
      } finally {
        setLoading(false); // 🟢 изчакваме зареждането
      }
    }

    fetchCategories();
  }, [categoriesUpdated]);

  const triggerCategoriesReload = () => {
    setCategoriesUpdated(prev => !prev);
  };

  // 🛑 предотвратяване на hydration error
  if (loading) return null;

  return (
    <ProductContext.Provider value={{ categories, triggerCategoriesReload }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);
