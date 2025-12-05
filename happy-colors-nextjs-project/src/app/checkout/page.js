'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import styles from './checkout.module.css';

export default function CheckoutPage() {
  const { cartItems, getTotalPrice, clearCart } = useCart();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    address: '',
    note: '',
    paymentMethods: [], // списък с избрани начини на плащане
  });

  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));

    setSubmitStatus({ type: '', message: '' });
  };

  const handlePaymentChange = (method) => {
    setFormData((prev) => {
      const isSelected = prev.paymentMethods.includes(method);

      // визуално чекбокс, но логически позволяваме само 1 избор
      const newMethods = isSelected ? [] : [method];

      return {
        ...prev,
        paymentMethods: newMethods,
      };
    });

    setErrors((prev) => ({
      ...prev,
      paymentMethods: '',
    }));

    setSubmitStatus({ type: '', message: '' });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Моля, въведете име и фамилия.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Моля, въведете телефон.';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Моля, въведете град.';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Моля, въведете адрес за доставка.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Моля, въведете e-mail.';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Моля, въведете валиден e-mail.';
    }

    if (!formData.paymentMethods || formData.paymentMethods.length === 0) {
      newErrors.paymentMethods = 'Моля, изберете начин на плащане.';
    }

    return newErrors;
  };

  const totalPrice = getTotalPrice();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ type: '', message: '' });

    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData,
          cartItems,
          totalPrice,
        }),
      });

      if (!res.ok) {
        throw new Error('Request failed');
      }

      setSubmitStatus({
        type: 'success',
        message:
          'Благодарим ви за поръчката, ще се свържем с вас възможно най-скоро.',
      });

      // по желание: чистим количката
      clearCart();
    } catch (err) {
      console.error('Order submit error:', err);
      setSubmitStatus({
        type: 'error',
        message:
          'Възникна грешка при изпращане на поръчката. Моля, опитайте отново.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.checkoutContainer}>
      <h1 className={styles.heading}>Завършване на поръчката</h1>

      <div className={styles.columns}>
        {/* Лява колона – данни за клиента */}
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <h2 className={styles.subheading}>Данни за доставка</h2>

          <div className={styles.field}>
            <label htmlFor="name">
              Име и фамилия <span className={styles.requiredStar}>*</span>
            </label>
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
            <label htmlFor="phone">
              Телефон <span className={styles.requiredStar}>*</span>
            </label>
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
            <label htmlFor="email">
              E-mail <span className={styles.requiredStar}>*</span>
            </label>
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
            <label htmlFor="city">
              Град <span className={styles.requiredStar}>*</span>
            </label>
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
            <label htmlFor="address">
              Адрес за доставка <span className={styles.requiredStar}>*</span>
            </label>
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
            <span className={styles.fieldLabel}>
              Начин на плащане{' '}
              <span className={styles.requiredStar}>*</span>
            </span>

            <div className={styles.paymentOptions}>
              <label className={styles.paymentOption}>
                <input
                  type="checkbox"
                  checked={formData.paymentMethods.includes('bank')}
                  onChange={() => handlePaymentChange('bank')}
                />
                <span>С банкова карта</span>
              </label>

              <label className={styles.paymentOption}>
                <input
                  type="checkbox"
                  checked={formData.paymentMethods.includes('cod')}
                  onChange={() => handlePaymentChange('cod')}
                />
                <span>Наложен платеж</span>
              </label>

            </div>

            {errors.paymentMethods && (
              <p className={styles.error}>{errors.paymentMethods}</p>
            )}
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

          {submitStatus.message && (
            <p
              className={`${styles.infoMessage} ${
                submitStatus.type === 'success'
                  ? styles.infoSuccess
                  : styles.infoError
              }`}
            >
              {submitStatus.message}
            </p>
          )}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Изпращане...' : 'Потвърди поръчката'}
          </button>

          <p className={styles.requiredNote}>
            Полетата, отбелязани със{' '}
            <span className={styles.requiredStar}>*</span>, са задължителни.
          </p>
        </form>

        {/* Дясна колона – обобщение на поръчката */}
        <aside className={styles.summary}>
          <h2 className={styles.subheading}>Вашата поръчка</h2>

          <ul className={styles.itemsList}>
            {cartItems.map((item) => (
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
