import { describe, expect, it } from "vitest";
import { CHALLENGES, challengesForSkill } from "@/content/challenges";
import { ROLES } from "@/content/roles";
import { getSkill } from "@/content/skills";
import { mark } from "./run";

describe("code challenges", () => {
  it("are well-formed and point at real skills and topics", () => {
    expect(new Set(CHALLENGES.map((c) => c.id)).size).toBe(CHALLENGES.length);
    for (const c of CHALLENGES) {
      const skill = getSkill(c.skillId);
      expect(skill.topics.some((t) => t.id === c.topicId), `${c.id} topic`).toBe(true);
      expect(c.starter.trim(), `${c.id} starter must differ from the solution`).not.toBe(c.solution.trim());
      expect(c.brief.length, `${c.id} brief`).toBeGreaterThan(40);
      expect(c.hints.length, `${c.id} hints`).toBeGreaterThan(0);
      if (c.language === "sql") {
        expect(c.setup, `${c.id} needs setup`).toBeTruthy();
        expect(c.checks, `${c.id} sql uses rows, not checks`).toEqual([]);
        expect(/^\s*select/i.test(c.solution), `${c.id} solution is a SELECT`).toBe(true);
      } else {
        expect(c.checks.length, `${c.id} checks`).toBeGreaterThanOrEqual(3);
        expect(c.setup, `${c.id} has no setup`).toBeUndefined();
      }
    }
  });

  it("cover every runnable skill with at least four, and reach every role but DevOps", () => {
    for (const skillId of ["sql", "javascript", "python", "programming-fundamentals", "data-cleaning", "statistics"]) {
      expect(challengesForSkill(skillId).length, skillId).toBeGreaterThanOrEqual(4);
    }
    for (const role of ROLES) {
      const n = role.skills.reduce((s, r) => s + challengesForSkill(r.skillId).length, 0);
      if (role.id === "devops-engineer") expect(n).toBe(0);
      else expect(n, role.id).toBeGreaterThan(0);
    }
  });

  it("marks only the cases that were run, and shows values the way the language writes them", () => {
    const challenge = { ...CHALLENGES.find((c) => c.language === "python")!, checks: ["f(1)", "f(2)"] };
    const reference = { ok: true as const, output: "", results: ["null", "[1,2]", "3"], display: ["None", "(1, 2)", "3"] };
    const student = { ok: true as const, output: "", results: ["null", "!ValueError: bad"], display: ["None", ""] };
    const verdict = mark(challenge, student, reference);
    expect(verdict.pass).toBe(false);
    expect(verdict.checks).toEqual([
      { label: "f(1)", expected: "None", got: "None", pass: true },
      { label: "f(2)", expected: "(1, 2)", got: "!ValueError: bad", pass: false },
    ]);
  });
});
