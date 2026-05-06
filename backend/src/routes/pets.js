import { Router } from "express";
import { db } from "../config/db.js";
import { pets, petAllergens, petHazardIngredients } from "../db/schema/index.js";
import { eq, and } from "drizzle-orm";
import { requireUser, asyncRoute } from "../middleware/requireUser.js";
import { cacheGet, cacheSet, cacheDel, CacheKey, TTL } from "../config/upstash.js";

const router = Router();
router.use(requireUser);

const VALID_SPECIES = ["dog", "cat"];
const VALID_SEVERITIES = ["mild", "moderate", "severe", "unknown"];

async function getPetForUser(petId, userId) {
  const [pet] = await db
    .select()
    .from(pets)
    .where(and(eq(pets.id, parseInt(petId)), eq(pets.userId, userId)))
    .limit(1);
  return pet ?? null;
}

// ─────────────────────────────────────────
// PETS CRUD
// ─────────────────────────────────────────

// GET /api/pets
router.get(
  "/",
  asyncRoute(async (req, res) => {
    const userId = req.dbUser.id;
    const cacheKey = CacheKey.petList(userId);

    let cached = await cacheGet(cacheKey);
    if (cached) return res.json({ pets: cached });

    const petList = await db
      .select()
      .from(pets)
      .where(eq(pets.userId, userId))
      .orderBy(pets.name);

    const petsWithDetails = await Promise.all(
      petList.map(async (pet) => {
        const [allergens, hazards] = await Promise.all([
          db.select().from(petAllergens).where(eq(petAllergens.petId, pet.id)).orderBy(petAllergens.allergen),
          db.select().from(petHazardIngredients).where(eq(petHazardIngredients.petId, pet.id)).orderBy(petHazardIngredients.ingredient),
        ]);
        return { ...pet, allergens, hazardIngredients: hazards };
      })
    );

    await cacheSet(cacheKey, petsWithDetails, TTL.PET_LIST);
    res.json({ pets: petsWithDetails });
  })
);

// POST /api/pets
router.post(
  "/",
  asyncRoute(async (req, res) => {
    const { name, species, breed, weightKg, birthYear } = req.body;
    if (!name || !species) return res.status(400).json({ error: "name and species are required" });

    if (!VALID_SPECIES.includes(species.toLowerCase())) {
      return res.status(400).json({ error: `species must be one of: ${VALID_SPECIES.join(", ")}` });
    }

    const [pet] = await db
      .insert(pets)
      .values({
        userId: req.dbUser.id,
        name,
        species: species.toLowerCase(),
        breed: breed ?? null,
        weightKg: weightKg ?? null,
        birthYear: birthYear ?? null,
      })
      .returning();

    await cacheDel(CacheKey.petList(req.dbUser.id));
    res.status(201).json({ message: "Pet added", pet });
  })
);

// PUT /api/pets/:petId
router.put(
  "/:petId",
  asyncRoute(async (req, res) => {
    const pet = await getPetForUser(req.params.petId, req.dbUser.id);
    if (!pet) return res.status(404).json({ error: "Pet not found" });

    const { name, breed, weightKg, birthYear } = req.body;

    const [updated] = await db
      .update(pets)
      .set({
        ...(name !== undefined && { name }),
        ...(breed !== undefined && { breed }),
        ...(weightKg !== undefined && { weightKg }),
        ...(birthYear !== undefined && { birthYear }),
        updatedAt: new Date(),
      })
      .where(eq(pets.id, pet.id))
      .returning();

    await cacheDel(CacheKey.petList(req.dbUser.id));
    res.json({ message: "Pet updated", pet: updated });
  })
);

// DELETE /api/pets/:petId
router.delete(
  "/:petId",
  asyncRoute(async (req, res) => {
    const pet = await getPetForUser(req.params.petId, req.dbUser.id);
    if (!pet) return res.status(404).json({ error: "Pet not found" });

    await db.delete(pets).where(eq(pets.id, pet.id));
    await cacheDel(CacheKey.petList(req.dbUser.id));
    res.json({ message: "Pet removed" });
  })
);

// ─────────────────────────────────────────
// PET ALLERGENS
// ─────────────────────────────────────────

