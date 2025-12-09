// server/controllers/contactsController.js

import express from 'express';
import { handleContactForm } from '../services/contactsServices.js';

const router = express.Router();

// Хелпър за премахване на HTML тагове
function sanitizeText(input) {
  return String(input).replace(/<\/?[^>]+(>|$)/g, '').trim();
}

// Проверка за валиден email
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

router.post('/', async (req, res) => {
  try {
    const { name, email, phone = '', message } = req.body;

    // Задължителни полета
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Липсват задължителни полета.' });
    }

    // Валидации за дължини
    if (name.trim().length < 3 || name.trim().length > 20) {
      return res.status(400).json({ message: 'Името трябва да е между 3 и 20 символа.' });
    }

    if (phone && phone.trim().length > 20) {
      return res.status(400).json({ message: 'Телефонът е прекалено дълъг (макс. 20 символа).' });
    }

    if (message.trim().length > 200) {
      return res.status(400).json({ message: 'Съобщението е прекалено дълго (макс. 200 символа).' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Невалиден email формат.' });
    }

    // Забранени символи (HTML/code injection)
    const forbiddenPattern = /<[^>]*>/g;
    const allFields = [name, email, phone, message];
    if (allFields.some((val) => forbiddenPattern.test(String(val).trim()))) {
      return res.status(400).json({ message: 'Забранени символи в полетата!' });
    }

    // Санитизация на входа
    const cleanData = {
      name: sanitizeText(name),
      email: sanitizeText(email),
      phone: sanitizeText(phone),
      message: sanitizeText(message),
    };

    await handleContactForm(cleanData);
    res.status(200).json({ message: 'Съобщението беше изпратено успешно.' });
  } catch (err) {
    console.error('Грешка при контактна форма:', err);
    res.status(500).json({ message: 'Грешка при изпращане на съобщението.' });
  }
});

export default router;
