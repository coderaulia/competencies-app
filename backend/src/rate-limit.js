"use strict";

function createRateLimiter(options = {}) {
  const windowMs = Number(options.windowMs) || 60 * 1000;
  const max = Number(options.max) || 10;
  const prefix = String(options.prefix || "rate-limit");
  const store = new Map();

  return function rateLimit(req, res, next) {
    const forwardedFor = String(req.headers["x-forwarded-for"] || "")
      .split(",")[0]
      .trim();
    const ip = forwardedFor || req.ip || "unknown";
    const key = `${prefix}:${ip}`;
    const now = Date.now();
    const earliestAllowed = now - windowMs;
    const entries = (store.get(key) || []).filter(
      (timestamp) => timestamp > earliestAllowed
    );

    if (entries.length >= max) {
      res.setHeader("Retry-After", String(Math.ceil(windowMs / 1000)));
      return res.status(429).json({
        error: {
          message: "Too many requests. Please try again later.",
        },
      });
    }

    entries.push(now);
    store.set(key, entries);
    return next();
  };
}

module.exports = {
  createRateLimiter,
};
