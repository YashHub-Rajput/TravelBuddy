// File: server/controllers/authController.js
const jwt  = require("jsonwebtoken");
const User = require("../models/User");

const VALID_INTERESTS = [
  "hiking","beaches","culture","food","adventure",
  "photography","backpacking","luxury","history","wildlife",
];
const VALID_STYLES = ["budget","mid-range","luxury","backpacker"];

/** Sign a JWT for the given user _id */
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

/** Strip sensitive fields before sending to client */
const buildUserPayload = (user) => ({
  id:                user._id,
  name:              user.name,
  email:             user.email,
  bio:               user.bio,
  avatar:            user.avatar,
  interests:         user.interests,
  travelPreferences: user.travelPreferences,
  isVerified:        user.isVerified,
  rating:            user.rating,
  reviewCount:       user.reviewCount,
});

/**
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Sanitise optional fields so invalid enum values don't crash Mongoose
    const rawInterests = Array.isArray(req.body.interests) ? req.body.interests : [];
    const interests    = rawInterests.filter((i) => VALID_INTERESTS.includes(i));

    const rawPrefs = req.body.travelPreferences || {};
    const travelPreferences = {
      budgetRange: {
        min: Number(rawPrefs?.budgetRange?.min) || 0,
        max: Number(rawPrefs?.budgetRange?.max) || 5000,
      },
      travelStyle: VALID_STYLES.includes(rawPrefs?.travelStyle)
        ? rawPrefs.travelStyle
        : "mid-range",
    };

    // Check duplicate email
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      return res.status(409).json({ message: "This email is already registered." });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      interests,
      travelPreferences,
    });

    const token = signToken(user._id);
    return res.status(201).json({ token, user: buildUserPayload(user) });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // Explicitly select password (it has select:false on schema)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = signToken(user._id);
    return res.json({ token, user: buildUserPayload(user) });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 */
const getMe = (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, getMe };
