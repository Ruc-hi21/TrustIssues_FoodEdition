// ============================================================
// routes/scans.js
// POST /api/scan/camera   — base64 image from Expo camera
// POST /api/scan/upload   — multipart file from gallery
// GET  /api/scan/history  — paginated history (cached)
// GET  /api/scan/:scanId  — full scan detail (cached)
// DELETE /api/scan/:scanId
// ============================================================

import { Router } from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import { db } from "../config/db.js";
import {
  scans, scanIngredients, scanPetResults,
  pets, petAllergens, petHazardIngredients, userAllergens,
} from "../db/schema/index.js";
import { eq, and, desc, count, sql } from "drizzle-orm";
import { requireUser, asyncRoute } from "../middleware/requireUser.js";
import rateLimiter from "../middleware/rateLimiter.js";
import { ocrFromFile, ocrFromBase64 } from "../services/ocrServices.js";
import { runAnalysisPipeline } from "../services/analysisService.js";
import { lookupByBarcode, searchByProductName, mergeWithOCR } from "../services/openFoodFactsService.js";
import { cacheGet, cacheSet, cacheDel, CacheKey, TTL } from "../config/upstash.js";

const router = Router();
router.use(requireUser);

const upload = multer({
  dest: "/tmp/ingredientsafe_uploads/",
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    cb(null, allowed.includes(file.mimetype));
  },
});

// ─────────────────────────────────────────
// Core pipeline — shared by camera + upload
// ─────────────────────────────────────────
async function runScanPipeline(userId, rawOcrText, ocrConfidence, inputSource, barcode = null) {

  // 1. Fetch user allergens (Redis → Neon fallback)
  let userAllergenList = await cacheGet(CacheKey.userAllergens(userId));
  if (!userAllergenList) {
    userAllergenList = await db
      .select({ allergen: userAllergens.allergen, severity: userAllergens.severity })
      .from(userAllergens)
      .where(eq(userAllergens.userId, userId));
    await cacheSet(CacheKey.userAllergens(userId), userAllergenList, TTL.USER_PROFILE);
  }

  // 2. Fetch pets + their allergens/hazards (Redis → Neon fallback)
  let petList = await cacheGet(CacheKey.petList(userId));
  if (!petList) {
    const rawPets = await db.select().from(pets).where(eq(pets.userId, userId));
    petList = await Promise.all(
      rawPets.map(async (pet) => {
        const [allergenRows, hazardRows] = await Promise.all([
          db.select({ allergen: petAllergens.allergen }).from(petAllergens).where(eq(petAllergens.petId, pet.id)),
          db.select({ ingredient: petHazardIngredients.ingredient }).from(petHazardIngredients).where(eq(petHazardIngredients.petId, pet.id)),
        ]);
        return {
          petId: pet.id,
          name: pet.name,
          species: pet.species,
          weightKg: pet.weightKg,
          allergens: allergenRows.map((a) => a.allergen),
          customHazards: hazardRows.map((h) => h.ingredient),
        };
      })
    );
    await cacheSet(CacheKey.petList(userId), petList, TTL.PET_LIST);
  }

  // 3. Fetch from Open Food Facts
  //    Try barcode first (high confidence), fall back to name search
  let offResult = { found: false };
  if (barcode) {
    offResult = await lookupByBarcode(barcode);
  }
  if (!offResult.found) {
    // Guess product name from first non-ingredient OCR line
    const firstLine = rawOcrText.split("\n").find((l) => l.trim().length > 3)?.trim() || "";
    offResult = await searchByProductName(firstLine);
  }

  // 4. Merge OCR + OFF data
  const mergedSources = mergeWithOCR(rawOcrText, offResult.found ? offResult.product : null);

  // 5. Run full analysis pipeline
  const analysis = runAnalysisPipeline(rawOcrText, userAllergenList, petList, mergedSources);

  // 6. Save scan to Neon
  const scanUuid = uuidv4();
  const [scan] = await db
    .insert(scans)
    .values({
      scanUuid,
      userId,
      rawOcrText,
      ocrConfidence,
      ocrEngine: "tesseract",
      externalSource: offResult.found ? "open_food_facts" : null,
      externalConfidence: offResult.found ? offResult.product.confidence : null,
      productName: analysis.productNameGuess,
      ingredientsRaw: analysis.ingredientsRaw,
      ingredientsList: analysis.ingredientsList,
      analysis,
      status: "completed",
      inputSource,
    })
    .returning({ id: scans.id, scanUuid: scans.scanUuid, createdAt: scans.createdAt });

  // 7. Save normalised ingredient rows (for future querying)
  if (analysis.ingredientsList.length > 0) {
    const ingredientRows = analysis.classifiedIngredients.map((c) => ({
      scanId: scan.id,
      ingredient: c.normName,
      isAllergen: analysis.humanFlags.some((f) => f.ingredient === c.normName),
      isPetHazard: analysis.petResults.some((pr) => pr.flags.some((f) => f.ingredient === c.normName)),
      hazardLevel: c.classification?.flag === "red" ? "caution" :
                   analysis.humanFlags.find((f) => f.ingredient === c.normName)?.hazardLevel ?? "safe",
      matchedRule: analysis.humanFlags.find((f) => f.ingredient === c.normName)?.ruleId ?? null,
    }));
    await db.insert(scanIngredients).values(ingredientRows).onConflictDoNothing();
  }

  // 8. Save per-pet results
  if (analysis.petResults.length > 0) {
    await db.insert(scanPetResults).values(
      analysis.petResults.map((pr) => ({
        scanId: scan.id,
        petId: pr.petId,
        isSafe: pr.isSafe,
        severity: pr.severity,
        flaggedItems: pr.flags.map((f) => f.ingredient),
        detail: pr.flags,
      }))
    );
  }

  // 9. Cache the completed scan result
  await cacheSet(CacheKey.scanResult(scan.scanUuid), { ...scan, analysis }, TTL.SCAN_RESULT);

  // 10. Bust history cache (new scan changes the list)
  // Pattern-based bust: delete page 1 and 2 for this user (most common pages)
  await cacheDel(
    CacheKey.scanHistory(userId, 1, 20),
    CacheKey.scanHistory(userId, 1, 10),
    CacheKey.scanHistory(userId, 2, 20)
  );

  return { scanUuid: scan.scanUuid, analysis };
}

