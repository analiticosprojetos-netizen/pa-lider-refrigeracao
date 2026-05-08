const rateLimit = require('express-rate-limit');

const globalRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  validate: false,
  message: { success: false, message: 'Muitas requisições deste IP, tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const userRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.USER_RATE_LIMIT_MAX) || 500,
  keyGenerator: (req) => {
    return req.user ? req.user.id.toString() : req.ip;
  },
  validate: false,
  message: { success: false, message: 'Muitas requisições deste usuário, tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  globalRateLimiter,
  userRateLimiter
};
