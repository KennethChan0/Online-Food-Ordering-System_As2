
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { getProfileRules } = require('../strategies/profileRules');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
    const { name, email, password, role = 'customer' } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({ name, email, password, role });
        res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role, token: generateToken(user.id) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({ id: user.id, name: user.name, email: user.email, role: user.role, token: generateToken(user.id) });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        // User cannot specify another account to view.
        if (Object.keys(req.query).length > 0) {
            return res.status(400).json({ message: 'You can only view your own profile' })
        }
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const rules = getProfileRules(user.role);
        return res.status(200).json(rules.buildProfile(user));
    } catch (error) {
        return res.status(500).json({ message: 'Failed to load profile. Please try again,' });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        if (Object.keys(req.query).length > 0) {
            return res.status(400).json({
                message: 'You can only update your own profile',
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
            });
        }

        const body = req.body;
        const rules = getProfileRules(user.role);
        const errorMessage = rules.validate(body);

        if (errorMessage) {
            return res.status(400).json({ message: errorMessage });
        }

        // Change the document only after all validation passes.
        for (const field of rules.getEditableFields()) {
            user[field] = body[field].trim();
        }

        const updatedUser = await user.save();

        return res.status(200).json({
            message: 'Profile updated successfully',
            profile: rules.buildProfile(updatedUser),
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Invalid profile information',
            });
        }

        return res.status(500).json({
            message: 'Failed to update profile. Please try again.',
        });
    }
};

const deleteUserProfile = async (req, res) => {
    try {
        if (Object.keys(req.query).length > 0) {
            return res.status(400).json({
                message: 'You can only delete your own account',
            });
        }

        const body = req.body || {};

        if (
            body.confirmDelete !== true ||
            Object.keys(body).some((field) => field !== 'confirmDelete')
        ) {
            return res.status(400).json({
                message: 'Please confirm deletion of your own account',
            });
        }

        const deletedUser = await User.findByIdAndDelete(req.user.id);

        if (!deletedUser) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        return res.status(200).json({
            message: 'Account deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to delete account. Please try again.'
        });
    }
};

module.exports = { registerUser, loginUser, updateUserProfile, getProfile, deleteUserProfile };
