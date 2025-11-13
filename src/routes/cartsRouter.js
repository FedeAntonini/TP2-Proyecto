const express = require("express");
const {getAllCarts, getCartById, createCart, deleteAllProductsByCart, finalizePurchase , deleteProductByCart, addProductsToCart, updateProductByCart} = require("../controllers/carts.controllers");
const cartsRouter = express.Router();
const isAdmin = require("../middlewares/auth/isAdmin");

//Get all carts
cartsRouter.get("/", isAdmin, getAllCarts);

//Get Cart By Id
cartsRouter.get("/:cid", getCartById);

//Get Cart By anonymus
cartsRouter.get("/anonymus", getCartById);

//Create Cart
cartsRouter.post("/", isAdmin, createCart);

//Delete All Products By Cart
cartsRouter.get("/:cid/products", deleteAllProductsByCart);

//Delete Product By Cart
cartsRouter.get("/:cid/products/:pid", deleteProductByCart);

//Update Cart add/substract product
cartsRouter.put("/:cid/products/:pid", updateProductByCart);

//Add product to the cart
cartsRouter.post("/:cid", addProductsToCart);

//Finalize Purchase
cartsRouter.get("/:cid/purchase", finalizePurchase);

module.exports = cartsRouter;