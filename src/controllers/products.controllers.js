const {Products} = require("../dao/factory");
const {ProductsRepository} = require("../repositories/products.repository");
const productsService = new ProductsRepository(new Products());
const { logger } = require("../utils/logger");

// Get all products
const getAllProducts = async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;
        
        // Obtener todos los productos
        let products = await productsService.getProducts();
        
        // Aplicar filtro de búsqueda si existe
        if (query) {
            const searchRegex = new RegExp(query, 'i');
            products = products.filter(product => 
                searchRegex.test(product.title) || 
                searchRegex.test(product.description) || 
                searchRegex.test(product.category)
            );
        }

        // Aplicar sort si existe
        if (sort) {
            const sortOrder = sort === 'asc' ? 1 : -1;
            products.sort((a, b) => (a.price - b.price) * sortOrder);
        }

        // Paginación
        const limitNum = parseInt(limit);
        const pageNum = parseInt(page);
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = pageNum * limitNum;
        const paginatedProducts = products.slice(startIndex, endIndex);

        // Información de paginación
        const totalPages = Math.ceil(products.length / limitNum);
        const hasPrevPage = pageNum > 1;
        const hasNextPage = pageNum < totalPages;
        const prevPage = hasPrevPage ? pageNum - 1 : null;
        const nextPage = hasNextPage ? pageNum + 1 : null;

        logger.info(`Products retrieved: ${paginatedProducts.length} products (page ${pageNum})`);

        res.status(200).json({
            success: true,
            payload: paginatedProducts,
            totalPages,
            prevPage,
            nextPage,
            page: pageNum,
            hasPrevPage,
            hasNextPage,
            prevLink: hasPrevPage ? `/api/products?page=${prevPage}&limit=${limitNum}` : null,
            nextLink: hasNextPage ? `/api/products?page=${nextPage}&limit=${limitNum}` : null
        });
    } catch (err) {
        logger.error(`Error getting products: ${err.message}`);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// Get product by ID
const getProductById = async (req, res) => {
    const { pid } = req.params;
    try {
        const product = await productsService.getOne(pid);
        if (!product) {
            logger.warn(`Product not found: ${pid}`);
            return res.status(404).json({
                success: false,
                error: "Product not found"
            });
        }
        logger.info(`Product retrieved: ${pid}`);
        res.status(200).json({
            success: true,
            product: product
        });
    } catch (err) {
        logger.error(`Error getting product ${pid}: ${err.message}`);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// Create product (Admin or Premium)
const createProduct = async (req, res) => {
    try {
        // Solo admins o usuarios premium pueden crear productos
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: "Authentication required"
            });
        }

        if (!req.user.admin && !req.user.premium) {
            return res.status(403).json({
                success: false,
                error: "Only admins or premium users can create products"
            });
        }

        const productData = {
            ...req.body,
            owner: req.user.admin ? "admin" : req.user.email
        };

        const newProduct = await productsService.create(productData);
        logger.success(`Product created: ${newProduct._id} by ${req.user.email}`);

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product: newProduct
        });
    } catch (err) {
        logger.error(`Error creating product: ${err.message}`);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// Update product
const updateProduct = async (req, res) => {
    const { pid } = req.params;
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: "Authentication required"
            });
        }

        // Verificar si el producto existe
        const existingProduct = await productsService.getOne(pid);
        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                error: "Product not found"
            });
        }

        // Solo admin puede actualizar cualquier producto
        // Premium solo puede actualizar sus propios productos
        if (!req.user.admin && (existingProduct.owner !== req.user.email)) {
            return res.status(403).json({
                success: false,
                error: "You can only update your own products"
            });
        }

        const updatedProduct = await productsService.update(pid, req.body);
        logger.success(`Product updated: ${pid} by ${req.user.email}`);

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        });
    } catch (err) {
        logger.error(`Error updating product ${pid}: ${err.message}`);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// Delete product
const deleteProduct = async (req, res) => {
    const { pid } = req.params;
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: "Authentication required"
            });
        }

        // Verificar si el producto existe
        const existingProduct = await productsService.getOne(pid);
        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                error: "Product not found"
            });
        }

        // Solo admin puede eliminar cualquier producto
        // Premium solo puede eliminar sus propios productos
        if (!req.user.admin && (existingProduct.owner !== req.user.email)) {
            return res.status(403).json({
                success: false,
                error: "You can only delete your own products"
            });
        }

        await productsService.delete(pid);
        logger.success(`Product deleted: ${pid} by ${req.user.email}`);

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (err) {
        logger.error(`Error deleting product ${pid}: ${err.message}`);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};

