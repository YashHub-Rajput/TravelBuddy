// File: server/routes/expenseRoutes.js
const express = require("express");
const { createExpense, getTripExpenses, settleExpense } = require("../controllers/expenseController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();
router.use(protect);

router.post("/", createExpense);
router.get("/trip/:tripId", getTripExpenses);
router.patch("/:id/settle/:userId", settleExpense);

module.exports = router;
