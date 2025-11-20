const {Carts} = require("../dao/factory");
const {CartsRepository} = require("../repositories/carts.repository");
const cartsService = new CartsRepository(new Carts());

const {Products} = require("../dao/factory");
const {ProductsRepository} = require("../repositories/products.repository");
const productsService = new ProductsRepository(new Products());

const getAllCarts = async (req, res) =>{
    try {
        const cart = await cartsService.getCarts();
        res.status(200).send(cart);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const getCartById = async (req, res) =>{
    const {cid} = req.params;
    try {
        const cart = await cartsService.getOne(cid);
        if(!cart){
            return res.status(404).json({
                success: false,
                error: "Cart not found"
            });
        }
        let totalPrice = 0;
        for(let i = 0; i < cart.products.length; i++){
            totalPrice = totalPrice + (cart.products[i].quantity * cart.products[i].product.price);
        }
        res.status(200).json({
            success: true,
            cart: cart,
            totalPrice: totalPrice
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
};

const createCart = async (req, res) =>{
    try {
        const response = await cartsService.createCart();
        res.status(200).send({ message: "Cart created", response});
    }catch (err) {
        res.status(500).send(err.message);
    }
};

const deleteAllProductsByCart = async (req, res) =>{
    const { cid } = req.params;
    if(req.user && (req.user.cartId === cid || req.user.admin)){
        try{
            const response = await cartsService.deleteAllProducts(cid);
            res.status(200).json({
                success: true,
                message: "Empty cart successfully",
                cart: response
            });
        }catch (err) {
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
};

const deleteProductByCart = async (req, res) =>{
    const { cid } = req.params;
    const { pid } = req.params;
    if(req.user && (req.user.cartId === cid || req.user.admin)){
        try{
            const response = await cartsService.deleteProduct(cid,pid);
            res.status(200).json({
                success: true,
                message: "Product deleted from cart successfully",
                cart: response
            });
        }catch(err){
            res.status(500).json({
                success: false,
                error: err.message
            });
        }
    }else{
        res.status(401).json({
            success: false,
            error: "You don't have access to this section"
        });
    }
}

const addProductsToCart = async (req,res) =>{
    const { cid } = req.params;
    const {productId, quantity} = req.body;
    try {
        const result = await productsService.getOne(productId);
        if(!result){
            return res.status(404).json({
                success: false,
                error: "Product not found"
            });
        }
        // if(req.user && req.user.admin){
        //     return res.status(401).json({
        //         success: false,
        //         error: "You can't add products to cart as admin"
        //     });
        // }
        // if(req.user && req.user.premium && result.owner === req.user.email){
        //     return res.status(401).json({
        //         success: false,
        //         error: "You can't add your own products to cart"
        //     });
        // }
        if(quantity > result.stock){
            return res.status(400).json({
                success: false,
                error: "Error, product is not in stock"
            });
        }
        const response = await cartsService.addProduct(cid, productId, quantity);
        res.status(200).json({
            success: true,
            message: "Product added to cart",
            cart: response
        });
    }catch(error){
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }     
}

const updateProductByCart = async (req,res) =>{
    const { cid } = req.params;
    const { pid } = req.params;
    const quantityObj = req.body;
    const productObject = {
        _id: pid,
        quantity: quantityObj.quantity
    }
    
    try{
        const response = await cartsService.updateProduct(cid,productObject);
        res.status(200).json({
            success: true,
            message: "Product Updated",
            cart: response
        });
    }catch (err) {
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
}

const finalizePurchase = async (req,res) =>{
    const { cid } = req.params;
    if(!req.user){
        return res.status(401).json({
            success: false,
            error: "You must be logged in to finalize purchase"
        });
    }
    const user = req.user.email;
    try{
        const response = await cartsService.finalizePurchase(cid, user);
        res.status(200).json({
            success: true,
            message: "Successful purchase",
            purchase: response
        });
    }catch(error){
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
}

module.exports = {getAllCarts, getCartById, createCart, finalizePurchase, deleteAllProductsByCart, deleteProductByCart, updateProductByCart, addProductsToCart};