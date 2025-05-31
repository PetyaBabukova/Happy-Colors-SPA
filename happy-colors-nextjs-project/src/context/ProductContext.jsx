'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [categoriesUpdated, setCategoriesUpdated] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('http://localhost:3030/categories');
        const data = await res.json();
        const categoryNames = data.map(cat => cat.name);
        setCategories(categoryNames);
      } catch (err) {
        console.error('Грешка при зареждане на категориите', err);
      }
    }

    fetchCategories();
  }, [categoriesUpdated]);

  const triggerCategoriesReload = () => {
    setCategoriesUpdated(prev => !prev);
  };

  return (
    <ProductContext.Provider value={{ categories, triggerCategoriesReload }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);
