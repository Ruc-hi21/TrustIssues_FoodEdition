const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
    // Canonical ingredient name (lowercased, trimmed)
    name: {
        type: String,
        required: [true, 'Ingredient name is required'],
        trim: true,
        lowercase: true,
        unique: true,
    },
    // Alternative names / synonyms for fuzzy matching (e.g. "MSG" ↔ "monosodium glutamate")
    aliases: {
        type: [String],
        default: [],
        set: (vals) => vals.map((v) => v.toLowerCase().trim()),
    },
    // Category for grouping (e.g. "preservative", "sweetener", "emulsifier", "allergen")
    category: {
        type: String,
        trim: true,
        lowercase: true,
        default: 'general',
    },
    // Flags to quickly filter when comparing against user dietary profiles
    flags: {
        isAnimalDerived: { type: Boolean, default: false },     // not vegan
        isDairyDerived: { type: Boolean, default: false },      // not lactose-safe
        containsGluten: { type: Boolean, default: false },      // not gluten-free
        isNutDerived: { type: Boolean, default: false },        // nut allergen
        isCommonAllergen: { type: Boolean, default: false },    // general allergen flag
    },
    // Optional description (for display purposes)
    description: {
        type: String,
        trim: true,
        default: '',
    },
    // Optional risk level ("safe", "moderate", "high")
    riskLevel: {
        type: String,
        enum: ['safe', 'moderate', 'high'],
        default: 'safe',
    },
}, {
    timestamps: true,
});

// Text index on name + aliases for search
ingredientSchema.index({ name: 'text', aliases: 'text' });

const Ingredient = mongoose.model('Ingredient', ingredientSchema);

module.exports = Ingredient;
