const usersModel = require("../data/mongo/models/usersModel");
const cartModel = require("../data/mongo/models/cartsModel");
const { logger } = require("../utils/logger");

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
    if (!req.user || !req.user.admin) {
        return res.status(403).json({
            success: false,
            error: "You don't have access to this section. Admin privileges required."
        });
    }

    try {
        const users = await usersModel.find({}, {
            _id: 1,
            firstname: 1,
            lastname: 1,
            age: 1,
            email: 1,
            premium: 1,
            admin: 1,
            last_connection: 1
        });
        logger.info(`Users retrieved by admin: ${req.user.email}`);
        res.status(200).json({
            success: true,
            users: users
        });
    } catch (error) {
        logger.error(`Error getting users: ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get User By ID (User can only view their own profile)
const getUserById = async (req, res) => {
    try {
        const { uid } = req.params;
        const loggedUserId = req.user._id.toString();

        if (uid !== loggedUserId) {
            logger.warn(`Access denied: User ${req.user.email} tried to access user ${uid}`);
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
            logger.warn(`User not found: ${uid}`);
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        logger.info(`User profile retrieved: ${uid}`);
        res.status(200).json({
            success: true,
            user: userDB
        });
    } catch (error) {
        logger.error(`Error getting user by ID: ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get User Profile
const getUserProfile = async (req, res) => {
    try {
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
        logger.info(`Profile retrieved: ${req.user.email}`);
        res.status(200).json({
            success: true,
            user: dbUser
        });
    } catch (error) {
        logger.error(`Error getting user profile: ${error.message}`);
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
};

// Update User Profile
const updateUserProfile = async (req, res) => {
    try {
        const { firstname, lastname } = req.body;
        const dbUser = await usersModel.findByIdAndUpdate(
            { _id: req.user._id },
            { firstname, lastname },
            { new: true }
        );
        logger.success(`Profile updated: ${req.user.email}`);
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
    } catch (error) {
        logger.error(`Error updating user profile: ${error.message}`);
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
};

// Change Premium Status (Admin only)
const changePremiumStatus = async (req, res) => {
    if (!req.user || !req.user.admin) {
        return res.status(401).json({
            success: false,
            error: "You don't have access to this section"
        });
    }

    const { uid } = req.params;
    const { premium } = req.body;

    try {
        const user = await usersModel.findById(uid);
        if (!user) {
            logger.warn(`User not found for premium change: ${uid}`);
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        if (premium === "false") {
            user.premium = premium;
            const saveUser = await usersModel.findByIdAndUpdate(uid, user, { new: true });
            logger.success(`Premium status changed to false for user: ${uid} by admin: ${req.user.email}`);
            res.status(200).json({
                success: true,
                message: "User's premium status has been changed",
                user: {
                    _id: saveUser._id,
                    premium: saveUser.premium
                }
            });
        } else {
            // Si el usuario tiene documentos y son >= 3, o si no tiene documentos (para testing)
            // Permitir upgrade. Falta implementar metodos para subir documentos ya sea multer o cloud.
            if ((user.documents && user.documents.length >= 3) || !user.documents || user.documents.length === 0) {
                user.premium = premium;
                const saveUser = await usersModel.findByIdAndUpdate(uid, user, { new: true });
                logger.success(`Premium status changed to true for user: ${uid} by admin: ${req.user.email}`);
                res.status(200).json({
                    success: true,
                    message: "User's premium status has been changed",
                    user: {
                        _id: saveUser._id,
                        premium: saveUser.premium
                    }
                });
            } else {
                logger.warn(`Premium upgrade denied: User ${uid} hasn't uploaded required documents`);
                res.status(400).json({
                    success: false,
                    error: "The user hasn't uploaded corresponding documents (requires 3 documents)"
                });
            }
        }
    } catch (error) {
        logger.error(`Error changing premium status: ${error.message}`);
        res.status(500).json({
            success: false,
            error: "Internal Server Error, could not change premium status"
        });
    }
};

// Change Admin Status (Admin only)
const changeAdminStatus = async (req, res) => {
    if (!req.user || !req.user.admin) {
        return res.status(401).json({
            success: false,
            error: "You don't have access to this section"
        });
    }

    const { uid } = req.params;
    const { admin } = req.body;

    try {
        const user = await usersModel.findById(uid);
        if (!user) {
            logger.warn(`User not found for admin change: ${uid}`);
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        user.admin = admin;
        const saveUser = await usersModel.findByIdAndUpdate(uid, user, { new: true });
        logger.success(`Admin status changed for user: ${uid} by admin: ${req.user.email}`);
        res.status(200).json({
            success: true,
            message: "User's admin status has been changed",
            user: {
                _id: saveUser._id,
                admin: saveUser.admin
            }
        });
    } catch (error) {
        logger.error(`Error changing admin status: ${error.message}`);
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
};

// Logout (Update last connection)
const logout = async (req, res) => {
    try {
        await usersModel.findOneAndUpdate({ _id: req.user._id }, { last_connection: new Date() });
        logger.info(`Logout successful: ${req.user.email}`);
        res.status(200).json({
            success: true,
            message: "Logout successful. Last connection updated."
        });
    } catch (error) {
        logger.error(`Error during logout: ${error.message}`);
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
};

// Delete inactive Accounts (Two Days Ago) - Admin only
const deleteInactiveAccounts = async (req, res) => {
    if (!req.user || !req.user.admin) {
        return res.status(401).json({
            success: false,
            error: "You don't have access to this section"
        });
    }

    const twoDays = new Date();
    twoDays.setDate(twoDays.getDate() - 2);

    try {
        const result = await usersModel.deleteMany({ last_connection: { $lt: twoDays } });
        logger.success(`Inactive accounts deleted: ${result.deletedCount} by admin: ${req.user.email}`);
        res.status(200).json({
            success: true,
            message: `A total of ${result.deletedCount} accounts have been removed`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        logger.error(`Error deleting inactive accounts: ${error.message}`);
        res.status(500).json({
            success: false,
            error: "Internal Server Error, Error deleting accounts"
        });
    }
};

// Delete User By admin
const deleteUser = async (req, res) => {
    if (!req.user || !req.user.admin) {
        return res.status(401).json({
            success: false,
            error: "You don't have access to this section"
        });
    }

    const { uid } = req.params;

    try {
        const user = await usersModel.findById(uid);
        if (user) {
            await usersModel.deleteOne({ _id: uid });
            if (user.cartId) {
                await cartModel.deleteOne({ _id: user.cartId });
            }
            logger.success(`User deleted: ${uid} by admin: ${req.user.email}`);
            res.status(200).json({
                success: true,
                message: "User deleted successfully"
            });
        } else {
            logger.warn(`User not found for deletion: ${uid}`);
            res.status(404).json({
                success: false,
                error: "User not found, couldn't delete user"
            });
        }
    } catch (error) {
        logger.error(`Error deleting user: ${error.message}`);
        res.status(500).json({
            success: false,
            error: "Internal Server Error, couldn't delete user"
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    getUserProfile,
    updateUserProfile,
    changePremiumStatus,
    changeAdminStatus,
    logout,
    deleteInactiveAccounts,
    deleteUser
};

