const express = require("express");
const usersRouter = express.Router();
const { authenticateJWT } = require("../middlewares/auth/jwtAuth");
const {
    getAllUsers,
    getUserById,
    getUserProfile,
    updateUserProfile,
    changePremiumStatus,
    changeAdminStatus,
    logout,
    deleteInactiveAccounts,
    deleteUser
} = require("../controllers/users.controllers");

// Get all users (Admin only)
usersRouter.get("/", authenticateJWT, getAllUsers);

// Get User By ID (User can only view their own profile)
usersRouter.get("/user/:uid", authenticateJWT, getUserById);

// Get User Profile
usersRouter.get("/profile", authenticateJWT, getUserProfile);

// Update User Profile
usersRouter.post("/profile", authenticateJWT, updateUserProfile);

// Change Premium Status (Admin only)
usersRouter.post("/premium/:uid", authenticateJWT, changePremiumStatus);

// Change Admin Status (Admin only)
usersRouter.post("/admin/:uid", authenticateJWT, changeAdminStatus);

// Logout (Update last connection)
usersRouter.get("/logout", authenticateJWT, logout);

// Delete inactive Accounts (Two Days Ago) - Admin only
usersRouter.get("/deleteAccounts", authenticateJWT, deleteInactiveAccounts);

// Delete User By admin
usersRouter.post("/delete/:uid", authenticateJWT, deleteUser);

module.exports = usersRouter;