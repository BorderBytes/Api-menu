const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');

// Buscar Productos
router.get('/search', productsController.searchProducts); // Debe ir antes de /:id para que no tome 'search' como un id

// Crear un nuevo producto
router.post('/', productsController.createProduct);

// Seleccionar por id
router.get('/:id', productsController.getProductById);

// Cambia el estado de un producto
router.patch('/status/:id', productsController.toggleProductStatus);

// Actualizar un producto
router.put('/:id', productsController.updateProduct);

module.exports = router;
