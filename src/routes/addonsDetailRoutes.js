const express = require('express');
const router = express.Router();
const addonsDetailController = require('../controllers/addonsDetailController');

// Obtener todos los detalles
router.get('/', addonsDetailController.getDetail);

// Buscar detalle
router.get('/search', addonsDetailController.searchAddonDetail); // Debe ir antes de /:id para que no tome 'search' como un id

// Obtener un detalle por ID
router.get('/:id', addonsDetailController.getAddonDetailById);

// Actualizar un detalle
router.put('/:id', addonsDetailController.updateAddonDetail);

// // Crear un addon
// router.post('/', addonsController.createAddon);

// Agregar información a determinado addon
router.post('/:id', addonsDetailController.createDetail);

// // Eliminar una categoría
// router.delete('/:id', addonsController.deleteAddon);

module.exports = router;