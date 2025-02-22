const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Sipariş oluştur
exports.createOrder = async (req, res) => {
  try {
    // Kullanıcının sepetini bul
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Sepetiniz boş'
      });
    }

    const { shippingAddress, paymentMethod } = req.body;

    // Stok kontrolü
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (product.stock < item.quantity) {
        return res.status(400).json({
          status: 'error',
          message: `${product.name} için yeterli stok yok`
        });
      }
    }

    // Sipariş oluştur
    const order = await Order.create({
      user: req.user._id,
      items: cart.items,
      totalAmount: cart.totalAmount,
      shippingAddress,
      paymentMethod
    });

    // Stokları güncelle
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // Sepeti temizle
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    await order.populate('items.product');

    res.status(201).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Tüm siparişleri getir
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: { orders }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Tek sipariş detayını getir
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('items.product');

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Sipariş bulunamadı'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Sipariş durumunu güncelle (Admin için)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Sipariş bulunamadı'
      });
    }

    order.status = status;
    await order.save();
    await order.populate('items.product');

    res.status(200).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Admin için tüm siparişleri listele
exports.getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'email firstName lastName')
      .populate('items.product')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: { orders }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};