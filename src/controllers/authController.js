const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '30d',
      algorithm: 'HS512' // Daha güçlü algoritma
    }
  );
};

exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Email benzersizliğini kontrol et
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Bu email adresi zaten kullanımda'
      });
    }

    // Yeni kullanıcı oluştur
    const user = await User.create({
      email,
      password,
      firstName,
      lastName
    });

    // Token oluştur
    const token = signToken(user._id);

    // Response headers güvenlik ayarları
    res.set({
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    });

    // Hassas bilgileri çıkar
    user.password = undefined;
    user.passwordChangedAt = undefined;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    res.status(201).json({
      status: 'success',
      token,
      data: { user }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Email ve şifre kontrolü
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Lütfen email ve şifre giriniz'
      });
    }

    // Kullanıcıyı bul
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Hatalı email veya şifre'
      });
    }

    // Hesap kilitli mi kontrol et
    if (user.accountLocked && user.lockUntil > Date.now()) {
      const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
      return res.status(401).json({
        status: 'error',
        message: `Hesabınız kilitlendi. ${remainingTime} dakika sonra tekrar deneyin.`
      });
    }

    // Şifre kontrolü
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      
      if (user.accountLocked) {
        return res.status(401).json({
          status: 'error',
          message: 'Çok fazla başarısız deneme. Hesabınız 30 dakika kilitlendi.'
        });
      }

      return res.status(401).json({
        status: 'error',
        message: 'Hatalı email veya şifre'
      });
    }

    // Başarılı giriş
    await user.successfulLogin();
    const token = signToken(user._id);

    // Response headers güvenlik ayarları
    res.set({
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    });

    // Hassas bilgileri çıkar
    user.password = undefined;
    user.passwordChangedAt = undefined;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    res.status(200).json({
      status: 'success',
      token,
      data: { user }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};