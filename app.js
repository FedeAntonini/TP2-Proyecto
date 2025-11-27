require("dotenv").config();

const express = require("express");
const config = require("./src/config/config");
const { httpLogger, logger } = require("./src/utils/logger");
const loginRouter = require("./src/routes/loginRouter");
const signupRouter = require("./src/routes/signupRouter");
const mongoose = require("mongoose");
const app = express();
const usersRouter = require("./src/routes/usersRouter");
const cartsRouter = require("./src/routes/cartsRouter");
const productsRouter = require("./src/routes/productsRouter");
const ticketsRouter = require("./src/routes/ticketsRouter");



// MongoDB connection
mongoose.connect(config.MONGO_URI)
    .then(() => logger.success("MongoDB connected successfully"))
    .catch((err) => logger.error("MongoDB connection error:", err));

const httpServer = app.listen(config.PORT, () => {
    logger.success(`Server running on port ${config.PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

//Middlewares
app.use(httpLogger); // HTTP request logging
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use("/api/tickets", ticketsRouter);

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
app.use("/api/products", productsRouter);

//404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: "Route not found"
    });
});