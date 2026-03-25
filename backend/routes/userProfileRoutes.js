const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userProfileController');
const {
    validateUserRegistration,
    validateUserProfileUpdate,
} = require('../middleware/validate');

// POST   /api/profiles       – Create / Register a new user profile
router.post('/', validateUserRegistration, ctrl.createProfile);

// GET    /api/profiles        – Get all user profiles
router.get('/', ctrl.getAllProfiles);

// GET    /api/profiles/:id    – Get a single profile by ID
router.get('/:id', ctrl.getProfileById);

// PUT    /api/profiles/:id    – Update a profile by ID
router.put('/:id', validateUserProfileUpdate, ctrl.updateProfile);

// DELETE /api/profiles/:id    – Delete a profile by ID
router.delete('/:id', ctrl.deleteProfile);

module.exports = router;
