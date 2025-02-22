const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, restrictTo } = require('../middlewares/auth');

// Tüm order rotaları için authentication gerekli
router.use(protect);

// Kullanıcı rotaları
router.post('/', orderController.createOrder);
router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrder);

// Admin rotaları
router.use(restrictTo('admin'));
router.get('/admin/all', orderController.getAllOrdersAdmin);
router.patch('/:id/status', orderController.updateOrderStatus);

module.exports = router;