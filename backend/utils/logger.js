const fs = require('fs');
const path = require('path');

const DEFAULT_MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const DEFAULT_RETENTION_DAYS = 7;

function ensureDirExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function formatDate(d = new Date()) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function redactPII(input) {
    if (input == null) return input;
    let str = typeof input === 'string' ? input : JSON.stringify(input);
    // Emails
    str = str.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, (m) => {
        const [user, domain] = m.split('@');
        const maskedUser = user.length <= 2 ? '*'.repeat(user.length) : user[0] + '*'.repeat(user.length - 2) + user[user.length - 1];
        return `${maskedUser}@${domain}`;
    });
    // Phone numbers (simple)
    str = str.replace(/(?:\+?\d[\s-]?){7,}/g, (m) => m.replace(/\d/g, (d, i) => (i < m.length - 3 ? '*': d)));
    // JWTs / tokens / passwords keys
    str = str.replace(/("?(?:token|jwt|authorization|password|secret)"?\s*:\s*")([^"]+)(")/gi, '$1***REDACTED***$3');
    // Authorization headers
    str = str.replace(/Authorization:\s*Bearer\s+[A-Za-z0-9\-_.]+/gi, 'Authorization: Bearer ***REDACTED***');
    return str;
}

class RotatingLogger {
    constructor(options) {
        this.level = options.level || 'info';
        this.logsDir = options.logsDir;
        this.maxSizeBytes = options.maxSizeBytes || DEFAULT_MAX_SIZE_BYTES;
        this.retentionDays = options.retentionDays || DEFAULT_RETENTION_DAYS;
        ensureDirExists(this.logsDir);
        this.currentDate = formatDate();
        this.stream = this.openStream();
        this.pruneOld();
    }

    openStream() {
        const filePath = path.join(this.logsDir, `app-${this.currentDate}.log`);
        return fs.createWriteStream(filePath, { flags: 'a' });
    }

    needsRotate() {
        try {
            const filePath = path.join(this.logsDir, `app-${this.currentDate}.log`);
            const stat = fs.existsSync(filePath) ? fs.statSync(filePath) : null;
            if (!stat) return false;
            return stat.size >= this.maxSizeBytes;
        } catch {
            return false;
        }
    }

    rotateIfNeeded() {
        const today = formatDate();
        if (today !== this.currentDate || this.needsRotate()) {
            this.stream.end();
            this.currentDate = today;
            this.stream = this.openStream();
        }
    }

    pruneOld() {
        try {
            const files = fs.readdirSync(this.logsDir)
                .filter(f => /^app-\d{4}-\d{2}-\d{2}\.log$/.test(f))
                .map(f => ({ f, p: path.join(this.logsDir, f), m: fs.statSync(path.join(this.logsDir, f)).mtime }))
                .sort((a, b) => b.m - a.m);
            const cutoff = Date.now() - this.retentionDays * 24 * 60 * 60 * 1000;
            for (const file of files) {
                if (file.m.getTime() < cutoff) {
                    try { fs.unlinkSync(file.p); } catch {}
                }
            }
        } catch {}
    }

    write(level, args) {
        if (!this.shouldLog(level)) return;
        const ts = new Date().toISOString();
        const line = `[${ts}] [${level.toUpperCase()}] ${args.map(a => redactPII(a)).join(' ')}\n`;
        try {
            this.rotateIfNeeded();
            this.stream.write(line);
        } catch {}
        // Always mirror to console for dev
        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](...args);
        }
    }

    shouldLog(level) {
        const order = { debug: 10, info: 20, warn: 30, error: 40 };
        const cur = order[this.level] ?? 20;
        const lvl = order[level] ?? 20;
        return lvl >= cur;
    }

    debug(...args) { this.write('debug', args); }
    info(...args)  { this.write('info', args); }
    warn(...args)  { this.write('warn', args); }
    error(...args) { this.write('error', args); }
}

function createLogger(config) {
    const logsRoot = path.join(process.cwd(), 'logs');
    ensureDirExists(logsRoot);
    return new RotatingLogger({
        level: (config.LOG_LEVEL || 'info').toLowerCase(),
        logsDir: logsRoot,
        maxSizeBytes: DEFAULT_MAX_SIZE_BYTES,
        retentionDays: config.BACKUP_RETENTION_DAYS || DEFAULT_RETENTION_DAYS,
    });
}

module.exports = {
    createLogger,
    redactPII,
};


