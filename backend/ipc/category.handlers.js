const { ipcMain } = require('electron');
const Category = require('../models/category.model');

function setupCategoryHandlers() {
// Get all categories
ipcMain.handle('get-categories', async (event) => {
    try {
        const categories = await Category.getAll();
        return categories;
    } catch (error) {
        throw new Error(error.message);
    }
});

// Get category by ID
ipcMain.handle('get-category-by-id', async (event, id) => {
    try {
        const category = await Category.getById(id);
        if (!category) {
            return { message: 'Category not found' };
        } else {
            return category;
        }
    } catch (error) {
        throw new Error(error.message);
    }
});

// Create new category
ipcMain.handle('create-category', async (event, categoryData) => {
    try {
        const categoryId = await Category.create(categoryData);
        return { id: categoryId, ...categoryData };
    } catch (error) {
        throw new Error(error.message);
    }
});

// Update category
ipcMain.handle('update-category', async (event, id, categoryData) => {
    try {
        await Category.update(id, categoryData);
        return { message: 'Category updated successfully' };
    } catch (error) {
        throw new Error(error.message);
    }
});

// Delete category
ipcMain.handle('delete-category', async (event, id) => {
    try {
        await Category.delete(id);
        return { message: 'Category deleted successfully' };
    } catch (error) {
        throw new Error(error.message);
    }
});

}

module.exports = setupCategoryHandlers; 