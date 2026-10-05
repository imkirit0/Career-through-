import "server-only";
import type { Question, Skill } from "@/content/taxonomy";
import { getSkill } from "@/content/skills";
import { estimateLevel } from "./estimate";

/**
 * Progressive (adaptive) question selection and scoring.
 *
 * Difficulty comes from the skill's own topic order, which is authored
 * foundational → applied, so topic 1 is the easiest and topic 4 the most applied.
 * Get one right and the next is harder; get one wrong and it steps back down.
 * The ladder decides what is asked; ./estimate decides what the answers add up to.
 */
export const SCORING_VERSION = "adaptive-v2";

export const MAX_DIFFICULTY = 4;
export const MIN_DIFFICULTY = 1;

export function difficultyOf(question: Question, skill: Skill = getSkill(question.skillId)): number {
  const i = skill.topics.findIndex((t) => t.id === question.topicId);
  return i < 0 ? MIN_DIFFICULTY : i + 1;
}

const clamp = (d: number) => Math.min(Math.max(d, MIN_DIFFICULTY), MAX_DIFFICULTY);

/** Where a skill's ladder starts: a baseline opens gently, a re-assessment opens mid. */
export function startDifficulty(kind: "baseline" | "skill" | "final"): number {
  return kind === "baseline" ? 1 : 2;
}

export type AskedAnswer = { question: Question; choice: number | undefined };

/** Difficulty for the next question, from how the candidate has done so far. */
export function nextDifficulty(asked: AskedAnswer[], start: number): number {
  let d = clamp(start);
  for (const { question, choice } of asked) {
    d = clamp(d + (choice === question.answer ? 1 : -1));
  }
  return d;
}

/**
 * Pick the next question for a skill at the wanted difficulty, falling back to the
 * nearest available band when that one is exhausted. Deterministic given the attempt id.
 */
export function pickQuestion(pool: Question[], usedIds: Set<string>, wanted: number, seed: string): Question | undefined {
  const skill = pool.length ? getSkill(pool[0].skillId) : undefined;
  if (!skill) return undefined;
  const available = pool.filter((q) => !usedIds.has(q.id));
  if (!available.length) return undefined;

  const byDistance = available
    .map((q) => ({ q, d: difficultyOf(q, skill) }))
    .sort((a, b) => {
      const da = Math.abs(a.d - wanted);
      const db = Math.abs(b.d - wanted);
      // Prefer the wanted band, then the nearest; on a tie prefer the harder one,
      // then a stable hash so the same attempt always sees the same question.
      return da - db || b.d - a.d || hash(seed + a.q.id) - hash(seed + b.q.id);
    });
  return byDistance[0]?.q;
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967296;
}

export type SkillProgress = { asked: number; quota: number };

/**
 * Which skill to ask about next: whichever is furthest behind its quota, so a
 * multi-skill assessment stays balanced even if the candidate stops early.
 */
export function nextSkill(progress: Record<string, SkillProgress>, order: string[]): string | undefined {
  const pending = order.filter((id) => progress[id] && progress[id].asked < progress[id].quota);
  if (!pending.length) return undefined;
  return pending.reduce((best, id) => (progress[id].asked < progress[best].asked ? id : best), pending[0]);
}

export type AdaptiveSkillScore = {
  correct: number;
  total: number;
  /** The estimated level: what this skill is set to. See ./estimate. */
  pct: number;
  /** The range the level very likely lies in. Absent on results scored before adaptive-v2. */
  low?: number;
  high?: number;
  /** Highest difficulty answered correctly — used to gate the top band. */
  peakCorrect: number;
  topics: Record<string, { correct: number; total: number; pct: number }>;
};

export type AdaptiveScore = {
  correct: number;
  total: number;
  /** The average of the skill levels. */
  pct: number;
  scoringVersion: string;
  bySkill: Record<string, AdaptiveSkillScore>;
};

/**
 * Score an attempt. Each skill's level is estimated from the difficulty of every question
 * it was asked and whether the answer was right, so a run of easy answers cannot claim a
 * high level and one slip does not halve it. A skipped or "not sure" answer is a wrong one.
 */
export function scoreAdaptive(asked: AskedAnswer[]): AdaptiveScore {
  const bySkill: Record<string, AdaptiveSkillScore> = {};
  const answered: Record<string, { difficulty: number; right: boolean }[]> = {};
  let correct = 0;

  for (const { question, choice } of asked) {
    const skill = getSkill(question.skillId);
    const d = difficultyOf(question, skill);
    const ok = Number.isInteger(choice) && choice === question.answer;
    const s = (bySkill[question.skillId] ??= { correct: 0, total: 0, pct: 0, peakCorrect: 0, topics: {} });
    const t = (s.topics[question.topicId] ??= { correct: 0, total: 0, pct: 0 });
    (answered[question.skillId] ??= []).push({ difficulty: d, right: ok });
    s.total++;
    t.total++;
    if (ok) {
      s.correct++;
      t.correct++;
      s.peakCorrect = Math.max(s.peakCorrect, d);
      correct++;
    }
  }

  for (const [skillId, s] of Object.entries(bySkill)) {
    const { level, low, high } = estimateLevel(answered[skillId]);
    s.pct = level;
    s.low = low;
    s.high = high;
    for (const t of Object.values(s.topics)) t.pct = t.total ? Math.round((t.correct / t.total) * 100) : 0;
  }

  const levels = Object.values(bySkill).map((s) => s.pct);
  return {
    correct,
    total: asked.length,
    pct: levels.length ? Math.round(levels.reduce((a, b) => a + b, 0) / levels.length) : 0,
    scoringVersion: SCORING_VERSION,
    bySkill,
  };
}
