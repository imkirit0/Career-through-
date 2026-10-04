import { describe, expect, it } from "vitest";
import { POINTS, ROUND, dayStart, displayName, pickRound, rankRows, scoreRound, weekStart, type ArenaQuestion, type Difficulty } from "./arena";

const q = (id: string, difficulty: Difficulty, answer = 0): ArenaQuestion => ({ id, topic: "t", difficulty, prompt: "p", options: ["a", "b", "c", "d"], answer, explanation: "e" });
// A dealt round: 3 easy, 5 medium, 2 hard, every answer is option 0.
const round = [q("e1", 1), q("e2", 1), q("e3", 1), q("m1", 2), q("m2", 2), q("m3", 2), q("m4", 2), q("m5", 2), q("h1", 3), q("h2", 3)];
const allRight = Object.fromEntries(round.map((x) => [x.id, 0]));
const allWrong = Object.fromEntries(round.map((x) => [x.id, 1]));
const BASE = 3 * 10 + 5 * 20 + 2 * 30;

describe("scoreRound", () => {
  it("a perfect round with the clock run out: base plus nine streak bonuses, no speed bonus", () => {
    const s = scoreRound(round, allRight, ROUND.seconds);
    expect(s).toMatchObject({ correct: 10, wrong: 0, skipped: 0, base: BASE, penalty: 0, streak: 9 * POINTS.streak, speed: 0, late: false, points: BASE + 45 });
  });

  it("gives the whole speed bonus for a quick round, and no more for an inhumanly quick one", () => {
    const full = Math.round(BASE * POINTS.speedShare);
    expect(scoreRound(round, allRight, ROUND.speedFullWithinSeconds).speed).toBe(full);
    expect(scoreRound(round, allRight, 45).speed).toBe(full);
    // Half-way between "full" and the clock: half the bonus.
    expect(scoreRound(round, allRight, 210).speed).toBe(Math.round(BASE * POINTS.speedShare * 0.5));
  });

  it("voids a round answered faster than anyone can read it", () => {
    const fast = scoreRound(round, allRight, 29);
    expect(fast).toMatchObject({ voided: "too_fast", points: 0, earned: 0, speed: 0, correct: 10 });
    expect(scoreRound(round, allRight, 30).voided).toBeNull();
    // The floor is per answer given: three answers in ten seconds is fine, skips cost no time.
    expect(scoreRound(round, { e1: 0, e2: 0, e3: 0 }, 10)).toMatchObject({ voided: null, points: 30 + 10 });
    expect(scoreRound(round, {}, 0)).toMatchObject({ voided: null, points: 0 });
  });

  it("voids a round when the tab was left too often, and ignores a nonsense count", () => {
    expect(scoreRound(round, allRight, 200, ROUND.maxTabSwitches).voided).toBeNull();
    expect(scoreRound(round, allRight, 200, ROUND.maxTabSwitches + 1)).toMatchObject({ voided: "left_tab", points: 0, tabSwitches: 3 });
    for (const junk of [-5, 1.5, Number.NaN]) expect(scoreRound(round, allRight, 200, junk)).toMatchObject({ voided: null, tabSwitches: 0 });
  });

  it("an all-wrong round floors at zero, never negative", () => {
    const s = scoreRound(round, allWrong, 60);
    expect(s).toMatchObject({ correct: 0, wrong: 10, penalty: 3 * 4 + 5 * 7 + 2 * 10, points: 0 });
  });

  it("skipping costs nothing and breaks a streak; a wrong answer costs and breaks it too", () => {
    // right, right, skip, right, wrong, right, right, right, skip, skip
    const answers = { e1: 0, e2: 0, m1: 0, m2: 3, m3: 0, m4: 0, m5: 0 };
    const s = scoreRound(round, answers, ROUND.seconds);
    expect(s).toMatchObject({ correct: 6, wrong: 1, skipped: 3, base: 10 + 10 + 20 + 20 + 20 + 20, penalty: 7, streak: 3 * POINTS.streak });
    expect(s.points).toBe(100 - 7 + 15);
  });

  it("gives no speed bonus below seven correct, however fast", () => {
    const six = Object.fromEntries(round.slice(0, 6).map((x) => [x.id, 0]));
    const seven = Object.fromEntries(round.slice(0, 7).map((x) => [x.id, 0]));
    expect(scoreRound(round, six, 60).speed).toBe(0);
    expect(scoreRound(round, seven, 60).speed).toBeGreaterThan(0);
  });

  it("is void when submitted after the clock plus grace, and counts within the grace", () => {
    expect(scoreRound(round, allRight, ROUND.seconds + ROUND.graceSeconds).late).toBe(false);
    const late = scoreRound(round, allRight, ROUND.seconds + ROUND.graceSeconds + 1);
    expect(late).toMatchObject({ late: true, voided: "late", points: 0, speed: 0, correct: 10 });
    expect(scoreRound(round, allRight, Number.NaN)).toMatchObject({ late: true, points: 0 });
  });

  it("ignores answers for questions that were not issued, and anything that is not an option index", () => {
    const s = scoreRound(round, { nope: 0, e1: "0", e2: 9, e3: 1.5, m1: -1, m2: null, __proto__: 0, h1: 0 }, ROUND.seconds);
    expect(s).toMatchObject({ correct: 1, wrong: 0, skipped: 9, points: 30 });
    expect(s.marks.find((m) => m.id === "e1")).toEqual({ id: "e1", choice: null, correct: false });
  });

  it("counts a question once even if the round listed it twice", () => {
    expect(scoreRound([round[0], round[0], round[1]], allRight, ROUND.seconds)).toMatchObject({ correct: 2, base: 20 });
  });

  it("blind guessing never has a positive expected value at any difficulty", () => {
    for (const d of [1, 2, 3] as const) expect(POINTS.right[d] * 0.25 - POINTS.wrong[d] * 0.75).toBeLessThanOrEqual(0);
  });
});