// GET /api/pets/:petId/allergens
router.get(
  "/:petId/allergens",
  asyncRoute(async (req, res) => {
    const pet = await getPetForUser(req.params.petId, req.dbUser.id);
    if (!pet) return res.status(404).json({ error: "Pet not found" });

    const allergens = await db
      .select()
      .from(petAllergens)
      .where(eq(petAllergens.petId, pet.id))
      .orderBy(petAllergens.allergen);

    res.json({ allergens });
  })
);

// POST /api/pets/:petId/allergens
router.post(
  "/:petId/allergens",
  asyncRoute(async (req, res) => {
    const pet = await getPetForUser(req.params.petId, req.dbUser.id);
    if (!pet) return res.status(404).json({ error: "Pet not found" });

    const { allergen, severity = "unknown" } = req.body;
    if (!allergen) return res.status(400).json({ error: "allergen is required" });

    const [row] = await db
      .insert(petAllergens)
      .values({
        petId: pet.id,
        allergen: allergen.toLowerCase().trim(),
        severity: VALID_SEVERITIES.includes(severity) ? severity : "unknown",
      })
      .onConflictDoUpdate({
        target: [petAllergens.petId, petAllergens.allergen],
        set: { severity },
      })
      .returning();

    // Bust pet list cache so allergens are fresh next GET /api/pets
    await cacheDel(CacheKey.petList(req.dbUser.id));
    res.status(201).json({ message: "Pet allergen added", allergen: row });
  })
);

// DELETE /api/pets/:petId/allergens/:allergenId
router.delete(
  "/:petId/allergens/:allergenId",
  asyncRoute(async (req, res) => {
    const pet = await getPetForUser(req.params.petId, req.dbUser.id);
    if (!pet) return res.status(404).json({ error: "Pet not found" });

    const [deleted] = await db
      .delete(petAllergens)
      .where(
        and(
          eq(petAllergens.id, parseInt(req.params.allergenId)),
          eq(petAllergens.petId, pet.id)
        )
      )
      .returning();

    if (!deleted) return res.status(404).json({ error: "Allergen not found" });
    await cacheDel(CacheKey.petList(req.dbUser.id));
    res.json({ message: "Pet allergen removed" });
  })
);

// ─────────────────────────────────────────
// PET HAZARD INGREDIENTS
// ─────────────────────────────────────────

// GET /api/pets/:petId/hazards
router.get(
  "/:petId/hazards",
  asyncRoute(async (req, res) => {
    const pet = await getPetForUser(req.params.petId, req.dbUser.id);
    if (!pet) return res.status(404).json({ error: "Pet not found" });

    const hazards = await db
      .select()
      .from(petHazardIngredients)
      .where(eq(petHazardIngredients.petId, pet.id))
      .orderBy(petHazardIngredients.ingredient);

    res.json({ hazards });
  })
);

// POST /api/pets/:petId/hazards
router.post(
  "/:petId/hazards",
  asyncRoute(async (req, res) => {
    const pet = await getPetForUser(req.params.petId, req.dbUser.id);
    if (!pet) return res.status(404).json({ error: "Pet not found" });

    const { ingredient, notes } = req.body;
    if (!ingredient) return res.status(400).json({ error: "ingredient is required" });

    const [row] = await db
      .insert(petHazardIngredients)
      .values({
        petId: pet.id,
        ingredient: ingredient.toLowerCase().trim(),
        notes: notes ?? null,
      })
      .onConflictDoUpdate({
        target: [petHazardIngredients.petId, petHazardIngredients.ingredient],
        set: { notes: notes ?? null },
      })
      .returning();

    await cacheDel(CacheKey.petList(req.dbUser.id));
    res.status(201).json({ message: "Hazard ingredient added", hazard: row });
  })
);

// DELETE /api/pets/:petId/hazards/:hazardId
router.delete(
  "/:petId/hazards/:hazardId",
  asyncRoute(async (req, res) => {
    const pet = await getPetForUser(req.params.petId, req.dbUser.id);
    if (!pet) return res.status(404).json({ error: "Pet not found" });

    const [deleted] = await db
      .delete(petHazardIngredients)
      .where(
        and(
          eq(petHazardIngredients.id, parseInt(req.params.hazardId)),
          eq(petHazardIngredients.petId, pet.id)
        )
      )
      .returning();

    if (!deleted) return res.status(404).json({ error: "Hazard not found" });
    await cacheDel(CacheKey.petList(req.dbUser.id));
    res.json({ message: "Hazard ingredient removed" });
  })
);

export default router;