const productModel = require("./models/productsModel");

class ProductManager {
    async get() {
        try {
            const products = await productModel.find();
            return products;
        } catch (err) {
            throw err;
        }
    }

    async getOne(productId) {
        try {
            const product = await productModel.findById(productId);
            return product;
        } catch (err) {
            throw err;
        }
    }

    async create(productData) {
        try {
            const newProduct = new productModel(productData);
            await newProduct.save();
            return newProduct;
        } catch (err) {
            throw err;
        }
    }

    async update(productId, productData) {
        try {
            const updatedProduct = await productModel.findByIdAndUpdate(
                productId,
                productData,
                { new: true }
            );
            return updatedProduct;
        } catch (err) {
            throw err;
        }
    }

    async delete(productId) {
        try {
            const result = await productModel.findByIdAndDelete(productId);
            return result;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = ProductManager;

