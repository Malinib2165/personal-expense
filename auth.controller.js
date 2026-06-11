import User from "../models/UserSchema.js";
import jwt from "jsonwebtoken";

// Generate JWT
const generateToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register new user
// @route   POST /api/users
export const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body || {};

        if (!name || !email || !password) {
            res.status(400);
            throw new Error('Please add all fields');
        }

        // Validate email format
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            res.status(400);
            throw new Error('Please provide a valid email address');
        }

        const normalizedEmail = email.trim().toLowerCase();
        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        const user = await User.create({ name, email: normalizedEmail, password });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id.toString()),
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        next(error); // Pass to global error handler
    }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            res.status(400);
            throw new Error('Please provide email and password');
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (user && (await user.matchPassword(password))) {
            res.json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id.toString()) });
        } else {
            res.status(401);
            throw new Error('Invalid credentials');
        }
    } catch (error) {
        next(error);
    }
};