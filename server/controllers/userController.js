import express from 'express';
import { registerUser, loginUser } from '../services/userService.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json(user);
} catch (err) {
    let message = err.message;
  
    // Check if it's a Mongoose validation error
    if (err.name === 'ValidationError') {
      // Get the first field’s message only
      const firstError = Object.values(err.errors)[0];
      message = firstError?.message || 'Invalid input';
    }
  
    res.status(400).json({ message });
  }
  
});

router.post('/login', async (req, res) => {
    try {
      const { token, user } = await loginUser(req.body.email, req.body.password);
  
      res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'Lax',
        secure: false, // true в продукция
        maxAge: 24 * 60 * 60 * 1000,
        path: '/', // <--- ДОБАВИ ТОВА
      });
  
      res.status(200).json(user);
    } catch (err) {
      res.status(401).json({ message: 'Невалиден e-mail или парола' });
    }
  });

  router.post('/logout', (req, res) => {
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'Lax',
      secure: false,
      path: '/', // 🔥 задължително
    });
  
    res.status(204).end();
  });
  
  
  
  
  

export default router;
