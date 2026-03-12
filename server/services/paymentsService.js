// server/services/paymentService.js

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
    const unitPrice = Number(item.price);
    const unitAmount = Math.round(unitPrice * 100);

    if (!title) {
      throw new PaymentError('Невалидно име на продукт.', 400);
    }

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

export async function finalizePaidCheckoutSession(session) {
  const sessionId = String(session?.id || '').trim();
  if (!sessionId) {
    throw new PaymentError('Липсва Stripe session id.', 400);
  }

  const isPaid = session?.payment_status === 'paid';
  if (!isPaid) {
    throw new PaymentError('Плащането не е потвърдено в Stripe.', 400);
  }

  const paymentId = String(session?.metadata?.paymentId || '').trim();
  const draftId = String(session?.metadata?.draftId || '').trim();

  if (!paymentId || !draftId) {
    throw new PaymentError('Липсва metadata (paymentId/draftId) в Stripe session.', 500);
  }

  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw new PaymentError('Payment не е намерен.', 404);
  }

  if (payment.stripeSessionId && payment.stripeSessionId !== sessionId) {
    throw new PaymentError('Несъответствие в Stripe session id.', 400);
  }

  const draft = await CheckoutDraft.findById(draftId).lean();
  if (!draft) {
    throw new PaymentError('Draft не е намерен.', 404);
  }

  const sessionAmountTotal = Number(session?.amount_total ?? 0);
  const sessionCurrency = String(session?.currency ?? '').toLowerCase();

  const expectedAmount = Math.round(Number(draft.totalPrice || 0) * 100);
  const expectedCurrency = 'eur';

  if (sessionCurrency && sessionCurrency !== expectedCurrency) {
    throw new PaymentError('Валутата в Stripe не съвпада с очакваната.', 400);
  }

  if (sessionAmountTotal && expectedAmount && sessionAmountTotal !== expectedAmount) {
    throw new PaymentError('Сумата в Stripe не съвпада с очакваната.', 400);
  }

  const existingOrder = await Order.findOne({ paymentId: payment._id }).lean();
  if (existingOrder) {
    if (payment.status !== 'paid' || !payment.orderId) {
      payment.status = 'paid';
      payment.orderId = existingOrder._id;
      payment.stripeSessionId = sessionId;

      const pi0 = session?.payment_intent;
      if (pi0) {
        payment.stripePaymentIntentId = String(pi0);
      }

      await payment.save();
    }

    return {
      message: 'Плащането вече е потвърдено.',
      orderId: String(existingOrder._id),
      alreadyProcessed: true,
    };
  }

  const pi = session?.payment_intent;
  const paymentUpdate = {
    status: 'paid',
    stripeSessionId: sessionId,
  };

  if (pi) {
    paymentUpdate.stripePaymentIntentId = String(pi);
  }

  const updatedPayment = await Payment.findOneAndUpdate(
    { _id: paymentId, status: { $ne: 'paid' } },
    { $set: paymentUpdate },
    { new: true }
  );

  const paymentForOrder = updatedPayment || payment;

  const createdOrder = await Order.create({
    customer: draft.customer,
    shipping: draft.shipping,
    items: draft.items,
    totalPrice: draft.totalPrice,
    paymentMethod: 'card',
    status: 'processing',
    paymentId: paymentForOrder._id,
  });

  await Payment.findByIdAndUpdate(paymentId, {
    $set: {
      orderId: createdOrder._id,
      status: 'paid',
      stripeSessionId: sessionId,
      ...(pi ? { stripePaymentIntentId: String(pi) } : {}),
    },
  });

  try {
    await CheckoutDraft.findByIdAndUpdate(draftId, { $set: { status: 'used' } });
  } catch {}

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
Адрес: ${draft.customer?.address || '-'}

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

    await sendEmail({
      to: customerEmail,
      subject: customerSubject,
      text: customerText,
    });
  }

  return {
    message: 'Плащането е потвърдено успешно.',
    orderId: String(createdOrder._id),
    alreadyProcessed: false,
  };
}

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
    paymentMethod = 'card',
    cartItems = [],
    totalPrice,
    shippingMethod = '',
    econtOffice = '',
    speedyOffice = '',
    boxNow = false,
  } = orderData;

  const safeName = String(name ?? '').trim();
  const safeEmail = String(email ?? '').trim();
  const safePhone = String(phone ?? '').trim();
  const safeCity = String(city ?? '').trim();
  const safeAddress = String(address ?? '').trim();
  const safeShippingMethod = String(shippingMethod ?? '').trim();
  const safeEcontOffice = String(econtOffice ?? '').trim();
  const safeSpeedyOffice = String(speedyOffice ?? '').trim();

  if (!safeName || !safeEmail || !safePhone || !safeCity) {
    throw new PaymentError('Липсват задължителни полета.', 400);
  }

  if (!isValidEmail(safeEmail)) {
    throw new PaymentError('Невалиден email формат.', 400);
  }

  if (!safeShippingMethod) {
    throw new PaymentError('Липсва информация за начина на доставка.', 400);
  }

  if (safeShippingMethod === 'econt' && !safeEcontOffice) {
    throw new PaymentError('Моля, изберете офис или автомат на Еконт.', 400);
  }

  if (safeShippingMethod === 'speedy' && !safeSpeedyOffice) {
    throw new PaymentError('Моля, изберете офис или автомат на Спиди.', 400);
  }

  if (safeShippingMethod === 'boxnow' && !safeAddress) {
    throw new PaymentError('Моля, въведете адрес за доставка.', 400);
  }

  if (safeShippingMethod === 'boxnow' && paymentMethod === 'cod') {
    throw new PaymentError('За Box Now е позволено само плащане с банкова карта.', 400);
  }

  const cleanCustomer = {
    name: sanitizeText(safeName),
    email: sanitizeText(safeEmail),
    phone: sanitizeText(safePhone),
    city: sanitizeText(safeCity),
    address: safeShippingMethod === 'boxnow' ? sanitizeText(safeAddress) : '',
    note: sanitizeText(note),
  };

  const cleanShipping = {
    shippingMethod: sanitizeText(safeShippingMethod),
    econtOffice: safeShippingMethod === 'econt' ? sanitizeText(safeEcontOffice) : '',
    speedyOffice: safeShippingMethod === 'speedy' ? sanitizeText(safeSpeedyOffice) : '',
    boxNow: Boolean(boxNow),
  };

  const safeTotalPrice = Number(totalPrice || 0);
  if (!Number.isFinite(safeTotalPrice) || safeTotalPrice <= 0) {
    throw new PaymentError('Невалидна обща сума.', 400);
  }

  const mapped = mapItems(cartItems);
  const draftItems = mapped.map((x) => x.draftItem);
  const lineItems = mapped.map((x) => x.stripeLineItem);

  const draft = await CheckoutDraft.create({
    customer: cleanCustomer,
    shipping: cleanShipping,
    items: draftItems,
    totalPrice: safeTotalPrice,
    currency: 'eur',
    status: 'open',
  });

  const payment = await Payment.create({
    provider: 'stripe',
    amount: Math.round(safeTotalPrice * 100),
    currency: 'eur',
    status: 'pending',
    draftId: draft._id,
  });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${clientUrl}/checkout/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/checkout/payment-cancel`,
      customer_email: cleanCustomer.email,
      metadata: {
        paymentId: String(payment._id),
        draftId: String(draft._id),
      },
    });

    const sessionId = String(session?.id || '').trim();
    if (!sessionId) {
      throw new PaymentError('Stripe не върна валиден session id.', 500);
    }

    payment.stripeSessionId = sessionId;
    await payment.save();

    return { url: session.url };
  } catch (err) {
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

  return finalizePaidCheckoutSession(session);
}

export { PaymentError };