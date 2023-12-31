const express = require('express');
const router = express.Router();
const publicControllers = require('../../controllers/public/publicControllers');

router.get('/products', publicControllers.getProducts);
router.get('/categories', publicControllers.getCategories);
router.get('/products/:id', publicControllers.getProductById);
router.get('/business/location', publicControllers.getBusinessLocation);
router.get('/business/publicInfo', publicControllers.getBussinessPublicInfo);

module.exports = router;