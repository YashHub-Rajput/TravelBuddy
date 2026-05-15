// File: server/services/matchingService.js
/**
 * ─────────────────────────────────────────────────────
 *  TRAVELBUDDY SMART MATCHING ALGORITHM
 * ─────────────────────────────────────────────────────
 *
 *  SCORING FORMULA (total = 100):
 *    • Date overlap    → 40 points  (most critical for travel)
 *    • Interest match  → 35 points  (compatibility)
 *    • Budget match    → 25 points  (financial fit)
 *
 *  All sub-scores are 0–1 before weighting.
 */

const WEIGHTS = {
  dateOverlap: 0.40,
  interestMatch: 0.35,
  budgetSimilarity: 0.25,
};

/**
 * Main entry point.
 * Returns a 0–100 compatibility score between two users.
 *
 * @param {Object} userA     - Current user document
 * @param {Array}  tripsA    - Current user's planning/active trips
 * @param {Object} userB     - Candidate user document
 * @param {Array}  tripsB    - Candidate's planning/active trips
 * @returns {number}         - Score 0–100
 */
const computeMatchScore = (userA, tripsA, userB, tripsB) => {
  const interestScore = computeInterestScore(userA.interests, userB.interests);
  const budgetScore = computeBudgetScore(
    userA.travelPreferences?.budgetRange,
    userB.travelPreferences?.budgetRange
  );

  // If either user has no trips, use profile-only scoring
  if (!tripsA.length || !tripsB.length) {
    return Math.round((interestScore * 0.6 + budgetScore * 0.4) * 100);
  }

  const dateScore = computeBestDateOverlap(tripsA, tripsB);

  const raw =
    dateScore * WEIGHTS.dateOverlap +
    interestScore * WEIGHTS.interestMatch +
    budgetScore * WEIGHTS.budgetSimilarity;

  return Math.round(raw * 100);
};

/**
 * Finds the best date overlap score across all trip-pair combinations.
 * Returns the highest 0–1 score found.
 */
const computeBestDateOverlap = (tripsA, tripsB) => {
  let best = 0;
  for (const tA of tripsA) {
    for (const tB of tripsB) {
      const score = computeDateOverlapScore(tA.startDate, tA.endDate, tB.startDate, tB.endDate);
      if (score > best) best = score;
    }
  }
  return best;
};

/**
 * Computes the overlap between two date ranges as a fraction of the shorter trip.
 * Returns 0 if no overlap, 1 if one trip is fully contained within the other.
 */
const computeDateOverlapScore = (startA, endA, startB, endB) => {
  const overlapStart = Math.max(new Date(startA), new Date(startB));
  const overlapEnd = Math.min(new Date(endA), new Date(endB));

  if (overlapEnd <= overlapStart) return 0; // No overlap

  const overlapDays = (overlapEnd - overlapStart) / (1000 * 60 * 60 * 24);
  const durA = (new Date(endA) - new Date(startA)) / (1000 * 60 * 60 * 24);
  const durB = (new Date(endB) - new Date(startB)) / (1000 * 60 * 60 * 24);

  // Score as fraction of the shorter trip's duration
  return Math.min(overlapDays / Math.min(durA, durB), 1);
};

/**
 * Jaccard similarity: |A ∩ B| / |A ∪ B|
 * Returns 0.5 if both sets are empty (neutral score).
 */
const computeInterestScore = (interestsA = [], interestsB = []) => {
  if (!interestsA.length && !interestsB.length) return 0.5;
  if (!interestsA.length || !interestsB.length) return 0;

  const setA = new Set(interestsA);
  const setB = new Set(interestsB);
  const intersection = [...setA].filter((i) => setB.has(i)).length;
  const union = new Set([...setA, ...setB]).size;

  return intersection / union;
};

/**
 * Budget range overlap score.
 * Full score (1.0) if ranges overlap completely.
 * Partial score based on gap size if they don't overlap.
 */
const computeBudgetScore = (budgetA, budgetB) => {
  if (!budgetA || !budgetB) return 0.5; // Neutral if not set

  const overlapStart = Math.max(budgetA.min, budgetB.min);
  const overlapEnd = Math.min(budgetA.max, budgetB.max);

  if (overlapEnd >= overlapStart) {
    // Ranges overlap — score = overlap / smaller range
    const overlap = overlapEnd - overlapStart;
    const smaller = Math.min(budgetA.max - budgetA.min, budgetB.max - budgetB.min);
    if (smaller === 0) return 1;
    return Math.min(overlap / smaller, 1);
  }

  // No overlap — penalize based on gap relative to max range
  const gap = overlapStart - overlapEnd;
  const maxVal = Math.max(budgetA.max, budgetB.max) || 1;
  return Math.max(0, 1 - gap / maxVal);
};

module.exports = {
  computeMatchScore,
  computeDateOverlapScore,
  computeInterestScore,
  computeBudgetScore,
};
