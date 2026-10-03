import "server-only"; // holds answer keys; they reach the browser only after an answer is given
import type { Question } from "./taxonomy";
import * as data from "./practice/data";
import * as frontend from "./practice/frontend";
import * as backend from "./practice/backend";
import * as qa from "./practice/qa";
import * as devops from "./practice/devops";
import * as shared from "./practice/shared";

/**
 * Practice-only questions. Kept apart from the scored pool in ./skills so that showing
 * answers here can never leak an assessment.
 */
export const PRACTICE_QUESTIONS: Question[] = [data, frontend, backend, qa, devops, shared].flatMap((g) => g.questions);

const byId = new Map(PRACTICE_QUESTIONS.map((q) => [q.id, q]));

export function getPracticeQuestion(id: string): Question | undefined {
  return byId.get(id);
}

export function practiceForSkill(skillId: string): Question[] {
  return PRACTICE_QUESTIONS.filter((q) => q.skillId === skillId);
}
