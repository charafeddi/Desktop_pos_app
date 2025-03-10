const express = require('express');
const router = express.Router();
const {
  getSales,
  getSale,
  createSale,
  updateSale,
  deleteSale,
  getClientSales,
  getSalesStats
} = require('../controllers/sale.controller');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Public routes (still need to be authenticated)
router.get('/stats', authorize('admin', 'manager'), getSalesStats);
router.get('/client/:clientId', getClientSales);
router.get('/', getSales);
router.get('/:id', getSale);

// Restricted routes
router.post('/', authorize('admin', 'manager', 'cashier'), createSale);
router.put('/:id', authorize('admin', 'manager'), updateSale);
router.delete('/:id', authorize('admin'), deleteSale);

module.exports = router; 