// File: server/routes/userRoutes.js
const express = require("express");
const {
  getUserProfile,
  updateProfile,
  reportUser,
  blockUser,
  createReview,
  getUserReviews,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// All user routes require authentication
router.use(protect);

router.get("/:id", getUserProfile);
router.put("/profile", updateProfile);
router.post("/:id/report", reportUser);
router.post("/:id/block", blockUser);
router.post("/:id/reviews", createReview);
router.get("/:id/reviews", getUserReviews);

module.exports = router;
