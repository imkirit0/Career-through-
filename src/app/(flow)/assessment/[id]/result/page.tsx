import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { attempt, db } from "@/db";
import { getAssessment } from "@/content/assessments";
import { getSkill, skillName } from "@/content/skills";
import { getJob } from "@/content/jobs";
import { liveReadiness, requireCandidate } from "@/lib/data";
import { interviewResponse } from "@/db";
import { interviewScoringAvailable } from "@/lib/interview/provider";
import { getPrompt } from "@/content/interview";
import { ResultView, type ResultLine } from "./result-view";

export const metadata: Metadata = { title: "Assessment result" };

export default async function ResultPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ a?: string }> }) {
  const id = decodeURIComponent((await params).id);
  const attemptId = (await searchParams).a;
  const { user, role } = await requireCandidate();
  if (!attemptId || !/^[0-9a-f-]{36}$/i.test(attemptId)) notFound();

  const [a] = await db.select().from(attempt).where(and(eq(attempt.id, attemptId), eq(attempt.userId, user.id), eq(attempt.assessmentId, id))).limit(1);
  const def = getAssessment(id);
  if (!a?.completedAt || !a.score || !a.impact || !def) notFound();
  const { score, impact } = a;
  // The recommendation is "what to do now", so it comes from live state, not the stored snapshot.
  const { readiness } = await liveReadiness(user.id, role);
  const nba = readiness.nextActions[0];
  const interview = await db.select().from(interviewResponse).where(eq(interviewResponse.attemptId, a.id)).orderBy(interviewResponse.createdAt);
  // Skills where the paper scored above the cap but practical evidence is still missing.
  const capped = readiness.perSkill.filter((p) => p.cappedFrom !== null && Object.keys(score.bySkill).includes(p.skillId));
  const roleSkill = new Map(role.skills.map((s) => [s.skillId, s]));
  const single = def.kind === "skill";
  // A drill leads with the topics this attempt got wrong, so it is the natural step after a miss.
  const practiseSkill = impact.remainingGaps.length
    ? nba?.skillId && impact.remainingGaps.includes(nba.skillId) ? nba.skillId : impact.remainingGaps[0]
    : null;

  const lines: ResultLine[] = single
    ? getSkill(def.skillIds[0]).topics.flatMap((t) => {
        const s = score.bySkill[def.skillIds[0]]?.topics[t.id];
        return s ? [{ id: t.id, name: t.name, pct: s.pct, correct: s.correct, total: s.total }] : [];
      })
    : Object.entries(score.bySkill).map(([skillId, s]) => ({
        id: skillId,
        name: skillName(skillId),
        pct: s.pct,
        correct: s.correct,
        total: s.total,
        target: roleSkill.get(skillId)?.target ?? 0,
        href: `/plan/${skillId}`,
      }));

  return (
    <ResultView
      title={def.title}
      kind={def.kind}
      verified={a.verified}
      score={score}
      impact={impact}
      lines={lines}
      topics={single}
      capped={capped.map((p) => ({ name: p.name, cappedFrom: p.cappedFrom!, level: p.level }))}
      interview={interview.map((r) => ({
        id: r.id,
        prompt: getPrompt(r.promptId)?.prompt ?? r.promptId,
        skipped: r.status === "skipped",
        words: r.words,
        score: r.score,
        pending: r.status === "pending",
        summary: r.feedback?.summary,
      }))}
      interviewScored={interviewScoringAvailable()}
      next={nba}
      practise={practiseSkill ? { skillId: practiseSkill, name: skillName(practiseSkill) } : null}
      unlocked={impact.unlockedJobIds.flatMap((jid) => {
        const job = getJob(jid);
        return job ? [{ title: job.title, company: job.company }] : [];
      })}
      finalPassed={
        def.kind === "final"
          ? !(impact.remainingGaps.some((id) => roleSkill.get(id)?.priority === "critical") || impact.scoreAfter < role.readyThreshold)
          : null
      }
    />
  );
}
