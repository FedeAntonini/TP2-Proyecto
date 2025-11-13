require("dotenv").config();

const express = require("express");
const config = require("./src/config/config");
const loginRouter = require("./src/routes/loginRouter");
const signupRouter = require("./src/routes/signupRouter");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const initializePassport = require("./src/config/passport.config");
const sessionRouter = require("./src/routes/sessionsRouter");
const passport = require("passport");
const app = express();
const usersRouter = require("./src/routes/usersRouter");

const httpServer = app.listen(config.PORT, ()=>{console.log(`Server running on port ${config.PORT}`)});

//Middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
initializePassport();
app.use(flash());
app.use(
    session({
        key: "EcommerceCookie",
        secret: "Cecommerce",
        resave: true,
        saveUninitialized: true,
        store: MongoStore.create({
            mongoUrl: config.MONGO_URI,
            ttl: 3600,
        }),
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use("/api/sessions", sessionRouter);

//Routes
app.get("/", (req,res)=>{
    res.status(200).redirect("/api/products");
});
app.use("/login", loginRouter);
app.use("/signup", signupRouter);
app.use("/api/users",usersRouter);
app.use((req, res, next) => {
    res.redirect('/api/products');
});