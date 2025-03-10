const express = require('express');
const router = express.Router();
const {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  searchSuppliers,
  getSupplierProducts
} = require('../controllers/supplier.controller');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Public routes (still need to be authenticated)
router.get('/search', searchSuppliers);
router.get('/', getSuppliers);
router.get('/:id', getSupplier);
router.get('/:id/products', getSupplierProducts);

// Restricted routes
router.post('/', authorize('admin', 'manager'), createSupplier);
router.put('/:id', authorize('admin', 'manager'), updateSupplier);
router.delete('/:id', authorize('admin', 'manager'), deleteSupplier);

module.exports = router; 