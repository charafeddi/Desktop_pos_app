// Plans migrations without applying them
process.env.MIGRATIONS_DRY_RUN = '1';
// Allow overriding DB path via env if needed
// process.env.DB_PATH = 'path/to/temp.db'

require('../config/database');


