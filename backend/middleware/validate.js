const { body, validationResult } = require('express-validator');

// Shared helper – returns 400 with error details if validation fails
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Validation rules for creating / registering a user profile
const validateUserRegistration = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Must be a valid email address')
        .normalizeEmail(),

    body('dietaryProfile.isVegetarian')
        .optional()
        .isBoolean().withMessage('isVegetarian must be a boolean'),

    body('dietaryProfile.isVegan')
        .optional()
        .isBoolean().withMessage('isVegan must be a boolean'),

    body('dietaryProfile.isGlutenFree')
        .optional()
        .isBoolean().withMessage('isGlutenFree must be a boolean'),

    body('dietaryProfile.isLactoseIntolerant')
        .optional()
        .isBoolean().withMessage('isLactoseIntolerant must be a boolean'),

    body('dietaryProfile.isNutAllergy')
        .optional()
        .isBoolean().withMessage('isNutAllergy must be a boolean'),

    body('dietaryProfile.customAllergens')
        .optional()
        .isArray().withMessage('customAllergens must be an array'),

    body('dietaryProfile.customAllergens.*')
        .optional()
        .isString().withMessage('Each custom allergen must be a string')
        .trim()
        .notEmpty().withMessage('Custom allergen cannot be empty'),

    body('dietaryProfile.avoidIngredients')
        .optional()
        .isArray().withMessage('avoidIngredients must be an array'),

    body('dietaryProfile.avoidIngredients.*')
        .optional()
        .isString().withMessage('Each avoided ingredient must be a string')
        .trim()
        .notEmpty().withMessage('Avoided ingredient cannot be empty'),

    body('preferredLanguage')
        .optional()
        .trim()
        .isLength({ min: 2, max: 10 }).withMessage('preferredLanguage must be 2-10 characters'),

    handleValidationErrors,
];

// Validation rules for updating a user profile (all fields optional)
const validateUserProfileUpdate = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

    body('email')
        .optional()
        .trim()
        .isEmail().withMessage('Must be a valid email address')
        .normalizeEmail(),

    body('dietaryProfile.isVegetarian')
        .optional()
        .isBoolean().withMessage('isVegetarian must be a boolean'),

    body('dietaryProfile.isVegan')
        .optional()
        .isBoolean().withMessage('isVegan must be a boolean'),

    body('dietaryProfile.isGlutenFree')
        .optional()
        .isBoolean().withMessage('isGlutenFree must be a boolean'),

    body('dietaryProfile.isLactoseIntolerant')
        .optional()
        .isBoolean().withMessage('isLactoseIntolerant must be a boolean'),

    body('dietaryProfile.isNutAllergy')
        .optional()
        .isBoolean().withMessage('isNutAllergy must be a boolean'),

    body('dietaryProfile.customAllergens')
        .optional()
        .isArray().withMessage('customAllergens must be an array'),

    body('dietaryProfile.avoidIngredients')
        .optional()
        .isArray().withMessage('avoidIngredients must be an array'),

    body('preferredLanguage')
        .optional()
        .trim()
        .isLength({ min: 2, max: 10 }).withMessage('preferredLanguage must be 2-10 characters'),

    handleValidationErrors,
];

module.exports = {
    validateUserRegistration,
    validateUserProfileUpdate,
};
