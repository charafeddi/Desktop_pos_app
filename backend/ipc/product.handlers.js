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

// Create new product (handles base64 image and saves to app data folder)
ipcMain.handle('create-product', async (event, productData) => {
    try {
        // Normalize optional unique fields
        if (productData) {
            if (typeof productData.barcode === 'string' && productData.barcode.trim() === '') {
                productData.barcode = null;
            }
        }
        // If image is a base64 data URL, persist it to disk and replace with file path
        if (productData && typeof productData.image === 'string' && productData.image.startsWith('data:image')) {
            const matches = productData.image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
            if (matches) {
                const mimeType = matches[1];
                const base64Data = matches[2];
                const ext = mimeType.split('/')[1] || 'png';

                // Determine persistent images directory alongside database dir
                const path = require('path');
                const fs = require('fs');
                const os = require('os');

                const isPackaged = process.env.NODE_ENV === 'production' || process.resourcesPath !== undefined;
                let imagesDir;
                if (isPackaged) {
                    const appDataPath = process.env.APPDATA || os.homedir();
                    imagesDir = path.join(appDataPath, 'POS-System', 'images');
                } else {
                    imagesDir = path.join(__dirname, '..', 'data', 'images');
                }
                fs.mkdirSync(imagesDir, { recursive: true });

                const filename = `product_${Date.now()}_${Math.floor(Math.random()*1e6)}.${ext}`;
                const filePath = path.join(imagesDir, filename);
                fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

                productData.image = filePath;
            }
        }

        const productId = await Product.create(productData);
        return { id: productId, ...productData };
    } catch (error) {
        throw new Error(error.message);
    }
});

// Update product
ipcMain.handle('update-product', async (event, id, productData) => {
    try {
        if (productData) {
            if (typeof productData.barcode === 'string' && productData.barcode.trim() === '') {
                productData.barcode = null;
            }
        }
        if (productData && typeof productData.image === 'string' && productData.image.startsWith('data:image')) {
            const matches = productData.image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
            if (matches) {
                const mimeType = matches[1];
                const base64Data = matches[2];
                const ext = mimeType.split('/')[1] || 'png';

                const path = require('path');
                const fs = require('fs');
                const os = require('os');

                const isPackaged = process.env.NODE_ENV === 'production' || process.resourcesPath !== undefined;
                let imagesDir;
                if (isPackaged) {
                    const appDataPath = process.env.APPDATA || os.homedir();
                    imagesDir = path.join(appDataPath, 'POS-System', 'images');
                } else {
                    imagesDir = path.join(__dirname, '..', 'data', 'images');
                }
                fs.mkdirSync(imagesDir, { recursive: true });

                const filename = `product_${id}_${Date.now()}_${Math.floor(Math.random()*1e6)}.${ext}`;
                const filePath = path.join(imagesDir, filename);
                fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

                productData.image = filePath;
            }
        }

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
        console.log('IPC: Getting low stock products...');
        const lowStock = await Product.getLowStock();
        console.log('IPC: Low stock products returned:', lowStock);
        return lowStock;
    } catch (error) {
        console.error('IPC: Error getting low stock products:', error);
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