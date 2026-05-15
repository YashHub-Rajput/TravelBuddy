// File: server/controllers/matchController.js
const User = require("../models/User");
const Trip = require("../models/Trip");
const { computeMatchScore } = require("../services/matchingService");

/**
 * GET /api/matches
 * Returns top 20 travel companion matches for the logged-in user,
 * sorted by compatibility score (highest first).
 *
 * Optional query param: ?tripId=<id>  (score against a specific trip)
 */
const getMatches = async (req, res, next) => {
  try {
    const { tripId } = req.query;
    const currentUser = req.user;

    // Get current user's trips for date overlap calculations
    let myTrips = await Trip.find({
      creator: currentUser._id,
      status: { $in: ["planning", "active"] },
    });

    if (tripId) {
      const specificTrip = await Trip.findById(tripId);
      if (specificTrip) myTrips = [specificTrip];
    }

    // Find all potential matches (excluding self and blocked users)
    const excluded = [currentUser._id, ...currentUser.blockedUsers];
    const candidates = await User.find({ _id: { $nin: excluded } }).lean();

    // Fetch each candidate's trips in parallel
    const candidatesWithTrips = await Promise.all(
      candidates.map(async (candidate) => {
        const trips = await Trip.find({
          creator: candidate._id,
          status: { $in: ["planning", "active"] },
        }).lean();
        return { user: candidate, trips };
      })
    );

    // Score and sort
    const matches = candidatesWithTrips
      .map(({ user, trips }) => ({
        user: sanitizeUser(user),
        score: computeMatchScore(currentUser, myTrips, user, trips),
      }))
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    res.json({ matches, count: matches.length });
  } catch (err) {
    next(err);
  }
};

/** Strip sensitive fields from user before sending in match results */
const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  bio: user.bio,
  avatar: user.avatar,
  interests: user.interests,
  travelPreferences: user.travelPreferences,
  isVerified: user.isVerified,
  rating: user.rating,
  reviewCount: user.reviewCount,
});

module.exports = { getMatches };
