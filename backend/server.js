const express = require('express');
const helmet = require('helmet');
const config = require('./config/env');
const { createLogger } = require('./utils/logger');
const requestLogger = require('./middleware/requestLogger');
const sanitizeMiddleware = require('./middleware/sanitize');
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
const logger = createLogger(config);

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
    }
  },
  crossOriginEmbedderPolicy: false  // Allow Electron renderer to load resources
}));

// Middleware — restrict CORS to localhost only (this is a desktop Electron app)
const allowedOrigins = [
  `http://localhost:${config.PORT}`,
  'http://localhost:5173', // Vite dev server
  'http://localhost:3000'
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Electron IPC, curl, etc.) or from known localhost ports
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeMiddleware());
app.use(requestLogger(logger));

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
const PORT = config.PORT;
const httpServer = app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT} (env: ${config.NODE_ENV})`);
});

// Graceful shutdown with WAL checkpoint to ensure durability
const db = require('./config/database');
let isShuttingDown = false;
async function gracefulShutdown(signal) {
    if (isShuttingDown) return;
    isShuttingDown = true;
    try {
        logger.info(`Received ${signal}. Performing WAL checkpoint and shutting down...`);
        try {
            // TRUNCATE mode resets the WAL to the smallest size after checkpoint
            db.pragma('wal_checkpoint(TRUNCATE)');
            logger.info('WAL checkpoint completed (TRUNCATE).');
        } catch (e) {
            logger.warn('WAL checkpoint failed:', e?.message || e);
        }
        try {
            db.pragma('optimize');
            logger.info('SQLite PRAGMA optimize executed at shutdown.');
        } catch (e) {
            logger.warn('SQLite optimize at shutdown failed:', e?.message || e);
        }

        // Stop accepting new connections
        await new Promise(resolve => httpServer.close(resolve));
        logger.info('HTTP server closed.');
    } catch (e) {
        logger.error('Error during graceful shutdown:', e?.message || e);
    } finally {
        process.exit(0);
    }
}

['SIGINT', 'SIGTERM'].forEach(sig => {
    process.on(sig, () => gracefulShutdown(sig));
});

// Weekly ANALYZE to keep query planner stats fresh
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
setInterval(() => {
    try {
        db.exec('ANALYZE;');
        logger.info('SQLite ANALYZE executed (weekly)');
    } catch (e) {
        logger.warn('SQLite ANALYZE failed:', e?.message || e);
    }
}, ONE_WEEK_MS);