/**
 * Strength standards data and pure calculation helpers.
 *
 * Every ratio below is (1-rep-max lift weight) / (bodyweight), using the
 * same units for both. Each lift stores 5 thresholds - the minimum ratio
 * required to be classed Beginner, Novice, Intermediate, Advanced, and
 * Elite respectively. Below the first threshold you're "Untrained"; the
 * implicit floor is 0, so LEVELS has one more entry than each threshold
 * array.
 *
 * These figures are general estimates assembled from widely-published
 * bodyweight-multiplier strength charts (the same shape used by sites like
 * StrengthLevel and Symmetric Strength). They are NOT a scientific or
 * competition-federation standard, they are a way to gauge roughly where a
 * lift sits and how far it is from a milestone. Edit the numbers below to
 * calibrate against a standard you trust more.
 */

const LEVELS = ['Untrained', 'Beginner', 'Novice', 'Intermediate', 'Advanced', 'Elite'];

const STANDARDS = {
  male: {
    squat:         [0.75, 1.00, 1.50, 2.00, 2.50],
    bench:         [0.50, 0.75, 1.00, 1.50, 2.00],
    deadlift:      [1.00, 1.25, 1.75, 2.25, 2.75],
    overheadPress: [0.35, 0.50, 0.75, 1.00, 1.25],
  },
  female: {
    squat:         [0.50, 0.75, 1.00, 1.50, 2.00],
    bench:         [0.25, 0.40, 0.60, 0.90, 1.25],
    deadlift:      [0.75, 1.00, 1.50, 2.00, 2.50],
    overheadPress: [0.20, 0.35, 0.50, 0.70, 0.90],
  },
};

const LIFT_LABELS = {
  squat: 'Squat',
  bench: 'Bench Press',
  deadlift: 'Deadlift',
  overheadPress: 'Overhead Press',
};

const LIFT_KEYS = Object.keys(LIFT_LABELS);

// The classic powerlifting total (squat + bench + deadlift) gets its own
// derived standard, summed band-by-band from the three individual lifts.
function totalStandards(sex) {
  const s = STANDARDS[sex];
  return s.squat.map((_, i) => s.squat[i] + s.bench[i] + s.deadlift[i]);
}

/**
 * Locate a ratio within a 5-value threshold array (Beginner..Elite bars).
 * Returns a continuous score (0 = Untrained floor, 100 = Elite threshold,
 * can exceed 100 past Elite) plus the discrete level label reached.
 *
 * Reaching a threshold exactly counts as having attained that level (the
 * band boundaries are inclusive on the upper/attained side), so someone
 * sitting exactly on the Advanced bar is shown as Advanced, not "0 to go
 * for Advanced" while still labeled Intermediate.
 */
function scoreRatio(ratio, thresholds) {
  const edges = [0, ...thresholds]; // 6 edges -> 5 bands, one per LEVELS[0..4]
  const bandWidth = 100 / thresholds.length; // 20

  // Highest level fully met (0 = Untrained .. thresholds.length = Elite).
  let levelIndex = 0;
  for (let k = thresholds.length; k >= 1; k--) {
    if (ratio >= edges[k]) {
      levelIndex = k;
      break;
    }
  }

  if (levelIndex === thresholds.length) {
    // At or past the Elite threshold.
    const eliteEdge = edges[edges.length - 1];
    const overshoot = eliteEdge > 0 ? (ratio - eliteEdge) / eliteEdge : 0;
    return {
      score: 100 + clamp(overshoot * bandWidth, 0, bandWidth * 2),
      levelIndex,
      levelLabel: LEVELS[levelIndex],
      nextThreshold: null,
      prevThreshold: eliteEdge,
    };
  }

  const lowerEdge = edges[levelIndex];
  const upperEdge = edges[levelIndex + 1];
  const bandScore = ((ratio - lowerEdge) / (upperEdge - lowerEdge)) * bandWidth;

  return {
    score: levelIndex * bandWidth + bandScore,
    levelIndex,
    levelLabel: LEVELS[levelIndex],
    nextThreshold: upperEdge,
    prevThreshold: lowerEdge,
  };
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Full classification for one lift.
 * @param {'male'|'female'} sex
 * @param {string} liftKey one of LIFT_KEYS
 * @param {number} bodyweight
 * @param {number} liftWeight
 */
function classifyLift(sex, liftKey, bodyweight, liftWeight) {
  const thresholds = STANDARDS[sex][liftKey];
  const ratio = liftWeight / bodyweight;
  const result = scoreRatio(ratio, thresholds);
  return { ratio, thresholds, ...result };
}

function classifyTotal(sex, bodyweight, totalWeight) {
  const thresholds = totalStandards(sex);
  const ratio = totalWeight / bodyweight;
  const result = scoreRatio(ratio, thresholds);
  return { ratio, thresholds, ...result };
}

/** Progress toward an arbitrary goal weight for the same lift. */
function goalProgress(currentWeight, goalWeight) {
  if (!goalWeight || goalWeight <= 0) return null;
  const pct = clamp((currentWeight / goalWeight) * 100, 0, 999);
  return {
    pct,
    remaining: Math.max(0, goalWeight - currentWeight),
    achieved: currentWeight >= goalWeight,
  };
}

/** How far the lift is from a round multiple of bodyweight (0.5x steps). */
function bodyweightMilestone(ratio) {
  const step = 0.5;
  const achievedMultiple = Math.floor(ratio / step) * step;
  const nextMultiple = achievedMultiple + step;
  const pctToNext = clamp(((ratio - achievedMultiple) / step) * 100, 0, 100);
  return {
    achievedMultiple,
    nextMultiple,
    pctToNext,
    matchesBodyweight: ratio >= 1,
  };
}

if (typeof module !== 'undefined') {
  module.exports = {
    LEVELS,
    STANDARDS,
    LIFT_LABELS,
    LIFT_KEYS,
    totalStandards,
    scoreRatio,
    classifyLift,
    classifyTotal,
    goalProgress,
    bodyweightMilestone,
  };
}
