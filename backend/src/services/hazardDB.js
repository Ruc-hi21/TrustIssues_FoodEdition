// ============================================================
// hazardDB.js — IngredientSafe built-in hazard knowledge base
// Scope: Human allergens (Big 9 + extended) + Dog/Cat toxins
// Used as FALLBACK when external API is unavailable.
// Always runs in parallel as a safety net.
// ============================================================

// ─────────────────────────────────────────
// HUMAN ALLERGEN RULES  (FDA Big 9 + extended)
// ─────────────────────────────────────────
export const HUMAN_ALLERGEN_RULES = [
  {
    id: "allergen_milk",
    name: "Dairy / Milk",
    keywords: [
      "milk", "lactose", "dairy", "whey", "casein", "caseinate",
      "lactalbumin", "lactoglobulin", "butter", "cream", "cheese",
      "yogurt", "ghee", "curds", "lactulose",
    ],
    category: "big9",
    description: "Contains milk proteins (casein/whey) that trigger immune reactions.",
    recommendation: "Avoid. Check for lactose-free alternatives.",
  },
  {
    id: "allergen_eggs",
    name: "Eggs",
    keywords: [
      "egg", "eggs", "albumin", "globulin", "lysozyme", "mayonnaise",
      "meringue", "ovalbumin", "ovomucin", "ovomucoid",
    ],
    category: "big9",
    description: "Egg proteins in both white and yolk are common allergens.",
    recommendation: "Check labels carefully — eggs appear in many baked goods.",
  },
  {
    id: "allergen_fish",
    name: "Fish",
    keywords: [
      "fish", "salmon", "tuna", "cod", "tilapia", "bass", "flounder",
      "haddock", "mahi", "perch", "snapper", "sole", "swordfish",
      "trout", "anchovy", "anchovies", "worcestershire",
    ],
    category: "big9",
    description: "Fish proteins are stable and can survive cooking.",
    recommendation: "Avoid all fish species; cross-contamination risk is high.",
  },
  {
    id: "allergen_shellfish",
    name: "Shellfish",
    keywords: [
      "shellfish", "shrimp", "crab", "lobster", "oyster", "scallop",
      "clam", "mussel", "prawn", "crayfish", "squid", "octopus", "calamari",
    ],
    category: "big9",
    description: "Shellfish allergy is often lifelong and can cause anaphylaxis.",
    recommendation: "Strict avoidance. Carry epinephrine if prescribed.",
  },
  {
    id: "allergen_peanuts",
    name: "Peanuts",
    keywords: [
      "peanut", "groundnut", "arachis oil", "peanut oil",
      "peanut butter", "monkey nuts", "mixed nuts",
    ],
    category: "big9",
    description: "One of the most common causes of fatal anaphylaxis.",
    recommendation: "Strict avoidance. Verify 'may contain peanuts' warnings.",
  },
  {
    id: "allergen_tree_nuts",
    name: "Tree Nuts",
    keywords: [
      "almond", "cashew", "walnut", "pecan", "pistachio", "hazelnut",
      "macadamia", "brazil nut", "pine nut", "chestnut",
      "marzipan", "nougat", "praline",
    ],
    category: "big9",
    description: "Tree nut allergy is distinct from peanut allergy but equally serious.",
    recommendation: "Avoid all tree nuts unless allergen-tested individually.",
  },
  {
    id: "allergen_wheat_gluten",
    name: "Wheat / Gluten",
    keywords: [
      "wheat", "gluten", "flour", "bread", "semolina", "spelt", "durum",
      "kamut", "farro", "triticale", "seitan", "wheat starch",
      "wheat germ", "wheat bran",
    ],
    category: "big9",
    description: "Relevant for wheat allergy AND celiac disease.",
    recommendation: "Look for certified gluten-free labels.",
  },
  {
    id: "allergen_soy",
    name: "Soy / Soya",
    keywords: [
      "soy", "soya", "soybean", "tofu", "miso", "tempeh", "edamame",
      "soy sauce", "tamari", "soy milk", "soy protein",
      "textured vegetable protein", "tvp",
    ],
    category: "big9",
    description: "Soy is widespread in processed foods — read all labels.",
    recommendation: "Check sauces, processed snacks, and meat substitutes.",
  },
  {
    id: "allergen_sesame",
    name: "Sesame",
    keywords: [
      "sesame", "tahini", "til", "gingelly", "benne",
      "sesame oil", "sesame seed", "sesame flour",
    ],
    category: "big9",
    description: "Added to the Big 9 by the FASTER Act (2023).",
    recommendation: "Common in Middle Eastern, Asian, and artisan baked goods.",
  },
  {
    id: "allergen_sulphites",
    name: "Sulphites / Sulfites",
    keywords: [
      "sulphite", "sulfite", "sulphur dioxide", "sulfur dioxide",
      "sodium metabisulfite", "potassium metabisulfite",
      "e220", "e221", "e222", "e223", "e224",
    ],
    category: "common",
    description: "Sulphites are preservatives that cause reactions in asthmatics.",
    recommendation: "Common in wine, dried fruit, and processed meats.",
  },
  {
    id: "allergen_mustard",
    name: "Mustard",
    keywords: ["mustard", "mustard seed", "mustard oil", "mustard flour"],
    category: "common",
    description: "Major allergen in Europe; can cause anaphylaxis.",
    recommendation: "Check sauces, marinades, and salad dressings.",
  },
  {
    id: "allergen_celery",
    name: "Celery",
    keywords: ["celery", "celeriac", "celery seed", "celery salt"],
    category: "common",
    description: "Common in soups, sauces, and spice mixes.",
    recommendation: "Often hidden in stock cubes and processed foods.",
  },
  {
    id: "allergen_lupin",
    name: "Lupin",
    keywords: ["lupin", "lupine", "lupin seed", "lupin flour", "lupin protein"],
    category: "common",
    description: "Related to peanuts; cross-reactivity is possible.",
    recommendation: "Increasingly used in gluten-free baked goods.",
  },
];

