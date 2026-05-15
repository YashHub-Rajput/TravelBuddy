// File: server/routes/matchRoutes.js
const express = require("express");
const { getMatches } = require("../controllers/matchController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();
router.use(protect);
router.get("/", getMatches);
module.exports = router;
