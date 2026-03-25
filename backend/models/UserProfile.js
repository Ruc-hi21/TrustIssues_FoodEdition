const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name must be at most 100 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    // Dietary preferences / restrictions selected by the user
    dietaryProfile: {
        isVegetarian: { type: Boolean, default: false },
        isVegan: { type: Boolean, default: false },
        isGlutenFree: { type: Boolean, default: false },
        isLactoseIntolerant: { type: Boolean, default: false },
        isNutAllergy: { type: Boolean, default: false },
        // Custom allergens the user wants to avoid (free-form list)
        customAllergens: {
            type: [String],
            default: [],
        },
        // Specific ingredients the user wants to avoid
        avoidIngredients: {
            type: [String],
            default: [],
        },
    },
    preferredLanguage: {
        type: String,
        default: 'en',
        trim: true,
    },
}, {
    timestamps: true, // adds createdAt and updatedAt automatically
});

// Index on email for fast lookups
userProfileSchema.index({ email: 1 });

const UserProfile = mongoose.model('UserProfile', userProfileSchema);

module.exports = UserProfile;
