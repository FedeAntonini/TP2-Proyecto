const express = require("express");
const {getAllCarts, getCartById, createCart, deleteAllProductsByCart, finalizePurchase , deleteProductByCart, addProductsToCart, updateProductByCart} = require("../controllers/carts.controllers");
const cartsRouter = express.Router();
const { isAdmin } = require("../middlewares/auth/isAdmin");
const { authenticateJWT } = require("../middlewares/auth/jwtAuth");



//  Finalize Purchase (tiene que estar ANTES del :cid)
cartsRouter.get("/:cid/purchase", authenticateJWT, finalizePurchase);

//Get all carts (Admin only)
cartsRouter.get("/", authenticateJWT, isAdmin, getAllCarts);

//Get Cart By Id
cartsRouter.get("/:cid", getCartById);

//Get Cart By anonymus
cartsRouter.get("/anonymus", getCartById);

//Create Cart (Admin only)
cartsRouter.post("/", authenticateJWT, isAdmin, createCart);

//Delete All Products By Cart
cartsRouter.get("/:cid/products", authenticateJWT, deleteAllProductsByCart);

//Delete Product By Cart
cartsRouter.get("/:cid/products/:pid", authenticateJWT, deleteProductByCart);

//Update Cart add/substract product
cartsRouter.put("/:cid/products/:pid", authenticateJWT, updateProductByCart);

//Add product to the cart
cartsRouter.post("/:cid", authenticateJWT, addProductsToCart);

//Finalize Purchase
//cartsRouter.get("/:cid/purchase", authenticateJWT, finalizePurchase);



module.exports = cartsRouter;