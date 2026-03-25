const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/comparisonController');

// POST /api/compare – Compare extracted ingredients against a user's dietary profile
router.post('/', ctrl.compare);

module.exports = router;
