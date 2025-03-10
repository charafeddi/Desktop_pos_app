const express = require('express');
const router = express.Router();
const {
  getProductUnits,
  getProductUnit,
  createProductUnit,
  updateProductUnit,
  deleteProductUnit,
  convertUnits
} = require('../controllers/productUnit.controller');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Public routes (still need to be authenticated)
router.get('/', getProductUnits);
router.get('/:id', getProductUnit);
router.post('/convert', convertUnits);

// Restricted routes
router.post('/', authorize('admin', 'manager'), createProductUnit);
router.put('/:id', authorize('admin', 'manager'), updateProductUnit);
router.delete('/:id', authorize('admin'), deleteProductUnit);

module.exports = router; 