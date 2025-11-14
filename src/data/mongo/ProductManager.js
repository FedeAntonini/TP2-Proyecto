const productModel = require("./models/productsModel");

class ProductManager {
    async get(filterPage, options){
        try{
            const paginate = await productModel.paginate(filterPage, options);
            return paginate;
        }catch(err){
            throw err;
        }
    }

    async getByQuery(query){
        try{
            const products = await productModel.find({
                $or: [
                    { title: {$regex: query, $options: 'i'} },
                    { description: { $regex: query, $options: 'i' } },
                ]
            });
            return products;
        }catch(err){
            throw err;
        }
    }

    async getById(id){
        try{
            const result = await productModel.findById(id);
            return result;
        }catch(err){
            throw err;
        }
    }

    async getByCode(code){
        try {
            const result = await productModel.find({code:code});
            return result;
        } catch (error) {
            throw error;
        }
    }

    async getByCategory(filterPage, options){
        try{
            const paginate = await productModel.paginate(filterPage, options);
            return paginate;
        }catch(err){
            throw err;
        }
    }

    async create(product) {
        try {
            const newProduct = new productModel(product);
            await newProduct.save();
            return newProduct;
        } catch (err) {
            throw err;
        }
    }

    async delete(productId) {
        try {
            const result = await productModel.findByIdAndDelete(productId);
            return result;
        }catch(err){
            throw err;
        }
    }
    
    async update(productId, product) {
        try {
            const result = await productModel.findByIdAndUpdate(productId, product);
            return result;
        }catch(err){
            throw err;
        }
    }
}

module.exports = ProductManager;