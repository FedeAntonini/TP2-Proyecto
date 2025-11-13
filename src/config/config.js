// Build MongoDB connection string from environment variables
const buildMongoUri = () => {
    const DB_USER = process.env.DB_USER || null;
    const DB_PASS = process.env.DB_PASS || null;
    const DB_NAME = process.env.DB_NAME || null;
    const DB_HOST = process.env.DB_HOST || null;
    const DB_USE_SRV = process.env.DB_USE_SRV === 'true' || false;

    // Build URI from individual components
    if (DB_USER && DB_PASS && DB_HOST && DB_NAME) {
        const protocol = DB_USE_SRV ? 'mongodb+srv' : 'mongodb';
        const port = DB_USE_SRV ? '' : ':27017';
        return `${protocol}://${DB_USER}:${DB_PASS}@${DB_HOST}${port}/${DB_NAME}?appName=coderclone`;
    } 
    else if (DB_USER && DB_PASS && DB_HOST) {
        const protocol = DB_USE_SRV ? 'mongodb+srv' : 'mongodb';
        const port = DB_USE_SRV ? '' : ':27017';
        const dbName = DB_NAME || 'ecommerce';
        return `${protocol}://${DB_USER}:${DB_PASS}@${DB_HOST}${port}/${dbName}?appName=coderclone`;
    }
    else if (DB_NAME) {
        return `mongodb://localhost:27017/${DB_NAME}`;
    } 
    else {
        return "mongodb://localhost:27017/ecommerce";
    }
};

const config = {
    PORT: process.env.PORT || 8081,
    DB_USER: process.env.DB_USER || null,
    DB_PASS: process.env.DB_PASS || null,
    DB_NAME: process.env.DB_NAME || null,
    DB_HOST: process.env.DB_HOST || null,
    DB_USE_SRV: process.env.DB_USE_SRV === 'true' || false,
    MONGO_URI: buildMongoUri(),
    JWT_SECRET: process.env.JWT_SECRET || "your-secret-key-change-in-production",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "24h",
    EMAIL_USER: process.env.EMAIL_USER || null,
    STRIPE_KEY: process.env.STRIPE_KEY || null
};

module.exports = config;