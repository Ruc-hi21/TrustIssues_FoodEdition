// ============================================================
// analysisService.js — IngredientSafe core analysis pipeline
// ============================================================
//
// PIPELINE (7 steps):
//   1. EXTRACT    — pull "Ingredients:" block from combined text
//   2. PARSE      — split into individual tokens
//   3. NORMALISE  — lowercase, resolve synonyms via ingredientDB
//   4. CLASSIFY   — flag each ingredient green/neutral/red
//   5. HUMAN      — allergen matching (user list + hazardDB + OFF tags)
//   6. PET        — toxin matching per pet (dog/cat)
//   7. SCORE      — scoringEngine: greens add, neutrals nothing,
//                   allergens deduct massively + DANGEROUS status
// ============================================================

import { HUMAN_ALLERGEN_RULES, PET_TOXIN_RULES, matchesKeyword } from "./hazardDB.js";
import { normaliseIngredient, classifyIngredient } from "./ingredientDB.js";
import { computeScore } from "./scoringEngine.js";

// ── Step 1: Extract the ingredients block ──
function extractIngredientsBlock(text) {
  const patterns = [
    /ingredients?[\s:]+(.+?)(?=\n\n|\bnutrition\b|\bcontains\b|\bstorage\b|\bbest before\b|\bnet weight\b|$)/is,
    /contains?[\s:]+(.+?)(?=\n\n|\bnutrition\b|\bstorage\b|$)/is,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]?.trim().length > 5) return match[1].trim();
  }
  return text.trim();
}

// ── Step 2: Parse individual tokens ──
function parseIngredients(block) {
  // Flatten sub-ingredients in parentheses first
  const expanded = block.replace(/\(([^)]+)\)/g, ", $1");
  return expanded
    .split(/[,;]/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1)
    .filter((t) => !/^\d+(\.\d+)?%?$/.test(t));
}

// ── Step 3+4: Normalise + Classify ──
function normaliseAndClassify(tokens) {
  return tokens.map((raw) => {
    const normName = normaliseIngredient(raw);
    const classification = classifyIngredient(normName);
    return { raw, normName, classification };
  });
}

// ── Step 5: Human allergen analysis ──
function analyseHuman(normalisedIngredients, userAllergens, offAllergenTags = []) {
  const flags = [];
  const seen = new Set();
  const fullText = normalisedIngredients.join(" ");

  // a) Built-in allergen rules (Big 9 + extended)
  for (const rule of HUMAN_ALLERGEN_RULES) {
    const matchedKw = matchesKeyword(fullText, rule.keywords);
    if (matchedKw && !seen.has(rule.id)) {
      seen.add(rule.id);
      const triggerIng =
        normalisedIngredients.find((i) => rule.keywords.some((kw) => i.includes(kw))) || matchedKw;
      flags.push({
        ingredient: triggerIng,
        matchedKeyword: matchedKw,
        ruleName: rule.name,
        ruleId: rule.id,
        hazardLevel: "danger",
        description: rule.description,
        recommendation: rule.recommendation,
        source: "builtin",
      });
    }
  }

  // b) OFF manufacturer-declared allergen tags
  for (const tag of offAllergenTags) {
    const ruleId = `off_${tag}`;
    if (!seen.has(ruleId)) {
      seen.add(ruleId);
      flags.push({
        ingredient: tag,
        matchedKeyword: tag,
        ruleName: `Declared allergen: ${tag}`,
        ruleId,
        hazardLevel: "danger",
        description: `The manufacturer has declared this product contains ${tag}.`,
        recommendation: "Avoid if allergic.",
        source: "open_food_facts",
      });
    }
  }

  // c) User's personal allergen list
  for (const ua of userAllergens) {
    const norm = normaliseIngredient(ua.allergen);
    const matchedIng = normalisedIngredients.find((i) => i.includes(norm));
    if (matchedIng) {
      const ruleId = `user_${norm}`;
      if (!seen.has(ruleId)) {
        seen.add(ruleId);
        flags.push({
          ingredient: matchedIng,
          matchedKeyword: norm,
          ruleName: `Your allergen: ${ua.allergen}`,
          ruleId,
          hazardLevel: ua.severity === "severe" ? "danger" : "caution",
          description: `You are allergic to ${ua.allergen} (${ua.severity}).`,
          recommendation: "Avoid this product.",
          source: "user",
        });
      }
    }
  }

  return flags;
}

