const express = require("express");
const routerLogin = express.Router();
const { login } = require("../controllers/authController");

routerLogin.get("/", (req, res) =>{
    res.status(200).json({
        message: "Login endpoint. Send POST /login with email and password."
    });
});

routerLogin.post("/", login);

module.exports = routerLogin;
