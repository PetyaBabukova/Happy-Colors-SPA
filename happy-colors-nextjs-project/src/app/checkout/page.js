// happy-colors-nextjs-project/src/app/checkout/page.js

'use client';

import Link from 'next/link';
import styles from './checkout.module.css';
import { useCheckoutManager } from '@/managers/checkoutManager'; 
export default function CheckoutPage() {
  const {
    cartItems,
    totalPrice,
    formData,
    errors,
    isSubmitting,
    handleChange,
    handlePaymentChange,
    handleSubmit,
  } = useCheckoutManager();

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

  return (
    <section className={styles.checkoutContainer}>
      <h1 className={styles.heading}>Завършване на поръчката</h1>

      <div className={styles.columns}>
        {/* Лява колона – данни за клиента */}
        <form className={styles.form} onSubmit={handleSubmit}>
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
              type="text"
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
            <input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
            />
            {errors.address && <p className={styles.error}>{errors.address}</p>}
          </div>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>
              Начин на плащане <span className={styles.requiredStar}>*</span>
            </span>

            <div className={styles.paymentOptions}>
              <label className={styles.paymentOption}>
                <input
                  type="checkbox"
                  checked={formData.paymentMethods.includes('card')}
                  onChange={() => handlePaymentChange('card')}
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
