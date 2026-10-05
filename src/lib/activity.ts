import { arenaSubjectName } from "@/content/arena";
import { getAssessment } from "@/content/assessments";
import { getChallenge } from "@/content/challenges";
import { getJob } from "@/content/jobs";
import { skillName } from "@/content/skills";

export type ActivityEvent = { eventType: string; metadata: Record<string, unknown>; createdAt: Date };
export type ActivityKind = "assessment" | "practice" | "code" | "arena" | "interview" | "plan" | "project" | "job" | "card" | "profile";
export type ActivityItem = { kind: ActivityKind; title: string; detail: string; at: Date; href: string };

// ponytail: days are counted in India time, where the students are. Make it per-user if that changes.
const TIME_ZONE = "Asia/Kolkata";
const dayKey = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(d);
const DAY = 86_400_000;

/** The hour of the day (0-23) where the students are, for the greeting. */
export const localHour = (now = new Date()) => Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: TIME_ZONE }).format(now)) % 24;

/**
 * Consecutive days with any recorded activity, ending today. A streak survives until the end
 * of the next day, so it does not read as broken first thing in the morning.
 */
export function streakDays(dates: Date[], now = new Date()): number {
  const active = new Set(dates.map(dayKey));
  let from = active.has(dayKey(now)) ? 0 : active.has(dayKey(new Date(now.getTime() - DAY))) ? 1 : -1;
  if (from < 0) return 0;
  let n = 0;
  while (active.has(dayKey(new Date(now.getTime() - from * DAY)))) {
    n++;
    from++;
  }
  return n;
}

/**
 * The things a student did, newest first, in words. Bookkeeping events (an assessment being
 * started, readiness being recomputed) are left out: they are not something the student did.
 */
export function describeActivity(events: ActivityEvent[], attempts: { id: string; assessmentId: string }[]): ActivityItem[] {
  const assessmentOf = new Map(attempts.map((a) => [a.id, a.assessmentId]));
  const items: ActivityItem[] = [];
  for (const e of events) {
    const m = e.metadata;
    const str = (k: string) => (typeof m[k] === "string" ? (m[k] as string) : "");
    const num = (k: string) => (typeof m[k] === "number" ? (m[k] as number) : null);
    const add = (kind: ActivityKind, title: string, detail: string, href: string) => items.push({ kind, title, detail, at: e.createdAt, href });

    switch (e.eventType) {
      case "BASELINE_COMPLETED":
      case "SKILL_ASSESSMENT_COMPLETED":
      case "FINAL_ASSESSMENT_COMPLETED": {
        const assessmentId = assessmentOf.get(str("attemptId"));
        const title = assessmentId ? getAssessment(assessmentId)?.title : undefined;
        add(
          "assessment",
          `Completed ${title ?? "an assessment"}`,
          num("pct") !== null ? `Score: ${num("pct")}%` : "Assessment",
          assessmentId ? `/assessment/${encodeURIComponent(assessmentId)}/result?a=${str("attemptId")}` : "/assessments",
        );
        break;
      }
      case "SKILL_PRACTISED":
        add("practice", `${str("mode") === "mock" ? "Mock test" : "Quick drill"}: ${skillName(str("skillId"))}`, `${num("correct") ?? 0} of ${num("total") ?? 0} correct`, `/practice?skill=${str("skillId")}`);
        break;
      case "CODE_CHALLENGE_PASSED":
        add("code", `Solved ${getChallenge(str("challengeId"))?.title ?? "a code challenge"}`, `${skillName(str("skillId"))} code challenge`, `/practice/code?skill=${str("skillId")}`);
        break;
      case "ARENA_ROUND_FINISHED":
        add("arena", `Arena round: ${arenaSubjectName(str("subject"))}`, `${num("points") ?? 0} points · ${num("correct") ?? 0} of ${num("total") ?? 0} correct`, `/arena/round/${str("roundId")}`);
        break;
      case "INTERVIEW_PRACTISED":
        add("interview", "Practised interview questions", num("words") !== null ? `${num("words")} words written` : "Spoken rehearsal", "/practice/interview");
        break;
      case "PLAN_DAY_COMPLETED":
        add("plan", `Finished day ${(num("day") ?? 0) + 1} of the ${skillName(str("skillId"))} plan`, "Study plan", `/plan/${str("skillId")}`);
        break;
      case "PROJECT_SUBMITTED":
        add("project", "Submitted your project", "Project evidence", "/plan?view=project");
        break;
      case "JOB_UNLOCKED": {
        const job = getJob(str("jobId"));
        add("job", `Unlocked ${job?.title ?? "an opportunity"}`, job?.company ?? "Opportunity", "/jobs");
        break;
      }
      case "CAREER_CARD_CREATED":
        add("card", "Career Card issued", "Final verification passed", "/card");
        break;
      case "PROFILE_CONFIRMED":
        add("profile", "Confirmed your profile", `${num("claimedSkills") ?? 0} skills claimed`, "/profile");
        break;
    }
  }
  return items;
}
