const express = require('express');
const router = express.Router();
const imagesController = require('../controllers/imagesController');

// Obtener una imagen por tipo/nombre
router.get('/:id', imagesController.getImage);