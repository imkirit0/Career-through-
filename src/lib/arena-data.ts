import "server-only";
import { and, count, desc, eq, gt, gte, isNotNull, isNull, max, sql, sum } from "drizzle-orm";
import { arenaRound, db, profile } from "@/db";
import type { ArenaSubjectId } from "@/content/arena";
import { ROUND, SCORING_VERSION, displayName, pickRound, rankRows, scoreRound, type ArenaQuestion, type RoundScore } from "./arena";
import { loadBank } from "./arena-bank";
import { logEvent } from "./events";

// Everything that reads or writes a round. Time is always the database's clock, and a
// round's result is written exactly once: see finishRound.

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

  const { all } = await loadBank(subject);
  const questionIds = pickRound(all, rand).map((q) => q.id);
  try {
    const [row] = await db.insert(arenaRound).values({ userId, roleId, subject, questionIds, scoringVersion: SCORING_VERSION }).returning({ id: arenaRound.id });
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
      elapsed,
    })
    .from(arenaRound)
    .where(and(eq(arenaRound.id, roundId), eq(arenaRound.userId, userId)))
    .limit(1);
  if (!row) return null;
  const { byId } = await loadBank(row.subject as ArenaSubjectId);
  const questions = row.questionIds.map((id) => byId.get(id)).filter((q): q is ArenaQuestion => q !== undefined);
  return { ...row, questions, secondsLeft: Math.max(Math.ceil(ROUND.seconds - row.elapsed), 0), expired: expired(row.elapsed) };
}

export type FinishedRound = { id: string; subject: string; points: number; correct: number; score: Omit<RoundScore, "marks"> | null; answers: Record<string, number>; questions: ArenaQuestion[] };

/**
 * Mark a round and store its result, once. The answers come from the browser and are not
 * trusted: marking uses the questions the server issued and the database's clock. If the
 * round was already finished (a double click, a second tab, a replayed request) nothing is
 * written and the stored result is returned unchanged.
 */
export async function finishRound(userId: string, roundId: string, answers: Record<string, unknown>): Promise<FinishedRound | null> {
  const round = await getRound(userId, roundId);
  if (!round) return null;
  const stored = (r: NonNullable<typeof round>): FinishedRound => ({ id: r.id, subject: r.subject, points: r.points, correct: r.correct, score: r.score, answers: r.answers ?? {}, questions: r.questions });
  if (round.finishedAt) return stored(round);

  const { marks, ...score } = scoreRound(round.questions, answers, round.elapsed);
  const kept = Object.fromEntries(marks.filter((m) => m.choice !== null).map((m) => [m.id, m.choice as number]));

  const written = await db.transaction(async (tx) => {
    const [row] = await tx
      .update(arenaRound)
      .set({ finishedAt: sql`now()`, answers: kept, correct: score.correct, points: score.points, score })
      // The guard that makes this once-only: a finished round matches no row.
      .where(and(eq(arenaRound.id, roundId), eq(arenaRound.userId, userId), isNull(arenaRound.finishedAt)))
      .returning({ id: arenaRound.id });
    if (row) await logEvent(userId, "ARENA_ROUND_FINISHED", { roundId, subject: round.subject, points: score.points, correct: score.correct, total: round.questions.length }, tx);
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
    .where(and(eq(arenaRound.roleId, roleId), isNotNull(arenaRound.finishedAt), since ? gte(arenaRound.finishedAt, since) : undefined))
    .groupBy(arenaRound.userId, profile.name, profile.leaderboardHidden)
    .having(gt(points, 0))
    .orderBy(desc(points));

  const ranked = rankRows(rows.map((r) => ({ ...r, lastFinishedAt: r.lastFinishedAt ?? new Date(0) })));
  const entry = (r: (typeof ranked)[number]): BoardEntry => ({ rank: r.rank, name: displayName(r.name, r.hidden), points: r.points, rounds: r.rounds, you: r.userId === viewerId });
  const me = ranked.find((r) => r.userId === viewerId);
  return { top: ranked.slice(0, BOARD_SIZE).map(entry), you: me ? entry(me) : null, players: ranked.length };
}
