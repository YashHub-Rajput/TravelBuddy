// File: server/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * protect – Verifies JWT from Authorization header.
 * Attaches the authenticated user to req.user.
 * Usage: router.get("/route", protect, handler)
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized. Please log in." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user and attach to request (password excluded by default)
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User belonging to this token no longer exists." });
    }

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired. Please log in again." });
    }
    return res.status(401).json({ message: "Invalid token." });
  }
};

module.exports = { protect };
