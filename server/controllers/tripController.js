// File: server/controllers/tripController.js
const Trip = require("../models/Trip");

/**
 * POST /api/trips  –  Create a new trip
 */
const createTrip = async (req, res, next) => {
  try {
    const trip = await Trip.create({ ...req.body, creator: req.user._id });
    await trip.populate("creator", "name avatar isVerified rating");
    res.status(201).json({ message: "Trip created.", trip });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/trips  –  Browse public trips (with optional filters)
 */
const getTrips = async (req, res, next) => {
  try {
    const { destination, startDate, endDate, minBudget, maxBudget, page = 1, limit = 12 } = req.query;

    const filter = { isPublic: true, status: { $in: ["planning", "active"] } };

    if (destination) filter.destination = { $regex: destination, $options: "i" };
    if (startDate) filter.startDate = { $gte: new Date(startDate) };
    if (endDate) filter.endDate = { $lte: new Date(endDate) };
    if (minBudget || maxBudget) {
      filter.budget = {};
      if (minBudget) filter.budget.$gte = Number(minBudget);
      if (maxBudget) filter.budget.$lte = Number(maxBudget);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [trips, total] = await Promise.all([
      Trip.find(filter)
        .populate("creator", "name avatar isVerified rating")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Trip.countDocuments(filter),
    ]);

    res.json({
      trips,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/trips/my  –  Get authenticated user's trips
 */
const getMyTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find({
      $or: [
        { creator: req.user._id },
        { "members.user": req.user._id },
      ],
    })
      .populate("creator", "name avatar isVerified")
      .sort({ createdAt: -1 });

    res.json({ trips });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/trips/:id  –  Get single trip by ID
 */
const getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate("creator", "name avatar isVerified rating bio")
      .populate("members.user", "name avatar isVerified rating");

    if (!trip) return res.status(404).json({ message: "Trip not found." });
    res.json({ trip });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/trips/:id  –  Update a trip (creator only)
 */
const updateTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found." });
    if (!trip.creator.equals(req.user._id)) {
      return res.status(403).json({ message: "Only the trip creator can edit this trip." });
    }

    const allowed = [
      "destination", "description", "startDate", "endDate",
      "budget", "currency", "tags", "maxGroupSize", "status", "isPublic",
    ];
    allowed.forEach((f) => { if (req.body[f] !== undefined) trip[f] = req.body[f]; });
    await trip.save();

    res.json({ message: "Trip updated.", trip });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/trips/:id  –  Delete a trip (creator only)
 */
const deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found." });
    if (!trip.creator.equals(req.user._id)) {
      return res.status(403).json({ message: "Only the trip creator can delete this trip." });
    }

    await trip.deleteOne();
    res.json({ message: "Trip deleted." });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/trips/:id/join  –  Request to join a trip
 */
const requestJoinTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found." });
    if (trip.creator.equals(req.user._id)) {
      return res.status(400).json({ message: "You are the creator of this trip." });
    }

    const existing = trip.members.find((m) => m.user.equals(req.user._id));
    if (existing) {
      return res.status(400).json({ message: "You have already requested to join." });
    }

    trip.members.push({ user: req.user._id, status: "pending" });
    await trip.save();
    res.json({ message: "Join request sent to the trip creator." });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/trips/:id/members/:userId  –  Approve or reject a member (creator only)
 */
const updateMemberStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // "accepted" or "rejected"
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found." });
    if (!trip.creator.equals(req.user._id)) {
      return res.status(403).json({ message: "Only the creator can manage members." });
    }

    const member = trip.members.find((m) => m.user.equals(req.params.userId));
    if (!member) return res.status(404).json({ message: "Member not found." });

    member.status = status;
    await trip.save();
    res.json({ message: `Member ${status}.` });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTrip,
  getTrips,
  getMyTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  requestJoinTrip,
  updateMemberStatus,
};
