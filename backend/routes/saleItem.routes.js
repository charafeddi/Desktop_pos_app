const express = require('express');
const router = express.Router();
const {
  getSaleItems,
  getSaleItem,
  updateQuantity,
  returnItem,
  getItemsByProduct,
  getSaleItemStats
} = require('../controllers/saleItem.controller');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Public routes (still need to be authenticated)
router.get('/stats', authorize('admin', 'manager'), getSaleItemStats);
router.get('/product/:productId', getItemsByProduct);
router.get('/', getSaleItems);
router.get('/:id', getSaleItem);

// Restricted routes
router.put('/:id/quantity', authorize('admin', 'manager'), updateQuantity);
router.post('/:id/return', authorize('admin', 'manager', 'cashier'), returnItem);

module.exports = router; 