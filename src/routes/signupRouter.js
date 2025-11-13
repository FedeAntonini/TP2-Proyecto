const express = require("express");
const routersignup = express.Router();
const passport = require("passport");

routersignup.get("/", (req, res) =>{
    res.render("signup", {title: "Register"});
});

routersignup.post("/", passport.authenticate("register", {
    failureRedirect: "/signup",
    successRedirect:"/login",
    passReqToCallback:true
}));

module.exports = routersignup;