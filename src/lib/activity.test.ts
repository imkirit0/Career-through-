import { describe, expect, it } from "vitest";
import { describeActivity, streakDays } from "./activity";

// 15:00 India time on 3 Oct 2026.
const NOW = new Date("2026-10-03T09:30:00Z");
const daysAgo = (n: number, hourUtc = 9) => new Date(Date.UTC(2026, 9, 3 - n, hourUtc));

describe("streakDays", () => {
  it("counts consecutive days ending today", () => {
    expect(streakDays([daysAgo(0), daysAgo(1), daysAgo(1, 3), daysAgo(2)], NOW)).toBe(3);
  });
  it("is still alive when the last activity was yesterday, and stops at a gap", () => {
    expect(streakDays([daysAgo(1), daysAgo(2), daysAgo(4)], NOW)).toBe(2);
  });
  it("is zero when nothing happened today or yesterday", () => {
    expect(streakDays([daysAgo(2), daysAgo(3)], NOW)).toBe(0);
    expect(streakDays([], NOW)).toBe(0);
  });
  it("buckets by the day in India, not in UTC", () => {
    // 20:00 UTC on 2 Oct is already 01:30 on 3 Oct in India: that is today, not yesterday.
    expect(streakDays([new Date("2026-10-02T20:00:00Z")], NOW)).toBe(1);
  });
});

describe("describeActivity", () => {
  it("names what the student did and drops bookkeeping events", () => {
    const at = NOW;
    const items = describeActivity(
      [
        { eventType: "READINESS_UPDATED", metadata: {}, createdAt: at },
        { eventType: "BASELINE_STARTED", metadata: {}, createdAt: at },
        { eventType: "SKILL_PRACTISED", metadata: { skillId: "sql", mode: "drill", correct: 4, total: 5 }, createdAt: at },
        { eventType: "PLAN_DAY_COMPLETED", metadata: { skillId: "sql", day: 0 }, createdAt: at },
        { eventType: "SKILL_ASSESSMENT_COMPLETED", metadata: { attemptId: "a1", pct: 65 }, createdAt: at },
      ],
      [{ id: "a1", assessmentId: "skill:sql" }],
    );
    expect(items.map((i) => [i.kind, i.title, i.detail])).toEqual([
      ["practice", "Quick drill: SQL", "4 of 5 correct"],
      ["plan", "Finished day 1 of the SQL plan", "Study plan"],
      ["assessment", expect.stringMatching(/^Completed .*SQL/), "Score: 65%"],
    ]);
    expect(items[2].href).toBe("/assessment/skill%3Asql/result?a=a1");
  });
});
