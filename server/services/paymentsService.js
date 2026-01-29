// server/services/paymentsService.js
import Stripe from 'stripe';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import { getStripeClient } from '../utils/stripeClient.js';
import { sendEmail } from '../helpers/sendEmail.js';

class PaymentError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value || String(value).trim() === '') {
    throw new PaymentError(`${name} не е конфигуриран на сървъра.`, 500);
  }
  return value;
}

function sanitizeText(input) {
  return String(input ?? '').replace(/<\/?[^>]+(>|$)/g, '').trim();
}

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(String(email ?? '').trim());
}

function mapItems(cartItems) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new PaymentError('Липсват продукти в поръчката.', 400);
  }

  return cartItems.map((item) => {
    const title = String(item.title ?? 'Продукт').trim();
    const quantity = Number(item.quantity);

    const unitPrice = Number(item.price); // EUR
    const unitAmount = Math.round(unitPrice * 100);

    if (!title) throw new PaymentError('Невалидно име на продукт.', 400);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new PaymentError('Невалидно количество на продукт.', 400);
    }
    if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
      throw new PaymentError('Невалидна цена на продукт.', 400);
    }

    return {
      orderItem: {
        productId: item._id,
        title,
        quantity,
        unitPrice,
      },
      stripeLineItem: {
        price_data: {
          currency: 'eur',
          product_data: { name: title },
          unit_amount: unitAmount,
        },
        quantity,
      },
    };
  });
}

/**
 * Създава Stripe Checkout Session + създава Order/Payment (pending) в DB.
 * Връща session.url за redirect към Stripe.
 */
