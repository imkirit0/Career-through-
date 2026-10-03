// The Arena's rules: how a round is dealt, how it is scored, and how a board is ordered.
// Pure functions only, so every rule here is covered by src/lib/arena.test.ts. The server
// actions call these; nothing about a score is ever decided in the browser.

export type Difficulty = 1 | 2 | 3;
export type ArenaQuestion = { id: string; topic: string; difficulty: Difficulty; prompt: string; options: string[]; answer: number; explanation: string };
/** A question as the browser sees it during a round. */
export type ArenaPublicQuestion = Omit<ArenaQuestion, "answer" | "explanation">;

/** Stored on every round. Change it whenever a number below changes: old rounds keep their points. */
export const SCORING_VERSION = "arena-v1";

export const ROUND = {
  seconds: 300,
  /** Network slack after the clock runs out before a submission counts as late. */
  graceSeconds: 10,
  /** Questions per difficulty. Fixed, so every round has the same maximum. */
  mix: { 1: 3, 2: 5, 3: 2 } as Record<Difficulty, number>,
  count: 10,
} as const;

export const POINTS = {
  right: { 1: 10, 2: 20, 3: 30 } as Record<Difficulty, number>,
  /** With four options a blind guess is right one time in four: 3 × wrong ≥ right, so guessing never pays. */
  wrong: { 1: 4, 2: 7, 3: 10 } as Record<Difficulty, number>,
  /** For each correct answer that directly follows a correct one. */
  streak: 5,
  /** Share of the correct-answer points added for a round finished with the whole clock left. */
  speedShare: 0.25,
  /** The speed bonus is for fast and right, not fast and guessing. */
  speedMinCorrect: 7,
} as const;

/**
 * Deal a round: the fixed mix of difficulties, no question twice, easy first.
 * `rand` is injectable so the deal can be tested.
 */
export function pickRound(bank: ArenaQuestion[], rand: () => number = Math.random): ArenaQuestion[] {
  const round: ArenaQuestion[] = [];
  for (const d of [1, 2, 3] as const) {
    const pool = bank.filter((q) => q.difficulty === d);
    if (pool.length < ROUND.mix[d]) throw new Error(`The bank has ${pool.length} questions at difficulty ${d}; a round needs ${ROUND.mix[d]}.`);
    // Partial Fisher-Yates: the first mix[d] slots end up holding distinct random questions.
    for (let i = 0; i < ROUND.mix[d]; i++) {
      const j = i + Math.floor(rand() * (pool.length - i));
      [pool[i], pool[j]] = [pool[j], pool[i]];
      round.push(pool[i]);
    }
  }
  return round;
}

export type RoundScore = {
  correct: number;
  wrong: number;
  skipped: number;
  /** Points for correct answers, before anything else. */
  base: number;
  penalty: number;
  streak: number;
  speed: number;
  /** Submitted after the clock plus grace: the round is void. */
  late: boolean;
  points: number;
  marks: { id: string; choice: number | null; correct: boolean }[];
};

/**
 * Score a round. `questions` are the ones the server issued, in the order asked; `answers`
 * is whatever the browser sent and is not trusted: unknown ids are ignored and anything
 * that is not a valid option index counts as skipped. `elapsedSeconds` is server time.
 */
export function scoreRound(questions: ArenaQuestion[], answers: Record<string, unknown>, elapsedSeconds: number): RoundScore {
  const seen = new Set<string>();
  const asked = questions.filter((q) => !seen.has(q.id) && seen.add(q.id));
  let base = 0;
  let penalty = 0;
  let streak = 0;
  let correct = 0;
  let wrong = 0;
  let run = false;

  const marks = asked.map((q) => {
    const raw = Object.hasOwn(answers, q.id) ? answers[q.id] : undefined;
    const choice = typeof raw === "number" && Number.isInteger(raw) && raw >= 0 && raw < q.options.length ? raw : null;
    const right = choice === q.answer;
    if (right) {
      correct++;
      base += POINTS.right[q.difficulty];
      if (run) streak += POINTS.streak;
    } else if (choice !== null) {
      wrong++;
      penalty += POINTS.wrong[q.difficulty];
    }
    run = right;
    return { id: q.id, choice, correct: right };
  });

  const late = !(elapsedSeconds <= ROUND.seconds + ROUND.graceSeconds);
  const left = Math.min(Math.max((ROUND.seconds - elapsedSeconds) / ROUND.seconds, 0), 1);
  const speed = correct >= POINTS.speedMinCorrect ? Math.round(base * POINTS.speedShare * left) : 0;
  const points = late ? 0 : Math.max(base - penalty + streak + speed, 0);
  return { correct, wrong, skipped: asked.length - correct - wrong, base, penalty, streak, speed: late ? 0 : speed, late, points, marks };
}

// ponytail: India has one time zone and no daylight saving, so a fixed offset is exact.
const IST_OFFSET_MS = 5.5 * 3_600_000;
const DAY_MS = 86_400_000;

/** The Monday 00:00 (India time) that starts the week `now` is in. The weekly board resets here. */
export function weekStart(now = new Date()): Date {
  const local = new Date(now.getTime() + IST_OFFSET_MS);
  const sinceMonday = (local.getUTCDay() + 6) % 7;
  const midnight = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate());
  return new Date(midnight - sinceMonday * DAY_MS - IST_OFFSET_MS);
}

/** "Anaswer Ajay" → "Anaswer A.". A student who has opted out keeps their rank without their name. */
export function displayName(name: string, hidden: boolean): string {
  if (hidden) return "Anonymous";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "Student";
  return parts.length > 1 ? `${parts[0]} ${parts.at(-1)![0].toUpperCase()}.` : parts[0];
}

export type BoardRow = { userId: string; points: number; rounds: number; lastFinishedAt: Date };

/**
 * Order a board. More points first; on a tie, whoever got there first; then user id, so the
 * order is the same every time it is computed. Ranks are 1, 2, 3… with no shared places.
 */
export function rankRows<T extends BoardRow>(rows: T[]): (T & { rank: number })[] {
  return [...rows]
    .sort((a, b) => b.points - a.points || a.lastFinishedAt.getTime() - b.lastFinishedAt.getTime() || a.userId.localeCompare(b.userId))
    .map((r, i) => ({ ...r, rank: i + 1 }));
}
