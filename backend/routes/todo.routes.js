const express = require('express');
const router = express.Router();
const {
  getTodos,
  getTodo,
  createTodo,
  updateTodo,
  deleteTodo,
  getTodoStats
} = require('../controllers/todo.controller');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Public routes (still need to be authenticated)
router.get('/todos', getTodos);
router.get('/stats', getTodoStats);
router.get('/:id', getTodo);

// Restricted routes
router.post('/', authorize('admin', 'manager', 'cashier'), createTodo);
router.put('/:id', authorize('admin', 'manager', 'cashier'), updateTodo);
router.delete('/:id', authorize('admin', 'manager'), deleteTodo);

module.exports = router; 