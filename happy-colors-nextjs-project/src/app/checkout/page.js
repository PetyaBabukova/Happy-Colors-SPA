'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import styles from './checkout.module.css';

export default function CheckoutPage() {
  const { cartItems, getTotalPrice } = useCart();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    address: '',
    note: '',
  });

  const [errors, setErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState('');

  // ако количката е празна – няма какво да чекираме
  if (cartItems.length === 0) {
    return (
      <section className={styles.emptyCheckout}>
        <h1>Количката е празна</h1>
        <p>Няма артикули за поръчка.</p>
        <Link href="/products" className={styles.backToShop}>
          ← Обратно към магазина
        </Link>
      </section>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // чистим грешката за конкретното поле, ако има
    setErrors(prev => ({
      ...prev,
      [name]: '',
    }));
    setSubmitMessage('');
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Моля, въведете име и фамилия.';
    if (!formData.phone.trim()) newErrors.phone = 'Моля, въведете телефон.';
    if (!formData.city.trim()) newErrors.city = 'Моля, въведете град.';
    if (!formData.address.trim()) newErrors.address = 'Моля, въведете адрес за доставка.';

    if (formData.email && !formData.email.includes('@')) {
      newErrors.email = 'Моля, въведете валиден e-mail или оставете полето празно.';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitMessage('');
      return;
    }

    // Засега само логваме – реалния checkout flow ще добавим по-късно
    console.log('Checkout form data:', formData);
    console.log('Cart items:', cartItems);

    setSubmitMessage(
      'Това е демо версия на checkout-а. Реалното изпращане на поръчката ще го добавим допълнително.'
    );
  };

  const totalPrice = getTotalPrice();

  return (
    <section className={styles.checkoutContainer}>
      <h1 className={styles.heading}>Завършване на поръчката</h1>

      <div className={styles.columns}>
        {/* Лява колона – данни за клиента */}
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <h2 className={styles.subheading}>Данни за доставка</h2>

          <div className={styles.field}>
            <label htmlFor="name">Име и фамилия *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <p className={styles.error}>{errors.name}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="phone">Телефон *</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
            />
            {errors.phone && <p className={styles.error}>{errors.phone}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="email">E-mail (по избор)</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <p className={styles.error}>{errors.email}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="city">Град *</label>
            <input
              id="city"
              name="city"
              type="text"
              value={formData.city}
              onChange={handleChange}
            />
            {errors.city && <p className={styles.error}>{errors.city}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="address">Адрес за доставка *</label>
            <textarea
              id="address"
              name="address"
              rows={3}
              value={formData.address}
              onChange={handleChange}
            />
            {errors.address && <p className={styles.error}>{errors.address}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="note">Бележка към поръчката (по избор)</label>
            <textarea
              id="note"
              name="note"
              rows={3}
              value={formData.note}
              onChange={handleChange}
            />
          </div>

          {submitMessage && (
            <p className={styles.infoMessage}>{submitMessage}</p>
          )}

          <button type="submit" className={styles.submitBtn}>
            Потвърди поръчката
          </button>

          <p className={styles.requiredNote}>
            Полетата, отбелязани със *, са задължителни.
          </p>
        </form>

        {/* Дясна колона – обобщение на поръчката */}
        <aside className={styles.summary}>
          <h2 className={styles.subheading}>Вашата поръчка</h2>

          <ul className={styles.itemsList}>
            {cartItems.map(item => (
              <li key={item._id} className={styles.itemRow}>
                <div>
                  <p className={styles.itemTitle}>{item.title}</p>
                  <p className={styles.itemMeta}>
                    Количество: {item.quantity} × {item.price.toFixed(2)} лв.
                  </p>
                </div>
                <p className={styles.itemTotal}>
                  {(item.quantity * item.price).toFixed(2)} лв.
                </p>
              </li>
            ))}
          </ul>

          <div className={styles.totalRow}>
            <span>Общо:</span>
            <strong>{totalPrice.toFixed(2)} лв.</strong>
          </div>

          <Link href="/cart" className={styles.backToCart}>
            ← Върни се към количката
          </Link>
        </aside>
      </div>
    </section>
  );
}
