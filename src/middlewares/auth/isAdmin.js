const isAdmin = (req, res, next) => {
    if (req.user && req.user.admin) {
        next();
    } else {
        res.status(403).json({
            success: false,
            error: "You don't have access to this section. Admin privileges required."
        });
    }
};

module.exports = isAdmin;