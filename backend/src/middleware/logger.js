
const structuredLog = (type, data) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    severity: type === 'error' ? 'ERROR' : 'INFO',
    service: 'shopsphere-backend',
    ...data
  };
  console.log(JSON.stringify(logEntry));
};

export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    structuredLog('request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Date.now() - start,
      userAgent: req.get('user-agent'),
      ip: req.ip
    });
  });

  next();
};

export const errorLogger = (err, req, res, next) => {
  structuredLog('error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  res.status(500).json({ error: 'Internal Server Error' });
};
