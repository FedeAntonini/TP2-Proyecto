const express = require("express");
const usersModel = require("../data/mongo/models/usersModel");
const cartModel = require("../data/mongo/models/cartsModel");
const usersRouter = express.Router();

//Get All users
usersRouter.get("/", async(req,res)=>{
    if(req.session.user.admin){
        const users = await usersModel.find({},{
            _id: 1,
            firstname: 1,
            lastname: 1,
            age: 1,
            email: 1,
            premium: 1,
            admin: 1,
            last_connection: 1
        });
        res.status(200).render("users.handlebars", {users});
    }else{  
        req.flash("error", "You don't have access to this section");
        res.status(401).redirect("/api/products");
    }
});

//Get User By ID (View for the admin)
usersRouter.get("/user/:uid", async(req,res)=>{
    if(req.session.user.admin){
        const { uid } = req.params;
        const userDB = await usersModel.findById(uid,{
            _id: 1,
            firstname: 1,
            lastname: 1,
            age: 1,
            email: 1,
            premium: 1,
            admin: 1,
            last_connection: 1
        });
        res.status(200).render("userId.handlebars", {userDB});
    }else{  
        req.flash("error", "You don't have access to this section");
        res.status(401).redirect("/api/products");
    }
});

//Get User By ID (View for the user), render Profile
usersRouter.get("/profile", async (req,res)=>{
    if(req.session.user){
        try{
            const dbUser = await usersModel.findById(req.session.user._id);
            res.status(201).render("profile",{dbUser});
        }catch(error){
            req.flash("error",`Internal Server Error`);
            res.status(500).redirect("/api/products");
        }
    }else{
        req.flash("error", "You don't have access to this section");
        res.status(401).redirect("/api/products");
    }
});

//Post User Fields
usersRouter.post("/profile", async (req,res)=>{
    if(req.session.user){
        try{
            const {firstname,lastname} = req.body;
            const dbUser = await usersModel.findByIdAndUpdate(
                { _id: req.session.user._id },
                { firstname, lastname}, 
                { new:true }
            );
            req.session.user.firstname = firstname;
            req.session.user.lastname = lastname;
            res.status(200).render("profile", {dbUser})
        }catch(error){
            req.flash("error",`Internal Server Error`);
            res.status(500).redirect("/api/products");
        }
    }else{
        req.flash("error", "You don't have access to this section");
        res.status(401).redirect("/api/products");
    }
});

//Change Premium Status
usersRouter.post("/premium/:uid", async(req,res) =>{
    if(req.session.user.admin){
        const { uid } = req.params;
        const { premium } = req.body;
        try{
            const user = await usersModel.findById(uid);
            if(premium === "false"){
                user.premium = premium;
                const saveUser = await usersModel.findByIdAndUpdate(uid, user);
                req.flash("success",`User's premium status has been changed`);
                res.status(200).redirect("/api/products");
            }else{
                if(user.documents.length >= 3){
                    user.premium = premium;
                    const saveUser = await usersModel.findByIdAndUpdate(uid, user);
                    req.flash("success",`User's premium status has been changed`);
                    res.status(200).redirect("/api/products");
                }else{
                    req.flash("error",`The user hasn't uploaded corresponding documents`);
                    res.status(401).redirect("/api/products");
                }
            }
        }catch(error){
            req.flash("error",`Internal Server Error, could not change premium status`);
            res.status(500).redirect("/api/products");
        }
    }else{
        req.flash("error", "You don't have access to this section");
        res.status(401).redirect("/api/products");
    }
});

//Change Admin Status
usersRouter.post("/admin/:uid", async(req,res) =>{
    if(req.session.user.admin){
        const { uid } = req.params;
        const { admin } = req.body;
        try{
            const user = await usersModel.findById({uid});
            user.admin = admin;
            const saveUser = await usersModel.findByIdAndUpdate(uid, user);
            req.flash("success",`User's admin status has been changed`);
            res.status(200).redirect("/api/products");
        }catch(error){
            req.flash("error",`Internal Server Error`);
            res.status(500).redirect("/api/products");
        }
    }else{
        req.flash("error", "You don't have access to this section");
        res.status(401).redirect("/api/products");
    }
});

//Destroy Session
usersRouter.get("/logout", async(req,res) =>{
    if(req.session.user){
        const saveDate = await usersModel.findOneAndUpdate({_id:req.session.user._id}, {last_connection: new Date()});
        req.session.destroy();
        res.status(200).redirect("/login");
    }else{
        res.status(200).redirect("/login");
    }
});

//Delete inactive Accounts (Two Days Ago)
usersRouter.get("/deleteAccounts", async(req,res)=>{
    if(req.session.user.admin){
        const twoDays = new Date();
        twoDays.setDate(twoDays.getDate() - 2);
        try{
            const result = await usersModel.deleteMany({last_connection: {$lt: twoDays} });
            req.flash("success",`A total of ${result.deletedCount} accounts have been removed`)
            res.status(200).redirect("/api/products");
        }catch(error){
            req.flash("error",`Internal Server Error, Error deleting accounts`);
            res.status(500).redirect("/api/products");
        }
    }else{
        req.flash("error", "You don't have access to this section");
        res.status(401).redirect("/api/products");
    }
});

//Delete User By admin
usersRouter.post("/delete/:uid", async(req,res)=>{
    if(req.session.user.admin){
        const { uid } = req.params;
        try{
            const user = await usersModel.deleteOne({_id:uid});
            if(user){
                const deleteCart = await cartModel.deleteOne(user.cartId);
                req.flash("success","User deleted successfully");
                res.status(200).redirect("/api/users");
            }else{
                req.flash("error","User not found, couldn't delete user");
                res.status(404).redirect("/api/users");
            }
        }catch(error){
            req.flash("error",`Internal Server Error, couldn't delete user`);
            res.status(500).redirect("/api/users");
        }
    }else{
        req.flash("error", "You don't have access to this section");
        res.status(401).redirect("/api/products");
    }
});
module.exports = usersRouter;