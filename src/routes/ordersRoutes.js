const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');

// Obtener los estados de orden
router.get('/status', ordersController.getAllOrderStatuses);

// Buscar Productos
router.get('/search', ordersController.searchOrders); // Debe ir antes de /:id para que no tome 'search' como un id

// Obtener orden por ID 
router.get('/:id', ordersController.getOrderById);

// Obtener productos de una orden
router.get('/products/:id', ordersController.getProductsByOrderId);


// Obtener los los de una orden en base a su id
router.get('/logs/:id', ordersController.getOrderLogsById);

module.exports = router;
