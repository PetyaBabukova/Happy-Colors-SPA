// server/services/paymentsService.js
import Stripe from 'stripe';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import CheckoutDraft from '../models/CheckoutDraft.js';
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
      draftItem: {
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
 * ✅ Общ финализиращ метод (ползва се и от confirm, и от webhook)
 * - session трябва да е paid
 * - paymentId/draftId идват от metadata
 * - създава Order от draft (само веднъж)
 * - маркира Payment paid + orderId (идемпотентно)
 * - праща имейли (admin + customer)
 */
export async function finalizePaidCheckoutSession(session) {
  const sessionId = String(session?.id || '').trim();
  if (!sessionId) throw new PaymentError('Липсва Stripe session id.', 400);

  const isPaid = session?.payment_status === 'paid';
  if (!isPaid) throw new PaymentError('Плащането не е потвърдено в Stripe.', 400);

  const paymentId = String(session?.metadata?.paymentId || '').trim();
  const draftId = String(session?.metadata?.draftId || '').trim();

  if (!paymentId || !draftId) {
    throw new PaymentError('Липсва metadata (paymentId/draftId) в Stripe session.', 500);
  }

  // 1) Плащане
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new PaymentError('Payment не е намерен.', 404);

  // sanity: ако имаме записан sessionId и не съвпада
  if (payment.stripeSessionId && payment.stripeSessionId !== sessionId) {
    throw new PaymentError('Несъответствие в Stripe session id.', 400);
  }

  // 2) Draft
  const draft = await CheckoutDraft.findById(draftId).lean();
  if (!draft) throw new PaymentError('Draft не е намерен.', 404);

  // 3) Сума/валута checks
  const sessionAmountTotal = Number(session?.amount_total ?? 0); // cents
  const sessionCurrency = String(session?.currency ?? '').toLowerCase();

  const expectedAmount = Math.round(Number(draft.totalPrice || 0) * 100);
  const expectedCurrency = 'eur';

  if (sessionCurrency && sessionCurrency !== expectedCurrency) {
    throw new PaymentError('Валутата в Stripe не съвпада с очакваната.', 400);
  }
  if (sessionAmountTotal && expectedAmount && sessionAmountTotal !== expectedAmount) {
    throw new PaymentError('Сумата в Stripe не съвпада с очакваната.', 400);
  }

  // 4) Ако вече имаме Order за този payment → връщаме (идемпотентно)
  const existingOrder = await Order.findOne({ paymentId: payment._id }).lean();
  if (existingOrder) {
    // гарантираме, че payment има orderId и е paid
    if (payment.status !== 'paid' || !payment.orderId) {
      payment.status = 'paid';
      payment.orderId = existingOrder._id;
      payment.stripeSessionId = sessionId;
      const pi = session?.payment_intent;
      if (pi) payment.stripePaymentIntentId = String(pi);
      await payment.save();
    }

    return {
      message: 'Плащането вече е потвърдено.',
      orderId: String(existingOrder._id),
      alreadyProcessed: true,
    };
  }

  // 5) Опитваме атомично да маркираме payment като paid (ако не е paid)
  // Ако някой друг вече е “спечелил”, updatedPayment ще е null.
  const pi = session?.payment_intent;
  const paymentUpdate = {
    status: 'paid',
    stripeSessionId: sessionId,
  };
  if (pi) paymentUpdate.stripePaymentIntentId = String(pi);

  const updatedPayment = await Payment.findOneAndUpdate(
    { _id: paymentId, status: { $ne: 'paid' } },
    { $set: paymentUpdate },
    { new: true }
  );

  // Ако вече е paid, продължаваме към “recovery” сценарий: платено без order
  // (например crash между paid и order creation)
  const paymentForOrder = updatedPayment || payment;

  // 6) Създаваме Order (само ако няма)
  const createdOrder = await Order.create({
    customer: draft.customer,
    shipping: draft.shipping,
    items: draft.items,
    totalPrice: draft.totalPrice,
    paymentMethod: 'card',
    // ✅ ВАЖНО: нямаш 'paid' в enum-а → използваме 'processing'
    status: 'processing',
    paymentId: paymentForOrder._id,
  });

  // 7) Записваме orderId в payment (дори да е бил paid от друг поток)
  await Payment.findByIdAndUpdate(paymentId, {
    $set: {
      orderId: createdOrder._id,
      status: 'paid',
      stripeSessionId: sessionId,
      ...(pi ? { stripePaymentIntentId: String(pi) } : {}),
    },
  });

  // 8) Mark draft used (best effort)
  try {
    await CheckoutDraft.findByIdAndUpdate(draftId, { $set: { status: 'used' } });
  } catch {}

  // 9) Emails (admin + customer) + продукт ID
  const itemsText = (draft.items || [])
    .map(
      (i) =>
        `- ${i.title} (ID: ${i.productId}) | количество: ${i.quantity} | цена: ${Number(
          i.unitPrice
        ).toFixed(2)} €`
    )
    .join('\n');

  const adminSubject = `Платена поръчка (карта) от ${draft.customer?.name} (Happy Colors)`;
  const adminText = `
Платена поръчка (Stripe)

Име: ${draft.customer?.name}
Имейл: ${draft.customer?.email}
Телефон: ${draft.customer?.phone}
Град: ${draft.customer?.city}
Адрес: ${draft.customer?.address}

Доставка: ${draft.shipping?.shippingMethod || '-'}
Еконт офис: ${draft.shipping?.econtOffice || '-'}
Спиди офис: ${draft.shipping?.speedyOffice || '-'}
Box Now: ${draft.shipping?.boxNow ? 'Да' : 'Не'}

Stripe Session ID: ${sessionId}
PaymentIntent ID: ${pi ? String(pi) : '-'}

Поръчани продукти:
${itemsText || '(няма продукти)'}

Обща сума: ${Number(draft.totalPrice || 0).toFixed(2)} €
Order ID: ${createdOrder._id}
`.trim();

  await sendEmail({ subject: adminSubject, text: adminText });

  const customerEmail = String(draft.customer?.email || '').trim();
  if (customerEmail && isValidEmail(customerEmail)) {
    const customerSubject = 'Поръчката ви е приета (Happy Colors)';
    const customerText = `
Здравейте, ${draft.customer?.name || ''}!

Поръчката ви е приета. Ще се свържем с вас при първа възможност.

Номер на поръчка: ${createdOrder._id}
Обща сума: ${Number(draft.totalPrice || 0).toFixed(2)} €

Поздрави,
Happy Colors
`.trim();

    await sendEmail({ to: customerEmail, subject: customerSubject, text: customerText });
  }

  return {
    message: 'Плащането е потвърдено успешно.',
    orderId: String(createdOrder._id),
    alreadyProcessed: false,
  };
}

/**
 * Създава Stripe Checkout Session + създава Draft/Payment (pending) в DB.
 * ❗ НЕ създаваме Order тук.
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
  const draftItems = mapped.map((x) => x.draftItem);
  const lineItems = mapped.map((x) => x.stripeLineItem);

  // 1) Draft
  const draft = await CheckoutDraft.create({
    customer: cleanCustomer,
    shipping: cleanShipping,
    items: draftItems,
    totalPrice: safeTotalPrice,
    currency: 'eur',
    status: 'open',
  });

  // 2) Payment
  const payment = await Payment.create({
    provider: 'stripe',
    amount: Math.round(safeTotalPrice * 100),
    currency: 'eur',
    status: 'pending',
    draftId: draft._id,
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
        paymentId: String(payment._id),
        draftId: String(draft._id),
      },
    });

    payment.stripeSessionId = String(session.id);
    await payment.save();

    return { url: session.url };
  } catch (err) {
    // rollback
    try {
      await Payment.findByIdAndDelete(payment._id);
    } catch {}
    try {
      await CheckoutDraft.findByIdAndDelete(draft._id);
    } catch {}

    throw new PaymentError(
      err?.message || 'Грешка при създаване на Stripe checkout сесия.',
      500
    );
  }
}

/**
 * CONFIRM:
 * - взима session от Stripe
 * - ползва общия finalizePaidCheckoutSession
 */
export async function confirmCardPaymentSession(sessionId = '') {
  const cleanSessionId = String(sessionId || '').trim();
  if (!cleanSessionId) throw new PaymentError('Липсва session_id.', 400);

  const stripe = getStripeClient();
  if (!stripe) throw new PaymentError('Stripe не е конфигуриран на сървъра.', 500);

  const session = await stripe.checkout.sessions.retrieve(cleanSessionId, {
    expand: ['payment_intent'],
  });

  return finalizePaidCheckoutSession(session);
}

export { PaymentError };
