const cartModel = require("./models/cartsModel");
const productModel = require("./models/productsModel");
const ticketModel = require("./models/ticketModel");
const Crypto = require("crypto");

class CartManager {
    async get() {
        try {
            const carts = await cartModel.find().populate("products.product");
            return carts;
        }catch (err) {
            throw err;
        }
    }
    async getOne(cartId){
        try {
            const cart = await cartModel.findById({_id: cartId}).populate("products.product");
            return cart;
        }catch (err) {
            throw err;
        }
    }
    async create() {
        try {
            const newCart = new cartModel();
            await newCart.save();
            return newCart;
        }catch (err) {
            throw err;
        }
    }
    async deleteCart(cartId) {
        try {
            const result = await cartModel.findByIdAndDelete(cartId);
            return result;
        } catch (err) {
            throw err;
        }
    }
    async addProduct(cartId, productId, quantity) {
        const myProduct = {
            product: productId,
            quantity: quantity,
        };
        try {
            const result = await cartModel.find({ _id: cartId });
        if (result[0].products.length === 0) {
            result[0].products.push(myProduct);
            await cartModel.findByIdAndUpdate(cartId, {products: result[0].products}, { new: true });
            // Retornar el carrito actualizado con populate para incluir información completa de productos
            const updatedCart = await cartModel.findById(cartId).populate("products.product");
            return updatedCart;
        }else {
            const index = result[0].products.findIndex((element) => element.product.toString() === myProduct.product)
            
            index === -1 ? result[0].products.push(myProduct) : result[0].products[index].quantity += quantity;

            await cartModel.findByIdAndUpdate(cartId, {products: result[0].products}, { new: true });
            
            // Retornar el carrito actualizado con populate para incluir información completa de productos
            const updatedCart = await cartModel.findById(cartId).populate("products.product");
            return updatedCart;
        }
        }catch(err){
            throw err;
        }
    }
    async updateProduct(cartId, productObject){
        const myProduct = {
            product: productObject._id,
            quantity: productObject.quantity,
        };
        try {
            const result = await cartModel.find({ _id: cartId });
            const index = result[0].products.findIndex((product) => product.product.toString() === myProduct.product);
            if (index !== -1) {
                result[0].products.splice(index,1,myProduct);
                const resultSave = await cartModel.findByIdAndUpdate(cartId, {products: result[0].products});
                return resultSave;
            }
        }catch (err) {
            throw err;
        }
    }
    async deleteAllProducts(cartId){
        try{
            const result = await cartModel.find({_id: cartId});
            result[0].products.length = 0;
            const resultSave = await cartModel.findByIdAndUpdate(cartId, {
                products: result[0].products,
            });
            return resultSave;
        }catch(err){
            throw err;
        }
    }
    async deleteProduct(cid, pid){
        try{
            const cart = await cartModel.findOne({_id: cid});
            const index = cart.products.findIndex((product) => product._id.toString() === pid);
            if(index !== -1){
                cart.products.splice(index,1);
                const resultSave = await cartModel.findByIdAndUpdate(cid, {
                    products: cart.products,
                });
                return resultSave;
            }else{
                return "Product Not Found";
            }
        }catch(err){
            throw err;
        }
    }
    async finalizePurchase(cid,userEmail){
        try{
            const cart = await cartModel.findById({_id: cid}).populate("products.product");
            let productsPurchase = [];
            let totalPrice = 0;
            for(let i = 0; i < cart.products.length; i++){
                let newStock = cart.products[i].product.stock - cart.products[i].quantity;
                productsPurchase.push(cart.products[i]);
                totalPrice = totalPrice + (cart.products[i].quantity * cart.products[i].product.price);
                let saveProduct = await productModel.findByIdAndUpdate(cart.products[i].product._id, {stock: newStock});
                cart.products.splice(i,1);
                i--;
            }
            let saveCart = await cartModel.findByIdAndUpdate(cid, {products: cart.products});
            const myTicket = {
                code: Crypto.randomBytes(16).toString("hex").substring(0, 6),
                purchase_datetime: new Date(),
                amount: totalPrice,
                products: productsPurchase,
                purchaser: userEmail
            }
            const ticket = await ticketModel.create(myTicket);
            return ticket;
        }catch(error){
            throw error;
        }
    }
}

module.exports = CartManager;