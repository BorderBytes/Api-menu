const express = require('express');
const passport = require('passport');
const path = require('path');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.get('/login', authController.getView);
router.use('/assets', express.static(path.join(__dirname, '../public/auth/assets')));
router.get('/logout', authController.logout);


module.exports = router;
