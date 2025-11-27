const express = require("express");
const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require("../controllers/products.controllers");
const productsRouter = express.Router();
const { authenticateJWT } = require("../middlewares/auth/jwtAuth");
const {isAdmin} = require("../middlewares/auth/isAdmin");
const {isAdminOrPremium} = require("../middlewares/auth/isAdminOrPremium");

// Get all products (Public - no auth required)
productsRouter.get("/", getAllProducts);

// Get product by ID (Public - no auth required)
productsRouter.get("/:pid", getProductById);

// Create product (Requires JWT - Admin or Premium)
productsRouter.post("/", authenticateJWT, isAdminOrPremium, createProduct);

// Update product (Requires JWT - Admin or Owner)
// Note: Controller validates ownership for premium users
productsRouter.put("/:pid", authenticateJWT, isAdminOrPremium, updateProduct);

// Delete product (Requires JWT - Admin or Owner)
// Note: Controller validates ownership for premium users
productsRouter.delete("/:pid", authenticateJWT, isAdminOrPremium, deleteProduct);

module.exports = productsRouter;

