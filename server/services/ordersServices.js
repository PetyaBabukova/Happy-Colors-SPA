// server/services/ordersServices.js

import Order from '../models/Order.js';
import { sendEmail } from '../helpers/sendEmail.js';

class OrderError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

// ----------------------
// Helpers
// ----------------------

function sanitizeText(input) {
  return String(input ?? '').replace(/<\/?[^>]+(>|$)/g, '').trim();
}

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(String(email ?? '').trim());
}

function isValidPaymentMethod(method) {
  return ['card', 'cod'].includes(method);
}

function getClientUrl() {
  return process.env.CLIENT_URL || 'http://localhost:3000';
}

function getProductLink(productId) {
  const clientUrl = getClientUrl();
  return `${clientUrl}/products/${String(productId || '').trim()}`;
}

function getCustomerProductsText(items = []) {
  return items
    .map((item) => {
      const productId = item.productId ? String(item.productId) : '';
      const productLink = productId ? getProductLink(productId) : '-';

      return `- ${item.title}\n  ${productLink}`;
    })
    .join('\n\n');
}

function getAdminItemsText(items = []) {
  return items
    .map((item) => {
      const productId = item.productId ? String(item.productId) : '-';
      const productLink = productId !== '-' ? getProductLink(productId) : '-';

      return `- ${item.title}\n  ${productLink}\n  ID: ${productId} | количество: ${item.quantity} | цена: ${Number(item.unitPrice).toFixed(2)} €`;
    })
    .join('\n\n');
}

function getShippingProviderLabel(shipping) {
  if (shipping.shippingMethod === 'econt') {
    return 'Еконт';
  }

  if (shipping.shippingMethod === 'speedy') {
    return 'Спиди';
  }

  if (shipping.shippingMethod === 'boxnow') {
    return 'Box Now';
  }

  return '-';
}

