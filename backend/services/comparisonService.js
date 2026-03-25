const Ingredient = require('../models/Ingredient');

/**
 * Core comparison logic.
 *
 * Takes an array of raw ingredient strings (e.g. extracted via OCR) and a
 * user's dietary profile, then returns a structured report of flagged
 * ingredients and an overall safety verdict.
 *
 * @param {string[]} extractedIngredients – raw ingredient names from OCR text
 * @param {Object}   dietaryProfile       – the user's dietaryProfile sub-document
 * @returns {Object} { flaggedIngredients, safeIngredients, verdict }
 */
async function compareIngredients(extractedIngredients, dietaryProfile) {
    // Normalise the extracted strings
    const normalised = extractedIngredients.map((i) => i.toLowerCase().trim()).filter(Boolean);

    const flagged = [];
    const safe = [];

    for (const raw of normalised) {
        // Try to find the ingredient in the DB by name or alias
        const ingredient = await Ingredient.findOne({
            $or: [
                { name: raw },
                { aliases: raw },
            ],
        });

        // ------ Check against user's explicit avoid list ------
        const isInAvoidList = (dietaryProfile.avoidIngredients || [])
            .some((a) => a.toLowerCase().trim() === raw);

        const isCustomAllergen = (dietaryProfile.customAllergens || [])
            .some((a) => a.toLowerCase().trim() === raw);

        if (isInAvoidList || isCustomAllergen) {
            flagged.push({
                ingredient: raw,
                reason: isInAvoidList
                    ? 'Listed in your avoided ingredients'
                    : 'Matches a custom allergen in your profile',
                riskLevel: 'high',
                dbMatch: ingredient ? ingredient.name : null,
            });
            continue;
        }

        // If no DB record exists, mark as unknown but not flagged
        if (!ingredient) {
            safe.push({
                ingredient: raw,
                note: 'Not found in ingredient database — could not verify',
                riskLevel: 'unknown',
            });
            continue;
        }

        // ------ Flag-based checks using the ingredient's flags ------
        const reasons = [];

        if (dietaryProfile.isVegan && ingredient.flags.isAnimalDerived) {
            reasons.push('Contains animal-derived ingredient (not vegan)');
        }

        if (dietaryProfile.isVegetarian && ingredient.flags.isAnimalDerived && ingredient.category === 'meat') {
            reasons.push('Contains meat-derived ingredient (not vegetarian)');
        }

        if (dietaryProfile.isGlutenFree && ingredient.flags.containsGluten) {
            reasons.push('Contains gluten');
        }

        if (dietaryProfile.isLactoseIntolerant && ingredient.flags.isDairyDerived) {
            reasons.push('Contains dairy-derived ingredient');
        }

        if (dietaryProfile.isNutAllergy && ingredient.flags.isNutDerived) {
            reasons.push('Contains nut-derived ingredient');
        }

        if (reasons.length > 0) {
            flagged.push({
                ingredient: raw,
                reason: reasons.join('; '),
                riskLevel: ingredient.riskLevel || 'high',
                dbMatch: ingredient.name,
            });
        } else {
            safe.push({
                ingredient: raw,
                riskLevel: ingredient.riskLevel || 'safe',
                dbMatch: ingredient.name,
            });
        }
    }

    // Overall verdict
    let verdict = 'safe';
    if (flagged.some((f) => f.riskLevel === 'high')) {
        verdict = 'unsafe';
    } else if (flagged.length > 0) {
        verdict = 'caution';
    }

    return {
        totalIngredientsChecked: normalised.length,
        flaggedCount: flagged.length,
        safeCount: safe.length,
        verdict,
        flaggedIngredients: flagged,
        safeIngredients: safe,
    };
}

module.exports = { compareIngredients };
