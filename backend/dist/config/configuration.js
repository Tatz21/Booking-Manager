"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    port: parseInt(process.env.PORT || '3000', 10),
    environment: process.env.NODE_ENV || 'development',
    apiPrefix: process.env.API_PREFIX || '/api/v1',
    database: {
        url: process.env.DATABASE_URL,
    },
    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET,
        accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
    },
    razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID || '',
        keySecret: process.env.RAZORPAY_KEY_SECRET || '',
        webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
    },
    subscription: {
        priceInr: parseInt(process.env.SUBSCRIPTION_PLAN_PRICE_INR || '199', 10),
        trialDays: parseInt(process.env.SUBSCRIPTION_TRIAL_DAYS || '7', 10),
    },
    appUrl: process.env.APP_URL || 'http://localhost:3000',
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
    },
    throttler: {
        ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
        limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
    },
});
//# sourceMappingURL=configuration.js.map