// ─────────────────────────────────────────
// PET TOXIN RULES — Dogs & Cats only
// ─────────────────────────────────────────
export const PET_TOXIN_RULES = [
  {
    id: "pet_xylitol",
    name: "Xylitol",
    keywords: ["xylitol", "birch sugar", "wood sugar", "e967"],
    affectedSpecies: ["dog", "cat"],
    hazardLevel: "deadly",
    mechanism: "Causes rapid insulin release and liver failure.",
    symptoms: ["vomiting", "lethargy", "loss of coordination", "seizures", "liver failure"],
    emergencyNote: "EMERGENCY: Contact vet immediately. Do NOT induce vomiting.",
  },
  {
    id: "pet_grapes",
    name: "Grapes / Raisins / Currants",
    keywords: ["grape", "raisin", "currant", "sultana"],
    affectedSpecies: ["dog", "cat"],
    hazardLevel: "deadly",
    mechanism: "Unknown toxin causes acute kidney failure. Even small amounts are dangerous.",
    symptoms: ["vomiting", "diarrhea", "lethargy", "kidney failure"],
    emergencyNote: "EMERGENCY: Any amount can be fatal. Seek vet care immediately.",
  },
  {
    id: "pet_chocolate",
    name: "Chocolate / Cocoa / Theobromine",
    keywords: [
      "chocolate", "cocoa", "cacao", "theobromine",
      "cocoa butter", "cocoa powder", "cocoa solids",
    ],
    affectedSpecies: ["dog", "cat"],
    hazardLevel: "danger",
    mechanism: "Theobromine metabolises very slowly in dogs/cats, causing stimulant toxicity.",
    symptoms: ["vomiting", "diarrhea", "increased heart rate", "muscle tremors", "seizures"],
    emergencyNote: "Dark chocolate is far more toxic than milk chocolate. Contact vet.",
  },
  {
    id: "pet_caffeine",
    name: "Caffeine",
    keywords: [
      "caffeine", "coffee", "tea", "guarana", "matcha",
      "espresso", "green tea extract", "yerba mate",
    ],
    affectedSpecies: ["dog", "cat"],
    hazardLevel: "danger",
    mechanism: "Overstimulates the nervous and cardiovascular systems.",
    symptoms: ["restlessness", "elevated heart rate", "vomiting", "tremors", "seizures"],
    emergencyNote: "Even coffee grounds or tea bags can be dangerous. Contact vet.",
  },
  {
    id: "pet_onion_garlic",
    name: "Alliums (Onion / Garlic / Leek / Chives)",
    keywords: [
      "onion", "garlic", "leek", "chive", "shallot", "scallion",
      "onion powder", "garlic powder", "onion salt", "garlic salt",
      "onion extract", "garlic extract",
    ],
    affectedSpecies: ["dog", "cat"],
    hazardLevel: "danger",
    mechanism: "N-propyl disulfide destroys red blood cells causing haemolytic anaemia.",
    symptoms: ["lethargy", "pale gums", "loss of appetite", "rapid breathing", "anaemia"],
    emergencyNote: "Powdered forms are far more concentrated. Even small daily doses accumulate.",
  },
  {
    id: "pet_macadamia",
    name: "Macadamia Nuts",
    keywords: ["macadamia"],
    affectedSpecies: ["dog"],
    hazardLevel: "danger",
    mechanism: "Unknown toxin causes temporary but severe neurological symptoms.",
    symptoms: ["weakness", "hyperthermia", "vomiting", "tremors"],
    emergencyNote: "Especially dangerous when combined with chocolate.",
  },
  {
    id: "pet_avocado",
    name: "Avocado (Persin)",
    keywords: ["avocado", "guacamole"],
    affectedSpecies: ["dog", "cat"],
    hazardLevel: "danger",
    mechanism: "Persin causes fluid accumulation in lungs in large amounts.",
    symptoms: ["difficulty breathing", "fluid retention", "weakness"],
    emergencyNote: "High-fat content also risks pancreatitis.",
  },
  {
    id: "pet_alcohol",
    name: "Alcohol / Ethanol",
    keywords: [
      "alcohol", "ethanol", "wine", "beer", "spirits",
      "rum", "vodka", "whiskey", "fermented",
    ],
    affectedSpecies: ["dog", "cat"],
    hazardLevel: "danger",
    mechanism: "Animals process alcohol far more slowly than humans.",
    symptoms: ["vomiting", "disorientation", "low blood sugar", "seizures"],
    emergencyNote: "Contact vet immediately. Do not wait for symptoms.",
  },
  {
    id: "pet_nutmeg",
    name: "Nutmeg / Mace",
    keywords: ["nutmeg", "mace", "myristicin"],
    affectedSpecies: ["dog", "cat"],
    hazardLevel: "caution",
    mechanism: "Myristicin causes hallucinations, disorientation, and elevated heart rate.",
    symptoms: ["disorientation", "increased heart rate", "dry mouth", "seizures"],
    emergencyNote: "Large amounts are dangerous. Contact vet if consumed.",
  },
  {
    id: "pet_salt",
    name: "Excess Salt / Sodium",
    keywords: [
      "salt", "sodium chloride", "sea salt", "rock salt",
      "soy sauce", "brine", "pickle",
    ],
    affectedSpecies: ["dog", "cat"],
    hazardLevel: "caution",
    mechanism: "High sodium causes osmotic shifts leading to brain swelling.",
    symptoms: ["extreme thirst", "vomiting", "diarrhea", "tremors", "seizures"],
    emergencyNote: "Ensure fresh water access. Contact vet if large amounts consumed.",
  },
];

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────
export function normaliseText(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchesKeyword(text, keywords) {
  const norm = normaliseText(text);
  for (const kw of keywords) {
    if (norm.includes(kw)) return kw;
  }
  return null;
}