import { Router } from "express";
import { db } from "../config/db.js";
import { users } from "../db/schema/index.js";
import { eq } from "drizzle-orm";
import { asyncRoute } from "../middleware/requireUser.js";
import { cacheSet, cacheDel, CacheKey, TTL } from "../config/upstash.js";

const router = Router();

// POST /api/auth/sync
// Call after Clerk sign-in to ensure user exists in local DB.
router.post(
  "/sync",
  asyncRoute(async (req, res) => {
    const clerkId = req.auth.userId;
    const { name, email } = req.body;

    if (!email) return res.status(400).json({ error: "Email is required" });

    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (existing) {
      // Refresh cache on every sync
      await cacheSet(CacheKey.userProfile(clerkId), existing, TTL.USER_PROFILE);
      return res.json({ user: existing, created: false });
    }

    const [created] = await db
      .insert(users)
      .values({ clerkId, name: name ?? null, email })
      .returning();

    await cacheSet(CacheKey.userProfile(clerkId), created, TTL.USER_PROFILE);

    res.status(201).json({ user: created, created: true });
  })
);

export default router;