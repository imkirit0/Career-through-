import "server-only";
import { and, count, desc, eq, gt, gte, isNotNull, isNull, max, notLike, sql, sum } from "drizzle-orm";
import { arenaRound, db, profile } from "@/db";
import { ARENA_SUBJECTS, type ArenaSubjectId } from "@/content/arena";
import { PRACTICE_SUFFIX, ROUND, SCORING_VERSION, dayStart, displayName, pickRound, rankRows, scoreRound, type ArenaQuestion, type RoundScore } from "./arena";
import { loadBank } from "./arena-bank";
import { logEvent } from "./events";

// Everything that reads or writes a round. Time is always the database's clock, and a
// round's result is written exactly once: see finishRound.

/** How many of a student's past rounds in a subject are checked so they are not dealt the same question again. */
const SEEN_ROUNDS = 400;

/** Seconds since the round started, by the database clock. */
const elapsed = sql<number>`extract(epoch from (now() - ${arenaRound.startedAt}))`.mapWith(Number);
const expired = (seconds: number) => seconds > ROUND.seconds + ROUND.graceSeconds;
const isUniqueViolation = (e: unknown) => typeof e === "object" && e !== null && ((e as { code?: string }).code === "23505" || (e as { cause?: { code?: string } }).cause?.code === "23505");

async function openRound(userId: string) {
  const [open] = await db
    .select({ id: arenaRound.id, elapsed })
    .from(arenaRound)
    .where(and(eq(arenaRound.userId, userId), isNull(arenaRound.finishedAt)))
    .limit(1);
  return open;
}

/** The student's round in progress, if it still has time on the clock. */
export async function getOpenRound(userId: string) {
  const open = await openRound(userId);
  return open && !expired(open.elapsed) ? { id: open.id, secondsLeft: Math.max(Math.ceil(ROUND.seconds - open.elapsed), 0) } : null;
}

/**
 * Start a round, or hand back the one already in progress: a student has one open round at
 * a time (the database enforces it). An open round whose clock has run out is closed at zero first.
 */
export async function startRound(userId: string, roleId: string, subject: ArenaSubjectId, rand?: () => number): Promise<{ id: string }> {
  const open = await openRound(userId);
  if (open && !expired(open.elapsed)) return { id: open.id };
  if (open) await finishRound(userId, open.id, {});

  // Every round dealt today counts against the day's ranked rounds, finished or not.
  const earlier = await db
    .select({ questionIds: arenaRound.questionIds, startedAt: arenaRound.startedAt })
    .from(arenaRound)
    .where(and(eq(arenaRound.userId, userId), eq(arenaRound.subject, subject)))
    .orderBy(desc(arenaRound.startedAt))
    .limit(SEEN_ROUNDS);
  const today = dayStart().getTime();
  const ranked = earlier.filter((r) => r.startedAt.getTime() >= today).length < ROUND.rankedPerSubjectPerDay;
  const scoringVersion = ranked ? SCORING_VERSION : SCORING_VERSION + PRACTICE_SUFFIX;

  const { all } = await loadBank(subject);
  const questionIds = pickRound(all, rand, new Set(earlier.flatMap((r) => r.questionIds))).map((q) => q.id);
  try {
    const [row] = await db.insert(arenaRound).values({ userId, roleId, subject, questionIds, scoringVersion }).returning({ id: arenaRound.id });
    return row;
  } catch (e) {
    // Two starts at once (two tabs): the unique index let one in. Join that round.
    if (!isUniqueViolation(e)) throw e;
    const other = await openRound(userId);
    if (!other) throw e;
    return { id: other.id };
  }
}

export type PlayableRound = { id: string; subject: string; finished: boolean; secondsLeft: number; questions: ArenaQuestion[] };

/** A round with its questions, for its owner only. Questions removed from the bank since are dropped. */
export async function getRound(userId: string, roundId: string) {
  const [row] = await db
    .select({
      id: arenaRound.id,
      subject: arenaRound.subject,
      roleId: arenaRound.roleId,
      questionIds: arenaRound.questionIds,
      finishedAt: arenaRound.finishedAt,
      answers: arenaRound.answers,
      points: arenaRound.points,
      correct: arenaRound.correct,
      score: arenaRound.score,
      scoringVersion: arenaRound.scoringVersion,
      elapsed,
    })
    .from(arenaRound)
    .where(and(eq(arenaRound.id, roundId), eq(arenaRound.userId, userId)))
    .limit(1);
  if (!row) return null;
  const { byId } = await loadBank(row.subject as ArenaSubjectId);
  const questions = row.questionIds.map((id) => byId.get(id)).filter((q): q is ArenaQuestion => q !== undefined);
  return { ...row, questions, practice: row.scoringVersion.endsWith(PRACTICE_SUFFIX), secondsLeft: Math.max(Math.ceil(ROUND.seconds - row.elapsed), 0), expired: expired(row.elapsed) };
}

