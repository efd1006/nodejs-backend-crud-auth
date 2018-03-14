const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth')

// controller
const OrdersController = require('../controllers/orders')

/* GET All order */
router.get('/', checkAuth, OrdersController.orders_get_all);

/* Single order */
router.get('/:id', checkAuth, OrdersController.orders_get_order);

/* SAVE order */ 
router.post('/', checkAuth, OrdersController.orders_create_order);

/* Delete order */
router.delete('/:id', checkAuth, OrdersController.orders_delete_order);

module.exports = router;