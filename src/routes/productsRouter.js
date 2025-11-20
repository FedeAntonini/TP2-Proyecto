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

// Get all products (Public - no auth required)
productsRouter.get("/", getAllProducts);

// Get product by ID (Public - no auth required)
productsRouter.get("/:pid", getProductById);

// Create product (Requires JWT - Admin or Premium)
productsRouter.post("/", authenticateJWT, createProduct);

// Update product (Requires JWT - Admin or Owner)
productsRouter.put("/:pid", authenticateJWT, updateProduct);

// Delete product (Requires JWT - Admin or Owner)
productsRouter.delete("/:pid", authenticateJWT, deleteProduct);

module.exports = productsRouter;

