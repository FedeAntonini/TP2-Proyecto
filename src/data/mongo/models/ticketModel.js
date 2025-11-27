const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    purchase_datetime: {
        type: Date,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    purchaser: {
        type: String,
        required: true
    },
    products: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Products", required: true },
            quantity: { type: Number, required: true }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model("Ticket", ticketSchema);
