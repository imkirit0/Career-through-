import type { Question } from "@/content/taxonomy";

// Practice is rehearsal: its own question bank, answers shown freely, nothing stored as
// evidence. The scored pool in content/skills is never served here.

export const PRACTICE_MODES = {
  /** Untimed, feedback after every answer. */
  drill: { label: "Quick drill", count: 5, minutes: null },
  /** Timed like a skill assessment, feedback only at the end. */
  mock: { label: "Mock test", count: 6, minutes: 8 },
} as const;

export type PracticeMode = keyof typeof PRACTICE_MODES;

/** Share of correct answers at which we say "go and prove it". */
export const READY_RATIO = 0.8;

/**
 * Choose a run from a skill's practice pool: topics the student last got wrong come
 * first, the rest is random, and the run is asked in authored order (foundational → applied).
 */
export function pickPractice(pool: Question[], count: number, weakTopics: string[] = [], rand: () => number = Math.random): Question[] {
  const weak = new Set(weakTopics);
  return pool
    .map((q, order) => ({ q, order, key: rand() }))
    .sort((a, b) => Number(weak.has(b.q.topicId)) - Number(weak.has(a.q.topicId)) || a.key - b.key)
    .slice(0, count)
    .sort((a, b) => a.order - b.order)
    .map((x) => x.q);
}

/** Server-side marking. An id that is missing from `answers` counts as wrong. */
export function markPractice(questions: Question[], answers: Record<string, number>) {
  const correct = questions.filter((q) => answers[q.id] === q.answer).length;
  return { correct, total: questions.length, ready: questions.length > 0 && correct / questions.length >= READY_RATIO };
}
