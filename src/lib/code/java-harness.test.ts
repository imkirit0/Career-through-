import { describe, expect, it } from "vitest";
import { CHALLENGES } from "@/content/challenges";
import { RESULTS_MARK, buildJavaMain, readJavaRun } from "./java-harness";

describe("java harness", () => {
  it("calls every check once, each guarded on its own", () => {
    const main = buildJavaMain(["Solution.f(1)", "Solution.f(2)"]);
    expect(main).toContain("public class Main");
    expect(main).toContain("out.add(Json.of(Solution.f(1)))");
    expect(main).toContain("out.add(Json.of(Solution.f(2)))");
    expect(main.match(/catch \(Throwable e\)/g)).toHaveLength(2);
  });

  it("separates what the student printed from the results", () => {
    const run = readJavaRun(`hello\nworld\n\n${RESULTS_MARK}["[1,2]","!ArithmeticException: / by zero"]\n`, "", 0);
    expect(run).toEqual({ ok: true, output: "hello\nworld", results: ["[1,2]", "!ArithmeticException: / by zero"] });
  });

  it("reports a crash before the results as an error, keeping the printed output", () => {
    expect(readJavaRun("partial\n", "Exception in thread main", 1)).toEqual({ ok: false, error: "Exception in thread main", output: "partial" });
  });

  it("gives every Java version a Solution class, its own checks and hints", () => {
    const withJava = CHALLENGES.filter((c) => c.java);
    expect(withJava.length).toBeGreaterThanOrEqual(6);
    for (const { id, java } of withJava) {
      expect(java!.solution, id).toMatch(/class Solution\b/);
      expect(java!.starter.trim(), id).not.toBe(java!.solution.trim());
      expect(java!.checks.length, id).toBeGreaterThanOrEqual(3);
      expect(java!.checks.every((c) => c.startsWith("Solution.")), id).toBe(true);
      expect(java!.hints.length, id).toBeGreaterThan(0);
    }
  });
});
