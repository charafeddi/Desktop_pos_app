const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoiceStatus,
  deleteInvoice,
  getInvoicesByDateRange,
  getInvoiceStats
} = require('../controllers/invoice.controller');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Public routes (still need to be authenticated)
router.get('/stats', authorize('admin', 'manager'), getInvoiceStats);
router.get('/date-range', authorize('admin', 'manager'), getInvoicesByDateRange);
router.get('/', getInvoices);
router.get('/:id', getInvoice);

// Restricted routes
router.post('/', authorize('admin', 'manager', 'cashier'), createInvoice);
router.put('/:id/status', authorize('admin', 'manager'), updateInvoiceStatus);
router.delete('/:id', authorize('admin'), deleteInvoice);

module.exports = router; 