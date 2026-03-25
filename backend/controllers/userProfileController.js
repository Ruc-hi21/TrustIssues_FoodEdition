const UserProfile = require('../models/UserProfile');

// CREATE – Register a new user profile
exports.createProfile = async (req, res) => {
    try {
        const { name, email, dietaryProfile, preferredLanguage } = req.body;

        // Check if email already exists
        const existing = await UserProfile.findOne({ email });
        if (existing) {
            return res.status(409).json({ error: 'A profile with this email already exists' });
        }

        const profile = await UserProfile.create({
            name,
            email,
            dietaryProfile,
            preferredLanguage,
        });

        res.status(201).json({ message: 'Profile created successfully', profile });
    } catch (error) {
        console.error('Error creating user profile:', error);
        res.status(500).json({ error: 'Failed to create user profile' });
    }
};

// READ – Get all user profiles
exports.getAllProfiles = async (req, res) => {
    try {
        const profiles = await UserProfile.find().sort({ createdAt: -1 });
        res.json({ count: profiles.length, profiles });
    } catch (error) {
        console.error('Error fetching profiles:', error);
        res.status(500).json({ error: 'Failed to fetch profiles' });
    }
};

// READ – Get a single profile by ID
exports.getProfileById = async (req, res) => {
    try {
        const profile = await UserProfile.findById(req.params.id);
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        res.json({ profile });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

// UPDATE – Update a profile by ID
exports.updateProfile = async (req, res) => {
    try {
        const profile = await UserProfile.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json({ message: 'Profile updated successfully', profile });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

// DELETE – Delete a profile by ID
exports.deleteProfile = async (req, res) => {
    try {
        const profile = await UserProfile.findByIdAndDelete(req.params.id);

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json({ message: 'Profile deleted successfully' });
    } catch (error) {
        console.error('Error deleting profile:', error);
        res.status(500).json({ error: 'Failed to delete profile' });
    }
};
