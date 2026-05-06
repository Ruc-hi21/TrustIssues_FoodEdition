import { Router } from "express";
import { HUMAN_ALLERGEN_RULES, PET_TOXIN_RULES } from "../services/hazardDB.js";

const router = Router();

// GET /api/hazards?search=xylitol
// Public reference lookup — no auth required
router.get("/", (req, res) => {
  const query = (req.query.search || "").toLowerCase().trim();

  const humanMatches = HUMAN_ALLERGEN_RULES.filter(
    (r) =>
      r.name.toLowerCase().includes(query) ||
      r.keywords.some((k) => k.includes(query))
  ).map((r) => ({ type: "human_allergen", ...r }));

  const petMatches = PET_TOXIN_RULES.filter(
    (r) =>
      r.name.toLowerCase().includes(query) ||
      r.keywords.some((k) => k.includes(query))
  ).map((r) => ({ type: "pet_toxin", ...r }));

  res.json({
    query,
    results: [...humanMatches, ...petMatches],
    totalHuman: humanMatches.length,
    totalPet: petMatches.length,
  });
});

export default router;