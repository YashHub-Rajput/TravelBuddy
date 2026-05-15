// File: server/controllers/userController.js
const User = require("../models/User");
const Review = require("../models/Review");

/**
 * GET /api/users/:id  –  Public profile
 */
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-blockedUsers -reportedBy -email -__v"
    );
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/users/profile  –  Update own profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const allowed = ["name", "bio", "avatar", "interests", "travelPreferences"];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-password -blockedUsers -reportedBy");

    res.json({ message: "Profile updated.", user });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/users/:id/report  –  Report a user
 */
const reportUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot report yourself." });
    }

    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: "User not found." });

    if (!target.reportedBy.includes(req.user._id)) {
      target.reportedBy.push(req.user._id);
      await target.save();
    }

    res.json({ message: "User reported." });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/users/:id/block  –  Block a user
 */
const blockUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot block yourself." });
    }

    const me = await User.findById(req.user._id);
    if (!me.blockedUsers.map(String).includes(req.params.id)) {
      me.blockedUsers.push(req.params.id);
      await me.save();
    }

    res.json({ message: "User blocked." });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/users/:id/reviews  –  Leave a review
 */
const createReview = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot review yourself." });
    }

    const review = await Review.create({
      reviewer: req.user._id,
      reviewee: req.params.id,
      trip: req.body.tripId,
      rating: req.body.rating,
      comment: req.body.comment,
    });

    // Recompute average rating for the reviewee
    const allReviews = await Review.find({ reviewee: req.params.id });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await User.findByIdAndUpdate(req.params.id, {
      rating: Math.round(avg * 10) / 10,
      reviewCount: allReviews.length,
    });

    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users/:id/reviews  –  Get reviews for a user
 */
const getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.id })
      .populate("reviewer", "name avatar isVerified")
      .populate("trip", "destination")
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUserProfile,
  updateProfile,
  reportUser,
  blockUser,
  createReview,
  getUserReviews,
};
