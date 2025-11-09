const express = require("express");
const routerLogin = express.Router();
const passport = require("passport");

routerLogin.get("/", (req, res) =>{
    res.render("login", {title: "Login"});
});

routerLogin.post("/", passport.authenticate("login", {failureRedirect:"/login"}),async (req,res) =>{
    req.session.user = {
        _id: req.user._id,
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        age: req.user.age,
        admin: req.user.admin,
        email: req.user.email,
        cartId: req.user.cartId,
        premium: req.user.premium
    }
    res.status(200).redirect("api/products");
});

module.exports = routerLogin;
