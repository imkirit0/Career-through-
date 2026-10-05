// How a set of answers becomes a skill level.
//
// A level is an estimate, so it comes with a range. Each answer says something about what
// the student can do: a hard question answered right says a lot, an easy one little, and a
// right answer on a four-option question may have been a guess. This works out the levels
// that are consistent with all the answers together, and reports the middle and the spread.
//
// Pure and deterministic: the same answers always give the same level and range.

/**
 * The model. These numbers are judgement, not measurement: there is no response data yet to
 * fit them to. They are in one place so they can be recalibrated when there is.
 */
export const MODEL = {
  /** How hard each of the four difficulty bands is, on the ability scale (0 = an average student). */
  difficulty: [-1.5, -0.5, 0.5, 1.5],
  /** How sharply the chance of knowing an answer rises with ability. */
  slope: 1.3,
  /** Chance of picking the right one of four options without knowing it. */
  guess: 0.25,
  /**
   * Spread of ability assumed before any answer is seen. Deliberately wide, so the answers
   * decide the level and not this assumption: a perfect six-question run reaches the
   * knowledge cap, and three wrong answers land near 10%.
   */
  spread: 1.6,
} as const;

export type Answered = { /** 1 (foundational) to 4 (most applied). */ difficulty: number; right: boolean };
export type Estimate = { level: number; low: number; high: number };

/** The share of the range the reported low and high leave out on each side. */
const TAIL = 0.1;

const GRID = Array.from({ length: 81 }, (_, i) => -4 + i * 0.1);
const band = (difficulty: number) => MODEL.difficulty[Math.min(Math.max(Math.round(difficulty), 1), 4) - 1];
/** Chance a student of this ability actually knows the answer to a question of this band. */
const knows = (ability: number, at: number) => 1 / (1 + Math.exp(-MODEL.slope * (ability - at)));
/** A level is the share of the four bands a student of this ability has mastered. */
const LEVEL = GRID.map((a) => (100 * MODEL.difficulty.reduce((s, d) => s + knows(a, d), 0)) / MODEL.difficulty.length);
const PRIOR = GRID.map((a) => Math.exp(-(a * a) / (2 * MODEL.spread * MODEL.spread)));

/**
 * The level these answers point to, and the range it very likely lies in (the middle 80%).
 * "I'm not sure" and a wrong choice are the same thing here: the student did not know it.
 */
export function estimateLevel(answers: Answered[]): Estimate {
  const weight = PRIOR.map((prior, i) => {
    let w = prior;
    for (const a of answers) {
      const right = MODEL.guess + (1 - MODEL.guess) * knows(GRID[i], band(a.difficulty));
      w *= a.right ? right : 1 - right;
    }
    return w;
  });
  const total = weight.reduce((s, w) => s + w, 0);
  const level = weight.reduce((s, w, i) => s + w * LEVEL[i], 0) / total;

  // LEVEL rises with ability, so the percentiles can be read straight off the grid.
  const at = (share: number) => {
    let seen = 0;
    for (let i = 0; i < GRID.length; i++) {
      seen += weight[i] / total;
      if (seen >= share) return LEVEL[i];
    }
    return LEVEL[GRID.length - 1];
  };
  return { level: Math.round(level), low: Math.round(at(TAIL)), high: Math.round(at(1 - TAIL)) };
}
