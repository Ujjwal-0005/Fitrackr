import helmet from "helmet";
import rateLimit from "express-rate-limit";

/**
 * Configure Helmet for security headers
 */
export const configureHelmet = () => {
    return helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                imgSrc: ["'self'", "data:", "https:", "blob:"],
                scriptSrc: ["'self'"],
                connectSrc: ["'self'", "http://localhost:8080", "http://localhost:5173"],
            },
        },
        crossOriginEmbedderPolicy: false, // Allow embedding for development
        crossOriginResourcePolicy: { policy: "cross-origin" },
    });
};

/**
 * CORS configuration with credentials support
 */
export const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:3000',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:3000',
        ];

        // Add production origin from env
        if (process.env.FRONTEND_URL) {
            allowedOrigins.push(process.env.FRONTEND_URL);
        }

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    exposedHeaders: ['X-CSRF-Token'],
    maxAge: 86400, // 24 hours
};

/**
 * Rate limiter for authentication endpoints
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 100 : 10, // Much higher limit in development
    message: {
        message: "Too many authentication attempts. Please try again later.",
        retryAfter: 15 * 60, // seconds
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting in development for localhost
    skip: (req) => {
        return process.env.NODE_ENV === 'development' &&
            (req.ip === '127.0.0.1' || req.ip === '::1' || req.hostname === 'localhost');
    },
    // Skip successful requests from counting
    skipSuccessfulRequests: false,
});

/**
 * Rate limiter for general API endpoints
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 1000 : 100, // Much higher limit in development
    message: {
        message: "Too many requests. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting in development for localhost
    skip: (req) => {
        return process.env.NODE_ENV === 'development' &&
            (req.ip === '127.0.0.1' || req.ip === '::1' || req.hostname === 'localhost');
    },
});

/**
 * Strict rate limiter for password reset
 */
export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts per hour
    message: {
        message: "Too many password reset attempts. Please try again in an hour.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter for OTP endpoints
 */
export const otpLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 OTP requests per hour
    message: {
        message: "Too many OTP requests. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
