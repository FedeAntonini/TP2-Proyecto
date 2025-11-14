const { verifyToken, extractTokenFromHeader } = require("../../utils/jwt");
const usersModel = require("../../data/mongo/models/usersModel");

const authenticateJWT = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = extractTokenFromHeader(authHeader);

        if (!token) {
            return res.status(401).json({
                success: false,
                error: "No token provided. Authorization header required: Bearer <token>"
            });
        }

        const decoded = verifyToken(token);

        const userId = decoded._id || decoded.id;
        const user = await usersModel.findById(userId);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: "User not found"
            });
        }

        req.user = {
            _id: user._id,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            age: user.age,
            admin: user.admin,
            premium: user.premium,
            cartId: user.cartId
        };

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: error.message || "Authentication failed"
        });
    }
};


const optionalJWT = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = extractTokenFromHeader(authHeader);

        if (token) {
            const decoded = verifyToken(token);
            const user = await usersModel.findById(decoded._id);
            
            if (user) {
                req.user = {
                    _id: user._id,
                    email: user.email,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    age: user.age,
                    admin: user.admin,
                    premium: user.premium,
                    cartId: user.cartId
                };
            }
        }
    } catch (error) {
        // Nos chupa un huevo si hay error total es opcional
    }
    
    next();
};

module.exports = {
    authenticateJWT,
    optionalJWT
};

