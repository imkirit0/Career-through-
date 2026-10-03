import { describe, expect, it } from "vitest";
import { ARENA_SUBJECTS } from "./arena";
import { loadBank } from "@/lib/arena-bank";
import { ROUND, pickRound } from "@/lib/arena";

describe("arena question banks", () => {
  it.each(ARENA_SUBJECTS.map((s) => s.id))("%s: every question can be asked and marked", async (subject) => {
    const { all, byId } = await loadBank(subject);
    expect(all.length).toBeGreaterThanOrEqual(1000);
    expect(byId.size, "ids are unique").toBe(all.length);
    for (const q of all) {
      expect([1, 2, 3], `${q.id} difficulty`).toContain(q.difficulty);
      expect(q.options.length, `${q.id} options`).toBe(4);
      expect(new Set(q.options).size, `${q.id} options are distinct`).toBe(4);
      expect(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4, `${q.id} answer`).toBe(true);
      expect(q.prompt.trim().length, `${q.id} prompt`).toBeGreaterThan(0);
      expect(q.explanation.trim().length, `${q.id} explanation`).toBeGreaterThan(0);
    }
    expect(pickRound(all).length).toBe(ROUND.count);
  });
});
