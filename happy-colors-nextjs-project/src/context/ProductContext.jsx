'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import baseUrl from '@/config';

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [categories, setCategories] = useState([]); // всички категории – за форми
  const [visibleCategories, setVisibleCategories] = useState([]); // за хедъра и shop
  const [products, setProducts] = useState([]); // резервираме за бъдеща нужда
  const [loading, setLoading] = useState(true);
  const [reloadFlag, setReloadFlag] = useState(false);

  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);

        // 🟢 1. Взимаме всички категории (обекти)
        const allCatsRes = await fetch(`${baseUrl}/categories`);
        const allCatsData = await allCatsRes.json();
        setCategories(allCatsData);

        // 🟢 2. Взимаме само видимите категории (обекти с поне 1 продукт)
        const visibleRes = await fetch(`${baseUrl}/categories/visible`);
        const visibleData = await visibleRes.json();
        setVisibleCategories(visibleData); // 🔴 махаме .map(cat => cat.name)
      } catch (err) {
        console.error('Грешка при зареждане на категориите:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [reloadFlag]);

  const triggerCategoriesReload = () => {
    setReloadFlag(prev => !prev);
  };

  if (loading) return null;

  return (
    <ProductContext.Provider
      value={{
        categories,          // всички – за форми
        visibleCategories,   // само с продукти – за хедъра и shop
        products,            // future
        triggerCategoriesReload,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);
