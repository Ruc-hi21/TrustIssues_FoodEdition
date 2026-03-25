const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/ingredientController');

// POST   /api/ingredients        – Add a new ingredient
router.post('/', ctrl.createIngredient);

// GET    /api/ingredients        – List all (with optional ?search=xxx&category=yyy)
router.get('/', ctrl.getAllIngredients);

// GET    /api/ingredients/:id    – Get ingredient by ID
router.get('/:id', ctrl.getIngredientById);

// PUT    /api/ingredients/:id    – Update ingredient
router.put('/:id', ctrl.updateIngredient);

// DELETE /api/ingredients/:id    – Delete ingredient
router.delete('/:id', ctrl.deleteIngredient);

module.exports = router;
