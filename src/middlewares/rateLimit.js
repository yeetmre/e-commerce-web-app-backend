const rateLimit = require('express-rate-limit');

// Genel API limiter
exports.apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100, // IP başına maksimum istek
    message: {
        status: 'error',
        message: 'Çok fazla istek yapıldı, lütfen 15 dakika sonra tekrar deneyin.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Login için özel limiter
exports.loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 saat
    max: 5, // IP başına maksimum 5 başarısız giriş denemesi
    message: {
        status: 'error',
        message: 'Çok fazla giriş denemesi yapıldı, lütfen 1 saat sonra tekrar deneyin.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Kayıt için özel limiter
exports.registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 saat
    max: 3, // IP başına maksimum 3 kayıt denemesi
    message: {
        status: 'error',
        message: 'Çok fazla kayıt denemesi yapıldı, lütfen 1 saat sonra tekrar deneyin.'
    }
});