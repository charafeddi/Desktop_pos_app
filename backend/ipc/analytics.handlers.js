const { ipcMain } = require('electron');
const db = require('../config/database');

function setupAnalyticsHandlers() {
    // Supplier spend (COGS by supplier)
    ipcMain.handle('analytics:supplier-spend', async (_event) => {
        try {
            const rows = db.prepare(`
                SELECT 
                    COALESCE(s.id, 0) as supplier_id,
                    COALESCE(s.name, 'Unassigned') as supplier_name,
                    ROUND(SUM(si.quantity * p.purchase_price), 2) AS total_spend,
                    COUNT(DISTINCT si.sale_id) as sales_count,
                    COUNT(DISTINCT si.product_id) as products_count
                FROM sale_items si
                JOIN products p ON si.product_id = p.id
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                GROUP BY s.id, s.name
                ORDER BY total_spend DESC
            `).all();
            return rows;
        } catch (error) {
            console.error('analytics:supplier-spend error', error);
            throw error;
        }
    });

    // Product price comparison across suppliers
    ipcMain.handle('analytics:product-price-compare', async (_event) => {
        try {
            // Find product keys (name, sku) that exist with multiple suppliers
            const multiSupplierKeys = db.prepare(`
                SELECT name, COALESCE(sku, '') as sku_key
                FROM products
                GROUP BY name, COALESCE(sku, '')
                HAVING COUNT(DISTINCT supplier_id) > 1
            `).all();

            const results = [];
            const detailsStmt = db.prepare(`
                SELECT p.name as product_name, p.sku, p.purchase_price,
                       s.id as supplier_id, s.name as supplier_name
                FROM products p
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                WHERE p.name = ? AND COALESCE(p.sku, '') = ?
                ORDER BY p.purchase_price ASC
            `);

            for (const key of multiSupplierKeys) {
                const list = detailsStmt.all(key.name, key.sku_key);
                if (list && list.length > 0) {
                    const prices = list.map(r => r.purchase_price).filter(v => typeof v === 'number');
                    const min = Math.min(...prices);
                    const max = Math.max(...prices);
                    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
                    results.push({
                        product_name: list[0].product_name,
                        sku: list[0].sku,
                        suppliers: list,
                        min_price: Number(min.toFixed(2)),
                        max_price: Number(max.toFixed(2)),
                        avg_price: Number(avg.toFixed(2))
                    });
                }
            }
            return results;
        } catch (error) {
            console.error('analytics:product-price-compare error', error);
            throw error;
        }
    });
}

module.exports = setupAnalyticsHandlers;


