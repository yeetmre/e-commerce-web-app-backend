const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    // 1) Token'ı al
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Lütfen giriş yapın'
      });
    }

    // 2) Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Kullanıcıyı kontrol et
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Bu token\'a ait kullanıcı artık mevcut değil'
      });
    }

    // 4) Kullanıcıyı request'e ekle
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Geçersiz token'
    });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Bu işlemi yapmaya yetkiniz yok'
      });
    }
    next();
  };
};