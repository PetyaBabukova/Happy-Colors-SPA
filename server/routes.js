import express from 'express';
import userController from './controllers/userController.js';
import productsController from './controllers/productsController.js';
import categoryController from './controllers/categoryController.js';
import searchController from './controllers/searchController.js';
import contactsController from './controllers/contactsController.js';
import ordersController from './controllers/ordersController.js';
import paymentsController from './controllers/paymentsController.js';
import deliveryController from './controllers/deliveryController.js';

const router = express.Router();

router.use('/users', userController);
router.use('/products', productsController);
router.use('/categories', categoryController);
router.use('/search', searchController);
router.use('/contacts', contactsController);
router.use('/orders', ordersController);
router.use('/payments', paymentsController);
router.use('/delivery', deliveryController);

export default router;