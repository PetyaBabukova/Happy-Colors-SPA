'use client';

import { useCart } from '@/context/CartContext';
import styles from './Cart.module.css';
import Image from 'next/image';

export default function CartItem({ item }) {
  const { removeFromCart } = useCart();

  return (
    <div className={styles.cartItem}>
      <Image
        src={item.image}
        alt={item.title}
        width={80}
        height={80}
        className={styles.productImage}
      />

      <div className={styles.details}>
        <h4>{item.title}</h4>
        <p>Цена: {item.price.toFixed(2)} лв.</p>
        <p>Количество: {item.quantity}</p>
        <p>Общо: {(item.price * item.quantity).toFixed(2)} лв.</p>
      </div>

      <button
        onClick={() => removeFromCart(item._id)}
        className={styles.removeBtn}
      >
        Премахни
      </button>
    </div>
  );
}
