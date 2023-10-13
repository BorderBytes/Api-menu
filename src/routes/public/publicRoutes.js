const express = require('express');
const router = express.Router();
const publicControllers = require('../../controllers/public/publicControllers');

router.get('/products', publicControllers.getProducts);
router.get('/categories', publicControllers.getCategories);
router.get('/products/:id', publicControllers.getProductById);

module.exports = router;