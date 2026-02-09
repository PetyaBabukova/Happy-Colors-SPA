// server/middlewares/paymentValidations.js

const forbiddenPattern = /<[^>]*>/g;

function hasForbiddenHtml(value) {
  return forbiddenPattern.test(String(value ?? '').trim());
}

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(String(email ?? '').trim());
}

export function validateCreatePaymentSession(req, res, next) {
  try {
    const {
      email,
      cartItems = [],
      totalPrice,
      shippingMethod = '',
      econtOffice = '',
      speedyOffice = '',
      name = '',
      phone = '',
      city = '',
      address = '',
      note = '',
      boxNow = false,
    } = req.body || {};

    // 1) Минимални задължителни за Stripe session
    if (!email) {
      return res.status(400).json({ message: 'Липсва email.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Невалиден email формат.' });
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: 'Количката е празна или невалидна.' });
    }

    // 2) Валидация на cartItems
    for (const item of cartItems) {
      if (!item || typeof item !== 'object') {
        return res.status(400).json({ message: 'Невалиден продукт в количката.' });
      }

      if (!item.title || String(item.title).trim().length < 1) {
        return res.status(400).json({ message: 'Липсва име на продукт.' });
      }

      const qty = Number(item.quantity);
      const price = Number(item.price);

      if (!Number.isFinite(qty) || qty < 1) {
        return res.status(400).json({ message: 'Невалидно количество на продукт.' });
      }

      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({ message: 'Невалидна цена на продукт.' });
      }

      // basic HTML guard
      if (hasForbiddenHtml(item.title)) {
        return res.status(400).json({ message: 'Забранени символи в данните за продукт.' });
      }
    }

    const total = Number(totalPrice);
    if (!Number.isFinite(total) || total <= 0) {
      return res.status(400).json({ message: 'Невалидна обща сума.' });
    }

    // 3) Лека защита за текстови полета (ако ги пращаме)
    const textFields = [shippingMethod, econtOffice, speedyOffice, name, phone, city, address, note];
    if (textFields.some((v) => hasForbiddenHtml(v))) {
      return res.status(400).json({ message: 'Забранени символи в полетата!' });
    }

    // 4) boxNow трябва да е boolean-изируем
    req.body.boxNow = Boolean(boxNow);

    next();
  } catch (err) {
    console.error('validateCreatePaymentSession error:', err);
    return res.status(500).json({ message: 'Грешка при валидация на плащането.' });
  }
}
