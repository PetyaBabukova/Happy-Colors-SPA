import express from 'express';
import jwt from 'jsonwebtoken';
import { loginUser, registerUser } from '../services/userService.js';

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'secret';

router.post('/register', async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    let message = err.message;
    if (err.name === 'ValidationError') {
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
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
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
    path: '/',
  });

  res.status(204).end();
});

router.get('/me', (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'No token' });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    res.status(200).json({
      _id: decoded._id,
      username: decoded.username,
      email: decoded.email,
    });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;
