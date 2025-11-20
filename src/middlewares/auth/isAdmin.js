const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.admin) {
        next();
    } else {
        res.status(401).json({
            success: false,
            error: "You don't have access to this section"
        });
    }
};

module.exports = isAdmin;