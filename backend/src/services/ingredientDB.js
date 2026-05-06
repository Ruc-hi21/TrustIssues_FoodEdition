// ============================================================
// ingredientDB.js — Scientific Ingredient Database
// ============================================================
// Purpose: normalise ingredient names from OCR/OFF text into
// canonical forms, and classify them for scoring.
//
// Three flag tiers used by scoringEngine.js:
//   GREEN   — beneficial / clean: ADD points
//   NEUTRAL — neither good nor bad: no change
//   RED     — harmful / suspect: DEDUCT points
//   ALLERGEN — handled separately by scoringEngine (huge deduction)
//
// Sources: FDA GRAS list, EFSA food additive database,
//          EWG Food Scores, published toxicology literature.
// ============================================================

// ─────────────────────────────────────────
// NORMALISATION MAP
// Maps common OCR variants, abbreviations, and alternate spellings
// → canonical ingredient name used throughout the app.
// ─────────────────────────────────────────
export const NORMALISATION_MAP = {
  // Sugars
  "high fructose corn syrup": "high-fructose corn syrup",
  "hfcs": "high-fructose corn syrup",
  "corn syrup solids": "corn syrup",
  "invert sugar syrup": "invert sugar",
  "cane sugar": "sugar",
  "raw sugar": "sugar",
  "beet sugar": "sugar",
  "crystalline fructose": "fructose",
  "dextrose monohydrate": "dextrose",

  // Fats & oils
  "palm olein": "palm oil",
  "partially hydrogenated soybean oil": "partially hydrogenated oil",
  "partially hydrogenated vegetable oil": "partially hydrogenated oil",
  "hydrogenated vegetable fat": "partially hydrogenated oil",
  "interesterified fat": "interesterified oil",
  "rapeseed oil": "canola oil",
  "colza oil": "canola oil",

  // Preservatives — E-number aliases
  "e200": "sorbic acid",
  "e202": "potassium sorbate",
  "e210": "benzoic acid",
  "e211": "sodium benzoate",
  "e212": "potassium benzoate",
  "e220": "sulphur dioxide",
  "e221": "sodium sulphite",
  "e250": "sodium nitrite",
  "e251": "sodium nitrate",
  "e252": "potassium nitrate",

  // Colours
  "e102": "tartrazine",
  "e104": "quinoline yellow",
  "e110": "sunset yellow fcf",
  "e122": "carmoisine",
  "e124": "ponceau 4r",
  "e129": "allura red",
  "e133": "brilliant blue fcf",
  "e150a": "caramel colour",
  "e150d": "caramel colour (sulphite ammonia)",
  "e171": "titanium dioxide",

  // Sweeteners
  "e950": "acesulfame potassium",
  "acesulfame k": "acesulfame potassium",
  "ace-k": "acesulfame potassium",
  "e951": "aspartame",
  "e952": "cyclamate",
  "e954": "saccharin",
  "e955": "sucralose",
  "e960": "steviol glycosides",
  "stevia extract": "steviol glycosides",
  "reb a": "steviol glycosides",

  // Emulsifiers
  "e322": "lecithin",
  "soy lecithin": "lecithin",
  "sunflower lecithin": "lecithin",
  "e471": "mono- and diglycerides",
  "monoglycerides": "mono- and diglycerides",
  "diglycerides": "mono- and diglycerides",
  "e472e": "datem",
  "e481": "sodium stearoyl lactylate",
  "ssl": "sodium stearoyl lactylate",
  "e482": "calcium stearoyl lactylate",
  "csl": "calcium stearoyl lactylate",

  // Thickeners / stabilisers
  "e401": "sodium alginate",
  "e402": "potassium alginate",
  "e407": "carrageenan",
  "e412": "guar gum",
  "e415": "xanthan gum",
  "e440": "pectin",
  "e460": "microcrystalline cellulose",
  "e466": "carboxymethyl cellulose",
  "cmc": "carboxymethyl cellulose",

  // Antioxidants
  "e300": "ascorbic acid",
  "vitamin c": "ascorbic acid",
  "e306": "tocopherols",
  "e307": "alpha-tocopherol",
  "vitamin e": "tocopherols",
  "e310": "propyl gallate",
  "e320": "bha",
  "butylated hydroxyanisole": "bha",
  "e321": "bht",
  "butylated hydroxytoluene": "bht",

  // Flavour enhancers
  "e621": "monosodium glutamate",
  "msg": "monosodium glutamate",
  "e627": "disodium guanylate",
  "e631": "disodium inosinate",
  "e635": "disodium ribonucleotides",
  "yeast extract": "yeast extract",
  "autolyzed yeast": "yeast extract",
  "hydrolyzed vegetable protein": "hydrolysed vegetable protein",
  "hvp": "hydrolysed vegetable protein",

  // Proteins / dairy variants (for allergen normalisation)
  "skim milk powder": "milk powder",
  "skimmed milk powder": "milk powder",
  "non fat dry milk": "milk powder",
  "dried whey": "whey",
  "whey powder": "whey",
  "sodium caseinate": "casein",
  "calcium caseinate": "casein",
  "milk protein concentrate": "milk protein",
  "milk protein isolate": "milk protein",

  // Starch variants
  "modified corn starch": "modified starch",
  "modified potato starch": "modified starch",
  "modified tapioca starch": "modified starch",
  "hydroxypropyl starch": "modified starch",
  "acetylated starch": "modified starch",
};

