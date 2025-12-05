// server/services/ordersServices.js

import { sendEmail } from '../helpers/sendEmail.js';

class OrderError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Хелпър за премахване на HTML тагове
function sanitizeText(input) {
  return String(input).replace(/<\/?[^>]+(>|$)/g, '').trim();
}

// Проверка за валиден email
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(String(email).trim());
}

function isValidPaymentMethod(method) {
  const allowed = ['card', 'cod']; // 'card' = С карта, 'cod' = Наложен платеж
  return allowed.includes(method);
}

export async function handleOrder(rawData) {
  const {
    name,
    email,
    phone = '',
    city,
    address,
    note = '',
    paymentMethod,
    cartItems = [],
    totalPrice,
  } = rawData || {};

  // 1) Задължителни полета
  if (!name || !email || !phone || !city || !address || !paymentMethod) {
    throw new OrderError('Липсват задължителни полета.', 400);
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new OrderError('Количката е празна или невалидна.', 400);
  }

  // 2) Валидации за дължини
  if (name.trim().length < 3 || name.trim().length > 50) {
    throw new OrderError('Името трябва да е между 3 и 50 символа.', 400);
  }

  if (phone && phone.trim().length > 20) {
    throw new OrderError(
      'Телефонът е прекалено дълъг (макс. 20 символа).',
      400
    );
  }

  if (city.trim().length < 2 || city.trim().length > 50) {
    throw new OrderError('Градът трябва да е между 2 и 50 символа.', 400);
  }

  if (address.trim().length < 5 || address.trim().length > 200) {
    throw new OrderError('Адресът трябва да е между 5 и 200 символа.', 400);
  }

  if (note && note.trim().length > 500) {
    throw new OrderError('Бележката е прекалено дълга (макс. 500 символа).', 400);
  }

  if (!isValidEmail(email)) {
    throw new OrderError('Невалиден email формат.', 400);
  }

  if (!isValidPaymentMethod(paymentMethod)) {
    throw new OrderError('Невалиден начин на плащане.', 400);
  }

  // 3) Забранени HTML тагове
  const forbiddenPattern = /<[^>]*>/g;
  const allFields = [name, email, phone, city, address, note];
  if (allFields.some((val) => forbiddenPattern.test(String(val).trim()))) {
    throw new OrderError('Забранени символи в полетата!', 400);
  }

  // 4) Санитизация
  const cleanCustomer = {
    name: sanitizeText(name),
    email: sanitizeText(email),
    phone: sanitizeText(phone),
    city: sanitizeText(city),
    address: sanitizeText(address),
    note: sanitizeText(note),
    paymentMethod: sanitizeText(paymentMethod),
  };

  const safeTotalPrice = Number(totalPrice || 0);

  // 5) Подготовка на имейл
  const paymentLabelMap = {
    card: 'С карта',
    cod: 'Наложен платеж',
  };

  const paymentLabel =
    paymentLabelMap[cleanCustomer.paymentMethod] || cleanCustomer.paymentMethod || '-';

  const itemsText = (cartItems || [])
    .map(
      (item) =>
        `- ${item.title} | количество: ${item.quantity} | единична цена: ${item.price} лв. | общо: ${
          item.quantity * item.price
        } лв.`
    )
    .join('\n');

  const subject = `Нова поръчка от ${cleanCustomer.name} (Happy Colors)`;

  const text = `
Нова поръчка от Happy Colors

Име и фамилия: ${cleanCustomer.name}
Имейл: ${cleanCustomer.email}
Телефон: ${cleanCustomer.phone || '-'}
Град: ${cleanCustomer.city}
Адрес за доставка: ${cleanCustomer.address}
Начин на плащане: ${paymentLabel}
Бележка: ${cleanCustomer.note || '(няма)'}

Поръчани продукти:
${itemsText || '(няма продукти)'}

Обща сума: ${safeTotalPrice.toFixed(2)} лв.
  `.trim();

  await sendEmail({ subject, text });

  return { message: 'Поръчката беше изпратена успешно.' };
}
