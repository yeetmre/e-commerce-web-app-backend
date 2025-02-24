const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

exports.securityMiddleware = [
    // Basic security headers
    helmet(),
    
    // Content Security Policy
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    }),

    // NoSQL injection koruması
    mongoSanitize(),

    // XSS koruması
    (req, res, next) => {
        res.setHeader('X-XSS-Protection', '1; mode=block');
        next();
    },

    // Clickjacking koruması
    (req, res, next) => {
        res.setHeader('X-Frame-Options', 'DENY');
        next();
    },

    // MIME type sniffing koruması
    (req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        next();
    },

    // CORS headers
    (req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        next();
    },

    // Request size limiti
    (req, res, next) => {
        if (req.headers['content-length'] && req.headers['content-length'] > 10 * 1024 * 1024) { // 10MB
            return res.status(413).json({
                status: 'error',
                message: 'Payload too large'
            });
        }
        next();
    }
];