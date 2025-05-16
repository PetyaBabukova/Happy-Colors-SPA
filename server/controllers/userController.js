import express from 'express';
import { registerUser } from '../services/userService.js';

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

export default router;
