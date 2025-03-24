const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth.routes');
const categoryRoutes = require('./routes/category.routes');
const clientRoutes = require('./routes/client.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const productRoutes = require('./routes/product.routes');
const productTypeRoutes = require('./routes/productType.routes');
const productUnitRoutes = require('./routes/productUnit.routes');
const saleRoutes = require('./routes/sale.routes');
const salesItemRoutes = require('./routes/saleItem.routes');
const supplierRoutes = require('./routes/supplier.routes');
const todoRoutes = require('./routes/todo.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/product-types', productTypeRoutes);
app.use('/api/product-units', productUnitRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/sales-items', salesItemRoutes);
app.use('/api/invoices', invoiceRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!'
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 