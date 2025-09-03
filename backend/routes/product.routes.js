const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/product.controller');
const auth = require('../middleware/auth');

// Public routes
router.get('/', ProductController.getAll);
router.get('/low-stock', ProductController.getLowStock);
router.get('/popular', ProductController.getPopularProducts);
router.get('/:id/stock', ProductController.getProductStock);
router.get('/:id', ProductController.getById);

// Protected routes (require authentication)
router.post('/', auth, ProductController.create);
router.put('/:id', auth, ProductController.update);
router.delete('/:id', auth, ProductController.delete);

module.exports = router; 