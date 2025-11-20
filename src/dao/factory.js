const CartManager = require("../data/mongo/CartManager");
const ProductManager = require("../data/mongo/ProductManager");

module.exports = {
    Carts: CartManager,
    Products: ProductManager
};

