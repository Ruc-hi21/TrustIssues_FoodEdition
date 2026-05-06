// ============================================================
// scoringEngine.js — IngredientSafe Scoring Algorithm
// ============================================================
//
// SCORING RULES (applied in order):
//
//   BASE SCORE: 100
//
//   GREEN ingredient found:
//     +5 per ingredient (capped at +20 total green bonus)
//     → rewards clean/beneficial formulations
//
//   NEUTRAL ingredient:
//     +0 / no change
//     → neither penalised nor rewarded
//
//   RED ingredient found:
//     -15 per ingredient
//     → harmful additive, processing concern
//
//   USER ALLERGEN matched (personal account allergens):
//     -60 per match  +  status = "DANGEROUS"
//     → huge deduction, overrides everything
//
//   BUILT-IN allergen rule matched (Big 9 etc.):
//     -40 per match  +  flag as danger
//
//   PET TOXIN matched:
//     deadly: -35  |  danger: -25  |  caution: -10
//
//   OFF declared allergen tag:
//     -40 per tag (same as built-in — manufacturer confirmed)
//
//   NOVA GROUP penalty (ultra-processed):
//     nova 4: -10
//     nova 3: -5
//     nova 1/2: +5
//
//   Floor: 0  |  Ceiling: 100
//
// RATING BANDS:
//   80–100 → Safe     (green  #2e7d32)
//   55–79  → Caution  (amber  #f57f17)
//   0–54   → Danger   (red    #c62828)
// ============================================================

const POINTS = {
  GREEN_PER:          +5,
  GREEN_CAP:          +20,
  NEUTRAL:             0,
  RED_PER:            -15,
  USER_ALLERGEN:      -60,   // personal account allergen
  BUILTIN_ALLERGEN:   -40,   // Big 9 / extended list
  OFF_ALLERGEN:       -40,   // manufacturer-declared tag
  PET_DEADLY:         -35,
  PET_DANGER:         -25,
  PET_CAUTION:        -10,
  NOVA_4:             -10,
  NOVA_3:              -5,
  NOVA_1_2:            +5,
};

// ─────────────────────────────────────────
// Score ingredients classified by ingredientDB
// ─────────────────────────────────────────
function scoreClassifiedIngredients(classifications) {
  let delta = 0;
  let greenCount = 0;
  const breakdown = [];

  for (const { name, classification } of classifications) {
    if (!classification) {
      breakdown.push({ name, flag: "unknown", points: 0 });
      continue;
    }

    let points = 0;
    if (classification.flag === "green") {
      if (greenCount * POINTS.GREEN_PER < POINTS.GREEN_CAP) {
        points = POINTS.GREEN_PER;
        greenCount++;
      }
    } else if (classification.flag === "red") {
      points = POINTS.RED_PER;
    } else {
      points = POINTS.NEUTRAL;
    }

    delta += points;
    breakdown.push({
      name,
      flag: classification.flag,
      category: classification.category,
      description: classification.description,
      points,
    });
  }

  return { delta, breakdown };
}

// ─────────────────────────────────────────
// Score human allergen flags
// ─────────────────────────────────────────
function scoreHumanFlags(humanFlags) {
  let delta = 0;
  const dangerous = [];

  for (const flag of humanFlags) {
    if (flag.source === "user") {
      delta += POINTS.USER_ALLERGEN;
      dangerous.push({ ...flag, points: POINTS.USER_ALLERGEN, status: "DANGEROUS" });
    } else if (flag.source === "open_food_facts") {
      delta += POINTS.OFF_ALLERGEN;
      dangerous.push({ ...flag, points: POINTS.OFF_ALLERGEN, status: "DANGEROUS" });
    } else {
      delta += POINTS.BUILTIN_ALLERGEN;
      dangerous.push({ ...flag, points: POINTS.BUILTIN_ALLERGEN, status: "DANGEROUS" });
    }
  }

  return { delta, dangerous };
}

// ─────────────────────────────────────────
// Score pet results
// ─────────────────────────────────────────
function scorePetResults(petResults) {
  let delta = 0;

  for (const pet of petResults) {
    for (const flag of pet.flags) {
      if (flag.hazardLevel === "deadly") delta += POINTS.PET_DEADLY;
      else if (flag.hazardLevel === "danger") delta += POINTS.PET_DANGER;
      else if (flag.hazardLevel === "caution") delta += POINTS.PET_CAUTION;
    }
  }

  return delta;
}

// ─────────────────────────────────────────
// Score Nova group (processing level)
// ─────────────────────────────────────────
function scoreNova(novaGroup) {
  if (novaGroup === 4) return POINTS.NOVA_4;
  if (novaGroup === 3) return POINTS.NOVA_3;
  if (novaGroup === 1 || novaGroup === 2) return POINTS.NOVA_1_2;
  return 0;
}

// ─────────────────────────────────────────
// PUBLIC: compute final score
// ─────────────────────────────────────────
export function computeScore({
  classifications = [],
  humanFlags = [],
  petResults = [],
  novaGroup = null,
}) {
  let score = 100;

  const { delta: ingredientDelta, breakdown } = scoreClassifiedIngredients(classifications);
  const { delta: allergenDelta, dangerous } = scoreHumanFlags(humanFlags);
  const petDelta = scorePetResults(petResults);
  const novaDelta = scoreNova(novaGroup);

  score += ingredientDelta + allergenDelta + petDelta + novaDelta;
  score = Math.max(0, Math.min(100, score));

  const rating =
    score >= 80 ? "Safe" :
    score >= 55 ? "Caution" :
    "Danger";

  const ratingColor =
    rating === "Safe"    ? "#2e7d32" :
    rating === "Caution" ? "#f57f17" :
    "#c62828";

  // Flag as DANGEROUS if any user/confirmed allergen matched
  const isDangerous = dangerous.length > 0;

  return {
    score,
    rating: isDangerous ? "Danger" : rating,
    ratingColor: isDangerous ? "#c62828" : ratingColor,
    isDangerous,
    breakdown: {
      ingredients: breakdown,
      allergens: dangerous,
      novaPoints: novaDelta,
      petPoints: petDelta,
    },
    pointsDetail: {
      base: 100,
      ingredientDelta,
      allergenDelta,
      petDelta,
      novaDelta,
      final: score,
    },
  };
}