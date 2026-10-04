import { describe, expect, it } from "vitest";
import { QUESTIONS, getAssessment, questionsForSkill } from "@/content/assessments";
import { ROLES } from "@/content/roles";
import { getSkill } from "@/content/skills";
import { difficultyOf } from "./adaptive";
import { nextQuestion, scoreAttemptAdaptive, type AttemptRow } from "./attempt";

// The baseline is a student's first full measurement, so what it awards is pinned here: any
// change to question pools, the ladder or the weights that moves a score fails this file.

/** Sit an assessment through the real engine. `right(n)` decides the nth question of each skill. */
function sit(assessmentId: string, right: (n: number) => boolean) {
  const def = getAssessment(assessmentId)!;
  const a: AttemptRow = { id: `test-${assessmentId}`, assessmentId: def.id, kind: def.kind, questionIds: [], answers: {}, stage: "knowledge" };
  const seen: Record<string, number> = {};
  const path: Record<string, number[]> = {};
  for (;;) {
    const q = nextQuestion(a, def);
    if (!q) break;
    const n = (seen[q.skillId] = (seen[q.skillId] ?? 0) + 1) - 1;
    a.questionIds.push(q.id);
    a.answers![q.id] = right(n) ? q.answer : (q.answer + 1) % q.options.length;
    (path[q.skillId] ??= []).push(difficultyOf(q));
  }
  return { def, score: scoreAttemptAdaptive(a, def), path, asked: a.questionIds };
}

describe("the scored question pool", () => {
  it("every question can be asked and marked", () => {
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(QUESTIONS.length);
    for (const q of QUESTIONS) {
      expect(q.options.length, `${q.id} options`).toBe(4);
      expect(new Set(q.options.map((o) => o.trim().toLowerCase())).size, `${q.id} options are distinct`).toBe(4);
      expect(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4, `${q.id} answer`).toBe(true);
      expect(getSkill(q.skillId).topics.some((t) => t.id === q.topicId), `${q.id} topic`).toBe(true);
      expect(q.explanation.trim().length, `${q.id} explanation`).toBeGreaterThan(0);
    }
  });

  it("gives every role skill two questions at each of the four difficulties", () => {
    for (const skillId of new Set(ROLES.flatMap((r) => r.skills.map((s) => s.skillId)))) {
      const perBand = [1, 2, 3, 4].map((d) => questionsForSkill(skillId).filter((q) => difficultyOf(q) === d).length);
      expect(perBand, skillId).toEqual([2, 2, 2, 2]);
    }
  });

  it("does not favour an answer position", () => {
    const counts = [0, 1, 2, 3].map((i) => QUESTIONS.filter((q) => q.answer === i).length);
    for (const c of counts) expect(c / QUESTIONS.length).toBeGreaterThan(0.2);
  });
});

describe("baseline scoring", () => {
  // Right/wrong on a skill's three questions → the level that skill is given.
  const TABLE: Record<string, number> = { RRR: 100, RRW: 50, WRR: 50, RWR: 33, WWR: 33, RWW: 17, WRW: 17, WWW: 0 };

  it.each(ROLES.map((r) => r.id))("%s: every answer pattern scores the same for every skill", (roleId) => {
    for (const [pattern, pct] of Object.entries(TABLE)) {
      const { def, score } = sit(`baseline:${roleId}`, (n) => pattern[n] === "R");
      expect(Object.keys(score.bySkill).sort(), "every role skill is assessed").toEqual([...def.skillIds].sort());
      for (const [skillId, s] of Object.entries(score.bySkill)) {
        expect(s.pct, `${skillId} ${pattern}`).toBe(pct);
        expect(s.total, `${skillId} is asked three questions`).toBe(3);
        expect(s.correct).toBe([...pattern].filter((c) => c === "R").length);
      }
      expect(score.pct).toBe(pct);
    }
  });

  it("asks three questions per skill, never repeats one, and starts each skill easy", () => {
    for (const role of ROLES) {
      const { def, path, asked, score } = sit(`baseline:${role.id}`, () => true);
      expect(asked.length).toBe(def.skillIds.length * 3);
      expect(new Set(asked).size).toBe(asked.length);
      expect(score.total).toBe(asked.length);
      // All correct: the ladder climbs easy, medium, applied.
      for (const skillId of def.skillIds) expect(path[skillId], skillId).toEqual([1, 2, 3]);
    }
  });

  it("steps down after a wrong answer and never scores a correct answer lower than a wrong one", () => {
    const { path } = sit("baseline:backend-developer", (n) => n === 0);
    for (const levels of Object.values(path)) expect(levels).toEqual([1, 2, 1]);
    // Changing any single answer from wrong to right never lowers the level.
    for (const p of Object.keys(TABLE)) {
      for (let i = 0; i < 3; i++) {
        if (p[i] !== "W") continue;
        const better = p.slice(0, i) + "R" + p.slice(i + 1);
        expect(TABLE[better], `${p} -> ${better}`).toBeGreaterThanOrEqual(TABLE[p]);
      }
    }
  });
});
