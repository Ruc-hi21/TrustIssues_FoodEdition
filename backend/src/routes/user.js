import { Router } from "express";
import { db } from "../config/db.js";
import { users, userAllergens } from "../db/schema/index.js";
import { eq, and } from "drizzle-orm";
import { requireUser, asyncRoute } from "../middleware/requireUser.js";
import {
  cacheGet, cacheSet, cacheDel,
  CacheKey, TTL,
} from "../config/upstash.js";

const router = Router();
router.use(requireUser);

const VALID_SEVERITIES = ["mild", "moderate", "severe", "unknown"];

// ─────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────

// GET /api/user/profile
router.get(
  "/profile",
  asyncRoute(async (req, res) => {
    const userId = req.dbUser.id;

    // Try cache for allergens
    const allergenKey = CacheKey.userAllergens(userId);
    let allergens = await cacheGet(allergenKey);

    if (!allergens) {
      allergens = await db
        .select()
        .from(userAllergens)
        .where(eq(userAllergens.userId, userId))
        .orderBy(userAllergens.allergen);
      await cacheSet(allergenKey, allergens, TTL.USER_PROFILE);
    }

    res.json({ ...req.dbUser, allergens });
  })
);

// PUT /api/user/profile
router.put(
  "/profile",
  asyncRoute(async (req, res) => {
    const { name, preferredLanguage } = req.body;

    const [updated] = await db
      .update(users)
      .set({
        ...(name !== undefined && { name }),
        ...(preferredLanguage !== undefined && { preferredLanguage }),
        updatedAt: new Date(),
      })
      .where(eq(users.id, req.dbUser.id))
      .returning();

    // Invalidate cached profile
    await cacheDel(CacheKey.userProfile(req.dbUser.clerkId));

    res.json({ message: "Profile updated", user: updated });
  })
);

// ─────────────────────────────────────────
// USER ALLERGENS
// ─────────────────────────────────────────

// GET /api/user/allergens
router.get(
  "/allergens",
  asyncRoute(async (req, res) => {
    const userId = req.dbUser.id;
    const cacheKey = CacheKey.userAllergens(userId);

    let allergens = await cacheGet(cacheKey);
    if (!allergens) {
      allergens = await db
        .select()
        .from(userAllergens)
        .where(eq(userAllergens.userId, userId))
        .orderBy(userAllergens.allergen);
      await cacheSet(cacheKey, allergens, TTL.USER_PROFILE);
    }

    res.json({ allergens });
  })
);

// POST /api/user/allergens
// Body: { allergen: "peanuts", severity: "severe" }
router.post(
  "/allergens",
  asyncRoute(async (req, res) => {
    const { allergen, severity = "unknown" } = req.body;
    if (!allergen) return res.status(400).json({ error: "allergen is required" });

    const normAllergen = allergen.toLowerCase().trim();
    const normSeverity = VALID_SEVERITIES.includes(severity) ? severity : "unknown";

    const [row] = await db
      .insert(userAllergens)
      .values({ userId: req.dbUser.id, allergen: normAllergen, severity: normSeverity })
      .onConflictDoUpdate({
        target: [userAllergens.userId, userAllergens.allergen],
        set: { severity: normSeverity },
      })
      .returning();

    // Invalidate allergen cache — next GET will re-fetch fresh list
    await cacheDel(CacheKey.userAllergens(req.dbUser.id));

    res.status(201).json({ message: "Allergen added", allergen: row });
  })
);

// DELETE /api/user/allergens/:allergenId
router.delete(
  "/allergens/:allergenId",
  asyncRoute(async (req, res) => {
    const [deleted] = await db
      .delete(userAllergens)
      .where(
        and(
          eq(userAllergens.id, parseInt(req.params.allergenId)),
          eq(userAllergens.userId, req.dbUser.id)
        )
      )
      .returning();

    if (!deleted) return res.status(404).json({ error: "Allergen not found" });

    await cacheDel(CacheKey.userAllergens(req.dbUser.id));

    res.json({ message: "Allergen removed" });
  })
);

export default router;