const { ipcMain } = require('electron');
const Supplier = require('../models/supplier.model');

function setupSupplierHandlers() {
// Get all suppliers
ipcMain.handle('get-suppliers', async (event) => {
    try {
        const suppliers = await Supplier.getAll();
        return suppliers;
    } catch (error) {
        throw new Error(error.message);
    }
});

// Get supplier by ID
ipcMain.handle('get-supplier-by-id', async (event, id) => {
    try {
        const supplier = await Supplier.getById(id);
        if (!supplier) {
            return { message: 'Supplier not found' };
        } else {
            return supplier;
        }
    } catch (error) {
        throw new Error(error.message);
    }
});

// Create new supplier
ipcMain.handle('create-supplier', async (event, supplierData) => {
    try {
        const supplierId = await Supplier.create(supplierData);
        return { id: supplierId, ...supplierData };
    } catch (error) {
        throw new Error(error.message);
    }
});

// Update supplier
ipcMain.handle('update-supplier', async (event, id, supplierData) => {
    try {
        await Supplier.update(id, supplierData);
        // Return the updated supplier row so frontend state can update reactively
        const updated = await Supplier.findById(id);
        return updated;
    } catch (error) {
        throw new Error(error.message);
    }
});

// Delete supplier
ipcMain.handle('delete-supplier', async (event, id) => {
    try {
        await Supplier.delete(id);
        return { message: 'Supplier deleted successfully' };
    } catch (error) {
        throw new Error(error.message);
    }
}); 

}

module.exports = setupSupplierHandlers; 