// ── Step 6: Pet analysis (dogs & cats) ──
function analysePets(normalisedIngredients, pets) {
  const fullText = normalisedIngredients.join(" ");

  return pets.map((pet) => {
    const flags = [];
    const seen = new Set();
    const species = pet.species.toLowerCase();

    // a) Built-in species toxin rules
    const speciesRules = PET_TOXIN_RULES.filter((r) => r.affectedSpecies.includes(species));
    for (const rule of speciesRules) {
      const matchedKw = matchesKeyword(fullText, rule.keywords);
      if (matchedKw && !seen.has(rule.id)) {
        seen.add(rule.id);
        const triggerIng =
          normalisedIngredients.find((i) => rule.keywords.some((kw) => i.includes(kw))) || matchedKw;
        flags.push({
          ingredient: triggerIng,
          matchedKeyword: matchedKw,
          ruleName: rule.name,
          ruleId: rule.id,
          hazardLevel: rule.hazardLevel,
          description: rule.mechanism,
          symptoms: rule.symptoms,
          emergencyNote: rule.emergencyNote,
          source: "builtin",
        });
      }
    }

    // b) Owner-defined pet allergens
    for (const allergen of pet.allergens) {
      const norm = normaliseIngredient(allergen);
      const matchedIng = normalisedIngredients.find((i) => i.includes(norm));
      if (matchedIng) {
        const ruleId = `pet_allergen_${pet.petId}_${norm}`;
        if (!seen.has(ruleId)) {
          seen.add(ruleId);
          flags.push({
            ingredient: matchedIng,
            matchedKeyword: norm,
            ruleName: `${pet.name}'s allergen: ${allergen}`,
            ruleId,
            hazardLevel: "caution",
            description: `You flagged ${allergen} as an allergen for ${pet.name}.`,
            source: "user",
          });
        }
      }
    }

    // c) Owner-defined custom hazard ingredients
    for (const hazard of pet.customHazards) {
      const norm = normaliseIngredient(hazard);
      const matchedIng = normalisedIngredients.find((i) => i.includes(norm));
      if (matchedIng) {
        const ruleId = `pet_hazard_${pet.petId}_${norm}`;
        if (!seen.has(ruleId)) {
          seen.add(ruleId);
          flags.push({
            ingredient: matchedIng,
            matchedKeyword: norm,
            ruleName: `Custom hazard for ${pet.name}: ${hazard}`,
            ruleId,
            hazardLevel: "danger",
            description: `You marked ${hazard} as hazardous for ${pet.name}.`,
            source: "user",
          });
        }
      }
    }

    const levels = ["safe", "caution", "danger", "deadly"];
    const worstLevel = flags.reduce(
      (worst, f) => (levels.indexOf(f.hazardLevel) > levels.indexOf(worst) ? f.hazardLevel : worst),
      "safe"
    );

    return {
      petId: pet.petId,
      petName: pet.name,
      species: pet.species,
      isSafe: flags.length === 0,
      severity: worstLevel,
      flags,
    };
  });
}

function guessProductName(rawText) {
  const skip = /ingredients?|nutrition|contains|allerg|serving|calories|per 100/i;
  return (
    rawText.split("\n").map((l) => l.trim()).find((l) => l.length > 2 && l.length < 80 && !skip.test(l)) ||
    "Unknown Product"
  );
}

// ── PUBLIC: run the full pipeline ──
export function runAnalysisPipeline(rawOcrText, userAllergens, pets, mergedSources = {}) {
  const {
    ingredientsText = rawOcrText,
    parsedIngredients: offParsedIngredients = [],
    allergensTags: offAllergenTags = [],
    tracesTags = [],
    productName: externalProductName = null,
    novaGroup = null,
    nutriscoreGrade = null,
    dataSource = "ocr_only",
    confidence = "low",
    imageUrl = null,
  } = mergedSources;

  // Step 1: Extract
  const ingredientsRaw = extractIngredientsBlock(ingredientsText);

  // Step 2: Parse — prefer OFF's pre-parsed list if available
  const rawTokens = offParsedIngredients.length > 0
    ? offParsedIngredients
    : parseIngredients(ingredientsRaw);

  // Step 3+4: Normalise + Classify
  const classified = normaliseAndClassify(rawTokens);
  const normalisedIngredients = classified.map((c) => c.normName);
  const ingredientsList = rawTokens;

  // Step 5: Human allergen analysis
  const humanFlags = analyseHuman(normalisedIngredients, userAllergens, offAllergenTags);

  // Step 6: Pet analysis
  const petResults = analysePets(normalisedIngredients, pets);

  // Step 7: Score
  const scoreResult = computeScore({
    classifications: classified.map((c) => ({ name: c.normName, classification: c.classification })),
    humanFlags,
    petResults,
    novaGroup,
  });

  const productNameGuess = externalProductName || guessProductName(rawOcrText);

  return {
    // Product info
    productNameGuess,
    imageUrl,
    nutriscoreGrade,
    novaGroup,
    dataSource,
    confidence,

    // Ingredients
    ingredientsRaw,
    ingredientsList,
    ingredientsCount: ingredientsList.length,
    classifiedIngredients: classified,

    // Flags
    humanFlags,
    isSafeForUser: humanFlags.length === 0 && !scoreResult.isDangerous,
    petResults,
    traceAllergens: tracesTags,

    // Score
    ...scoreResult,

    analysedAt: new Date().toISOString(),
  };
}