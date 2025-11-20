const mongoose = require("mongoose");

const productCollection = "products";

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    category: {
        type: String
    },
    thumbnails: {
        type: [String],
        default: []
    },
    code: {
        type: String,
        unique: true
    },
    status: {
        type: Boolean,
        default: true
    },
    owner: {
        type: String,
        default: "admin"
    }
}, {
    timestamps: true
});

const productModel = mongoose.model(productCollection, productSchema);

module.exports = productModel;

