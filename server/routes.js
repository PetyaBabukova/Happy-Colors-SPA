import express from 'express';
import userController from './controllers/userController.js';
import productsController from './controllers/productsController.js';
import jwt from 'jsonwebtoken'; // ⬅️ това липсваше

const router = express.Router();
const SECRET = process.env.SECRET; // ⬅️ това също липсваше

// ⬅️ Имаш си вече userController
router.use('/users', userController);
router.use('/products', productsController);



export default router;
