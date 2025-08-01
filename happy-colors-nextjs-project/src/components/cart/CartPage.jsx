'use client';

import { useCart } from '@/context/CartContext';
import CartItem from './CartItem';
import styles from './Cart.module.css';
import Link from 'next/link';

export default function CartPage() {
  const {
    cartItems,
    clearCart,
    getTotalPrice,
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <h2>Количката е празна</h2>
        <Link href="/products" className={styles.backToShop}>
          ← Обратно към магазина
        </Link>
      </div>
    );
  }

  return (
    <section className={styles.cartContainer}>
      <h1>Моята количка</h1>

      <div className={styles.cartItems}>
        {cartItems.map(item => (
          <CartItem key={item._id} item={item} />
        ))}
      </div>

      <div className={styles.summary}>
        <p>Обща сума: <strong>{getTotalPrice().toFixed(2)} лв.</strong></p>
        <button onClick={clearCart} className={styles.clearBtn}>
          Изчисти количката
        </button>
      </div>
    </section>
  );
}
