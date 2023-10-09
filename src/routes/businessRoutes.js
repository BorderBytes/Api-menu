const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');

// Obtener la info del negocio
router.get('/', businessController.getInfoBusiness);

// Obtener la ubicación del negocio
router.get('/directions', businessController.getDirectionBusiness);

// Actualizar la info del negocio
router.put('/:id', businessController.updateInfoBusiness);

// Actualizar la dirección
router.put('/directions', businessController.updateDirectionBusiness);

// Seleccionar los horarios
router.get('/schedules', businessController.getAllSchedules);

// Actualizar los horarios
router.post('/schedules', businessController.insertSchedule);

// Cambiar imagen perfil
router.patch('/profilePicture', businessController.changeProfileImage);

// Cambiar imagen cover
router.patch('/coverImage', businessController.changeCoverPicture);

// Cambiar contraseña
router.patch('/password', businessController.updatePassword);

module.exports = router;