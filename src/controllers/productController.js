const Product = require('../models/Product');

// Tüm ürünleri listeleme (filtreleme ve arama ile)
exports.getAllProducts = async (req, res) => {
  try {
    const queryObj = { isActive: true };

    // Arama işlemi
    if (req.query.search) {
      queryObj.name = { $regex: req.query.search, $options: 'i' };
    }

    // Kategori filtresi
    if (req.query.category) {
      queryObj.category = req.query.category;
    }

    // Fiyat aralığı filtresi
    if (req.query.minPrice || req.query.maxPrice) {
      queryObj.price = {};
      if (req.query.minPrice) queryObj.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) queryObj.price.$lte = Number(req.query.maxPrice);
    }

    // Sorguyu oluştur
    let query = Product.find(queryObj);

    // Sıralama
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt'); // Varsayılan sıralama
    }

    // Sayfalama
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    // Sorguyu çalıştır
    const products = await query;
    const total = await Product.countDocuments(queryObj);

    res.status(200).json({
      status: 'success',
      results: products.length,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      data: { products }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Diğer metodlar aynı kalacak...
exports.createProduct = async (req, res) => {
  try {
    const productData = { ...req.body, createdBy: req.user._id };
    const product = await Product.create(productData);
    
    res.status(201).json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Ürün bulunamadı'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Ürün bulunamadı'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Ürün bulunamadı'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Ürün başarıyla silindi'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};