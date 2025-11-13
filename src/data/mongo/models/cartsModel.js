const mongoose = require("mongoose");

const cartCollection = "carts";

const cartSchema = new mongoose.Schema({
    id: String,
    products: {
        type:[
            {
                product:{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "products"
                },
                quantity: Number
            } 
        ],
        default: [],
    },
    user: String,
});

const cartModel = mongoose.model(cartCollection, cartSchema);

module.exports = cartModel;