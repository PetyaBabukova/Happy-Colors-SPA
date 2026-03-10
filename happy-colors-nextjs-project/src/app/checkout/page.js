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
    econtOffices,
    speedyOffices,
    officesLoading,
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

  // проверяваме дали има въведен град
  const cityFilled = formData.city?.trim().length > 0;

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

  // филтрираме примерните офиси по въведения град, ако няма динамични данни
  const lowerCity = formData.city?.trim().toLowerCase() || '';
  const availableEcontOffices =
    econtOffices && econtOffices.length > 0
      ? econtOffices
      : cityFilled
      ? ECONT_OFFICES.filter((office) =>
          office.toLowerCase().includes(lowerCity)
        )
      : [];
  const availableSpeedyOffices =
    speedyOffices && speedyOffices.length > 0
      ? speedyOffices
      : cityFilled
      ? SPEEDY_OFFICES.filter((office) =>
          office.toLowerCase().includes(lowerCity)
        )
      : [];

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

          {/* избор на доставчик */}
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

          {/* избор на офис на Еконт */}
          {shipping.shippingMethod === 'econt' && (
            <div className={styles.field}>
              <label htmlFor="econtOffice">
                Офис на Еконт <span className={styles.requiredStar}>*</span>
              </label>
              {cityFilled ? (
                availableEcontOffices.length > 0 ? (
                  <select
                    id="econtOffice"
                    value={shipping.econtOffice}
                    onChange={(e) => setEcontOffice(e.target.value)}
                  >
                    <option value="">Изберете офис на Еконт</option>
                    {availableEcontOffices.map((office) => (
                      <option key={office} value={office}>
                        {office}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select id="econtOffice" disabled>
                    <option value="">Няма офиси за този град</option>
                  </select>
                )
              ) : (
                <select id="econtOffice" disabled>
                  <option value="">Първо въведете град</option>
                </select>
              )}
              {errors.econtOffice && (
                <p className={styles.error}>{errors.econtOffice}</p>
              )}
              {officesLoading && (
                <p
                  style={{
                    marginTop: '4px',
                    fontSize: '0.875em',
                    color: '#666',
                  }}
                >
                  Зареждат се офисите…
                </p>
              )}
            </div>
          )}

          {/* избор на офис на Спиди */}
          {shipping.shippingMethod === 'speedy' && (
            <div className={styles.field}>
              <label htmlFor="speedyOffice">
                Офис на Спиди <span className={styles.requiredStar}>*</span>
              </label>
              {cityFilled ? (
                availableSpeedyOffices.length > 0 ? (
                  <select
                    id="speedyOffice"
                    value={shipping.speedyOffice}
                    onChange={(e) => setSpeedyOffice(e.target.value)}
                  >
                    <option value="">Изберете офис на Спиди</option>
                    {availableSpeedyOffices.map((office) => (
                      <option key={office} value={office}>
                        {office}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select id="speedyOffice" disabled>
                    <option value="">Няма офиси за този град</option>
                  </select>
                )
              ) : (
                <select id="speedyOffice" disabled>
                  <option value="">Първо въведете град</option>
                </select>
              )}
              {errors.speedyOffice && (
                <p className={styles.error}>{errors.speedyOffice}</p>
              )}
              {officesLoading && (
                <p
                  style={{
                    marginTop: '4px',
                    fontSize: '0.875em',
                    color: '#666',
                  }}
                >
                  Зареждат се офисите…
                </p>
              )}
            </div>
          )}

          {/* ... останалата част (плащане, бележка, сумирано) се запазва без промяна ... */}
          {/* кодът за плащане, бележка, бутон за изпращане и модала може да се остави както е във вашия файл */}
          {/* ... */}
        </form>

        {/* Дясна колона – обобщение, модал и т.н. остават непроменени */}
      </div>
    </section>
  );
}