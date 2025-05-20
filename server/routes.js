import express from 'express';
import userController from './controllers/userController.js';
import jwt from 'jsonwebtoken'; // ⬅️ това липсваше

const router = express.Router();
const SECRET = process.env.SECRET; // ⬅️ това също липсваше

// ⬅️ Имаш си вече userController
router.use('/users', userController);



export default router;
