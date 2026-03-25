const Ingredient = require('../models/Ingredient');

// CREATE – Add a new ingredient
exports.createIngredient = async (req, res) => {
    try {
        const { name, aliases, category, flags, description, riskLevel } = req.body;

        const existing = await Ingredient.findOne({ name: name.toLowerCase().trim() });
        if (existing) {
            return res.status(409).json({ error: 'Ingredient already exists', ingredient: existing });
        }

        const ingredient = await Ingredient.create({
            name, aliases, category, flags, description, riskLevel,
        });

        res.status(201).json({ message: 'Ingredient created', ingredient });
    } catch (error) {
        console.error('Error creating ingredient:', error);
        res.status(500).json({ error: 'Failed to create ingredient' });
    }
};

// READ – Get all ingredients (with optional search query)
exports.getAllIngredients = async (req, res) => {
    try {
        const { search, category } = req.query;
        const filter = {};

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { aliases: { $regex: search, $options: 'i' } },
            ];
        }
        if (category) {
            filter.category = category.toLowerCase().trim();
        }

        const ingredients = await Ingredient.find(filter).sort({ name: 1 });
        res.json({ count: ingredients.length, ingredients });
    } catch (error) {
        console.error('Error fetching ingredients:', error);
        res.status(500).json({ error: 'Failed to fetch ingredients' });
    }
};

// READ – Get a single ingredient by ID
exports.getIngredientById = async (req, res) => {
    try {
        const ingredient = await Ingredient.findById(req.params.id);
        if (!ingredient) {
            return res.status(404).json({ error: 'Ingredient not found' });
        }
        res.json({ ingredient });
    } catch (error) {
        console.error('Error fetching ingredient:', error);
        res.status(500).json({ error: 'Failed to fetch ingredient' });
    }
};

// UPDATE – Update an ingredient by ID
exports.updateIngredient = async (req, res) => {
    try {
        const ingredient = await Ingredient.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!ingredient) {
            return res.status(404).json({ error: 'Ingredient not found' });
        }

        res.json({ message: 'Ingredient updated', ingredient });
    } catch (error) {
        console.error('Error updating ingredient:', error);
        res.status(500).json({ error: 'Failed to update ingredient' });
    }
};

// DELETE – Delete an ingredient by ID
exports.deleteIngredient = async (req, res) => {
    try {
        const ingredient = await Ingredient.findByIdAndDelete(req.params.id);

        if (!ingredient) {
            return res.status(404).json({ error: 'Ingredient not found' });
        }

        res.json({ message: 'Ingredient deleted' });
    } catch (error) {
        console.error('Error deleting ingredient:', error);
        res.status(500).json({ error: 'Failed to delete ingredient' });
    }
};
