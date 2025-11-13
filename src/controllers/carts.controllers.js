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
    if(req.session.user){
        const {cid} = req.params;
        try {
            let totalPrice = 0;
            const cart = await cartsService.getOne(cid);
            for(let i = 0; i < cart.products.length; i++){
                totalPrice = totalPrice + (cart.products[i].quantity * cart.products[i].product.price);
            }
            res.status(200).render("cartId", {cart:cart, totalPrice:totalPrice});
        } catch (err) {
            req.flash("error", "Internal Server Error");
            res.status(500).redirect("/api/products");
        }
    }else{
        res.render("cartId", {});
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
    if(req.session.user.cartId === cid | req.session.user.admin){
        try{
            const response = await cartsService.deleteAllProducts(cid);
            req.flash("success","Empty cart successfully");
            res.status(200).redirect(`/api/carts/${cid}`);
        }catch (err) {
            console.log(err);
            res.status(500).redirect(`/api/carts/${cid}`)
        }
    }else{
        req.flash("error", "You don't have access to this section");
        res.status(401).redirect("/api/products");
    }
};

const deleteProductByCart = async (req, res) =>{
    const { cid } = req.params;
    const { pid } = req.params;
    if(req.session.user.cartId === cid | req.session.user.admin){
        try{
            const response = await cartsService.deleteProduct(cid,pid);
            res.status(200).redirect(`/api/carts/${cid}`);
        }catch(err){
            res.status(500).send(err.message);
        }
    }else{
        req.flash("error", "You don't have access to this section");
        res.status(401).redirect("/api/products");
    }
}

const addProductsToCart = async (req,res) =>{
    const { cid } = req.params;
    const {productId, quantity} = req.body;
    const result = await productsService.getOne(productId);
    if(req.session.user.admin){
        req.flash("error", "You can't add products to cart as admin");
        res.status(401).redirect("/api/products");
    }else if(req.session.user.premium && result.owner === req.session.user.email){
        req.flash("error", "you can't add your products to cart");
        res.status(401).redirect("/api/products");
    }else if(quantity > result.stock){
        req.flash("error", "Error, product is not in stock");
        res.status(401).redirect("/api/products");
    }else{
        try{
            const response = await cartsService.addProduct(cid, productId, quantity);
            req.flash("success", "Product added to cart");
            res.status(200).redirect(`/api/carts/${cid}`);
        }catch(error){
            req.flash("error", "Internal Server Error");
            res.status(500).redirect("/api/products");
        }
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
        res.status(200).send({ message: "Product Updated", response });
    }catch (err) {
        req.flash("error", "Internal Server Error");
        res.status(500).redirect("/api/products");
    }
}

const finalizePurchase = async (req,res) =>{
    const { cid } = req.params;
    const user = req.session.user.email;
    try{
        const response = await cartsService.finalizePurchase(cid, user);
        req.flash("success", "Successful purchase");
        res.status(500).redirect(`/api/carts/${cid}`);
    }catch(error){
        req.flash("error", "Internal Server Error");
        res.status(500).redirect("/api/products");
    }
}

module.exports = {getAllCarts, getCartById, createCart, finalizePurchase, deleteAllProductsByCart, deleteProductByCart, updateProductByCart, addProductsToCart};