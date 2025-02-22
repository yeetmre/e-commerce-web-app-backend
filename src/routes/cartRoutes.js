const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middlewares/auth');

// Tüm cart rotaları için authentication gerekli
router.use(protect);

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.delete('/remove/:productId', cartController.removeFromCart);
router.patch('/update/:productId', cartController.updateCartItem);

module.exports = router;