export type FinishedRound = { id: string; subject: string; points: number; correct: number; score: Omit<RoundScore, "marks"> | null; answers: Record<string, number>; questions: ArenaQuestion[] };

/**
 * Mark a round and store its result, once. The answers come from the browser and are not
 * trusted: marking uses the questions the server issued and the database's clock. If the
 * round was already finished (a double click, a second tab, a replayed request) nothing is
 * written and the stored result is returned unchanged.
 */
export async function finishRound(userId: string, roundId: string, answers: Record<string, unknown>, tabSwitches = 0): Promise<FinishedRound | null> {
  const round = await getRound(userId, roundId);
  if (!round) return null;
  const stored = (r: NonNullable<typeof round>): FinishedRound => ({ id: r.id, subject: r.subject, points: r.points, correct: r.correct, score: r.score, answers: r.answers ?? {}, questions: r.questions });
  if (round.finishedAt) return stored(round);

  const { marks, ...scored } = scoreRound(round.questions, answers, round.elapsed, tabSwitches);
  // A practice round is marked the same way; it just puts nothing on the board.
  const score = round.practice ? { ...scored, practice: true, points: 0 } : scored;
  const kept = Object.fromEntries(marks.filter((m) => m.choice !== null).map((m) => [m.id, m.choice as number]));

  const written = await db.transaction(async (tx) => {
    const [row] = await tx
      .update(arenaRound)
      .set({ finishedAt: sql`now()`, answers: kept, correct: score.correct, points: score.points, score })
      // The guard that makes this once-only: a finished round matches no row.
      .where(and(eq(arenaRound.id, roundId), eq(arenaRound.userId, userId), isNull(arenaRound.finishedAt)))
      .returning({ id: arenaRound.id });
    if (row) await logEvent(userId, "ARENA_ROUND_FINISHED", { roundId, subject: round.subject, points: score.points, correct: score.correct, total: round.questions.length, practice: round.practice }, tx);
    return Boolean(row);
  });

  if (written) return { id: round.id, subject: round.subject, points: score.points, correct: score.correct, score, answers: kept, questions: round.questions };
  // Lost the race to another submission of the same round: report what that one stored.
  const again = await getRound(userId, roundId);
  return again ? stored(again) : null;
}

export type BoardEntry = { rank: number; name: string; points: number; rounds: number; you: boolean };
export type Board = { top: BoardEntry[]; you: BoardEntry | null; players: number };

/** How many places a board shows before "you" is appended on its own line. */
export const BOARD_SIZE = 20;

/**
 * A role's leaderboard since `since` (null for all time). Every total is a SUM over stored
 * round rows, so the board cannot drift from the rounds behind it.
 * ponytail: ranks every scoring player of the role on each read; keep running totals in a
 * table if a role ever has more players than that is comfortable for.
 */
export async function getBoard(roleId: string, since: Date | null, viewerId: string): Promise<Board> {
  const points = sum(arenaRound.points).mapWith(Number);
  const rows = await db
    .select({ userId: arenaRound.userId, points, rounds: count(), lastFinishedAt: max(arenaRound.finishedAt), name: profile.name, hidden: profile.leaderboardHidden })
    .from(arenaRound)
    .innerJoin(profile, eq(profile.userId, arenaRound.userId))
    .where(and(eq(arenaRound.roleId, roleId), isNotNull(arenaRound.finishedAt), notLike(arenaRound.scoringVersion, `%${PRACTICE_SUFFIX}`), since ? gte(arenaRound.finishedAt, since) : undefined))
    .groupBy(arenaRound.userId, profile.name, profile.leaderboardHidden)
    .having(gt(points, 0))
    .orderBy(desc(points));

  const ranked = rankRows(rows.map((r) => ({ ...r, lastFinishedAt: r.lastFinishedAt ?? new Date(0) })));
  const entry = (r: (typeof ranked)[number]): BoardEntry => ({ rank: r.rank, name: displayName(r.name, r.hidden), points: r.points, rounds: r.rounds, you: r.userId === viewerId });
  const me = ranked.find((r) => r.userId === viewerId);
  return { top: ranked.slice(0, BOARD_SIZE).map(entry), you: me ? entry(me) : null, players: ranked.length };
}

/** Ranked rounds each subject still has for the student today (India time). */
export async function getRankedLeft(userId: string): Promise<Record<ArenaSubjectId, number>> {
  const rows = await db
    .select({ subject: arenaRound.subject, dealt: count() })
    .from(arenaRound)
    .where(and(eq(arenaRound.userId, userId), gte(arenaRound.startedAt, dayStart())))
    .groupBy(arenaRound.subject);
  const dealt = new Map(rows.map((r) => [r.subject, r.dealt]));
  return Object.fromEntries(ARENA_SUBJECTS.map((s) => [s.id, Math.max(ROUND.rankedPerSubjectPerDay - (dealt.get(s.id) ?? 0), 0)])) as Record<ArenaSubjectId, number>;
}
