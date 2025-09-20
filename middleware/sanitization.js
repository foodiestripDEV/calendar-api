const validator = require("validator");

const sanitizeInput = (req, res, next) => {
  try {
    const sanitizeObject = (obj) => {
      if (typeof obj === "string") {
        let sanitized = validator.escape(obj);

        sanitized = sanitized.replace(
          /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
          ""
        );
        sanitized = sanitized.replace(/javascript:/gi, "");
        sanitized = sanitized.replace(/vbscript:/gi, "");
        sanitized = sanitized.replace(/on\w+\s*=/gi, "");
        sanitized = sanitized.replace(/data:text\/html/gi, "");

        return sanitized;
      } else if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      } else if (obj !== null && typeof obj === "object") {
        const sanitized = {};
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            sanitized[key] = sanitizeObject(obj[key]);
          }
        }
        return sanitized;
      }
      return obj;
    };

    if (req.body) {
      req.body = sanitizeObject(req.body);
    }

    if (req.query) {
      req.query = sanitizeObject(req.query);
    }

    if (req.params) {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    console.error("Sanitization error:", error);
    res.status(400).json({
      success: false,
      error: "Invalid input format",
      message: "Request contains invalid or potentially dangerous content",
    });
  }
};

const preventSQLInjection = (req, res, next) => {
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return next();
  }
  
  const sqlInjectionPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(;|\-\-|\/\*|\*\/)/g,
    /(\b(OR|AND)\b.*?=.*?(\b(OR|AND)\b|$))/gi,
  ];

  const checkValue = (value) => {
    if (typeof value === "string") {
      return sqlInjectionPatterns.some((pattern) => pattern.test(value));
    }
    return false;
  };

  const checkObject = (obj) => {
    if (typeof obj === "string") {
      return checkValue(obj);
    } else if (Array.isArray(obj)) {
      return obj.some(checkObject);
    } else if (obj !== null && typeof obj === "object") {
      return Object.values(obj).some(checkObject);
    }
    return false;
  };

  if (
    checkObject(req.body) ||
    checkObject(req.query) ||
    checkObject(req.params)
  ) {
    console.warn(
      `[SECURITY] Potential SQL injection attempt from IP: ${req.ip}`
    );
    return res.status(400).json({
      success: false,
      error: "Invalid input detected",
      message: "Request contains potentially malicious content",
    });
  }

  next();
};

const requestSizeLimiter = (req, res, next) => {
  const maxBodySize = 1024 * 1024;
  const maxQueryParams = 50;
  const maxStringLength = 10000;

  if (req.body && JSON.stringify(req.body).length > maxBodySize) {
    return res.status(413).json({
      success: false,
      error: "Request too large",
      message: "Request body exceeds maximum allowed size",
    });
  }

  if (Object.keys(req.query).length > maxQueryParams) {
    return res.status(400).json({
      success: false,
      error: "Too many parameters",
      message: "Request contains too many query parameters",
    });
  }

  const checkStringLengths = (obj) => {
    if (typeof obj === "string" && obj.length > maxStringLength) {
      return true;
    } else if (Array.isArray(obj)) {
      return obj.some(checkStringLengths);
    } else if (obj !== null && typeof obj === "object") {
      return Object.values(obj).some(checkStringLengths);
    }
    return false;
  };

  if (checkStringLengths(req.body) || checkStringLengths(req.query)) {
    return res.status(400).json({
      success: false,
      error: "String too long",
      message: "Request contains strings that exceed maximum length",
    });
  }

  next();
};

module.exports = {
  sanitizeInput,
  preventSQLInjection,
  requestSizeLimiter,
};
// this file is middleware/sanitization.js and the rest is in server.js