const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/category.controller');
const auth = require('../middleware/auth');

// Public routes
router.get('/', CategoryController.getAll);
router.get('/hierarchy', CategoryController.getHierarchy);
router.get('/:id', CategoryController.getById);
router.get('/:id/products', CategoryController.getProducts);
router.get('/:parentId/children', CategoryController.getChildren);

// Protected routes (require authentication)
router.post('/', auth, CategoryController.create);
router.put('/:id', auth, CategoryController.update);
router.delete('/:id', auth, CategoryController.delete);

module.exports = router; 