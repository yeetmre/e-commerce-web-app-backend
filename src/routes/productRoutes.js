const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, restrictTo } = require('../middlewares/auth');

// Açık rotalar
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProduct);

// Korumalı rotalar (sadece giriş yapmış kullanıcılar)
router.use(protect);

// Admin rotaları
router.use(restrictTo('admin'));
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;