// ─────────────────────────────────────────
// POST /api/scan/camera
// Body: { image: "<base64>", barcode?: "<ean13>" }
// Rate limited: 10 req / 180s per user
// ─────────────────────────────────────────
router.post(
  "/camera",
  rateLimiter,
  asyncRoute(async (req, res) => {
    const { image, barcode } = req.body;
    if (!image) return res.status(400).json({ error: "image (base64) is required" });

    const ocrResult = await ocrFromBase64(image);
    if (!ocrResult.success) {
      return res.status(422).json({
        error: "OCR_FAILED",
        message: ocrResult.error,
        suggestion: "Retake the photo with better lighting and a steady hand.",
      });
    }

    const { scanUuid, analysis } = await runScanPipeline(
      req.dbUser.id, ocrResult.rawText, ocrResult.confidence, "camera", barcode ?? null
    );

    res.status(201).json({
      scanId: scanUuid,
      ocrConfidence: ocrResult.confidence,
      wordCount: ocrResult.wordCount,
      analysis,
    });
  })
);

// ─────────────────────────────────────────
// POST /api/scan/upload
// Form: image (file), barcode? (field)
// Rate limited
// ─────────────────────────────────────────
router.post(
  "/upload",
  rateLimiter,
  upload.single("image"),
  asyncRoute(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "image file is required" });

    const filePath = req.file.path;
    const barcode = req.body.barcode ?? null;

    try {
      const ocrResult = await ocrFromFile(filePath);
      if (!ocrResult.success) {
        return res.status(422).json({
          error: "OCR_FAILED",
          message: ocrResult.error,
          suggestion: "Upload a clearer, higher-resolution image.",
        });
      }

      const { scanUuid, analysis } = await runScanPipeline(
        req.dbUser.id, ocrResult.rawText, ocrResult.confidence, "upload", barcode
      );

      res.status(201).json({
        scanId: scanUuid,
        ocrConfidence: ocrResult.confidence,
        wordCount: ocrResult.wordCount,
        analysis,
      });
    } finally {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  })
);

