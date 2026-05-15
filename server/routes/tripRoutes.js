// File: server/routes/tripRoutes.js
const express = require("express");
const {
  createTrip,
  getTrips,
  getMyTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  requestJoinTrip,
  updateMemberStatus,
} = require("../controllers/tripController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Public: browse trips
router.get("/", getTrips);

// Protected routes (auth required)
router.use(protect);
router.get("/my", getMyTrips);
router.post("/", createTrip);
router.get("/:id", getTripById);
router.put("/:id", updateTrip);
router.delete("/:id", deleteTrip);
router.post("/:id/join", requestJoinTrip);
router.patch("/:id/members/:userId", updateMemberStatus);

module.exports = router;
