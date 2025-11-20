require("dotenv").config();

const express = require("express");
const config = require("./src/config/config");
const loginRouter = require("./src/routes/loginRouter");
const signupRouter = require("./src/routes/signupRouter");
const mongoose = require("mongoose");
const app = express();
const usersRouter = require("./src/routes/usersRouter");
const cartsRouter = require("./src/routes/cartsRouter");

mongoose.connect(config.MONGO_URI)
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => console.error("MongoDB connection error:", err));

const httpServer = app.listen(config.PORT, ()=>{console.log(`Server running on port ${config.PORT}`)});

//Middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//Routes
app.get("/", (req,res)=>{
    res.status(200).json({
        success: true,
        message: "Server OK"
    });
});
app.use("/login", loginRouter);
app.use("/signup", signupRouter);
app.use("/api/users",usersRouter);
app.use("/api/carts", cartsRouter);

//404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: "Route not found"
    });
});