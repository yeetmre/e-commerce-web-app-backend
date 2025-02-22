const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Sepeti görüntüle
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price images');

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
        totalAmount: 0
      });
    }

    res.status(200).json({
      status: 'success',
      data: { cart }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Sepete ürün ekle
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Ürünü kontrol et
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Ürün bulunamadı'
      });
    }

    // Stok kontrolü
    if (product.stock < quantity) {
      return res.status(400).json({
        status: 'error',
        message: 'Yetersiz stok'
      });
    }

    // Sepeti bul veya oluştur
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
        totalAmount: 0
      });
    }

    // Ürün sepette var mı kontrol et
    const itemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId
    );

    if (itemIndex > -1) {
      // Ürün zaten sepette, miktarı güncelle
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Yeni ürün ekle
      cart.items.push({
        product: productId,
        quantity,
        price: product.price
      });
    }

    await cart.save();
    await cart.populate('items.product', 'name price images');

    res.status(200).json({
      status: 'success',
      data: { cart }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Sepetten ürün çıkar
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: 'Sepet bulunamadı'
      });
    }

    cart.items = cart.items.filter(item => 
      item.product.toString() !== productId
    );

    await cart.save();
    await cart.populate('items.product', 'name price images');

    res.status(200).json({
      status: 'success',
      data: { cart }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Sepet ürün miktarını güncelle
exports.updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // Miktar kontrolü
    if (quantity < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Miktar 1\'den küçük olamaz'
      });
    }

    // Ürün kontrolü
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Ürün bulunamadı'
      });
    }

    // Stok kontrolü
    if (product.stock < quantity) {
      return res.status(400).json({
        status: 'error',
        message: 'Yetersiz stok'
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: 'Sepet bulunamadı'
      });
    }

    const itemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Ürün sepette bulunamadı'
      });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    await cart.populate('items.product', 'name price images');

    res.status(200).json({
      status: 'success',
      data: { cart }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};