const express = require('express');
const router = express.Router();
const {
  getReturns,
  getReturn,
  createReturn,
  updateReturn,
  getReturnsByDateRange,
  getReturnStats
} = require('../controllers/return.controller');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Public routes (still need to be authenticated)
router.get('/stats', authorize('admin', 'manager'), getReturnStats);
router.get('/date-range', authorize('admin', 'manager'), getReturnsByDateRange);
router.get('/', getReturns);
router.get('/:id', getReturn);

// Restricted routes
router.post('/', authorize('admin', 'manager', 'cashier'), createReturn);
router.put('/:id', authorize('admin', 'manager'), updateReturn);

module.exports = router; 