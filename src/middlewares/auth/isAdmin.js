const { logger } = require("../../utils/logger");

const isAdmin = (req, res, next) => {
    // Log detallado para debugging
    if (req.user) {
        logger.debug(`isAdmin check - User: ${req.user.email}, admin value: ${req.user.admin}, type: ${typeof req.user.admin}`);
    } else {
        logger.warn(`isAdmin check - No user in request`);
    }

    if (req.user && req.user.admin === true) {
        logger.debug(`Admin access granted: ${req.user.email} - ${req.method} ${req.path}`);
        next();
    } else {
        logger.warn(`Admin access denied: ${req.user?.email || 'Anonymous'} - ${req.method} ${req.path}. Admin value: ${req.user?.admin}, type: ${typeof req.user?.admin}`);
        res.status(403).json({
            success: false,
            error: "You don't have access to this section. Admin privileges required."
        });
    }
};

module.exports = isAdmin;