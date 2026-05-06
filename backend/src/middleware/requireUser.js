// ============================================================
// middleware/requireUser.js
// Resolves Clerk userId → internal DB user.
// Cache layer: Redis (TTL 5 min) → Neon DB fallback.
// Attaches req.dbUser for all protected routes.
// ============================================================

import { db } from "../config/db.js";
import { users } from "../db/schema/index.js";
import { eq } from "drizzle-orm";
import { cacheGet, cacheSet, CacheKey, TTL } from "../config/upstash.js";

export async function requireUser(req, res, next) {
  try {
    const clerkId = req.auth?.userId;
    if (!clerkId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const cacheKey = CacheKey.userProfile(clerkId);

    // 1. Try Redis cache first
    const cached = await cacheGet(cacheKey);
    if (cached) {
      req.dbUser = cached;
      return next();
    }

    // 2. Fall through to Neon DB
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (!user) {
      return res.status(404).json({
        error: "User not found. Call POST /api/auth/sync first.",
      });
    }

    // 3. Warm the cache for next request
    await cacheSet(cacheKey, user, TTL.USER_PROFILE);

    req.dbUser = user;
    next();
  } catch (err) {
    next(err);
  }
}

// Wrap async route handlers — avoids try/catch in every route
export function asyncRoute(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}