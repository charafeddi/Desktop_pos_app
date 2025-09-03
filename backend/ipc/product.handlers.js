const { ipcMain } = require('electron');
const Product = require('../models/product.model');

function setupProductHandlers() {
// Get all products
ipcMain.handle('get-products', async (event) => {
    try {
        const products = await Product.getAll();
        return products;
    } catch (error) {
        throw new Error(error.message);
    }
});

// Get product by ID
ipcMain.handle('get-product-by-id', async (event, id) => {
    try {
        const product = await Product.getById(id);
        if (!product) {
            return { message: 'Product not found' };
        } else {
            return product;
        }
    } catch (error) {
        throw new Error(error.message);
    }
});

// Create new product
ipcMain.handle('create-product', async (event, productData) => {
    try {
        const productId = await Product.create(productData);
        return { id: productId, ...productData };
    } catch (error) {
        throw new Error(error.message);
    }
});

// Update product
ipcMain.handle('update-product', async (event, id, productData) => {
    try {
        await Product.update(id, productData);
        return { message: 'Product updated successfully' };
    } catch (error) {
        throw new Error(error.message);
    }
});

// Delete product
ipcMain.handle('delete-product', async (event, id) => {
    try {
        await Product.delete(id);
        return { message: 'Product deleted successfully' };
    } catch (error) {
        throw new Error(error.message);
    }
});
// Get product low Stock
ipcMain.handle('get-product-low-stock', async (event) => {
    try {
        const lowStock = await Product.getLowStock();
        return lowStock;
    } catch (error) {
        throw new Error(error.message);
    }
});

// Get popular products
ipcMain.handle('get-popular-products', async (event, limit = 10, period = null) => {
    try {
        const products = await Product.getPopularProducts(limit, period);
        return products;
    } catch (error) {
        throw new Error(error.message);
    }
});

// Get product stock by ID
ipcMain.handle('get-product-stock', async (event, id) => {
    try {
        const productStock = await Product.getProductStock(id);
        if (!productStock) {
            return { message: 'Product not found' };
        } else {
            return productStock;
        }
    } catch (error) {
        throw new Error(error.message);
    }
});

}

module.exports = setupProductHandlers; 