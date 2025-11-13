const config = {
    PORT: process.env.PORT || 8081,
    DB_USER: process.env.DB_USER || null,
    DB_PASS: process.env.DB_PASS || null,
    DB_NAME: process.env.DB_NAME || null,
    EMAIL_USER: process.env.EMAIL_USER || null,
    STRIPE_KEY: process.env.STRIPE_KEY || null
};

module.exports = config;