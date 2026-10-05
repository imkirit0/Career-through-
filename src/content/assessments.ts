import "server-only"; // this module holds answer keys
import type { AssessmentDef, Question } from "./taxonomy";
import { GROUPS, getSkill } from "./skills";
import { getRole } from "./roles";
import * as moreData from "./skills/more/data";
import * as moreFrontend from "./skills/more/frontend";
import * as moreBackend from "./skills/more/backend";
import * as moreQa from "./skills/more/qa";
import * as moreDevops from "./skills/more/devops";
import * as moreShared from "./skills/more/shared";

// The second half of each skill's pool (q9 to q16) lives in ./skills/more, one file per group.
export const QUESTIONS: Question[] = [...GROUPS, moreData, moreFrontend, moreBackend, moreQa, moreDevops, moreShared].flatMap((g) => g.questions);

const byId = new Map(QUESTIONS.map((q) => [q.id, q]));

export function getQuestion(id: string): Question | undefined {
  return byId.get(id);
}

export function questionsForSkill(skillId: string): Question[] {
  return QUESTIONS.filter((q) => q.skillId === skillId);
}

const MIN_PER_QUESTION = 1.25;

/**
 * Baseline questions per skill, by how much the role depends on it. A level from three
 * questions is rough; six halves the guesswork where it matters most, without making a
 * new student sit a two-hour paper.
 */
export const BASELINE_QUESTIONS = { critical: 6, important: 4, nice: 3 } as const;
const SKILL_TEST_QUESTIONS = 6;
const FINAL_QUESTIONS = 4;

/**
 * Assessment ids are derived, not stored:
 *   baseline:<roleId>  — 6, 4 or 3 questions per role skill, by priority
 *   skill:<skillId>    — 6 questions on one skill
 *   final:<roleId>     — 4 questions per role skill
 */
export function getAssessment(id: string): AssessmentDef | null {
  const [kind, ref] = id.split(":");
  if (!ref) return null;
  try {
    if (kind === "baseline" || kind === "final") {
      const role = getRole(ref);
      const questionsBySkill = Object.fromEntries(role.skills.map((s) => [s.skillId, kind === "baseline" ? BASELINE_QUESTIONS[s.priority] : FINAL_QUESTIONS]));
      const total = Object.values(questionsBySkill).reduce((n, q) => n + q, 0);
      return {
        id,
        kind,
        title: `${role.title} ${kind === "baseline" ? "baseline" : "final verification"}`,
        roleId: role.id,
        skillIds: role.skills.map((s) => s.skillId),
        questionsBySkill,
        durationMin: Math.ceil(total * MIN_PER_QUESTION),
      };
    }
    if (kind === "skill") {
      const skill = getSkill(ref);
      return {
        id,
        kind,
        title: `${skill.name} assessment`,
        roleId: null,
        skillIds: [skill.id],
        questionsBySkill: { [skill.id]: SKILL_TEST_QUESTIONS },
        durationMin: 10,
      };
    }
  } catch {
    return null;
  }
  return null;
}
