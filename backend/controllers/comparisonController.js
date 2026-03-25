const UserProfile = require('../models/UserProfile');
const { compareIngredients } = require('../services/comparisonService');

/**
 * POST /api/compare
 * Body: { userId: "<mongo id>", ingredients: ["sugar", "gelatin", ...] }
 *
 * Looks up the user's dietary profile and runs the comparison engine.
 */
exports.compare = async (req, res) => {
    try {
        const { userId, ingredients } = req.body;

        if (!userId || !ingredients || !Array.isArray(ingredients)) {
            return res.status(400).json({
                error: 'Request body must include userId (string) and ingredients (array of strings)',
            });
        }

        const user = await UserProfile.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User profile not found' });
        }

        const report = await compareIngredients(ingredients, user.dietaryProfile);

        res.json({
            userId: user._id,
            userName: user.name,
            report,
        });
    } catch (error) {
        console.error('Error running ingredient comparison:', error);
        res.status(500).json({ error: 'Failed to compare ingredients' });
    }
};
