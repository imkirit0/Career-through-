import type { Challenge } from "./taxonomy";
import * as sql from "./challenges/sql";
import * as javascript from "./challenges/javascript";
import * as python from "./challenges/python";
import * as backend from "./challenges/backend";

/**
 * Code challenges, marked in the browser. The reference solution ships to the client on
 * purpose: expected results are computed from it there, and practice is never evidence.
 */
export const CHALLENGES: Challenge[] = [sql, javascript, python, backend].flatMap((g) => g.challenges);

const byId = new Map(CHALLENGES.map((c) => [c.id, c]));

export function getChallenge(id: string): Challenge | undefined {
  return byId.get(id);
}

export function challengesForSkill(skillId: string): Challenge[] {
  return CHALLENGES.filter((c) => c.skillId === skillId);
}
