const morgan = require("morgan");

// Colores para la consola
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
};

// Función para obtener el color según el status code
const getStatusColor = (status) => {
    if (status >= 500) return colors.red;
    if (status >= 400) return colors.yellow;
    if (status >= 300) return colors.cyan;
    if (status >= 200) return colors.green;
    return colors.reset;
};

// Función para obtener el color según el método HTTP
const getMethodColor = (method) => {
    switch (method) {
        case 'GET': return colors.blue;
        case 'POST': return colors.green;
        case 'PUT': return colors.yellow;
        case 'DELETE': return colors.red;
        case 'PATCH': return colors.magenta;
        default: return colors.reset;
    }
};

// Formato personalizado de morgan con colores
const morganFormat = (tokens, req, res) => {
    const method = tokens.method(req, res);
    const url = tokens.url(req, res);
    const status = tokens.status(req, res);
    const responseTime = tokens['response-time'](req, res);
    const contentLength = tokens.res(req, res, 'content-length');
    
    const methodColor = getMethodColor(method);
    const statusColor = getStatusColor(status);
    
    const timestamp = new Date().toISOString();
    const user = req.user ? `[${req.user.email}]` : '[Anonymous]';
    
    return [
        `${colors.dim}${timestamp}${colors.reset}`,
        `${methodColor}${method.padEnd(7)}${colors.reset}`,
        `${statusColor}${status}${colors.reset}`,
        `${colors.cyan}${responseTime}ms${colors.reset}`,
        `${colors.dim}${contentLength || '-'}${colors.reset}`,
        `${user}`,
        `${url}`
    ].join(' ');
};

// Middleware de morgan con formato personalizado
const httpLogger = morgan(morganFormat, {
    skip: (req, res) => {
        // No loggear requests a archivos estáticos si los hay
        return false;
    }
});

// Logger personalizado para la aplicación
const logger = {
    info: (message, ...args) => {
        const timestamp = new Date().toISOString();
        console.log(`${colors.dim}${timestamp}${colors.reset} ${colors.cyan}[INFO]${colors.reset} ${message}`, ...args);
    },
    
    error: (message, ...args) => {
        const timestamp = new Date().toISOString();
        console.error(`${colors.dim}${timestamp}${colors.reset} ${colors.red}[ERROR]${colors.reset} ${message}`, ...args);
    },
    
    warn: (message, ...args) => {
        const timestamp = new Date().toISOString();
        console.warn(`${colors.dim}${timestamp}${colors.reset} ${colors.yellow}[WARN]${colors.reset} ${message}`, ...args);
    },
    
    success: (message, ...args) => {
        const timestamp = new Date().toISOString();
        console.log(`${colors.dim}${timestamp}${colors.reset} ${colors.green}[SUCCESS]${colors.reset} ${message}`, ...args);
    },
    
    debug: (message, ...args) => {
        if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
            const timestamp = new Date().toISOString();
            console.log(`${colors.dim}${timestamp}${colors.reset} ${colors.magenta}[DEBUG]${colors.reset} ${message}`, ...args);
        }
    }
};

module.exports = {
    httpLogger,
    logger
};

