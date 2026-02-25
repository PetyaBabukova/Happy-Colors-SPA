import express from 'express';
import jwt from 'jsonwebtoken';
import { loginUser, registerUser } from '../services/userService.js';

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'secret';

// 🧾 Пътища
const ROUTES = {
  REGISTER: '/register',
  LOGIN: '/login',
  LOGOUT: '/logout',
  ME: '/me',
};

// 🍪 Cookie настройки
const COOKIE_NAME = 'token';
const COOKIE_CONFIG = {
  httpOnly: true,
  sameSite: 'Lax',
  secure: false, // 👉 Сложи true в продукция
  path: '/',
  maxAge: 24 * 60 * 60 * 1000, // 1 ден
};

router.post(ROUTES.REGISTER, async (req, res) => {
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

router.post(ROUTES.LOGIN, async (req, res) => {
  try {
    const { token, user } = await loginUser(req.body.email, req.body.password);

    res.cookie(COOKIE_NAME, token, COOKIE_CONFIG);
    res.status(200).json(user);
  } catch (err) {
    res.status(401).json({ message: 'Невалиден e-mail или парола' });
  }
});

router.post(ROUTES.LOGOUT, (req, res) => {
  res.clearCookie(COOKIE_NAME, COOKIE_CONFIG);
  res.status(204).end();
});

router.get(ROUTES.ME, (req, res) => {
  const token = req.cookies[COOKIE_NAME];

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
