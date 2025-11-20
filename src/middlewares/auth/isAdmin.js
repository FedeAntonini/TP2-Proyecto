const { logger } = require("../../utils/logger");

const isAdmin = (req, res, next) => {
    if (req.user && req.user.admin) {
        logger.debug(`Admin access granted: ${req.user.email} - ${req.method} ${req.path}`);
        next();
    } else {
        logger.warn(`Admin access denied: ${req.user?.email || 'Anonymous'} - ${req.method} ${req.path}`);
        res.status(403).json({
            success: false,
            error: "You don't have access to this section. Admin privileges required."
        });
    }
};

module.exports = isAdmin;