class ProductsRepository{
    constructor(dao){
        this.dao = dao;
    }
    getByQuery = async (query) =>{
        let result = await this.dao.getByQuery(query);
        return result;
    }

    get = async (filterPage, options) =>{
        let result = await this.dao.get(filterPage,options);
        return result;
    }

    getOne = async(id) =>{
        let result = await this.dao.getById(id);
        return result;
    }

    getByCode = async(code) =>{
        let result = await this.dao.getByCode(code);
        return result;
    }

    create = async (product) =>{
        let result = await this.dao.create(product);
        return result;
    }
    
    delete = async (product) =>{
        let result = await this.dao.delete(product);
        return result;
    }

    update = async (productId, product) =>{
        let result = await this.dao.update(productId, product);
        return result;
    }

}

module.exports = {ProductsRepository};