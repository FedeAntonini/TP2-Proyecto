const express = require("express");
const app = express();
const usersRouter = require("./src/routes/usersRouter");
const STRING_CONNECTION = ``;

const httpServer = app.listen(config.PORT, ()=>{logger.info(`Server running on port ${config.PORT}`)});

//Middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(flash());
app.use(
    session({
        key: "EcommerceCookie",
        secret: "Cecommerce",
        resave: true,
        saveUninitialized: true,
        store: MongoStore.create({
            mongoUrl: STRING_CONNECTION,
            mongoOptions: {
                useUnifiedTopology: true,
            },
            ttl: 3600,
        }),
    })
);
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