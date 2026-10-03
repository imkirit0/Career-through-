import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSkill } from "@/content/skills";
import { practiceForSkill } from "@/content/practice";
import { getCandidateState, requireCandidate } from "@/lib/data";
import { PRACTICE_MODES, pickPractice } from "@/lib/practice";
import { PracticeRun } from "./run";

export const metadata: Metadata = { title: "Practice" };

export default async function PracticeRunPage({ params, searchParams }: { params: Promise<{ mode: string }>; searchParams: Promise<{ skill?: string; run?: string }> }) {
  const { mode } = await params;
  const { skill: skillId, run } = await searchParams;
  if (mode !== "drill" && mode !== "mock") notFound();
  const { user, profile, role } = await requireCandidate();
  if (!skillId || !role.skills.some((s) => s.skillId === skillId)) redirect("/practice");

  const skill = getSkill(skillId);
  const { completed } = await getCandidateState(user.id, profile, role);
  // Lead with the topics the latest assessment showed as shaky.
  const topics = completed.find((a) => a.score?.bySkill[skillId])?.score?.bySkill[skillId]?.topics ?? {};
  const weak = Object.entries(topics).filter(([, t]) => t.correct < t.total).map(([id]) => id);
  const topicName = new Map(skill.topics.map((t) => [t.id, t.name]));
  const questions = pickPractice(practiceForSkill(skillId), PRACTICE_MODES[mode].count, weak);
  if (!questions.length) redirect("/practice");

  return (
    <div className="mx-auto max-w-2xl">
      <PracticeRun
        // A new `run` in the URL is a fresh attempt with a fresh set of questions.
        key={run ?? "first"}
        mode={mode}
        skillId={skillId}
        skillName={skill.name}
        // Answer keys stay on the server until the student has answered.
        questions={questions.map((q) => ({ id: q.id, topic: topicName.get(q.topicId) ?? "", prompt: q.prompt, options: q.options }))}
      />
    </div>
  );
}
