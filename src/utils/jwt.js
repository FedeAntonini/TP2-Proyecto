const jwt = require("jsonwebtoken");
const config = require("../config/config");

const generateToken = (user) => {
    const payload = {
        _id: user._id,
        email: user.email,
        admin: user.admin || false,
        premium: user.premium || false,
        cartId: user.cartId
    };

    return jwt.sign(payload, config.JWT_SECRET, {
        expiresIn: config.JWT_EXPIRES_IN || "24h"
    });
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, config.JWT_SECRET);
    } catch (error) {
        throw new Error("Invalid or expired token");
    }
};

const extractTokenFromHeader = (authHeader) => {
    if (!authHeader) return null;
    
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return null;
    }
    
    return parts[1];
};

module.exports = {
    generateToken,
    verifyToken,
    extractTokenFromHeader
};

