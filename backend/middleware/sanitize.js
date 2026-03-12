function sanitizeString(value) {
    if (typeof value !== 'string') return value;
    let s = value;
    // Normalize Unicode to prevent homoglyph tricks
    try { s = s.normalize('NFKC'); } catch {}
    // Remove NULL bytes
    s = s.replace(/\u0000/g, '');
    // Remove most control chars except tab/newline/carriage return
    s = s.replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
    // Trim excessive length to 10k to avoid abuse
    const MAX_LEN = 10000;
    if (s.length > MAX_LEN) s = s.slice(0, MAX_LEN);
    return s.trim();
}

function sanitizeValue(value) {
    if (value == null) return value;
    if (typeof value === 'string') return sanitizeString(value);
    if (Array.isArray(value)) return value.map(sanitizeValue);
    if (typeof value === 'object') return sanitizeObject(value);
    return value;
}

function sanitizeObject(obj) {
    const out = Array.isArray(obj) ? [] : {};
    for (const key of Object.keys(obj)) {
        const val = obj[key];
        out[key] = sanitizeValue(val);
    }
    return out;
}

function sanitizeMiddleware() {
    return (req, _res, next) => {
        if (req.body && typeof req.body === 'object') req.body = sanitizeObject(req.body);
        if (req.query && typeof req.query === 'object') req.query = sanitizeObject(req.query);
        if (req.params && typeof req.params === 'object') req.params = sanitizeObject(req.params);
        next();
    };
}

module.exports = sanitizeMiddleware;


