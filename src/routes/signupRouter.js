const express = require("express");
const routersignup = express.Router();
const { signup } = require("../controllers/authController");

routersignup.post("/", signup);

module.exports = routersignup;