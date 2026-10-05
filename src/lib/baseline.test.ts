import { describe, expect, it } from "vitest";
import { BASELINE_QUESTIONS, QUESTIONS, getAssessment, questionsForSkill } from "@/content/assessments";
import { ROLES } from "@/content/roles";
import { getSkill } from "@/content/skills";
import type { AssessmentDef } from "@/content/taxonomy";
import { difficultyOf } from "./adaptive";
import { nextQuestion, scoreAttemptAdaptive, type AttemptRow } from "./attempt";
import { MODEL } from "./estimate";

// The baseline is a student's first full measurement, so what it asks and what it awards are
// pinned here: a change to the pools, the ladder or the estimate that moves a level fails this file.

/** Sit an assessment through the real engine. `right` decides each question from its difficulty and position in its skill. */
function sit(def: AssessmentDef, id: string, right: (difficulty: number, nth: number) => boolean) {
  const a: AttemptRow = { id, assessmentId: def.id, kind: def.kind, questionIds: [], answers: {}, stage: "knowledge" };
  const seen: Record<string, number> = {};
  const path: Record<string, number[]> = {};
  for (;;) {
    const q = nextQuestion(a, def);
    if (!q) break;
    const n = (seen[q.skillId] = (seen[q.skillId] ?? 0) + 1) - 1;
    const d = difficultyOf(q);
    a.questionIds.push(q.id);
    a.answers![q.id] = right(d, n) ? q.answer : (q.answer + 1) % q.options.length;
    (path[q.skillId] ??= []).push(d);
  }
  return { score: scoreAttemptAdaptive(a), path, asked: a.questionIds };
}

describe("the scored question pool", () => {
  it("every question can be asked and marked", () => {
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(QUESTIONS.length);
    for (const q of QUESTIONS) {
      expect(q.options.length, `${q.id} options`).toBe(4);
      expect(new Set(q.options.map((o) => o.trim().toLowerCase())).size, `${q.id} options are distinct`).toBe(4);
      expect(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4, `${q.id} answer`).toBe(true);
      expect(getSkill(q.skillId).topics.some((t) => t.id === q.topicId), `${q.id} topic`).toBe(true);
      expect(q.prompt.trim().length, `${q.id} prompt`).toBeGreaterThan(0);
      expect(q.explanation.trim().length, `${q.id} explanation`).toBeGreaterThan(0);
    }
  });

  it("gives every role skill four questions at each of the four difficulties", () => {
    for (const skillId of new Set(ROLES.flatMap((r) => r.skills.map((s) => s.skillId)))) {
      const perBand = [1, 2, 3, 4].map((d) => questionsForSkill(skillId).filter((q) => difficultyOf(q) === d).length);
      expect(perBand, skillId).toEqual([4, 4, 4, 4]);
    }
  });

  it("does not favour an answer position", () => {
    for (const i of [0, 1, 2, 3]) expect(QUESTIONS.filter((q) => q.answer === i).length / QUESTIONS.length).toBeGreaterThan(0.2);
  });
});

describe("what the baseline asks", () => {
  it.each(ROLES.map((r) => r.id))("%s: more questions on the skills the role depends on most", (roleId) => {
    const role = ROLES.find((r) => r.id === roleId)!;
    const def = getAssessment(`baseline:${roleId}`)!;
    for (const s of role.skills) expect(def.questionsBySkill[s.skillId], s.skillId).toBe(BASELINE_QUESTIONS[s.priority]);
    const total = Object.values(def.questionsBySkill).reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThanOrEqual(44);
    expect(total).toBeLessThanOrEqual(51);
    expect(def.durationMin).toBe(Math.ceil(total * 1.25));

    const { asked, path, score } = sit(def, `quota-${roleId}`, () => true);
    expect(asked.length).toBe(total);
    expect(new Set(asked).size, "no question is asked twice").toBe(total);
    for (const s of role.skills) {
      expect(score.bySkill[s.skillId].total).toBe(def.questionsBySkill[s.skillId]);
      // All right: the ladder starts easy and climbs to the top.
      expect(path[s.skillId].slice(0, 3)).toEqual([1, 2, 3]);
    }
  });

  it("leaves enough unseen questions for a skill test after a baseline", () => {
    for (const role of ROLES) {
      const { asked } = sit(getAssessment(`baseline:${role.id}`)!, `leftover-${role.id}`, () => true);
      const seen = new Set(asked);
      for (const s of role.skills) expect(questionsForSkill(s.skillId).filter((q) => !seen.has(q.id)).length, s.skillId).toBeGreaterThanOrEqual(6);
    }
  });
});

