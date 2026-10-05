import { describe, expect, it } from "vitest";
import { estimateLevel, type Answered } from "./estimate";

const a = (pattern: string, difficulties: number[]): Answered[] => [...pattern].map((c, i) => ({ difficulty: difficulties[i], right: c === "R" }));

// Representative runs through the ladder: the pattern of right and wrong, and the difficulty of each question.
const CASES: Record<string, [string, number[]]> = {
  "critical skill, all six right": ["RRRRRR", [1, 2, 3, 4, 4, 4]],
  "critical skill, five of six": ["RRRRWR", [1, 2, 3, 4, 4, 3]],
  "important skill, all four right": ["RRRR", [1, 2, 3, 4]],
  "other skill, all three right": ["RRR", [1, 2, 3]],
  "easy and medium right, applied wrong": ["RRW", [1, 2, 3]],
  "three wrong": ["WWW", [1, 1, 1]],
  "six wrong": ["WWWWWW", [1, 1, 1, 1, 2, 2]],
};
const PINNED = {
  "critical skill, all six right": { level: 86, low: 69, high: 97 },
  "critical skill, five of six": { level: 72, low: 50, high: 90 },
  "important skill, all four right": { level: 77, low: 52, high: 96 },
  "other skill, all three right": { level: 70, low: 41, high: 94 },
  "easy and medium right, applied wrong": { level: 48, low: 22, high: 75 },
  "three wrong": { level: 11, low: 2, high: 22 },
  "six wrong": { level: 8, low: 2, high: 16 },
};

describe("estimateLevel", () => {
  it("stays between 0 and 100, with the level inside its range", () => {
    for (const answers of [[], a("RRRRRR", [1, 2, 3, 4, 4, 4]), a("WWWWWW", [1, 1, 1, 1, 2, 2]), a("RWRWRW", [1, 2, 1, 2, 1, 2])]) {
      const e = estimateLevel(answers);
      expect(e.low).toBeGreaterThanOrEqual(0);
      expect(e.high).toBeLessThanOrEqual(100);
      expect(e.low).toBeLessThanOrEqual(e.level);
      expect(e.level).toBeLessThanOrEqual(e.high);
    }
  });

  it("with no answers, sits in the middle with a wide range", () => {
    const e = estimateLevel([]);
    expect(e.level).toBe(50);
    expect(e.high - e.low).toBeGreaterThan(50);
  });

  it("a right answer never lowers the level and a wrong one never raises it", () => {
    const history = a("RWR", [1, 2, 1]);
    const before = estimateLevel(history).level;
    for (const difficulty of [1, 2, 3, 4]) {
      expect(estimateLevel([...history, { difficulty, right: true }]).level).toBeGreaterThanOrEqual(before);
      expect(estimateLevel([...history, { difficulty, right: false }]).level).toBeLessThanOrEqual(before);
    }
  });

  it("counts a hard question answered right for more, and an easy one answered wrong for more", () => {
    const right = [1, 2, 3, 4].map((difficulty) => estimateLevel([{ difficulty, right: true }]).level);
    expect(right).toEqual([...right].sort((x, y) => x - y));
    expect(right[3]).toBeGreaterThan(right[0]);
    const wrong = [1, 2, 3, 4].map((difficulty) => estimateLevel([{ difficulty, right: false }]).level);
    expect(wrong).toEqual([...wrong].sort((x, y) => x - y));
    expect(wrong[0]).toBeLessThan(wrong[3]);
  });

  it("narrows its range as answers come in", () => {
    const widths = [0, 3, 6].map((n) => {
      const e = estimateLevel(a("RRWRWR".slice(0, n), [1, 2, 3, 2, 3, 2].slice(0, n)));
      return e.high - e.low;
    });
    expect(widths[1]).toBeLessThan(widths[0]);
    expect(widths[2]).toBeLessThan(widths[1]);
  });

  it("does not care about the order of the answers, and gives the same result every time", () => {
    const one = a("RRW", [1, 2, 3]);
    expect(estimateLevel([...one].reverse())).toEqual(estimateLevel(one));
    expect(estimateLevel(one)).toEqual(estimateLevel(one));
  });

  it("is cautious about three easy answers and convinced by six that reach the top", () => {
    // Pinned: a change to the model that moves these is a change to every student's level.
    const got = Object.fromEntries(
      Object.entries(CASES).map(([name, [pattern, difficulties]]) => [name, estimateLevel(a(pattern, difficulties))]),
    );
    expect(got).toEqual(PINNED);
  });
});
