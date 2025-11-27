const { logger } = require("../../utils/logger");

const isAdminOrPremium = (req, res, next) => {
    if (req.user) {
        logger.debug(`isAdminOrPremium check - User: ${req.user.email}, admin: ${req.user.admin}, premium: ${req.user.premium}`);
    } else {
        logger.warn(`isAdminOrPremium check - No user in request`);
    }

    if (req.user && (req.user.admin === true || req.user.premium === true)) {
        logger.debug(`Admin or Premium access granted: ${req.user.email} - ${req.method} ${req.path}`);
        next();
    } else {
        logger.warn(`Admin or Premium access denied: ${req.user?.email || 'Anonymous'} - ${req.method} ${req.path}`);
        res.status(403).json({
            success: false,
            error: "You don't have access to this section. Admin or Premium privileges required."
        });
    }
};

module.exports = {
    isAdminOrPremium
};

