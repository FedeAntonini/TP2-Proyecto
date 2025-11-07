const mongoose = require("mongoose");
const usersCollection = "users";


const usersSchema = new mongoose.Schema({
    firstname: {type: String},
    lastname: {type: String},
    age: {type: Number},
    email: {type: String},
    admin: {type: Boolean, default: false},
    premium: {type: Boolean, default: false},
    cartId: {type: String},
    password: {type: String},
    img: {type: String},
    documents: {
        type:[{ name:{type: String}, reference: {type: String} }],
        default: [],
    },
    last_connection:{type: Date}
}, {versionKey: false});

const usersModel = mongoose.model(usersCollection, usersSchema);

module.exports = usersModel;