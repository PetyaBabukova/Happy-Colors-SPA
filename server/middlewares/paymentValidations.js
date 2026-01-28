// server/middlewares/paymentValidations.js

import mongoose from 'mongoose';

export function validateCreatePaymentSession(req, res, next) {
  const { orderId } = req.body || {};

  // 1) Body existence
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({
      message: 'Невалидно тяло на заявката.',
    });
  }

  // 2) orderId presence
  if (!orderId) {
    return res.status(400).json({
      message: 'Липсва orderId.',
    });
  }

  // 3) orderId format (Mongo ObjectId)
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({
      message: 'Невалиден формат на orderId.',
    });
  }

  // 4) OK
  next();
}
