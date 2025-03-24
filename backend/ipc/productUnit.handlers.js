const { ipcMain } = require('electron');
const ProductUnit = require('../models/productUnit.model');

function setupProductUnitHandlers() {
// Get all product units
ipcMain.handle('get-product-units', async (event) => {
    try {
        const productUnits = await ProductUnit.getAll();
        return productUnits;
    } catch (error) {
        throw new Error(error.message);
    }
});

// Get product unit by ID
ipcMain.handle('get-product-unit-by-id', async (event, id) => {
    try {
        const productUnit = await ProductUnit.getById(id);
        if (!productUnit) {
            return { message: 'Product unit not found' };
        } else {
            return productUnit;
        }
    } catch (error) {
        throw new Error(error.message);
    }
});

// Create new product unit
ipcMain.handle('create-product-unit', async (event, productUnitData) => {
    try {
        const productUnitId = await ProductUnit.create(productUnitData);
        return { id: productUnitId, ...productUnitData };
    } catch (error) {
        throw new Error(error.message);
    }
});

// Update product unit
ipcMain.handle('update-product-unit', async (event, id, productUnitData) => {
    try {
        await ProductUnit.update(id, productUnitData);
        return { message: 'Product unit updated successfully' };
    } catch (error) {
        throw new Error(error.message);
    }
});

// Delete product unit
ipcMain.handle('delete-product-unit', async (event, id) => {
    try {
        await ProductUnit.delete(id);
        return { message: 'Product unit deleted successfully' };
    } catch (error) {
        throw new Error(error.message);
    }
}); 

}   

module.exports = setupProductUnitHandlers; 