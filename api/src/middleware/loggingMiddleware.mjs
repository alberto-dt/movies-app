import logger from '../utils/logger.mjs';

export const requestLoggingMiddleware = (req, res, next) => {
    const startTime = Date.now();

    logger.debug(`Starting request: ${req.method} ${req.url}`, {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
    });

    const originalSend = res.send;
    res.send = function(data) {
        const duration = Date.now() - startTime;
        logger.logRequest(req, res, duration);

        if (duration > 2000) {
            logger.warn(`Slow response detected: ${req.method} ${req.url}`, {
                duration: duration,
                size: data ? data.length : 0
            });
        }

        return originalSend.call(this, data);
    };

    next();
};

export const errorLoggingMiddleware = (error, req, res, next) => {
    logger.error(`Error en ${req.method} ${req.url}`, error, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        body: req.body,
        params: req.params,
        query: req.query
    });

    res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        timestamp: new Date().toISOString()
    });
};