function getShippingLocationLabel(shipping, customerAddress = '') {
  if (shipping.shippingMethod === 'econt') {
    return shipping.econtOffice || '-';
  }

  if (shipping.shippingMethod === 'speedy') {
    return shipping.speedyOffice || '-';
  }

  if (shipping.shippingMethod === 'boxnow') {
    return customerAddress || '-';
  }

  return '-';
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
    address = '',
    note = '',
    paymentMethod,
    cartItems = [],
    totalPrice,
    shippingMethod = '',
    econtOffice = '',
    speedyOffice = '',
    boxNow = false,
  } = rawData || {};

  const safeName = String(name ?? '').trim();
  const safeEmail = String(email ?? '').trim();
  const safePhone = String(phone ?? '').trim();
  const safeCity = String(city ?? '').trim();
  const safeAddress = String(address ?? '').trim();
  const safeNote = String(note ?? '').trim();
  const safeShippingMethod = String(shippingMethod ?? '').trim();
  const safeEcontOffice = String(econtOffice ?? '').trim();
  const safeSpeedyOffice = String(speedyOffice ?? '').trim();

  // ----------------------
  // 1) Basic validations
  // ----------------------

  if (!safeName || !safeEmail || !safePhone || !safeCity || !paymentMethod) {
    throw new OrderError('Липсват задължителни полета.', 400);
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new OrderError('Количката е празна или невалидна.', 400);
  }

  if (!isValidEmail(safeEmail)) {
    throw new OrderError('Невалиден email формат.', 400);
  }

  if (!isValidPaymentMethod(paymentMethod)) {
    throw new OrderError('Невалиден начин на плащане.', 400);
  }

  if (paymentMethod === 'card') {
    throw new OrderError(
      'Плащането с карта се обработва през Stripe. Моля използвайте card checkout flow.',
      400
    );
  }

  if (!safeShippingMethod) {
    throw new OrderError('Липсва информация за начина на доставка.', 400);
  }

  if (safeShippingMethod === 'econt' && !safeEcontOffice) {
    throw new OrderError('Моля, изберете офис или автомат на Еконт.', 400);
  }

  if (safeShippingMethod === 'speedy' && !safeSpeedyOffice) {
    throw new OrderError('Моля, изберете офис или автомат на Спиди.', 400);
  }

  if (safeShippingMethod === 'boxnow' && !safeAddress) {
    throw new OrderError('Моля, въведете адрес за доставка.', 400);
  }

  // ----------------------
  // 2) Length & security checks
  // ----------------------

  if (safeName.length < 3 || safeName.length > 50) {
    throw new OrderError('Името трябва да е между 3 и 50 символа.', 400);
  }

  if (safePhone.length > 20) {
    throw new OrderError('Телефонът е прекалено дълъг.', 400);
  }

  if (safeCity.length < 2 || safeCity.length > 50) {
    throw new OrderError('Градът трябва да е между 2 и 50 символа.', 400);
  }

  if (safeShippingMethod === 'boxnow') {
    if (safeAddress.length < 5 || safeAddress.length > 200) {
      throw new OrderError('Адресът трябва да е между 5 и 200 символа.', 400);
    }
  }

  if (safeNote && safeNote.length > 500) {
    throw new OrderError('Бележката е прекалено дълга.', 400);
  }

  if (shippingMethod === 'boxnow' && paymentMethod === 'cod') {
    throw new Error('За Box Now е позволено само плащане с банкова карта.');
  }

  const forbiddenPattern = /<[^>]*>/g;
  const allFields = [
    safeName,
    safeEmail,
    safePhone,
    safeCity,
    safeAddress,
    safeNote,
    safeShippingMethod,
    safeEcontOffice,
    safeSpeedyOffice,
  ];

  if (allFields.some((v) => forbiddenPattern.test(String(v)))) {
    throw new OrderError('Забранени символи в полетата.', 400);
  }

  // ----------------------
  // 3) Sanitization
  // ----------------------

  const cleanCustomer = {
    name: sanitizeText(safeName),
    email: sanitizeText(safeEmail),
    phone: sanitizeText(safePhone),
    city: sanitizeText(safeCity),
    address: safeShippingMethod === 'boxnow' ? sanitizeText(safeAddress) : '',
    note: sanitizeText(safeNote),
  };

  const cleanShipping = {
    shippingMethod: sanitizeText(safeShippingMethod),
    econtOffice: safeShippingMethod === 'econt' ? sanitizeText(safeEcontOffice) : '',
    speedyOffice: safeShippingMethod === 'speedy' ? sanitizeText(safeSpeedyOffice) : '',
    boxNow: Boolean(boxNow),
  };

  const safeTotalPrice = Number(totalPrice || 0);

  // ----------------------
  // 4) Map items
  // ----------------------

  const mappedItems = cartItems.map((item) => ({
    productId: item._id,
    title: String(item.title || ''),
    quantity: Number(item.quantity || 0),
    unitPrice: Number(item.price || 0),
  }));

  // ----------------------
  // 5) Create Order (COD only)
  // ----------------------

  const order = await Order.create({
    customer: cleanCustomer,
    shipping: cleanShipping,
    items: mappedItems,
    totalPrice: safeTotalPrice,
    paymentMethod: 'cod',
    status: 'new',
  });

  // ----------------------
  // 6) Emails (admin + customer)
  // ----------------------

  const adminSubject = `Поръчка от ${cleanCustomer.name}`;

  const adminItemsText = getAdminItemsText(mappedItems);
  const customerProductsText = getCustomerProductsText(mappedItems);
  const customerNote = cleanCustomer.note ? cleanCustomer.note : 'няма';
  const shippingProviderLabel = getShippingProviderLabel(cleanShipping);
  const shippingLocationLabel = getShippingLocationLabel(
    cleanShipping,
    cleanCustomer.address
  );

  const adminText = `
Нова поръчка от Happy Colors

Order ID: ${order._id}

Име: ${cleanCustomer.name}
Имейл: ${cleanCustomer.email}
Телефон: ${cleanCustomer.phone}
Град: ${cleanCustomer.city}
Адрес: ${cleanCustomer.address || '-'}

Бележка от клиента: ${customerNote}

Начин на плащане: Наложен платеж

Доставчик: ${shippingProviderLabel}
Адрес/Офис: ${shippingLocationLabel}

Поръчани продукти:
${adminItemsText}

Обща сума: ${safeTotalPrice.toFixed(2)} €
`.trim();

  try {
    await sendEmail({ subject: adminSubject, text: adminText });
  } catch (e) {
    console.error('Грешка при изпращане на admin имейл:', e);
    throw new OrderError(
      'Поръчката е записана, но не успяхме да изпратим имейл.',
      500
    );
  }

  const customerSubject = 'Поръчката ви е приета (Happy Colors)';
  const customerText = `
Здравейте, ${cleanCustomer.name}!

Благодарим Ви! Поръчката Ви е приета успешно.

Поръчани продукти:
${customerProductsText}

Ще се свържем с Вас при първа възможност.

Поздрави,
Happy Colors
`.trim();

  try {
    await sendEmail({
      to: cleanCustomer.email,
      subject: customerSubject,
      text: customerText,
    });
  } catch (e) {
    console.error('Грешка при изпращане на customer имейл:', e);
  }

  // ----------------------
  // 7) Response
  // ----------------------

  return {
    message: 'Поръчката беше изпратена успешно.',
    orderId: order._id,
  };
}