export async function createCardPaymentSession(orderData = {}) {
  const stripeSecretKey = requireEnv('STRIPE_SECRET_KEY');
  const clientUrl = requireEnv('CLIENT_URL');
  const stripe = new Stripe(stripeSecretKey);

  const {
    name,
    email,
    phone,
    city,
    address,
    note = '',
    cartItems = [],
    totalPrice,
    shippingMethod = '',
    econtOffice = '',
    speedyOffice = '',
    boxNow = false,
  } = orderData;

  // минимални проверки
  if (!name || !email || !phone || !city || !address) {
    throw new PaymentError('Липсват задължителни полета.', 400);
  }
  if (!isValidEmail(email)) {
    throw new PaymentError('Невалиден email формат.', 400);
  }
  if (!shippingMethod) {
    throw new PaymentError('Липсва информация за начина на доставка.', 400);
  }

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
  if (!Number.isFinite(safeTotalPrice) || safeTotalPrice <= 0) {
    throw new PaymentError('Невалидна обща сума.', 400);
  }

  const mapped = mapItems(cartItems);
  const orderItems = mapped.map((x) => x.orderItem);
  const lineItems = mapped.map((x) => x.stripeLineItem);

  // 1) Payment (pending)
  const payment = await Payment.create({
    provider: 'stripe',
    amount: Math.round(safeTotalPrice * 100),
    currency: 'eur',
    status: 'pending',
  });

  // 2) Order (paymentMethod=card, paymentId=payment._id)
  const order = await Order.create({
    customer: cleanCustomer,
    shipping: cleanShipping,
    items: orderItems,
    totalPrice: safeTotalPrice,
    paymentMethod: 'card',
    status: 'new',
    paymentId: payment._id,
  });

  // 3) Stripe session
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${clientUrl}/checkout/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/checkout/payment-cancel`,
      customer_email: cleanCustomer.email,
      metadata: {
        orderId: String(order._id),
        paymentId: String(payment._id),
      },
    });

    // 4) записваме sessionId (ако schema позволява)
    payment.stripeSessionId = String(session.id);
    await payment.save();

    return { url: session.url };
  } catch (err) {
    // rollback, за да не остава “висяща” поръчка/плащане ако Stripe session не се създаде
    try {
      await Order.findByIdAndDelete(order._id);
    } catch {}
    try {
      await Payment.findByIdAndDelete(payment._id);
    } catch {}

    throw new PaymentError(
      err?.message || 'Грешка при създаване на Stripe checkout сесия.',
      500
    );
  }
}

/**
 * CONFIRM flow:
 * - Проверява Stripe session по session_id
 * - Гарантира, че е paid
 * - Атомично маркира Payment като paid (idempotent) -> само 1 request праща мейли
 * - Праща email към ADMIN + CUSTOMER
 */
export async function confirmCardPaymentSession(sessionId = '') {
  const cleanSessionId = String(sessionId || '').trim();
  if (!cleanSessionId) {
    throw new PaymentError('Липсва session_id.', 400);
  }

  const stripe = getStripeClient();
  if (!stripe) {
    throw new PaymentError('Stripe не е конфигуриран на сървъра.', 500);
  }

  const session = await stripe.checkout.sessions.retrieve(cleanSessionId, {
    expand: ['payment_intent'],
  });

  const isPaid = session?.payment_status === 'paid';
  if (!isPaid) {
    throw new PaymentError('Плащането не е потвърдено в Stripe.', 400);
  }

  const orderId = String(session?.metadata?.orderId || '').trim();
  const paymentId = String(session?.metadata?.paymentId || '').trim();

  if (!orderId || !paymentId) {
    throw new PaymentError(
      'Липсва metadata (orderId/paymentId) в Stripe session.',
      500
    );
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new PaymentError('Order не е намерен.', 404);
  }

  // Допълнителна проверка за сума/валута
  const sessionAmountTotal = Number(session?.amount_total ?? 0); // cents
  const sessionCurrency = String(session?.currency ?? '').toLowerCase();

  const expectedAmount = Math.round(Number(order.totalPrice || 0) * 100);
  const expectedCurrency = 'eur';

  if (sessionCurrency && sessionCurrency !== expectedCurrency) {
    throw new PaymentError('Валутата в Stripe не съвпада с очакваната.', 400);
  }
  if (sessionAmountTotal && expectedAmount && sessionAmountTotal !== expectedAmount) {
    throw new PaymentError('Сумата в Stripe не съвпада с очакваната.', 400);
  }

  // ✅ Идемпотентност: атомично маркираме Payment като paid само ако не е paid
  const pi = session?.payment_intent;
  const paymentUpdate = {
    status: 'paid',
    stripeSessionId: cleanSessionId,
  };
  if (pi?.id) paymentUpdate.stripePaymentIntentId = String(pi.id);

  const updatedPayment = await Payment.findOneAndUpdate(
    { _id: paymentId, status: { $ne: 'paid' } },
    { $set: paymentUpdate },
    { new: true }
  );

  // Ако updatedPayment == null => вече е обработено (някой друг request е “спечелил”)
  if (!updatedPayment) {
    return {
      message: 'Плащането вече е потвърдено.',
      orderId,
      alreadyProcessed: true,
    };
  }

  // По желание можеш да смениш статус на order
  try {
    order.status = 'paid';
    await order.save();
  } catch {
    // ако schema не позволява — игнорираме
  }

  // ----------------
  // Emails
  // ----------------
  const itemsText = (order.items || [])
    .map(
      (i) =>
        `- ${i.title} | количество: ${i.quantity} | цена: ${Number(i.unitPrice).toFixed(2)} €`
    )
    .join('\n');

  // 1) ADMIN
  const adminSubject = `Платена поръчка (карта) от ${order.customer?.name} (Happy Colors)`;
  const adminText = `
Платена поръчка (Stripe)

Име: ${order.customer?.name}
Имейл: ${order.customer?.email}
Телефон: ${order.customer?.phone}
Град: ${order.customer?.city}
Адрес: ${order.customer?.address}

Доставка: ${order.shipping?.shippingMethod || '-'}
Еконт офис: ${order.shipping?.econtOffice || '-'}
Спиди офис: ${order.shipping?.speedyOffice || '-'}
Box Now: ${order.shipping?.boxNow ? 'Да' : 'Не'}

Stripe Session ID: ${cleanSessionId}
PaymentIntent ID: ${updatedPayment.stripePaymentIntentId || '-'}

Поръчани продукти:
${itemsText || '(няма продукти)'}

Обща сума: ${Number(order.totalPrice || 0).toFixed(2)} €
`.trim();

  await sendEmail({ subject: adminSubject, text: adminText });

  // 2) CUSTOMER
  const customerEmail = String(order.customer?.email || '').trim();
  if (customerEmail && isValidEmail(customerEmail)) {
    const customerSubject = 'Поръчката ви е приета (Happy Colors)';
    const customerText = `
Здравейте, ${order.customer?.name || ''}!

Поръчката ви е приета. Ще се свържем с вас при първа възможност.

Поздрави,
Happy Colors
`.trim();

    await sendEmail({ to: customerEmail, subject: customerSubject, text: customerText });
  }

  return {
    message: 'Плащането е потвърдено успешно.',
    orderId,
    alreadyProcessed: false,
  };
}

export { PaymentError };
