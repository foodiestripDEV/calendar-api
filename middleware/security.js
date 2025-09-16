const crypto = require("crypto");

const authenticateApiKey = (req, res, next) => {
  const apiKey =
    req.headers["x-api-key"] ||
    req.headers["authorization"]?.replace("Bearer ", "");

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: "API key required",
      message:
        "Please provide a valid API key in X-API-Key header or Authorization Bearer token",
    });
  }

  const validApiKeys = process.env.VALID_API_KEYS?.split(",") || [];

  if (!validApiKeys.includes(apiKey)) {
    return res.status(401).json({
      success: false,
      error: "Invalid API key",
      message: "The provided API key is not valid",
    });
  }

  req.apiKey = apiKey;
  next();
};

const apiKeyRateLimit = {};

const rateLimitByApiKey = (req, res, next) => {
  const apiKey = req.apiKey;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxRequests = 50;

  if (!apiKeyRateLimit[apiKey]) {
    apiKeyRateLimit[apiKey] = {
      requests: [],
      blocked: false,
    };
  }

  const keyData = apiKeyRateLimit[apiKey];

  keyData.requests = keyData.requests.filter((time) => now - time < windowMs);

  if (keyData.requests.length >= maxRequests) {
    return res.status(429).json({
      success: false,
      error: "Rate limit exceeded",
      message: `API key rate limit exceeded. Maximum ${maxRequests} requests per 15 minutes.`,
      retryAfter: Math.ceil((keyData.requests[0] + windowMs - now) / 1000),
    });
  }

  keyData.requests.push(now);
  next();
};

const ipWhitelist = (req, res, next) => {
  const clientIp =
    req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  const allowedIPs = process.env.ALLOWED_IPS?.split(",") || [];

  if (process.env.NODE_ENV === "development") {
    return next();
  }

  if (allowedIPs.length > 0 && !allowedIPs.includes(clientIp)) {
    console.warn(`Blocked request from unauthorized IP: ${clientIp}`);
    return res.status(403).json({
      success: false,
      error: "Access forbidden",
      message: "Your IP address is not authorized to access this API",
    });
  }

  next();
};

const securityLogger = (req, res, next) => {
  const clientIp = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers["user-agent"];
  const apiKey = req.apiKey;

  console.log(
    `[SECURITY] ${new Date().toISOString()} - IP: ${clientIp}, API Key: ${apiKey?.substring(
      0,
      8
    )}***, Method: ${req.method}, Path: ${req.path}, User-Agent: ${userAgent}`
  );

  next();
};

const generateApiKey = () => {
  return crypto.randomBytes(32).toString("hex");
};

module.exports = {
  authenticateApiKey,
  rateLimitByApiKey,
  ipWhitelist,
  securityLogger,
  generateApiKey,
};
