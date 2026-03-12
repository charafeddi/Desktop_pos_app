const { ipcMain } = require('electron');
const ProductType = require('../models/productType.model');
const { ipcError } = require('../utils/ipcError');

function setupProductTypeHandlers() {
// Get all product types
ipcMain.handle('get-product-types', async (event) => {
    try {
        const productTypes = await ProductType.getAll();
        return productTypes;
    } catch (error) {
        throw ipcError(error);
    }
});

// Get product type by ID
ipcMain.handle('get-product-type-by-id', async (event, id) => {
    try {
        const productType = await ProductType.getById(id);
        if (!productType) {
            return { message: 'Product type not found' };
        } else {
            return productType;
        }
    } catch (error) {
        throw ipcError(error);
    }
});

// Create new product type
ipcMain.handle('create-product-type', async (event, productTypeData) => {
    try {
        const productTypeId = await ProductType.create(productTypeData);
        return { id: productTypeId, ...productTypeData };
    } catch (error) {
        throw ipcError(error);
    }
});

// Update product type
ipcMain.handle('update-product-type', async (event, id, productTypeData) => {
    try {
        await ProductType.update(id, productTypeData);
        return { message: 'Product type updated successfully' };
    } catch (error) {
        throw ipcError(error);
    }
});

// Delete product type
ipcMain.handle('delete-product-type', async (event, id) => {
    try {
        await ProductType.delete(id);
        return { message: 'Product type deleted successfully' };
    } catch (error) {
        throw ipcError(error);
    }
}); 

}

module.exports = setupProductTypeHandlers; 