const mongoose = require("mongoose");

const ticketCollection = "tickets";

const ticketSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    purchase_datetime: {
        type: Date,
        required: true,
        default: Date.now
    },
    amount: {
        type: Number,
        required: true
    },
    purchaser: {
        type: String,
        required: true
    },
    products: {
        type: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "products"
                },
                quantity: Number
            }
        ],
        default: []
    }
}, {
    timestamps: true
});

const ticketModel = mongoose.model(ticketCollection, ticketSchema);

module.exports = ticketModel;

