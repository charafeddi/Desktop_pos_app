const express = require('express');
const router = express.Router();
const {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  searchClients,
  getClientStats,
  getClientBalance
} = require('../controllers/client.controller');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Public routes (still need to be authenticated)
router.get('/stats', authorize('admin', 'manager'), getClientStats);
router.get('/search', searchClients);
router.get('/', getClients);
router.get('/:id', getClient);
router.get('/:id/balance', getClientBalance);

// Restricted routes
router.post('/', authorize('admin', 'manager', 'cashier'), createClient);
router.put('/:id', authorize('admin', 'manager'), updateClient);
router.delete('/:id', authorize('admin'), deleteClient);

module.exports = router; 