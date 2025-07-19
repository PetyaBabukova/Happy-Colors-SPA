import express from 'express';
import userController from './controllers/userController.js';
import productsController from './controllers/productsController.js';
import categoryController from './controllers/categoryController.js';
import searchController from './controllers/searchController.js';
import contactsController from './controllers/contactsController.js';

const router = express.Router();

// ⬅️ Имаш си вече userController
router.use('/users', userController);
router.use('/products', productsController);
router.use('/categories', categoryController);
router.use('/search', searchController);
router.use('/contacts', contactsController);




export default router;