// ─────────────────────────────────────────
// INGREDIENT CLASSIFICATION DATABASE
// Each entry: { flag, category, description, sciName? }
// flag: "green" | "neutral" | "red"
// ─────────────────────────────────────────
export const INGREDIENT_CLASSIFICATIONS = {

  // ── GREEN — beneficial / clean ──────────────────────────
  "ascorbic acid":        { flag: "green", category: "vitamin", description: "Vitamin C — antioxidant, naturally occurring in fruits." },
  "tocopherols":          { flag: "green", category: "vitamin", description: "Vitamin E — natural antioxidant found in nuts and seeds." },
  "alpha-tocopherol":     { flag: "green", category: "vitamin", description: "Natural form of Vitamin E." },
  "riboflavin":           { flag: "green", category: "vitamin", description: "Vitamin B2 — essential nutrient." },
  "niacin":               { flag: "green", category: "vitamin", description: "Vitamin B3 — essential nutrient." },
  "thiamine":             { flag: "green", category: "vitamin", description: "Vitamin B1 — essential nutrient." },
  "folic acid":           { flag: "green", category: "vitamin", description: "Vitamin B9 — critical for cell development." },
  "beta carotene":        { flag: "green", category: "vitamin", description: "Provitamin A — natural pigment from vegetables." },
  "steviol glycosides":   { flag: "green", category: "sweetener", description: "Plant-derived zero-calorie sweetener, no glycaemic impact." },
  "xanthan gum":          { flag: "green", category: "stabiliser", description: "Fermentation-derived thickener, generally well tolerated." },
  "pectin":               { flag: "green", category: "fibre", description: "Natural soluble fibre from fruit — supports gut health." },
  "guar gum":             { flag: "green", category: "fibre", description: "Natural seed-derived fibre and thickener." },
  "lecithin":             { flag: "green", category: "emulsifier", description: "Natural emulsifier from soy or sunflower — GRAS status." },
  "sodium alginate":      { flag: "green", category: "stabiliser", description: "Derived from seaweed — natural thickener." },
  "potassium alginate":   { flag: "green", category: "stabiliser", description: "Derived from seaweed — natural thickener." },
  "sorbic acid":          { flag: "green", category: "preservative", description: "Mild natural preservative found in berries — well tolerated." },
  "potassium sorbate":    { flag: "green", category: "preservative", description: "Salt of sorbic acid — widely used safe preservative." },
  "citric acid":          { flag: "green", category: "acidulant", description: "Naturally found in citrus — safe acidulant and preservative." },
  "lactic acid":          { flag: "green", category: "acidulant", description: "Produced by fermentation — safe acidulant." },
  "acetic acid":          { flag: "green", category: "acidulant", description: "Vinegar component — natural preservative." },
  "malic acid":           { flag: "green", category: "acidulant", description: "Found naturally in apples — safe flavour acid." },

  // ── NEUTRAL — no meaningful benefit or harm ──────────────
  "sugar":                { flag: "neutral", category: "sweetener", description: "Common table sugar — neutral in moderate quantities." },
  "salt":                 { flag: "neutral", category: "mineral", description: "Sodium chloride — neutral in normal dietary amounts." },
  "water":                { flag: "neutral", category: "solvent", description: "No nutritional concern." },
  "modified starch":      { flag: "neutral", category: "thickener", description: "Chemically modified starch — generally considered safe." },
  "mono- and diglycerides": { flag: "neutral", category: "emulsifier", description: "Common emulsifier — GRAS, limited health data at high intake." },
  "carrageenan":          { flag: "neutral", category: "thickener", description: "Seaweed-derived thickener — some debate on gut effects, broadly approved." },
  "monosodium glutamate": { flag: "neutral", category: "flavour enhancer", description: "FDA GRAS — evidence does not support 'MSG symptom complex' claims at normal doses." },
  "sodium benzoate":      { flag: "neutral", category: "preservative", description: "Approved preservative — concern only when combined with vitamin C (forms benzene)." },
  "caramel colour":       { flag: "neutral", category: "colour", description: "Common colouring — Class I (plain) is safe; Class IV (sulphite ammonia) has more debate." },
  "corn syrup":           { flag: "neutral", category: "sweetener", description: "Glucose syrup — neutral, but contributes to sugar load." },
  "dextrose":             { flag: "neutral", category: "sweetener", description: "Simple sugar — rapid energy, neutral in small amounts." },
  "fructose":             { flag: "neutral", category: "sweetener", description: "Fruit sugar — neutral in small amounts." },
  "canola oil":           { flag: "neutral", category: "fat", description: "Refined vegetable oil — neutral profile." },
  "palm oil":             { flag: "neutral", category: "fat", description: "Widely used vegetable fat — environmental concern, nutritionally neutral." },
  "yeast extract":        { flag: "neutral", category: "flavour", description: "Natural flavour booster — contains glutamates naturally." },
  "microcrystalline cellulose": { flag: "neutral", category: "filler", description: "Indigestible plant fibre — used as anti-caking agent, inert." },
  "carboxymethyl cellulose": { flag: "neutral", category: "thickener", description: "Synthetic cellulose derivative — some animal studies show gut microbiome effects at high doses." },

  // ── RED — harmful / suspect ──────────────────────────────
  "high-fructose corn syrup": { flag: "red", category: "sweetener", description: "Linked to obesity, insulin resistance, and non-alcoholic fatty liver disease." },
  "partially hydrogenated oil": { flag: "red", category: "fat", description: "Contains trans fats — raises LDL, lowers HDL. FDA banned in US since 2020." },
  "interesterified oil":  { flag: "red", category: "fat", description: "Trans fat replacement — emerging evidence of negative metabolic effects." },
  "sodium nitrite":       { flag: "red", category: "preservative", description: "Used in cured meats — forms carcinogenic nitrosamines when heated. IARC Group 2A." },
  "sodium nitrate":       { flag: "red", category: "preservative", description: "Converts to nitrite in the body — same carcinogenic concern as sodium nitrite." },
  "potassium nitrate":    { flag: "red", category: "preservative", description: "Cured meat preservative — nitrosamine precursor." },
  "tartrazine":           { flag: "red", category: "colour", description: "Azo dye E102 — linked to hyperactivity in children; requires warning label in EU." },
  "sunset yellow fcf":    { flag: "red", category: "colour", description: "Azo dye E110 — linked to hyperactivity; EU warning label required." },
  "carmoisine":           { flag: "red", category: "colour", description: "Azo dye E122 — EU hyperactivity warning label." },
  "ponceau 4r":           { flag: "red", category: "colour", description: "Azo dye E124 — EU hyperactivity warning label." },
  "allura red":           { flag: "red", category: "colour", description: "Azo dye E129 — EU hyperactivity warning label." },
  "quinoline yellow":     { flag: "red", category: "colour", description: "Synthetic dye E104 — EU hyperactivity warning label." },
  "brilliant blue fcf":   { flag: "red", category: "colour", description: "Synthetic dye E133 — some hyperactivity concern." },
  "titanium dioxide":     { flag: "red", category: "colour", description: "E171 — EFSA concluded it can no longer be considered safe; banned in EU food since 2022." },
  "caramel colour (sulphite ammonia)": { flag: "red", category: "colour", description: "Class IV caramel — contains 4-MEI, a possible carcinogen (IARC 2B)." },
  "bha":                  { flag: "red", category: "antioxidant", description: "Butylated hydroxyanisole — possible human carcinogen (IARC 2B). Banned in some countries." },
  "bht":                  { flag: "red", category: "antioxidant", description: "Butylated hydroxytoluene — endocrine disruption concern; some countries restrict use." },
  "propyl gallate":       { flag: "red", category: "antioxidant", description: "E310 — potential endocrine disruptor; banned in infant food." },
  "acesulfame potassium": { flag: "red", category: "sweetener", description: "Artificial sweetener — some studies suggest gut microbiome disruption and insulin response." },
  "aspartame":            { flag: "red", category: "sweetener", description: "IARC classified as possibly carcinogenic (Group 2B, July 2023). Contraindicated in PKU." },
  "cyclamate":            { flag: "red", category: "sweetener", description: "Banned in the USA — evidence of carcinogenicity in animal studies." },
  "saccharin":            { flag: "red", category: "sweetener", description: "Oldest artificial sweetener — IARC Group 3; some evidence of bladder cancer at very high doses." },
  "sucralose":            { flag: "red", category: "sweetener", description: "Emerging evidence of DNA damage at high temperatures and gut microbiome disruption." },
  "benzoic acid":         { flag: "red", category: "preservative", description: "E210 — concern when paired with ascorbic acid (benzene formation)." },
  "hydrolysed vegetable protein": { flag: "red", category: "flavour", description: "Contains free glutamates and may contain trace allergens from source proteins." },
  "datem":                { flag: "red", category: "emulsifier", description: "E472e — animal studies show heart fibrosis at high doses; limited human data." },
};

// ─────────────────────────────────────────
// PUBLIC: normalise a single ingredient string
// ─────────────────────────────────────────
export function normaliseIngredient(raw) {
  const lower = raw.toLowerCase().replace(/[^a-z0-9 \-]/g, " ").replace(/\s+/g, " ").trim();
  return NORMALISATION_MAP[lower] ?? lower;
}

// ─────────────────────────────────────────
// PUBLIC: classify a normalised ingredient
// Returns { flag, category, description } or null if unknown
// ─────────────────────────────────────────
export function classifyIngredient(normalisedName) {
  return INGREDIENT_CLASSIFICATIONS[normalisedName] ?? null;
}