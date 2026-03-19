// server/controllers/userController.js

import express from 'express';
import jwt from 'jsonwebtoken';
import { loginUser, registerUser } from '../services/userService.js';

const router = express.Router();

const ROUTES = {
  REGISTER: '/register',
  LOGIN: '/login',
  LOGOUT: '/logout',
  ME: '/me',
};

const COOKIE_NAME = 'token';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || String(secret).trim() === '') {
    throw new Error('JWT_SECRET липсва в environment variables.');
  }

  return secret;
}

function getCookieConfig() {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    sameSite: 'Lax',
    secure: isProduction,
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  };
}

function getClearCookieConfig() {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    sameSite: 'Lax',
    secure: isProduction,
    path: '/',
  };
}

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

    res.cookie(COOKIE_NAME, token, getCookieConfig());
    res.status(200).json(user);
  } catch (err) {
    if (err.message === 'JWT_SECRET липсва в environment variables.') {
      return res.status(500).json({ message: 'Проблем в конфигурацията на сървъра.' });
    }

    res.status(401).json({ message: 'Невалиден e-mail или парола' });
  }
});

router.post(ROUTES.LOGOUT, (req, res) => {
  res.clearCookie(COOKIE_NAME, getClearCookieConfig());
  res.status(204).end();
});

router.get(ROUTES.ME, (req, res) => {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ message: 'No token' });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());

    res.status(200).json({
      _id: decoded._id,
      username: decoded.username,
      email: decoded.email,
    });
  } catch (err) {
    if (err.message === 'JWT_SECRET липсва в environment variables.') {
      return res.status(500).json({ message: 'Проблем в конфигурацията на сървъра.' });
    }

    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;