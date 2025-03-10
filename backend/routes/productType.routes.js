const express = require('express');
const router = express.Router();
const {
  getProductTypes,
  getProductType,
  createProductType,
  updateProductType,
  deleteProductType
} = require('../controllers/productType.controller');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Public routes (still need to be authenticated)
router.get('/', getProductTypes);
router.get('/:id', getProductType);

// Restricted routes
router.post('/', authorize('admin', 'manager'), createProductType);
router.put('/:id', authorize('admin', 'manager'), updateProductType);
router.delete('/:id', authorize('admin'), deleteProductType);

module.exports = router; 