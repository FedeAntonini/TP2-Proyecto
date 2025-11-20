class ProductsRepository {
    constructor(dao) {
        this.dao = dao;
    }

    getProducts = async () => {
        let result = await this.dao.get();
        return result;
    }

    getOne = async (productId) => {
        let result = await this.dao.getOne(productId);
        return result;
    }

    create = async (productData) => {
        let result = await this.dao.create(productData);
        return result;
    }

    update = async (productId, productData) => {
        let result = await this.dao.update(productId, productData);
        return result;
    }

    delete = async (productId) => {
        let result = await this.dao.delete(productId);
        return result;
    }
}

module.exports = { ProductsRepository };

