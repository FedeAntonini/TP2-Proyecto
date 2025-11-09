const passport = require("passport");
const local = require("passport-local");
const usersModel = require("../data/mongo/models/usersModel");
const bcrypt = require("bcrypt");
const cartModel = require("../data/mongo/models/cartsModel");

const LocalStrategy = local.Strategy;
const initializePassport = () =>{
    passport.serializeUser((user,done) =>{
        done(null,user.id);
    });
    passport.deserializeUser(async (id, done) =>{
        let user = await usersModel.findById(id);
        done(null, user);
    });
    passport.use("register", new LocalStrategy(
        {passReqToCallback:true, usernameField: "email"}, async(req,username,password,done)=>{
            const {firstname, lastname, email, age, confirm_password} = req.body;
            try{
                let user = await usersModel.findOne({email:username});
                if(user){
                    return done(null, false, req.flash("error","This account is already registered!"));
                }else if(!email || !firstname || !lastname || !age || !password || !confirm_password){
                    return done(null, false, req.flash("error","Missing data"));
                }else if(password !== confirm_password) return done(null,false, req.flash("error","Passwords don't match"))
                else{
                    const newCart = new cartModel();
                    await newCart.save();

                    const newUser = {
                        firstname,
                        lastname,
                        email,
                        age,
                        password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
                        cartId: newCart._id
                    }

                    let result = await usersModel.create(newUser);
                    return done(null,result);
                }
            }catch(error){
                return done("Error:" + error);
            }
        }
    ));
    passport.use("login", new LocalStrategy(
        {passReqToCallback:true,usernameField: "email"}, async(req,username, password,done)=>{
        try{
            const user = await usersModel.findOne({email:username});
            if(!user)return done(null,false,req.flash("error","This account doesn't exist or your account was eliminated."));
            if(!bcrypt.compareSync(password,user.password)) return done(null, false, req.flash("error", "Your password is incorrect"));

            const saveDate = await usersModel.findOneAndUpdate({email:username}, {last_connection: new Date()});
            return done(null,user);
        }catch(error){
            return done(error);
        }
    }));
};

module.exports = initializePassport;