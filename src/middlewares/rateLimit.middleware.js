const rateStore = new Map();
const DEFAULT_WINDOW_MS = 60000;
const DEFAULT_MAX = 100;

export const rateLimit = (options = {}) => {
  const windowMs = options.windowMs || DEFAULT_WINDOW_MS;
  const max = options.max || DEFAULT_MAX;

  return (req, res, next) => {
    const key = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const current = Date.now();
    const entry = rateStore.get(key) || { count: 0, expires: current + windowMs };

    if (current > entry.expires) {
      entry.count = 0;
      entry.expires = current + windowMs;
    }

    entry.count += 1;
    rateStore.set(key, entry);

    if (entry.count > max) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
      });
    }

    next();
  };
};
