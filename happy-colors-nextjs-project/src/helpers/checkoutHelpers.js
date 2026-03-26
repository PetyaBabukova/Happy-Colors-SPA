// src/helpers/checkoutHelpers.js
// Помощни функции за checkout процеса. Изнесени са от useCheckoutManager за
// по‑ясна отговорност и повторно използване. Тези функции нямат зависимост
// към React или хранилището на състоянието.

/**
 * Проверява дали даден низ съдържа валиден e-mail формат.
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  return /^\S+@\S+\.\S+$/.test(String(email || '').trim());
}

/**
 * Проверява телефонен номер (с опционален +) и между 8 и 15 цифри.
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  const clean = String(phone || '').replace(/\s+/g, '').trim();
  return /^\+?\d{8,15}$/.test(clean);
}

/**
 * Валидира данните на формата за поръчка и връща обект с грешки. Не хвърля
 * изключения, а събира грешките по полета. Валидациите отговарят на тези
 * използвани в оригиналния useCheckoutManager.
 *
 * @param {Object} formData – съдържа name, phone, email, city, address, paymentMethods
 * @param {Object} shipping – съдържа shippingMethod, econtOffice, speedyOffice, boxNow
 * @param {string} paymentMethod – избрания начин на плащане (‘card’ или ‘cod’)
 * @returns {Object} – обект с полета и съобщения за грешки
 */
export function validateCheckoutForm(formData, shipping, paymentMethod) {
  const errors = {};

  const name = (formData.name || '').trim();
  const phone = (formData.phone || '').trim();
  const city = (formData.city || '').trim();
  const address = (formData.address || '').trim();
  const email = (formData.email || '').trim();

  // Проверка на име: задължително между 3 и 20 символа
  if (!name || name.length < 3 || name.length > 20) {
    errors.name = 'Моля, въведете име от 3 до 20 символа';
  }

  // Телефон: задължителен и валиден
  if (!phone || !isValidPhone(phone)) {
    errors.phone = 'Моля, въведете валиден телефонен номер';
  }

  // E-mail: задължителен и валиден
  if (!email || !isValidEmail(email)) {
    errors.email = 'Моля, въведете валиден e-mail';
  }

  // Град: задължително поле
  if (!city) {
    errors.city = 'Моля, въведете град';
  }

  // Начин на плащане: трябва да има поне един избран метод
  if (!formData.paymentMethods || formData.paymentMethods.length === 0) {
    errors.paymentMethods = 'Моля, изберете начин на плащане';
  }

  // Box Now позволява само плащане с карта
  if (shipping.shippingMethod === 'boxnow' && paymentMethod === 'cod') {
    errors.paymentMethods = 'За Box Now е позволено само плащане с банкова карта';
  }

  // Проверки на методите за доставка
  if (!shipping.shippingMethod) {
    errors.shippingMethod = 'Моля, изберете начин на доставка';
  } else if (shipping.shippingMethod === 'econt' && !shipping.econtOffice) {
    errors.econtOffice = 'Моля, изберете офис на Еконт';
  } else if (shipping.shippingMethod === 'speedy' && !shipping.speedyOffice) {
    errors.speedyOffice = 'Моля, изберете офис на Спиди';
  } else if (shipping.shippingMethod === 'boxnow') {
    // При Box Now адресът трябва да е поне 10 символа
    if (!address || address.length < 10) {
      errors.address = 'Моля, въведете адрес за доставка - минимум 10 символа';
    }
  }

  return errors;
}

/**
 * Запазва черновата на поръчката и избора за доставка в localStorage (ако
 * съществува window) и връща обект с данните, подходящи за изпращане към сървъра.
 *
 * @param {Object} formData
 * @param {string} paymentMethod
 * @param {Object} shipping
 * @returns {Object} draft – изчистените полета
 */
export function persistDraft(formData, paymentMethod, shipping) {
  const draft = {
    name: (formData.name || '').trim(),
    email: (formData.email || '').trim(),
    phone: (formData.phone || '').trim(),
    city: (formData.city || '').trim(),
    // адресът има значение само при Box Now
    address: shipping.shippingMethod === 'boxnow' ? (formData.address || '').trim() : '',
    note: (formData.note || '').trim(),
    paymentMethod,
  };

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem('hc_order_draft', JSON.stringify(draft));
      window.localStorage.setItem(
        'hc_shipping_choice',
        JSON.stringify({
          shippingMethod: shipping.shippingMethod,
          econtOffice: shipping.econtOffice,
          speedyOffice: shipping.speedyOffice,
          boxNow: Boolean(shipping.boxNow),
        }),
      );
    } catch {
      // ignore storage errors (quota exceeded, etc.)
    }
  }

  return draft;
}