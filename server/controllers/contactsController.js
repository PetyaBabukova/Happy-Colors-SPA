import express from 'express';
import { handleContactForm } from '../services/contactsServices.js';

const router = express.Router();

router.post('/', async (req, res) => {
  
  try {
    const { name, email, phone = '', message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Липсват задължителни полета.' });
    }

    // HTML/code injection защита
    const forbiddenPattern = /<[^>]*>/g;
    const allFields = [name, email, phone, message];
    if (allFields.some((val) => forbiddenPattern.test(String(val).trim()))) {
      return res.status(400).json({ message: 'Забранени символи в полетата!' });
    }

    await handleContactForm({ name, email, phone, message });
    res.status(200).json({ message: 'Съобщението беше изпратено успешно.' });
  } catch (err) {
    console.error('Грешка при контактна форма:', err);
    res.status(500).json({ message: 'Грешка при изпращане на съобщението.' });
  }
});

export default router;
