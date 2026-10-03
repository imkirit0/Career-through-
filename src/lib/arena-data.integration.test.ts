import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { and, eq, isNull, sql } from "drizzle-orm";

// Runs only when a real Postgres is provided: TEST_DATABASE_URL=postgres://... npm test
const url = process.env.TEST_DATABASE_URL;
if (url) process.env.POSTGRES_URL = url;

describe.skipIf(!url)("arena rounds against Postgres", () => {
  const load = async () => {
    const { db, arenaRound, careerEvent, profile } = await import("@/db");
    const data = await import("./arena-data");
    const { loadBank } = await import("./arena-bank");
    const rules = await import("./arena");
    return { db, arenaRound, careerEvent, profile, loadBank, ...data, ...rules };
  };
  const newStudent = async (name: string, roleId: string, hidden = false) => {
    const { db, profile } = await load();
    const userId = randomUUID();
    await db.insert(profile).values({ userId, name, targetRoleId: roleId, leaderboardHidden: hidden });
    return userId;
  };
  const rightAnswers = async (subject: "python", ids: string[]) => {
    const { loadBank } = await load();
    const { byId } = await loadBank(subject);
    return Object.fromEntries(ids.map((id) => [id, byId.get(id)!.answer]));
  };

  it("deals a round once, resumes it, and joins concurrent starts into one round", async () => {
    const { db, arenaRound, startRound, getRound, ROUND } = await load();
    const user = await newStudent("Start Once", "role-start");
    const ids = await Promise.all(Array.from({ length: 6 }, () => startRound(user, "role-start", "python")));
    expect(new Set(ids.map((r) => r.id)).size).toBe(1);
    expect((await startRound(user, "role-start", "dbms")).id).toBe(ids[0].id);
    const open = await db.select().from(arenaRound).where(and(eq(arenaRound.userId, user), isNull(arenaRound.finishedAt)));
    expect(open.length).toBe(1);
    const round = (await getRound(user, ids[0].id))!;
    expect(round.questions.map((q) => q.difficulty)).toEqual([1, 1, 1, 2, 2, 2, 2, 2, 3, 3]);
    expect(round.secondsLeft).toBeGreaterThan(ROUND.seconds - 10);
  });

  it("the database itself refuses a second open round", async () => {
    const { db, arenaRound, startRound } = await load();
    const user = await newStudent("One Open", "role-open");
    await startRound(user, "role-open", "python");
    await expect(db.insert(arenaRound).values({ userId: user, roleId: "role-open", subject: "python", questionIds: [], scoringVersion: "x" })).rejects.toThrow();
  });

  it("scores a round exactly once, however many times and however it is submitted", async () => {
    const { db, arenaRound, careerEvent, startRound, getRound, finishRound, getBoard, scoreRound } = await load();
    const user = await newStudent("Finish Once", "role-finish");
    const { id } = await startRound(user, "role-finish", "python");
    const round = (await getRound(user, id))!;
    const answers = await rightAnswers("python", round.questions.map((q) => q.id));

    // Five submissions at once: one with the right answers, the rest trying to overwrite it.
    const results = await Promise.all([finishRound(user, id, answers), ...Array.from({ length: 4 }, () => finishRound(user, id, {}))]);
    const points = new Set(results.map((r) => r!.points));
    expect(points.size, "every caller is told the same stored result").toBe(1);

    const [row] = await db.select().from(arenaRound).where(eq(arenaRound.id, id));
    expect(row.finishedAt).not.toBeNull();
    expect([...points][0]).toBe(row.points);

    // A replay much later, with different answers, changes nothing.
    const replay = await finishRound(user, id, Object.fromEntries(Object.keys(answers).map((k) => [k, (answers[k] + 1) % 4])));
    expect(replay!.points).toBe(row.points);
    const [after] = await db.select().from(arenaRound).where(eq(arenaRound.id, id));
    expect(after).toEqual(row);

    const events = await db.select().from(careerEvent).where(and(eq(careerEvent.userId, user), eq(careerEvent.eventType, "ARENA_ROUND_FINISHED")));
    expect(events.length, "one result, one event").toBe(1);

    const board = await getBoard("role-finish", null, user);
    expect(board.you?.points ?? 0).toBe(row.points);
    expect(board.you?.rounds ?? (row.points ? 0 : 1)).toBe(1);

    // If the correct submission won the race, the stored points are what the rules give for a
    // round finished within a moment of starting (the speed bonus rounds 47.5 either way).
    if (row.correct === 10) {
      expect(row.points).toBeGreaterThanOrEqual(scoreRound(round.questions, answers, 1).points);
      expect(row.points).toBeLessThanOrEqual(scoreRound(round.questions, answers, 0).points);
    }
  });

  it("marks a full-marks round as the rules say, using the server's clock", async () => {
    const { db, arenaRound, startRound, getRound, finishRound } = await load();
    const user = await newStudent("Full Marks", "role-full");
    const { id } = await startRound(user, "role-full", "python");
    const round = (await getRound(user, id))!;
    // Pretend two and a half minutes have passed.
    await db.update(arenaRound).set({ startedAt: sql`now() - interval '150 seconds'` }).where(eq(arenaRound.id, id));
    const done = (await finishRound(user, id, await rightAnswers("python", round.questions.map((q) => q.id))))!;
    expect(done.correct).toBe(10);
    expect(done.score).toMatchObject({ base: 190, penalty: 0, streak: 45, late: false });
    expect(done.score!.speed).toBeGreaterThanOrEqual(23);
    expect(done.score!.speed).toBeLessThanOrEqual(24);
    expect(done.points).toBe(190 + 45 + done.score!.speed);
  });

  it("gives nothing for a round submitted after the clock, and nothing to someone else's round", async () => {
    const { db, arenaRound, startRound, getRound, finishRound, getOpenRound } = await load();
    const user = await newStudent("Too Late", "role-late");
    const stranger = await newStudent("Stranger", "role-late");
    const { id } = await startRound(user, "role-late", "python");
    const round = (await getRound(user, id))!;
    const answers = await rightAnswers("python", round.questions.map((q) => q.id));

    expect(await finishRound(stranger, id, answers)).toBeNull();
    expect(await getRound(stranger, id)).toBeNull();

    await db.update(arenaRound).set({ startedAt: sql`now() - interval '311 seconds'` }).where(eq(arenaRound.id, id));
    expect(await getOpenRound(user)).toBeNull();
    const late = (await finishRound(user, id, answers))!;
    expect(late).toMatchObject({ points: 0, correct: 10 });
    expect(late.score).toMatchObject({ late: true });
  });

  it("closes an abandoned round at zero when the student starts again", async () => {
    const { db, arenaRound, startRound } = await load();
    const user = await newStudent("Abandoned", "role-abandon");
    const first = await startRound(user, "role-abandon", "python");
    await db.update(arenaRound).set({ startedAt: sql`now() - interval '1 hour'` }).where(eq(arenaRound.id, first.id));
    const second = await startRound(user, "role-abandon", "dbms");
    expect(second.id).not.toBe(first.id);
    const [old] = await db.select().from(arenaRound).where(eq(arenaRound.id, first.id));
    expect(old.finishedAt).not.toBeNull();
    expect(old.points).toBe(0);
  });

  it("builds a role's board from the stored rounds: order, ranks, names and the weekly cut", async () => {
    const { db, arenaRound, getBoard, weekStart } = await load();
    const role = `role-board-${randomUUID()}`;
    const ann = await newStudent("Ann Lee", role);
    const bo = await newStudent("Bo Okoro", role, true);
    const cy = await newStudent("Cy", role);
    const zero = await newStudent("Zed Zero", role);
    const outsider = await newStudent("Other Role", `${role}-x`);
    const now = Date.now();
    const lastWeek = new Date(weekStart().getTime() - 3_600_000);
    const row = (userId: string, roleId: string, points: number, finishedAt: Date) => ({ userId, roleId, subject: "python", questionIds: [], scoringVersion: "arena-v1", points, finishedAt });
    await db.insert(arenaRound).values([
      row(ann, role, 120, new Date(now - 5000)),
      row(ann, role, 80, new Date(now - 4000)),
      row(bo, role, 200, new Date(now - 3000)), // ties Ann on points, but Ann got there first
      row(cy, role, 150, new Date(now - 2000)),
      row(cy, role, 500, lastWeek),
      row(zero, role, 0, new Date(now - 1000)),
      row(outsider, `${role}-x`, 999, new Date(now)),
    ]);

    const week = await getBoard(role, weekStart(), cy);
    expect(week.top.map((e) => [e.rank, e.name, e.points, e.rounds, e.you])).toEqual([
      [1, "Ann L.", 200, 2, false],
      [2, "Anonymous", 200, 1, false],
      [3, "Cy", 150, 1, true],
    ]);
    expect(week.players).toBe(3);
    expect(week.you).toMatchObject({ rank: 3, points: 150 });

    const allTime = await getBoard(role, null, zero);
    expect(allTime.top.map((e) => [e.name, e.points])).toEqual([["Cy", 650], ["Ann L.", 200], ["Anonymous", 200]]);
    expect(allTime.you, "a student with no points is not ranked").toBeNull();
  });
});
