// ============================================================
// config/upstash.js — Upstash Redis + Rate Limiter
// ============================================================
// ENV vars required:
//   UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
//   UPSTASH_REDIS_REST_TOKEN=AXxx...
//
// These are auto-read by Redis.fromEnv()
// ============================================================

import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import "dotenv/config";

// ─────────────────────────────────────────
// Redis client — used for caching
// ─────────────────────────────────────────
export const redis = Redis.fromEnv();

// ─────────────────────────────────────────
// Rate limiter — 10 requests per 180 seconds
// Applied to all /api/scan routes (OCR is expensive)
// ─────────────────────────────────────────
export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "180 s"),
  analytics: true,                    // track usage in Upstash dashboard
  prefix: "ingredientsafe_ratelimit", // namespace to avoid key collisions
});

// ─────────────────────────────────────────
// Cache TTLs (seconds)
// ─────────────────────────────────────────
export const TTL = {
  USER_PROFILE: 60 * 5,        // 5 min  — user profile + allergens
  SCAN_RESULT: 60 * 60 * 24,   // 24 hrs — individual scan result
  SCAN_HISTORY: 60 * 2,        // 2 min  — scan history list (short: changes often)
  PET_LIST: 60 * 5,            // 5 min  — user's pet list
};

// ─────────────────────────────────────────
// Cache key builders — centralised so keys
// are consistent across all files
// ─────────────────────────────────────────
export const CacheKey = {
  userProfile: (userId) => `user:${userId}:profile`,
  userAllergens: (userId) => `user:${userId}:allergens`,
  scanResult: (scanUuid) => `scan:${scanUuid}`,
  scanHistory: (userId, page, limit) => `user:${userId}:history:${page}:${limit}`,
  petList: (userId) => `user:${userId}:pets`,
};

// ─────────────────────────────────────────
// Helpers: safe get/set with error swallowing
// Redis failures should NEVER crash the app —
// we fall through to the DB transparently.
// ─────────────────────────────────────────
export async function cacheGet(key) {
  try {
    return await redis.get(key);
  } catch (err) {
    console.warn(`[cache] GET failed for key "${key}":`, err.message);
    return null;
  }
}

export async function cacheSet(key, value, ttlSeconds) {
  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch (err) {
    console.warn(`[cache] SET failed for key "${key}":`, err.message);
  }
}

export async function cacheDel(...keys) {
  try {
    if (keys.length > 0) await redis.del(...keys);
  } catch (err) {
    console.warn(`[cache] DEL failed for keys "${keys.join(", ")}":`, err.message);
  }
}

export default ratelimit;