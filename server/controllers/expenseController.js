// File: server/controllers/expenseController.js
const Expense = require("../models/Expense");
const Trip = require("../models/Trip");

/**
 * POST /api/expenses
 * Add a shared expense and auto-split it among specified users.
 */
const createExpense = async (req, res, next) => {
  try {
    const { tripId, title, amount, category, splitBetween, currency, notes } = req.body;

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found." });

    // Even split: each person owes amount / count
    const perPerson = Math.round((amount / splitBetween.length) * 100) / 100;
    const splits = splitBetween.map((userId) => ({
      user: userId,
      amount: perPerson,
      isPaid: userId.toString() === req.user._id.toString(), // Payer's own share is pre-marked
    }));

    const expense = await Expense.create({
      trip: tripId,
      paidBy: req.user._id,
      title,
      amount,
      category: category || "other",
      splits,
      currency: currency || "USD",
      notes: notes || "",
    });

    await expense.populate("paidBy", "name avatar");
    await expense.populate("splits.user", "name avatar");

    res.status(201).json({ expense });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/expenses/trip/:tripId
 * Get all expenses for a trip, plus a computed balance summary.
 */
const getTripExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ trip: req.params.tripId })
      .populate("paidBy", "name avatar")
      .populate("splits.user", "name avatar")
      .sort({ createdAt: -1 });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const balances = computeBalances(expenses);

    res.json({ expenses, total: Math.round(total * 100) / 100, balances });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/expenses/:id/settle/:userId
 * Mark a user's share of an expense as paid.
 */
const settleExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found." });

    const split = expense.splits.find(
      (s) => s.user.toString() === req.params.userId
    );
    if (!split) return res.status(404).json({ message: "Split entry not found." });

    split.isPaid = true;
    await expense.save();
    res.json({ message: "Expense marked as settled." });
  } catch (err) {
    next(err);
  }
};

/**
 * Computes net balances: who owes how much to whom.
 * Returns array of { from, to, amount } objects.
 */
const computeBalances = (expenses) => {
  const map = {};

  expenses.forEach((expense) => {
    const payerId = expense.paidBy._id.toString();

    expense.splits.forEach((split) => {
      const debtorId = split.user._id.toString();
      if (debtorId === payerId || split.isPaid) return;

      const key = [payerId, debtorId].sort().join("_");
      if (!map[key]) map[key] = { from: debtorId, to: payerId, amount: 0 };
      map[key].amount += split.amount;
    });
  });

  return Object.values(map)
    .filter((b) => b.amount > 0)
    .map((b) => ({ ...b, amount: Math.round(b.amount * 100) / 100 }));
};

module.exports = { createExpense, getTripExpenses, settleExpense };
