// Applies migrations against a temp database to validate they run cleanly
const os = require('os');
const path = require('path');
const fs = require('fs');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pos-mig-'));
const tempDbPath = path.join(tempDir, 'test.db');
process.env.DB_PATH = tempDbPath;
process.env.MIGRATIONS_DRY_RUN = '0';

console.log('[MIGRATIONS TEST] Using temp DB:', tempDbPath);
require('../config/database');
console.log('[MIGRATIONS TEST] Completed successfully');


