// server/services/ordersServices.js

import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import { sendEmail } from '../helpers/sendEmail.js';

class OrderError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

// ----------------------
// Helpers (временно тук)
// ----------------------

function sanitizeText(input) {
  return String(input).replace(/<\/?[^>]+(>|$)/g, '').trim();
}

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(String(email).trim());
}

function isValidPaymentMethod(method) {
  return ['card', 'cod'].includes(method);
}

// ----------------------
// Main service
// ----------------------

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
    shippingMethod = '',
    econtOffice = '',
    speedyOffice = '',
    boxNow = false,
  } = rawData || {};

  // ----------------------
  // 1) Basic validations
  // ----------------------

  if (!name || !email || !phone || !city || !address || !paymentMethod) {
    throw new OrderError('Липсват задължителни полета.', 400);
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new OrderError('Количката е празна или невалидна.', 400);
  }

  if (!isValidEmail(email)) {
    throw new OrderError('Невалиден email формат.', 400);
  }

  if (!isValidPaymentMethod(paymentMethod)) {
    throw new OrderError('Невалиден начин на плащане.', 400);
  }

  if (paymentMethod === 'cod' && !shippingMethod) {
    throw new OrderError('Липсва информация за начина на доставка.', 400);
  }

  // ----------------------
  // 2) Length & security checks
  // ----------------------

  if (name.trim().length < 3 || name.trim().length > 50) {
    throw new OrderError('Името трябва да е между 3 и 50 символа.', 400);
  }

  if (phone.trim().length > 20) {
    throw new OrderError('Телефонът е прекалено дълъг.', 400);
  }

  if (city.trim().length < 2 || city.trim().length > 50) {
    throw new OrderError('Градът трябва да е между 2 и 50 символа.', 400);
  }

  if (address.trim().length < 5 || address.trim().length > 200) {
    throw new OrderError('Адресът трябва да е между 5 и 200 символа.', 400);
  }

  if (note && note.trim().length > 500) {
    throw new OrderError('Бележката е прекалено дълга.', 400);
  }

  const forbiddenPattern = /<[^>]*>/g;
  const allFields = [
    name,
    email,
    phone,
    city,
    address,
    note,
    shippingMethod,
    econtOffice,
    speedyOffice,
  ];

  if (allFields.some((v) => forbiddenPattern.test(String(v)))) {
    throw new OrderError('Забранени символи в полетата.', 400);
  }

  // ----------------------
  // 3) Sanitization
  // ----------------------

  const cleanCustomer = {
    name: sanitizeText(name),
    email: sanitizeText(email),
    phone: sanitizeText(phone),
    city: sanitizeText(city),
    address: sanitizeText(address),
    note: sanitizeText(note),
  };

  const cleanShipping = {
    shippingMethod: sanitizeText(shippingMethod),
    econtOffice: sanitizeText(econtOffice),
    speedyOffice: sanitizeText(speedyOffice),
    boxNow: Boolean(boxNow),
  };

  const safeTotalPrice = Number(totalPrice || 0);

  // ----------------------
  // 4) Map items (business data)
  // ----------------------

  const mappedItems = cartItems.map((item) => ({
    productId: item._id,
    title: String(item.title || ''),
    quantity: Number(item.quantity || 0),
    unitPrice: Number(item.price || 0), // очакваме EUR
  }));

  // ----------------------
  // 5) Create Order
  // ----------------------

  const order = await Order.create({
    customer: cleanCustomer,
    shipping: cleanShipping,
    items: mappedItems,
    totalPrice: safeTotalPrice,
    paymentMethod,
    status: 'new',
  });

  // ----------------------
  // 6) Payment handling
  // ----------------------

  let payment = null;

  if (paymentMethod === 'card') {
    payment = await Payment.create({
      provider: 'stripe',
      amount: Math.round(safeTotalPrice * 100), // EUR → cents
      currency: 'eur',
      status: 'pending',
    });

    order.paymentId = payment._id;
    await order.save();

    // ⚠️ НЕ пращаме имейл тук
    // ще се прати след webhook (payment succeeded)
  }

  // ----------------------
  // 7) COD email (only here!)
  // ----------------------

  if (paymentMethod === 'cod') {
    const subject = `Нова поръчка от ${cleanCustomer.name} (Happy Colors)`;

    const itemsText = mappedItems
      .map(
        (item) =>
          `- ${item.title} | количество: ${item.quantity} | цена: ${item.unitPrice} €`
      )
      .join('\n');

    const text = `
Нова поръчка от Happy Colors

Име: ${cleanCustomer.name}
Имейл: ${cleanCustomer.email}
Телефон: ${cleanCustomer.phone}
Град: ${cleanCustomer.city}
Адрес: ${cleanCustomer.address}

Начин на плащане: Наложен платеж

Поръчани продукти:
${itemsText}

Обща сума: ${safeTotalPrice.toFixed(2)} €
`.trim();

    await sendEmail({ subject, text });
  }

  // ----------------------
  // 8) Response
  // ----------------------

  return {
    message:
      paymentMethod === 'card'
        ? 'Поръчката е създадена. Очаква се плащане.'
        : 'Поръчката беше изпратена успешно.',
    orderId: order._id,
    paymentId: payment ? payment._id : null,
  };
}
