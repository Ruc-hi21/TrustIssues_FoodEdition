// ============================================================
// openFoodFactsService.js — Open Food Facts API integration
// ============================================================
// Primary external data source. No API key required.
// Used for:
//   1. Ingredient text enrichment (better than OCR alone)
//   2. Official allergen tags from manufacturer declarations
//   3. Nova group (processing level 1–4)
//   4. Nutriscore grade (a–e)
//   5. Product image for UI
//
// Strategy:
//   - Try barcode first (if frontend sends one) → confidence HIGH
//   - Fall back to product name text search → confidence MEDIUM
//   - If both fail → OCR text used alone → confidence LOW
// ============================================================

import { normaliseIngredient } from "./ingredientDB.js";

const OFF_BASE = "https://world.openfoodfacts.org";
const USER_AGENT = "IngredientSafe/1.0 (OJT academic project)";
const TIMEOUT_MS = 6000;

// ─────────────────────────────────────────
// Normalise OFF allergen tags
// Input:  ["en:milk", "en:gluten", "en:peanuts"]
// Output: ["milk", "gluten", "peanuts"]
// ─────────────────────────────────────────
function normaliseOFFTags(tags = []) {
  return tags
    .map((t) => t.replace(/^[a-z]{2}:/, "").toLowerCase().replace(/-/g, " ").trim())
    .filter(Boolean);
}

// ─────────────────────────────────────────
// Shared OFF product parser
// ─────────────────────────────────────────
function parseOFFProduct(p, confidence) {
  // Parse ingredient list from OFF text — normalise each token
  const rawIngText = p.ingredients_text || "";
  const parsedIngredients = rawIngText
    .split(/[,;]/)
    .map((t) => t.replace(/\([^)]*\)/g, "").trim()) // remove sub-ingredient parens
    .filter((t) => t.length > 1)
    .map(normaliseIngredient);

  return {
    productName:      p.product_name || "",
    brands:           p.brands || "",
    ingredientsText:  rawIngText,
    parsedIngredients,
    allergensTags:    normaliseOFFTags(p.allergens_tags),
    tracesTags:       normaliseOFFTags(p.traces_tags),
    novaGroup:        p.nova_group ?? null,        // 1=unprocessed … 4=ultra-processed
    nutriscoreGrade:  p.nutriscore_grade ?? null,  // a/b/c/d/e
    imageUrl:         p.image_front_url ?? p.image_url ?? null,
    source:           "open_food_facts",
    confidence,
  };
}

// ─────────────────────────────────────────
// Lookup by barcode (EAN-13 / UPC)
// Most reliable — returns manufacturer-declared data
// ─────────────────────────────────────────
export async function lookupByBarcode(barcode) {
  try {
    const url =
      `${OFF_BASE}/api/v2/product/${encodeURIComponent(barcode)}.json` +
      `?fields=product_name,brands,ingredients_text,allergens_tags,traces_tags,nova_group,nutriscore_grade,image_front_url,image_url`;

    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) return { found: false, error: `OFF returned ${res.status}` };

    const data = await res.json();
    if (data.status !== 1 || !data.product) {
      return { found: false, error: "Barcode not found in Open Food Facts" };
    }

    return { found: true, product: parseOFFProduct(data.product, "high") };
  } catch (err) {
    return { found: false, error: `Barcode lookup failed: ${err.message}` };
  }
}

// ─────────────────────────────────────────
// Text search by product name
// Used when we have OCR text but no barcode
// ─────────────────────────────────────────
export async function searchByProductName(productNameGuess) {
  if (!productNameGuess || productNameGuess.trim().length < 3) {
    return { found: false, error: "Product name too short to search" };
  }

  try {
    const encoded = encodeURIComponent(productNameGuess.trim());
    const url =
      `${OFF_BASE}/cgi/search.pl?search_terms=${encoded}` +
      `&search_simple=1&action=process&json=1&page_size=1` +
      `&fields=product_name,brands,ingredients_text,allergens_tags,traces_tags,nova_group,nutriscore_grade,image_front_url,image_url`;

    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) return { found: false, error: `OFF search returned ${res.status}` };

    const data = await res.json();
    if (!data.products?.length) {
      return { found: false, error: "No matching product in Open Food Facts" };
    }

    const p = data.products[0];
    if (!p.ingredients_text?.trim()) {
      return { found: false, error: "Product found but has no ingredients data" };
    }

    return { found: true, product: parseOFFProduct(p, "medium") };
  } catch (err) {
    return { found: false, error: `Text search failed: ${err.message}` };
  }
}

// ─────────────────────────────────────────
// Merge OFF product data with OCR text
// Returns the best combined ingredients text for analysis
// ─────────────────────────────────────────
export function mergeWithOCR(ocrText, offProduct = null) {
  if (!offProduct) {
    return {
      ingredientsText: ocrText,
      parsedIngredients: [],
      productName: "",
      allergensTags: [],
      tracesTags: [],
      novaGroup: null,
      nutriscoreGrade: null,
      imageUrl: null,
      dataSource: "ocr_only",
      confidence: "low",
    };
  }

  // If OFF has a substantial ingredients string, prepend it.
  // We concatenate both so our keyword matching covers OCR noise too.
  const useExternal = offProduct.ingredientsText.length > 20;
  const ingredientsText = useExternal
    ? `${offProduct.ingredientsText}\n${ocrText}`
    : ocrText;

  return {
    ingredientsText,
    parsedIngredients: offProduct.parsedIngredients,
    productName: offProduct.productName,
    allergensTags: offProduct.allergensTags,
    tracesTags: offProduct.tracesTags,
    novaGroup: offProduct.novaGroup,
    nutriscoreGrade: offProduct.nutriscoreGrade,
    imageUrl: offProduct.imageUrl,
    dataSource: useExternal ? "external_primary" : "external_merged",
    confidence: offProduct.confidence,
  };
}