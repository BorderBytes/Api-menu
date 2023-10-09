const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');

// Buscar Productos
router.get('/search', ordersController.searchOrders); // Debe ir antes de /:id para que no tome 'search' como un id

module.exports = router;
