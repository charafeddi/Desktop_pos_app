const { redactPII } = require('../utils/logger');

function requestLogger(logger) {
    return (req, res, next) => {
        const start = Date.now();
        const { method, originalUrl } = req;
        const redactedHeaders = { ...req.headers };
        if (redactedHeaders.authorization) redactedHeaders.authorization = 'Bearer ***REDACTED***';
        const bodyPreview = redactPII(JSON.stringify(req.body || {})).slice(0, 1000);

        res.on('finish', () => {
            const duration = Date.now() - start;
            logger.info(`${method} ${originalUrl} ${res.statusCode} ${duration}ms`, `headers=${JSON.stringify(redactedHeaders)}`, `body=${bodyPreview}`);
        });

        next();
    };
}

module.exports = requestLogger;


