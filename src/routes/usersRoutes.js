const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

// Obtener todos los users
router.get('/', usersController.getUsers);

// Buscar users
router.get('/search', usersController.searchUsers); // Debe ir antes de /:id para que no tome 'search' como un id

// Obtener un cliente por ID
router.get('/:id', usersController.getUserById);

// Crear un nuevo usuario
router.post('/', usersController.createUser);

// Crear un nuevo usuario y cliente
router.post('/bundle', usersController.createBundleUser);

// Actualizar un usuario
router.put('/:id', usersController.updateUser);

module.exports = router;
