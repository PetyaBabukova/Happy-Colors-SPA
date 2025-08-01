'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // Зареждане от localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem('cartItems');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    }
  }, []);

  // Записване в localStorage при промяна
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // Добавяне към количката
  function addToCart(product) {
    setCartItems(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        return prev.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }

  // Премахване на артикул
  function removeFromCart(productId) {
    setCartItems(prev => prev.filter(item => item._id !== productId));
  }

  // Изчистване на количката
  function clearCart() {
    setCartItems([]);
  }

  // Общ брой артикули
  function getTotalItems() {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  // Обща сума
  function getTotalPrice() {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
