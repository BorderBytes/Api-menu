const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

// Enviar un correo
router.get('/', emailController.sendMail);


module.exports = router;