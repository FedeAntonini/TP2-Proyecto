class CartsRepository{
    constructor(dao){
        this.dao = dao;
    }

    getCarts = async () =>{
        let result = await this.dao.get();
        return result;
    }

    getOne = async (cid) =>{
        let result = await this.dao.getOne(cid);
        return result;
    }

    createCart = async () =>{
        let result = await this.dao.create();
        return result;
    }

    deleteAllProducts = async (cid) =>{
        let result = await this.dao.deleteAllProducts(cid);
        return result;
    }

    deleteProduct = async (cid, pid) =>{
        let result = await this.dao.deleteProduct(cid,pid);
        return result;
    }

    addProduct = async (cid, productId,quantity) =>{
        let result = await this.dao.addProduct(cid,productId,quantity);
        return result;
    }

    updateProduct = async (cartId, productObject) =>{
        let result = await this.dao.updateProduct(cartId,productObject);
        return result;
    }

    finalizePurchase = async (cid,user) =>{
        let result = await this.dao.finalizePurchase(cid,user);
        return result;
    }
}

module.exports = {CartsRepository};