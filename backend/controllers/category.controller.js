const Category = require('../models/category.model');

class CategoryController {
    // Create a new category
    static async create(req, res) {
        try {
            const { name, description, parent_id } = req.body;

            // Validate required fields
            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: 'Category name is required'
                });
            }

            // Check if parent category exists if parent_id is provided
            if (parent_id) {
                const parentCategory = await Category.findById(parent_id);
                if (!parentCategory) {
                    return res.status(404).json({
                        success: false,
                        message: 'Parent category not found'
                    });
                }
            }

            // Create category
            const categoryId = await Category.create({
                name,
                description,
                parent_id
            });

            // Get the created category
            const category = await Category.findById(categoryId);

            res.status(201).json({
                success: true,
                data: category
            });
        } catch (error) {
            console.error('Error creating category:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating category'
            });
        }
    }

    // Get all categories
    static async getAll(req, res) {
        try {
            const categories = await Category.getAll();
            res.json({
                success: true,
                data: categories
            });
        } catch (error) {
            console.error('Error getting categories:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting categories'
            });
        }
    }

    // Get category hierarchy
    static async getHierarchy(req, res) {
        try {
            const hierarchy = await Category.getHierarchy();
            res.json({
                success: true,
                data: hierarchy
            });
        } catch (error) {
            console.error('Error getting category hierarchy:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting category hierarchy'
            });
        }
    }

    // Get child categories
    static async getChildren(req, res) {
        try {
            const { parentId } = req.params;
            const children = await Category.getChildren(parentId);
            res.json({
                success: true,
                data: children
            });
        } catch (error) {
            console.error('Error getting child categories:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting child categories'
            });
        }
    }

    // Get category by ID
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const category = await Category.findById(id);

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }

            res.json({
                success: true,
                data: category
            });
        } catch (error) {
            console.error('Error getting category:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting category'
            });
        }
    }

    // Update category
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { name, description, parent_id } = req.body;

            // Check if category exists
            const existingCategory = await Category.findById(id);
            if (!existingCategory) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }

            // Check if parent category exists if parent_id is provided
            if (parent_id) {
                const parentCategory = await Category.findById(parent_id);
                if (!parentCategory) {
                    return res.status(404).json({
                        success: false,
                        message: 'Parent category not found'
                    });
                }
            }

            // Update category
            await Category.update(id, {
                name,
                description,
                parent_id
            });

            // Get the updated category
            const updatedCategory = await Category.findById(id);

            res.json({
                success: true,
                data: updatedCategory
            });
        } catch (error) {
            console.error('Error updating category:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating category'
            });
        }
    }

    // Delete category
    static async delete(req, res) {
        try {
            const { id } = req.params;

            // Check if category exists
            const category = await Category.findById(id);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }

            // Check if category has children
            const children = await Category.getChildren(id);
            if (children.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete category with child categories'
                });
            }

            // Delete category
            await Category.delete(id);

            res.json({
                success: true,
                message: 'Category deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting category:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting category'
            });
        }
    }

    // Get products in category
    static async getProducts(req, res) {
        try {
            const { id } = req.params;
            const products = await Category.getProducts(id);

            res.json({
                success: true,
                data: products
            });
        } catch (error) {
            console.error('Error getting category products:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting category products'
            });
        }
    }
}

module.exports = CategoryController; 