const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.admin) {
        next();
    } else {
        req.flash("error", "You don't have access to this section");
        res.status(401).redirect("/api/products");
    }
};

module.exports = isAdmin;