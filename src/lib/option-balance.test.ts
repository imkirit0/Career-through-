import { describe, expect, it } from "vitest";
import { QUESTIONS } from "@/content/assessments";
import { SKILLS } from "@/content/skills";

// A student who has learned that "the longest option is usually right" must gain nothing
// from it. With four options of similar length the correct one is the longest about one
// time in four; these limits allow some slack but fail if length starts to give answers away.

/** Skills to check; GROUP narrows it to one content file's skills when rebalancing. */
const only = process.env.SKILLS?.split(",");
const skills = SKILLS.filter((s) => !only || only.includes(s.id));

const MAX_LONGEST = 6; // of a skill's 16 questions
const STANDS_OUT = 1.3; // correct option this many times the longest wrong one

describe("answer options do not give the answer away by length", () => {
  it.each(skills.map((s) => s.id))("%s", (skillId) => {
    const qs = QUESTIONS.filter((q) => q.skillId === skillId);
    const len = (q: (typeof qs)[number]) => q.options.map((o) => o.length);
    const wrongMax = (q: (typeof qs)[number]) => Math.max(...len(q).filter((_, i) => i !== q.answer));
    const wrongMin = (q: (typeof qs)[number]) => Math.min(...len(q).filter((_, i) => i !== q.answer));

    const longest = qs.filter((q) => len(q)[q.answer] > wrongMax(q)).map((q) => q.id);
    const shortest = qs.filter((q) => len(q)[q.answer] < wrongMin(q)).map((q) => q.id);
    const standsOut = qs.filter((q) => len(q)[q.answer] >= 25 && len(q)[q.answer] >= STANDS_OUT * wrongMax(q)).map((q) => q.id);

    expect(standsOut, "the correct option is much longer than every wrong one").toEqual([]);
    expect(longest.length, `correct option is the longest in: ${longest.join(", ")}`).toBeLessThanOrEqual(MAX_LONGEST);
    expect(shortest.length, `correct option is the shortest in: ${shortest.join(", ")}`).toBeLessThanOrEqual(MAX_LONGEST);
  });
});
