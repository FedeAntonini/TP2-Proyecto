const {Products} = require("../dao/factory");
const {ProductsRepository} = require("../repositories/products.repository");
const productsService = new ProductsRepository(new Products());
const multer = require('multer');
const fs = require("fs");
const nodemailer = require("nodemailer");
const {logger} = require("../config/utils");
const config = require("../config/config");

const transport = nodemailer.createTransport({
    service:'gmail',
    port: 587,
    auth:{
        user:config.EMAIL_USER,
        pass:'icunvygjuhenqqpd'
    }
});

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null, `./src/public/img/products/`);
    },
    filename: function(req,file,cb){
        const ext = file.originalname.split('.').pop();
        cb(null, `${Date.now()}.${ext}`);
    }
});
const upload = multer({storage: storage});

const deleteThumbnail = async (thumbnailPath) => {
    try {
        await fs.promises.unlink(thumbnailPath);
    } catch (error) {
        logger.error(`Failed to eliminate thumbnail: ${error}`);
    }
};

const getAllProducts = async (req, res) => {
    const limit = req.query.limit || 8;
    let optionsUrl = `?limit=${limit}`;
    let page = parseInt(req.query.page) || 1;
    if(req.query.sort){
    if(!optionsUrl.includes("sort")){
        optionsUrl = optionsUrl + `&sort=${req.query.sort}`;
    }
    }

    let filterPage;
    if(req.query.category){
        filterPage = {category: req.query.category}
        if(!optionsUrl.includes("category")){
            optionsUrl = optionsUrl + `&category=${req.query.category}`
        }
    }else if(req.query.status){
        filterPage = {status: req.query.status}
        if(!optionsUrl.includes("status")){
            optionsUrl = optionsUrl + `&status=${req.query.status}`
        }
    }else{
        filterPage = {}
    }

    const options = {page: page, limit: limit, sort: req.query.sort ? {price: req.query.sort} : {}};
    try {
        let productsPage = await productsService.get(filterPage, options)
        const object = {
            status: "success",
            payload: productsPage.docs,
            totalPages: productsPage.totalPages,
            prevPage: productsPage.prevPage,
            nextPage: productsPage.nextPage,
            hasPrevPage: productsPage.hasPrevPage,
            hasNextPage: productsPage.hasNextPage,
            prevLink: productsPage.hasPrevPage != false ? `${optionsUrl}&page=${page - 1}` : null,
            nextLink: productsPage.hasNextPage != false ? `${optionsUrl}&page=${page + 1}` : null,
        }
        res.status(200).render("principalPage", {object});
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const getProductById = async (req,res) =>{
    const {pid} = req.params;
    try{
        const product = await productsService.getOne(pid);
        const moreProducts = await productsService.get({category: product.category},{});
        res.status(200).render("productId", {product: product, moreProducts: moreProducts.docs});
    } catch(error){
        res.status(500).send("ERROR");
    }
};

const getProductsByCategory = async (req, res) => {
    let optionsUrl;
    if(req.query.sort){
        optionsUrl = `?sort=${req.query.sort}`;
    }

    const options = {sort: req.query.sort ? {price: req.query.sort} : {}};

    const {category} = req.params;

    let filterPage = {category: category};

    try {
        let productsPage = await productsService.get(filterPage, options)
        const object = {
            status: "success",
            payload: productsPage.docs,
            totalPages: productsPage.totalPages,
            prevPage: productsPage.prevPage,
            nextPage: productsPage.nextPage,
            hasPrevPage: productsPage.hasPrevPage,
            hasNextPage: productsPage.hasNextPage,
            prevLink: productsPage.hasPrevPage != false ? `${optionsUrl}&page=${page - 1}` : null,
            nextLink: productsPage.hasNextPage != false ? `${optionsUrl}&page=${page + 1}` : null,
        }
        res.status(200).render("productsByCategory", {object: object, category: category});
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const getProductsBySearch = async (req, res) => {
    const search = req.query.search;
    try {
        let object = await productsService.getByQuery(search);
        if(req.query.sort){
            req.query.sort === 'asc' ? 
                object = object.sort((a,b) => a.price - b.price) 
            : 
                object = object.sort((a,b) => b.price - a.price);
        } 
        let notFound;
        object.length === 0 ? notFound = true : notFound = false;
        res.status(200).render("productsBySearch", {object:object, notFound, search: search});
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const createProduct = async (req, res) =>{
    if(req.session.user.admin || req.session.user.premium){
        upload.single('thumbnail')(req,res,async (err) =>{
            const {
                title,
                description,
                code,
                price,
                stock,
                category,
                status,
            } = req.body;
    
            const response = await productsService.getByCode(code);
            if (!title || !description || !code || !price || !stock || !category || !status || response.length >= 1) {
                fs.unlink(`./src/public/img/products/${req.file.filename}`, (err) => {
                    if (err) logger.error('Failed to eliminate thumbnail:', err);
                });
                res.status(400).redirect("/api/products",req.flash("error", "Couldn't create product"));
                return;
            }else{
                try {
                    let urlThumbnail = `/img/products/${req.file.filename}`;
                    let owner;
                    req.session.user.premium ? owner = req.session.user.email : owner = "admin";
                    const myProduct = {title,description,code,price,thumbnail:urlThumbnail,stock,category,status,owner};
                    const response = await productsService.create(myProduct);
                    req.flash("success","Product was created successfully");
                    res.status(200).redirect("/api/products");
                } catch (error) {
                    logger.error(`Failed to create product: ${error}`)
                    req.flash("error","Internal Server Error, couldn't create product");
                    res.status(500).redirect("/api/products");
                }
            }
        });
    }else{
        req.flash("error","You don't have access to this section");
        res.status(401).redirect("/api/products");
    }
};

const deleteProduct = async (req,res) =>{
    if(req.session.user.admin){
        const { id } = req.params;
        try {
            const result = await productsService.delete(id);
            await deleteThumbnail(`./src/public/${result.thumbnail}`);
            if(result.owner !== "admin"){
                let resultEmail = await transport.sendMail({
                    from:`"GonzE-Commerce" <${config.EMAIL_USER}>`,
                    to: result.owner,
                    subject: "Your product was eliminated, GonzE-Commerce",
                    html: `
                    <div>
                        <h1>Your product with id: ${id} was eliminated from GonzE-Commerce.</h1>
                        <h4>This is just a notice message </h4>
                    </div>
                    `,
                    attachments: []
                });
            }
            req.flash("success","Product was deleted successfully");
            res.status(200).redirect("/api/products");
        } catch (error) {
            logger.error(`Failed to eliminate product: ${error}`)
            req.flash("error","Internal Server Errror, coulnd´t delete product");
            res.status(500).redirect("/api/products");
        }
    }else if(req.session.user.premium){
        const { id } = req.params;
        try{
            const product = await productsService.getOne(id);
            if(product.owner === req.session.user.email){
                const result = await productsService.delete(id);
                await deleteThumbnail(`./src/public/${result.thumbnail}`);
                req.flash("success","Product was deleted successfully");
                res.status(200).redirect("/api/products");
            }else{
                req.flash("error","You can only delete your products.");
                res.status(401).redirect("/api/products");
            }
        }catch(error){
            logger.error(`Failed to eliminate product: ${error}`)
            req.flash("error","Internal Server Errror, coulnd´t delete product");
            res.status(500).redirect("/api/products");
        }
    }else{
        req.flash("error","You don't have access to this section");
        res.status(401).redirect("/api/products");
    }
};

const updateProduct = async (req,res) =>{
    if(req.session.user.admin){
        upload.single('thumbnail')(req,res,async (err) =>{
            const { id } = req.params;
            const {
                title,
                description,
                code,
                price,
                stock,
                category,
                status,
            } = req.body;

            const response = await productsService.getByCode(code);
            let responseId = response.length > 0 ? response[0]._id.toString() : id;

            if (!title || !description || !code || !price || !stock || !category || responseId !== id) {
                req.flash("error","You didn't complete all the fields")
                res.status(400).redirect("/api/products"); 
            }else{
                try{
                    let thumbnail;
                    if(req.file){
                        thumbnail = `/img/products/${req.file.filename}`;          
                        fs.unlink(`./src/public/${response[0].thumbnail}`, (err) => {
                            if (err) logger.error('Failed to delete thumbnail:', err);
                        });
                    }
                    const result = await productsService.update(id, {
                        title,
                        description,
                        code,
                        price,
                        thumbnail,
                        stock,
                        category,
                        status,
                    });
                    req.flash("success","Product Updated successfully");
                    res.status(500).redirect("/api/products");
                }catch(error){
                    req.flash("error","Internal Server Error");
                    res.status(500).redirect("/api/products");
                }
            }
        });
    }else{
        req.flash("error","You don't have access to this section");
        res.status(401).redirect("/api/products");
    }
};

module.exports = {getAllProducts,getProductById, getProductsByCategory, getProductsBySearch, createProduct, deleteProduct, updateProduct};