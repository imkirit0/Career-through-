import { describe, expect, it } from "vitest";
import { SKILLS } from "@/content/skills";
import { QUESTIONS } from "@/content/assessments";
import { PRACTICE_QUESTIONS, practiceForSkill } from "@/content/practice";
import { PRACTICE_MODES, markPractice, pickPractice } from "./practice";

describe("practice bank", () => {
  it("gives every skill 8 questions, 2 per topic, on its own topics", () => {
    for (const skill of SKILLS) {
      const pool = practiceForSkill(skill.id);
      expect(pool, skill.id).toHaveLength(8);
      for (const t of skill.topics) expect(pool.filter((q) => q.topicId === t.id), t.id).toHaveLength(2);
    }
    expect(PRACTICE_QUESTIONS).toHaveLength(SKILLS.length * 8);
  });

  it("has well-formed questions with unique ids", () => {
    expect(new Set(PRACTICE_QUESTIONS.map((q) => q.id)).size).toBe(PRACTICE_QUESTIONS.length);
    for (const q of PRACTICE_QUESTIONS) {
      expect(q.options, q.id).toHaveLength(4);
      expect(new Set(q.options).size, q.id).toBe(4);
      expect(q.answer, q.id).toBeGreaterThanOrEqual(0);
      expect(q.answer, q.id).toBeLessThan(4);
      expect(q.explanation.length, q.id).toBeGreaterThan(40);
    }
  });

  it("never serves a scored question: no shared id or prompt", () => {
    const scoredIds = new Set(QUESTIONS.map((q) => q.id));
    const scoredPrompts = new Set(QUESTIONS.map((q) => q.prompt.trim().toLowerCase()));
    for (const q of PRACTICE_QUESTIONS) {
      expect(scoredIds.has(q.id), q.id).toBe(false);
      expect(scoredPrompts.has(q.prompt.trim().toLowerCase()), q.id).toBe(false);
    }
  });
});

describe("practice runs", () => {
  const pool = practiceForSkill(SKILLS[0].id);
  const order = (id: string) => pool.findIndex((q) => q.id === id);

  it("picks the requested number without repeats, in authored order", () => {
    for (const mode of Object.values(PRACTICE_MODES)) {
      const run = pickPractice(pool, mode.count);
      expect(run).toHaveLength(mode.count);
      expect(new Set(run.map((q) => q.id)).size).toBe(mode.count);
      expect(run.map((q) => order(q.id))).toEqual([...run.map((q) => order(q.id))].sort((a, b) => a - b));
    }
  });

  it("always includes the topics the student last got wrong", () => {
    const weak = SKILLS[0].topics[3].id;
    for (let i = 0; i < 20; i++) {
      expect(pickPractice(pool, 5, [weak]).filter((q) => q.topicId === weak)).toHaveLength(2);
    }
  });

  it("marks on the server: unanswered is wrong, and 80% counts as ready", () => {
    const run = pool.slice(0, 5);
    const right = Object.fromEntries(run.map((q) => [q.id, q.answer]));
    expect(markPractice(run, right)).toEqual({ correct: 5, total: 5, ready: true });
    expect(markPractice(run, Object.fromEntries(run.slice(1).map((q) => [q.id, q.answer])))).toEqual({ correct: 4, total: 5, ready: true });
    expect(markPractice(run, { [run[0].id]: run[0].answer })).toEqual({ correct: 1, total: 5, ready: false });
    expect(markPractice([], {}).ready).toBe(false);
  });
});
