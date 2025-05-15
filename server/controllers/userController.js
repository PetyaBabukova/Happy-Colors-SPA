import express from 'express';
import { registerUser } from '../services/userService.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
