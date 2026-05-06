// ============================================================
// middleware/rateLimiter.js
// Upstash sliding window: 10 requests / 180s per user
// Identifier: real Clerk userId (not hardcoded)
// ============================================================

import ratelimiter from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
  try {
    // Use real Clerk userId so each user gets their own window.
    // Fall back to IP if somehow called before auth resolves.
    const identifier =
      req.auth?.userId ||
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.ip ||
      "anonymous";

    const { success, limit, remaining, reset } = await ratelimiter.limit(identifier);

    // Expose headers so the React Native client can show a countdown
    res.setHeader("X-RateLimit-Limit", limit);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", reset);

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      return res.status(429).json({
        error: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests. Please wait before scanning again.",
        retryAfter,
      });
    }

    next();
  } catch (error) {
    // Upstash unreachable — fail open, never block the user
    console.warn("[rateLimiter] Upstash unreachable, skipping:", error.message);
    next();
  }
};

export default rateLimiter;