// ─────────────────────────────────────────
// GET /api/scan/history?page=1&limit=20
// ─────────────────────────────────────────
router.get(
  "/history",
  asyncRoute(async (req, res) => {
    const userId = req.dbUser.id;
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const cacheKey = CacheKey.scanHistory(userId, page, limit);
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const [scanList, [{ total }]] = await Promise.all([
      db.select({
          scanUuid:    scans.scanUuid,
          productName: scans.productName,
          inputSource: scans.inputSource,
          status:      scans.status,
          createdAt:   scans.createdAt,
          score:       sql`(${scans.analysis}->>'score')::int`,
          rating:      sql`${scans.analysis}->>'rating'`,
          isDangerous: sql`(${scans.analysis}->>'isDangerous')::boolean`,
        })
        .from(scans)
        .where(eq(scans.userId, userId))
        .orderBy(desc(scans.createdAt))
        .limit(limit)
        .offset(offset),

      db.select({ total: count() }).from(scans).where(eq(scans.userId, userId)),
    ]);

    const payload = {
      scans: scanList,
      pagination: { page, limit, total, hasMore: offset + scanList.length < total },
    };

    await cacheSet(cacheKey, payload, TTL.SCAN_HISTORY);
    res.json(payload);
  })
);

// ─────────────────────────────────────────
// GET /api/scan/:scanId
// ─────────────────────────────────────────
router.get(
  "/:scanId",
  asyncRoute(async (req, res) => {
    const { scanId } = req.params;

    // Check cache first
    const cached = await cacheGet(CacheKey.scanResult(scanId));
    if (cached && cached.userId === req.dbUser.id) {
      // Fetch pet results (not stored in cache to keep size down)
      const petResultList = await db
        .select({
          id: scanPetResults.id, petId: scanPetResults.petId,
          isSafe: scanPetResults.isSafe, severity: scanPetResults.severity,
          flaggedItems: scanPetResults.flaggedItems, detail: scanPetResults.detail,
          petName: pets.name, species: pets.species,
        })
        .from(scanPetResults)
        .innerJoin(pets, eq(pets.id, scanPetResults.petId))
        .where(eq(scanPetResults.scanId, cached.id));

      return res.json({ ...cached, petResults: petResultList });
    }

    // Cache miss — fetch from Neon
    const [scan] = await db
      .select()
      .from(scans)
      .where(and(eq(scans.scanUuid, scanId), eq(scans.userId, req.dbUser.id)))
      .limit(1);

    if (!scan) return res.status(404).json({ error: "Scan not found" });

    const petResultList = await db
      .select({
        id: scanPetResults.id, petId: scanPetResults.petId,
        isSafe: scanPetResults.isSafe, severity: scanPetResults.severity,
        flaggedItems: scanPetResults.flaggedItems, detail: scanPetResults.detail,
        petName: pets.name, species: pets.species,
      })
      .from(scanPetResults)
      .innerJoin(pets, eq(pets.id, scanPetResults.petId))
      .where(eq(scanPetResults.scanId, scan.id));

    await cacheSet(CacheKey.scanResult(scanId), scan, TTL.SCAN_RESULT);
    res.json({ ...scan, petResults: petResultList });
  })
);

// ─────────────────────────────────────────
// DELETE /api/scan/:scanId
// ─────────────────────────────────────────
router.delete(
  "/:scanId",
  asyncRoute(async (req, res) => {
    const [deleted] = await db
      .delete(scans)
      .where(and(eq(scans.scanUuid, req.params.scanId), eq(scans.userId, req.dbUser.id)))
      .returning({ id: scans.id });

    if (!deleted) return res.status(404).json({ error: "Scan not found" });

    await cacheDel(
      CacheKey.scanResult(req.params.scanId),
      CacheKey.scanHistory(req.dbUser.id, 1, 20),
      CacheKey.scanHistory(req.dbUser.id, 1, 10)
    );

    res.status(204).send();
  })
);

export default router;