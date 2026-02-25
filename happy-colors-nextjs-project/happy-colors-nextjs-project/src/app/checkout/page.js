// happy-colors-nextjs-project/src/app/checkout/page.js
'use client';

import Link from 'next/link';
import styles from './checkout.module.css';
import MessageBox from '@/components/ui/MessageBox';
import {
  useCheckoutManager,
  ECONT_OFFICES,
  SPEEDY_OFFICES,
} from '@/managers/checkoutManager';

export default function CheckoutPage() {
  const {
    cartItems,
    totalPrice,
    formData,
    errors,
    isSubmitting,
    shipping,
    setShippingMethod,
    setEcontOffice,
    setSpeedyOffice,
    isConfirmOpen,
    closeConfirm,
    confirmOrder,
    submitError,
    submitSuccess,
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

  const paymentLabel =
    formData.paymentMethods?.[0] === 'card'
      ? 'С банкова карта'
      : formData.paymentMethods?.[0] === 'cod'
      ? 'Наложен платеж'
      : '-';

  const shippingLabel =
    shipping.shippingMethod === 'econt'
      ? `Еконт – ${shipping.econtOffice || '(не е избран офис)'}`
      : shipping.shippingMethod === 'speedy'
      ? `Спиди – ${shipping.speedyOffice || '(не е избран офис)'}`
      : shipping.shippingMethod === 'boxnow'
      ? 'Box Now'
      : '-';

  return (
    <section className={styles.checkoutContainer}>
      <h1 className={styles.heading}>Завършване на поръчката</h1>

      <div className={styles.columns}>
        {/* Лява колона – данни за клиента + доставка */}
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2 className={styles.subheading}>Данни за доставка</h2>

          {submitError && (
            <div style={{ marginBottom: '12px' }}>
              <MessageBox type="error" message={submitError} />
            </div>
          )}

          {submitSuccess && (
            <div style={{ marginBottom: '12px' }}>
              <MessageBox type="success" message={submitSuccess} />
            </div>
          )}

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

          {/* ---- ДОСТАВКА (ново) ---- */}
          <div className={styles.field}>
            <span className={styles.fieldLabel}>
              Начин на доставка <span className={styles.requiredStar}>*</span>
            </span>

            <div className={styles.radioGroup}>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="shippingMethod"
                  checked={shipping.shippingMethod === 'econt'}
                  onChange={() => setShippingMethod('econt')}
                />
                <span>Еконт (офис)</span>
              </label>

              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="shippingMethod"
                  checked={shipping.shippingMethod === 'speedy'}
                  onChange={() => setShippingMethod('speedy')}
                />
                <span>Спиди (офис)</span>
              </label>

              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="shippingMethod"
                  checked={shipping.shippingMethod === 'boxnow'}
                  onChange={() => setShippingMethod('boxnow')}
                />
                <span>Box Now</span>
              </label>
            </div>

            {errors.shippingMethod && (
              <p className={styles.error}>{errors.shippingMethod}</p>
            )}
          </div>

          {shipping.shippingMethod === 'econt' && (
            <div className={styles.field}>
              <label htmlFor="econtOffice">
                Офис на Еконт <span className={styles.requiredStar}>*</span>
              </label>
              <select
                id="econtOffice"
                value={shipping.econtOffice}
                onChange={(e) => setEcontOffice(e.target.value)}
              >
                <option value="">Изберете офис на Еконт</option>
                {ECONT_OFFICES.map((office) => (
                  <option key={office} value={office}>
                    {office}
                  </option>
                ))}
              </select>
              {errors.econtOffice && (
                <p className={styles.error}>{errors.econtOffice}</p>
              )}
            </div>
          )}

          {shipping.shippingMethod === 'speedy' && (
            <div className={styles.field}>
              <label htmlFor="speedyOffice">
                Офис на Спиди <span className={styles.requiredStar}>*</span>
              </label>
              <select
                id="speedyOffice"
                value={shipping.speedyOffice}
                onChange={(e) => setSpeedyOffice(e.target.value)}
              >
                <option value="">Изберете офис на Спиди</option>
                {SPEEDY_OFFICES.map((office) => (
                  <option key={office} value={office}>
                    {office}
                  </option>
                ))}
              </select>
              {errors.speedyOffice && (
                <p className={styles.error}>{errors.speedyOffice}</p>
              )}
            </div>
          )}

          {/* ---- Плащане ---- */}
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

          <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
            {isSubmitting ? 'Изпращане...' : 'Продължи'}
          </button>

          <p className={styles.requiredNote}>
            Полетата, отбелязани със{' '}
            <span className={styles.requiredStar}>*</span>, са задължителни.
          </p>
        </form>

        {/* Дясна колона – обобщение */}
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

      {/* ---------- MODAL STEP 2 ---------- */}
      {isConfirmOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>Моля проверете данните за доставка</h2>

            <div className={styles.modalBody}>
              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>Име:</span>
                <span className={styles.modalValue}>{formData.name}</span>
              </div>

              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>Телефон:</span>
                <span className={styles.modalValue}>{formData.phone}</span>
              </div>

              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>E-mail:</span>
                <span className={styles.modalValue}>{formData.email}</span>
              </div>

              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>Град:</span>
                <span className={styles.modalValue}>{formData.city}</span>
              </div>

              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>Адрес:</span>
                <span className={styles.modalValue}>{formData.address}</span>
              </div>

              {formData.note?.trim() ? (
                <div className={styles.modalRow}>
                  <span className={styles.modalLabel}>Бележка:</span>
                  <span className={styles.modalValue}>{formData.note}</span>
                </div>
              ) : null}

              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>Доставка:</span>
                <span className={styles.modalValue}>{shippingLabel}</span>
              </div>

              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>Плащане:</span>
                <span className={styles.modalValue}>{paymentLabel}</span>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalBtnSecondary}
                onClick={closeConfirm}
                disabled={isSubmitting}
              >
                Редактирай
              </button>

              <button
                type="button"
                className={styles.modalBtnPrimary}
                onClick={confirmOrder}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Обработваме...' : 'Потвърждавам поръчката'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
