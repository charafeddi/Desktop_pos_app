const fs = require('fs');
const path = require('path');

function loadDotEnv() {
    const candidates = [
        path.join(__dirname, '..', '.env'),   // backend/.env  (highest priority)
        path.join(__dirname, '.env'),          // backend/config/.env
        path.join(process.cwd(), '.env'),      // cwd root .env (lowest priority)
    ];
    let loaded = [];
    for (const p of candidates) {
        try {
            if (fs.existsSync(p)) {
                const content = fs.readFileSync(p, 'utf8');
                parseEnvContent(content);
                loaded.push(p);
            }
        } catch {}
    }
    return loaded.length ? loaded : null;
}

function parseEnvContent(content) {
    const lines = content.split(/\r?\n/);
    for (const raw of lines) {
        const line = raw.trim();
        if (!line || line.startsWith('#')) continue;
        const eqIdx = line.indexOf('=');
        if (eqIdx === -1) continue;
        const key = line.slice(0, eqIdx).trim();
        let value = line.slice(eqIdx + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith('\'') && value.endsWith('\''))) {
            value = value.slice(1, -1);
        }
        if (!(key in process.env)) {
            process.env[key] = value;
        }
    }
}

function toInt(value, fallback) {
    const n = Number.parseInt(value, 10);
    return Number.isFinite(n) ? n : fallback;
}

function validateAndBuildConfig() {
    // Detect if running in Electron
    const isElectron = process.versions && process.versions.electron;
    
    // For Electron apps, treat as development unless explicitly set to production
    let NODE_ENV = (process.env.NODE_ENV || 'development').toLowerCase();
    if (isElectron && NODE_ENV === 'production') {
        // Electron packaged apps should use development mode for JWT_SECRET handling
        console.log('Running in Electron, using relaxed JWT_SECRET requirements');
    }
    
    if (!['development', 'production', 'test'].includes(NODE_ENV)) {
        throw new Error(`Invalid NODE_ENV: ${NODE_ENV}`);
    }

    const PORT = toInt(process.env.PORT, 3000);
    
    // JWT_SECRET with fallback for Electron/development
    let JWT_SECRET = process.env.JWT_SECRET || '';
    if (!JWT_SECRET) {
        if (NODE_ENV === 'production' && !isElectron) {
            throw new Error('JWT_SECRET is required in production. Set it in the environment or .env file.');
        }
        // Provide a default for development/Electron (not secure for web production)
        JWT_SECRET = 'pos-desktop-app-default-secret-key-change-in-production';
        console.warn('Warning: Using default JWT_SECRET. Set JWT_SECRET in .env for production security.');
    }

    const BACKUP_RETENTION_DAYS = toInt(process.env.BACKUP_RETENTION_DAYS, 7);
    const LOG_LEVEL = (process.env.LOG_LEVEL || 'info').toLowerCase();
    const APP_DATA_DIR = process.env.APP_DATA_DIR || '';
    let BCRYPT_ROUNDS = toInt(process.env.BCRYPT_ROUNDS, 10);
    if (!Number.isFinite(BCRYPT_ROUNDS) || BCRYPT_ROUNDS < 10) BCRYPT_ROUNDS = 10;
    if (BCRYPT_ROUNDS > 12) BCRYPT_ROUNDS = 12;
    const MIGRATIONS_DRY_RUN = (process.env.MIGRATIONS_DRY_RUN || '').toString() === '1';
    const DB_PATH = process.env.DB_PATH || '';

    return {
        NODE_ENV,
        PORT,
        JWT_SECRET,
        BACKUP_RETENTION_DAYS,
        LOG_LEVEL,
        APP_DATA_DIR,
        BCRYPT_ROUNDS,
        MIGRATIONS_DRY_RUN,
        DB_PATH,
    };
}

loadDotEnv();
const config = validateAndBuildConfig();

module.exports = config;


