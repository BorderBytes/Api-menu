const express = require('express');
const router = express.Router();
const gitController = require('../controllers/gitController');

// Obtener todos los addons
router.get('/git-status', gitController.gitStatus);
router.get('/git-history', gitController.gitHistory);
router.get('/restore/:hash', gitController.checkoutToCommit);

module.exports = router;