describe("what the baseline awards", () => {
  const def = getAssessment("baseline:backend-developer")!;
  const levels = (right: (d: number, n: number) => boolean) => {
    const { score } = sit(def, "award", right);
    const byQuota: Record<number, number> = {};
    for (const [skillId, s] of Object.entries(score.bySkill)) {
      const quota = def.questionsBySkill[skillId];
      // Every skill with the same quota and the same answers gets the same level.
      if (byQuota[quota] !== undefined) expect(s.pct, skillId).toBe(byQuota[quota]);
      byQuota[quota] = s.pct;
      expect(s.low).toBeLessThanOrEqual(s.pct);
      expect(s.high).toBeGreaterThanOrEqual(s.pct);
    }
    return byQuota;
  };

  it("pins the level for clear-cut runs, by how many questions the skill was asked", () => {
    expect(levels(() => true)).toEqual({ 6: 86, 4: 77, 3: 70 });
    expect(levels(() => false)).toEqual({ 6: 8, 4: 9, 3: 11 });
    // Easy and medium right, everything harder wrong.
    expect(levels((d) => d <= 2)).toEqual({ 6: 50, 4: 54, 3: 48 });
  });

  it("never gives a better run a lower level", () => {
    const order = [levels(() => false), levels((d) => d <= 1), levels((d) => d <= 2), levels((d) => d <= 3), levels(() => true)];
    for (const quota of [3, 4, 6]) {
      const seq = order.map((o) => o[quota]);
      expect(seq, `quota ${quota}`).toEqual([...seq].sort((a, b) => a - b));
    }
  });
});

describe("how well the baseline measures a student", () => {
  // Simulated students of known ability answer through the real ladder and estimator. The
  // thresholds have slack: this guards against a change that makes the baseline clearly
  // worse, it does not claim these figures for real students.
  const know = (ability: number, d: number) => 1 / (1 + Math.exp(-1.3 * (ability - MODEL.difficulty[d - 1])));
  const trueLevel = (ability: number) => (100 * [1, 2, 3, 4].reduce((s, d) => s + know(ability, d), 0)) / 4;

  it.each([
    [3, 21, 68],
    [4, 19, 73],
    [6, 18, 75],
  ])("%i questions on a skill: error within ±%i points, 'at target' right at least %i%% of the time", (quota, maxError, minRight) => {
    let seed = 20261004;
    const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
    const gauss = () => Math.sqrt(-2 * Math.log(rand() || 1e-9)) * Math.cos(2 * Math.PI * rand());
    const def: AssessmentDef = { id: "baseline:sim", kind: "baseline", title: "", roleId: null, skillIds: ["sql"], questionsBySkill: { sql: quota }, durationMin: 10 };
    const N = 1500;
    const TARGET = 65;
    let squared = 0;
    let right = 0;
    let inRange = 0;
    for (let i = 0; i < N; i++) {
      const ability = gauss() * 1.1;
      const { score } = sit(def, `sim-${quota}-${i}`, (d) => rand() < MODEL.guess + (1 - MODEL.guess) * know(ability, d));
      const s = score.bySkill.sql;
      const truth = trueLevel(ability);
      squared += (s.pct - truth) ** 2;
      right += Number(truth >= TARGET === s.pct >= TARGET);
      inRange += Number(truth >= s.low! - 0.5 && truth <= s.high! + 0.5);
    }
    expect(Math.sqrt(squared / N)).toBeLessThan(maxError);
    expect((100 * right) / N).toBeGreaterThan(minRight);
    // The stated range should hold the true level about four times in five.
    expect((100 * inRange) / N).toBeGreaterThan(72);
  });
});
