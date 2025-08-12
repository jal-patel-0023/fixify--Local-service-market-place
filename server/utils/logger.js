let pino;
try {
  // Optional dependency: if not installed, we fall back to console
  pino = require('pino');
} catch (e) {
  pino = null;
}

let logger;

if (pino) {
  logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV !== 'production' ? {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'SYS:standard' }
    } : undefined
  });
} else {
  // Lightweight console fallback if pino is not available
  const wrap = (fn) => (...args) => fn('[logger]', ...args);
  logger = {
    info: wrap(console.log),
    warn: wrap(console.warn),
    error: wrap(console.error),
    debug: wrap(console.debug),
    child: () => logger,
  };
  console.warn('[logger] pino not installed; using console fallback. To enable structured logging, run: npm install pino pino-pretty');
}

module.exports = logger;