describe("pickRound", () => {
  const bank = [1, 2, 3].flatMap((d) => Array.from({ length: 40 }, (_, i) => q(`d${d}-${i}`, d as Difficulty)));

  it("deals the fixed mix, easy first, with no question twice", () => {
    for (let run = 0; run < 200; run++) {
      const dealt = pickRound(bank);
      expect(dealt.map((x) => x.difficulty)).toEqual([1, 1, 1, 2, 2, 2, 2, 2, 3, 3]);
      expect(new Set(dealt.map((x) => x.id)).size).toBe(ROUND.count);
    }
  });

  it("is decided only by the random source, and does not reorder the bank it was given", () => {
    const before = bank.map((x) => x.id);
    const seq = (seed: number) => () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    expect(pickRound(bank, seq(7)).map((x) => x.id)).toEqual(pickRound(bank, seq(7)).map((x) => x.id));
    expect(bank.map((x) => x.id)).toEqual(before);
  });

  it("deals only questions the student has not seen, until a tier runs out", () => {
    const seen = new Set(bank.filter((x) => x.difficulty === 2).slice(0, 35).map((x) => x.id));
    for (let run = 0; run < 100; run++) {
      const dealt = pickRound(bank, Math.random, seen);
      expect(dealt.some((x) => seen.has(x.id)), "five unseen mediums are left, so none is repeated").toBe(false);
    }
    // Seen everything at one difficulty: that tier starts over rather than failing.
    const all = new Set(bank.map((x) => x.id));
    expect(pickRound(bank, Math.random, all).length).toBe(ROUND.count);
  });

  it("refuses a bank that cannot fill the mix", () => {
    expect(() => pickRound(bank.filter((x) => x.difficulty !== 3))).toThrow(/difficulty 3/);
  });
});

describe("weekStart", () => {
  it("is the Monday midnight in India that the moment falls in", () => {
    // Monday 5 Oct 2026 00:00 IST is Sunday 4 Oct 18:30 UTC.
    const monday = new Date("2026-10-04T18:30:00Z");
    expect(weekStart(new Date("2026-10-04T18:29:59Z"))).toEqual(new Date("2026-09-27T18:30:00Z")); // Sunday 23:59:59 IST
    expect(weekStart(monday)).toEqual(monday);
    expect(weekStart(new Date("2026-10-07T06:00:00Z"))).toEqual(monday);
    expect(weekStart(new Date("2026-10-11T18:29:00Z"))).toEqual(monday); // the next Sunday night
  });
});

describe("dayStart", () => {
  it("is midnight in India, which is 18:30 UTC the day before", () => {
    expect(dayStart(new Date("2026-10-04T18:29:59Z"))).toEqual(new Date("2026-10-03T18:30:00Z"));
    expect(dayStart(new Date("2026-10-04T18:30:00Z"))).toEqual(new Date("2026-10-04T18:30:00Z"));
    expect(dayStart(new Date("2026-10-05T03:00:00Z"))).toEqual(new Date("2026-10-04T18:30:00Z"));
  });
});

describe("displayName", () => {
  it("shows first name and last initial, or nothing identifying when hidden", () => {
    expect(displayName("Anaswer Ajay", false)).toBe("Anaswer A.");
    expect(displayName("  priya   k  nair ", false)).toBe("priya N.");
    expect(displayName("Mia", false)).toBe("Mia");
    expect(displayName("", false)).toBe("Student");
    expect(displayName("Anaswer Ajay", true)).toBe("Anonymous");
  });
});

describe("rankRows", () => {
  const at = (h: number) => new Date(Date.UTC(2026, 9, 3, h));
  it("orders by points, then who got there first, then id, the same way every time", () => {
    const rows = [
      { userId: "c", points: 100, rounds: 1, lastFinishedAt: at(5) },
      { userId: "a", points: 300, rounds: 4, lastFinishedAt: at(9) },
      { userId: "b", points: 100, rounds: 2, lastFinishedAt: at(3) },
      { userId: "e", points: 100, rounds: 2, lastFinishedAt: at(5) },
    ];
    const ranked = rankRows(rows);
    expect(ranked.map((r) => [r.userId, r.rank])).toEqual([["a", 1], ["b", 2], ["c", 3], ["e", 4]]);
    expect(rankRows([...rows].reverse()).map((r) => r.userId)).toEqual(ranked.map((r) => r.userId));
  });
});
