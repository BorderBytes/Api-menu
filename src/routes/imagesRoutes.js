const express = require('express');
const router = express.Router();
const imagesController = require('../controllers/imagesController');

// Obtener info de folder
router.get('/:folder', imagesController.getFolder);
// Enviar imagen al cliente 
router.get('/:folder/:id/:filename', imagesController.getFile);

module.exports = router;