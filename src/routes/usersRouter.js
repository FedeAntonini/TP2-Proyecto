const express = require("express");
const usersModel = require("../data/mongo/models/usersModel");
const cartModel = require("../data/mongo/models/cartsModel");
const usersRouter = express.Router();
const { authenticateJWT } = require("../middlewares/auth/jwtAuth");


usersRouter.get("/", authenticateJWT, async(req,res)=>{
    if(req.user && req.user.admin){
        try {
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
            res.status(200).json({
                success: true,
                users: users
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }else{  
        res.status(403).json({
            success: false,
            error: "You don't have access to this section. Admin privileges required."
        });
    }
});

//Get User By ID, con JWT
usersRouter.get("/user/:uid", authenticateJWT, async(req,res)=>{
try {
    const { uid } = req.params;
    const loggedUserId = req.user._id.toString();

    if (uid !== loggedUserId) {
        return res.status(403).json({
            success: false,
            error: "Access denied. You can only view your own profile."
        });
    }
    const userDB = await usersModel.findById(uid, {
        _id: 1,
        firstname: 1,
        lastname: 1,
        age: 1,
        email: 1,
        premium: 1,
        admin: 1,
        last_connection: 1
    });
    if (!userDB) {
        return res.status(404).json({
            success: false,
            error: "User not found"
        });
    }

    res.status(200).json({
        success: true,
        user: userDB
    });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

//Get User Profile
usersRouter.get("/profile", authenticateJWT, async (req,res)=>{
    try{
        const dbUser = await usersModel.findById(req.user._id, {
            _id: 1,
            firstname: 1,
            lastname: 1,
            age: 1,
            email: 1,
            premium: 1,
            admin: 1,
            last_connection: 1
        });
        res.status(200).json({
            success: true,
            user: dbUser
        });
    }catch(error){
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
});

//Post User Fields
usersRouter.post("/profile", authenticateJWT, async (req,res)=>{
    try{
        const {firstname,lastname} = req.body;
        const dbUser = await usersModel.findByIdAndUpdate(
            { _id: req.user._id },
            { firstname, lastname}, 
            { new:true }
        );
        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                _id: dbUser._id,
                firstname: dbUser.firstname,
                lastname: dbUser.lastname,
                age: dbUser.age,
                email: dbUser.email,
                premium: dbUser.premium,
                admin: dbUser.admin,
                last_connection: dbUser.last_connection
            }
        });
    }catch(error){
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
});

//Change Premium Status (Admin only)
usersRouter.post("/premium/:uid", authenticateJWT, async(req,res) =>{
    if(req.user && req.user.admin){
        const { uid } = req.params;
        const { premium } = req.body;
        try{
            const user = await usersModel.findById(uid);
            if(!user){
                return res.status(404).json({
                    success: false,
                    error: "User not found"
                });
            }
            if(premium === "false"){
                user.premium = premium;
                const saveUser = await usersModel.findByIdAndUpdate(uid, user, { new: true });
                res.status(200).json({
                    success: true,
                    message: "User's premium status has been changed",
                    user: {
                        _id: saveUser._id,
                        premium: saveUser.premium
                    }
                });
            }else{
                // Si el usuario tiene documentos y son >= 3, o si no tiene documentos (para testing)
                // Permitir upgrade. Falta implementar metodos para subir documentos ya sea multer o cloud.
                if((user.documents && user.documents.length >= 3) || !user.documents || user.documents.length === 0){
                    user.premium = premium;
                    const saveUser = await usersModel.findByIdAndUpdate(uid, user, { new: true });
                    res.status(200).json({
                        success: true,
                        message: "User's premium status has been changed",
                        user: {
                            _id: saveUser._id,
                            premium: saveUser.premium
                        }
                    });
                }else{
                    res.status(400).json({
                        success: false,
                        error: "The user hasn't uploaded corresponding documents (requires 3 documents)"
                    });
                }
            }
        }catch(error){
            res.status(500).json({
                success: false,
                error: "Internal Server Error, could not change premium status"
            });
        }
    }else{
        res.status(401).json({
            success: false,
            error: "You don't have access to this section"
        });
    }
});

//Change Admin Status (Admin only)
usersRouter.post("/admin/:uid", authenticateJWT, async(req,res) =>{
    if(req.user && req.user.admin){
        const { uid } = req.params;
        const { admin } = req.body;
        try{
            const user = await usersModel.findById(uid);
            if(!user){
                return res.status(404).json({
                    success: false,
                    error: "User not found"
                });
            }
            user.admin = admin;
            const saveUser = await usersModel.findByIdAndUpdate(uid, user, { new: true });
            res.status(200).json({
                success: true,
                message: "User's admin status has been changed",
                user: {
                    _id: saveUser._id,
                    admin: saveUser.admin
                }
            });
        }catch(error){
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            });
        }
    }else{
        res.status(401).json({
            success: false,
            error: "You don't have access to this section"
        });
    }
});

//Logout (Update last connection)
usersRouter.get("/logout", authenticateJWT, async(req,res) =>{
    try {
        await usersModel.findOneAndUpdate({_id:req.user._id}, {last_connection: new Date()});
        res.status(200).json({
            success: true,
            message: "Logout successful. Last connection updated."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
});

//Delete inactive Accounts (Two Days Ago) - Admin only
usersRouter.get("/deleteAccounts", authenticateJWT, async(req,res)=>{
    if(req.user && req.user.admin){
        const twoDays = new Date();
        twoDays.setDate(twoDays.getDate() - 2);
        try{
            const result = await usersModel.deleteMany({last_connection: {$lt: twoDays} });
            res.status(200).json({
                success: true,
                message: `A total of ${result.deletedCount} accounts have been removed`,
                deletedCount: result.deletedCount
            });
        }catch(error){
            res.status(500).json({
                success: false,
                error: "Internal Server Error, Error deleting accounts"
            });
        }
    }else{
        res.status(401).json({
            success: false,
            error: "You don't have access to this section"
        });
    }
});

//Delete User By admin
usersRouter.post("/delete/:uid", authenticateJWT, async(req,res)=>{
    if(req.user && req.user.admin){
        const { uid } = req.params;
        try{
            const user = await usersModel.findById(uid);
            if(user){
                await usersModel.deleteOne({_id:uid});
                if(user.cartId){
                    await cartModel.deleteOne({_id: user.cartId});
                }
                res.status(200).json({
                    success: true,
                    message: "User deleted successfully"
                });
            }else{
                res.status(404).json({
                    success: false,
                    error: "User not found, couldn't delete user"
                });
            }
        }catch(error){
            res.status(500).json({
                success: false,
                error: "Internal Server Error, couldn't delete user"
            });
        }
    }else{
        res.status(401).json({
            success: false,
            error: "You don't have access to this section"
        });
    }
});
module.exports = usersRouter;