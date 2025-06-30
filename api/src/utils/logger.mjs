import fs from 'fs';
import path from 'path';

class Logger {
    constructor() {
        this.logDir = 'logs';
        this.createLogDirectory();
    }

    createLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    formatMessage(level, message, context = {}) {
        const timestamp = new Date().toISOString();
        const contextStr = Object.keys(context).length > 0 ?
            ` | Context: ${JSON.stringify(context)}` : '';

        return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
    }

    writeToFile(filename, message) {
        const filePath = path.join(this.logDir, filename);
        fs.appendFileSync(filePath, message + '\n');
    }

    info(message, context = {}) {
        const formattedMessage = this.formatMessage('info', message, context);
        console.log(`📋 ${formattedMessage}`);
        this.writeToFile('app.log', formattedMessage);
    }

    error(message, error = null, context = {}) {
        const errorDetails = error ? ` | Error: ${error.message} | Stack: ${error.stack}` : '';
        const formattedMessage = this.formatMessage('error', message + errorDetails, context);
        console.error(`🚨 ${formattedMessage}`);
        this.writeToFile('errors.log', formattedMessage);
    }

    warn(message, context = {}) {
        const formattedMessage = this.formatMessage('warn', message, context);
        console.warn(`⚠️ ${formattedMessage}`);
        this.writeToFile('app.log', formattedMessage);
    }

    debug(message, context = {}) {
        if (process.env.NODE_ENV !== 'production') {
            const formattedMessage = this.formatMessage('debug', message, context);
            console.debug(`🔍 ${formattedMessage}`);
            this.writeToFile('debug.log', formattedMessage);
        }
    }

    logRequest(req, res, duration) {
        const logData = {
            method: req.method,
            url: req.url,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            duration: `${duration}ms`,
            status: res.statusCode
        };

        const message = `${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`;
        this.info(message, logData);
        this.writeToFile('requests.log', this.formatMessage('request', message, logData));
    }
    logCache(action, data = {}) {
        const message = `Cache ${action}`;
        this.debug(message, data);
        this.writeToFile('cache.log', this.formatMessage('cache', message, data));
    }
}

const logger = new Logger();

export default logger;
