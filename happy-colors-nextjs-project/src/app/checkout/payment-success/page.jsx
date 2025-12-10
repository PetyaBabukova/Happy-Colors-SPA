'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import baseURL from '@/config';
import MessageBox from '@/components/ui/MessageBox';
import styles from '../checkout.module.css';

const SHIPPING_STORAGE_KEY = 'hc_shipping_choice';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { cartItems, getTotalPrice, clearCart } = useCart();

  const [message, setMessage] = useState(
    'Обработваме вашата поръчка...'
  );
  const [isError, setIsError] = useState(false);

  const totalPrice = getTotalPrice();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const rawDraft = window.localStorage.getItem('hc_order_draft');

    if (!rawDraft || !cartItems.length) {
      // Няма данни – най-вероятно поръчката вече е обработена
      setMessage(
        'Поръчката е вече обработена или липсват данни. Ще ви пренасочим към продуктите.'
      );
      const t = setTimeout(() => router.push('/products'), 4000);
      return () => clearTimeout(t);
    }

    let draft;
    try {
      draft = JSON.parse(rawDraft);
    } catch (err) {
      console.error('Грешка при парсване на hc_order_draft:', err);
      setIsError(true);
      setMessage(
        'Възникна грешка при обработка на поръчката. Моля, свържете се с нас.'
      );
      const t = setTimeout(() => router.push('/products'), 5000);
      return () => clearTimeout(t);
    }

    const rawShipping = window.localStorage.getItem(SHIPPING_STORAGE_KEY);
    let shipping = {};
    if (rawShipping) {
      try {
        shipping = JSON.parse(rawShipping);
      } catch (err) {
        console.error('Грешка при парсване на hc_shipping_choice:', err);
      }
    }

    fetch(`${baseURL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...draft,
        paymentMethod: 'card',
        cartItems,
        totalPrice,
        ...shipping,
      }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          throw new Error(
            data?.message || 'Грешка при финализиране на поръчката.'
          );
        }

        setIsError(false);
        setMessage(
          'Благодарим ви за поръчката! Плащането с карта беше успешно. Ще се свържем с вас при първа възможност.'
        );

        clearCart();
        window.localStorage.removeItem('hc_order_draft');
        window.localStorage.removeItem(SHIPPING_STORAGE_KEY);

        const t = setTimeout(() => {
          router.push('/products');
        }, 4000);

        return () => clearTimeout(t);
      })
      .catch((err) => {
        console.error('Грешка при финализиране на поръчката (card):', err);
        setIsError(true);
        setMessage(
          err.message ||
            'Възникна грешка при финализиране на поръчката. Моля, свържете се с нас.'
        );
        const t = setTimeout(() => router.push('/products'), 5000);
        return () => clearTimeout(t);
      });
  }, [cartItems, getTotalPrice, router, clearCart, totalPrice]);

  return (
    <section className={styles.checkoutContainer}>
      <div style={{ marginTop: '40px' }}>
        <MessageBox
          type={isError ? 'error' : 'success'}
          message={message}
        />
      </div>
    </section>
  );
}
