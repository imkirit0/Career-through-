import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/bits";
import { getCandidateState, requireCandidate } from "@/lib/data";
import { PlanView, VIEWS, type PlanViewId } from "./view";

export const metadata: Metadata = { title: "My Plan" };

export default async function PlanPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view } = await searchParams;
  const { user, profile, role } = await requireCandidate();
  const { readiness, evidence, planDone, baselineDone, interview } = await getCandidateState(user.id, profile, role);

  if (!baselineDone) {
    return (
      <>
        <PageHeader title="My Plan" />
        <EmptyState
          icon={CheckCircle2}
          title="Your plan is built from your baseline"
          body="We only plan for gaps you actually have. Take the baseline first so you don't study what you already know."
          href={`/assessment/${encodeURIComponent(`baseline:${role.id}`)}`}
          cta="Start baseline assessment"
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="My Plan"
        subtitle={`What to work on for ${role.title}, and the proof behind every score. Studying a plan doesn't raise your readiness: passing the test at the end does.`}
      />
      <PlanView
        view={VIEWS.includes(view as PlanViewId) ? (view as PlanViewId) : "todo"}
        role={role}
        readiness={readiness}
        evidence={evidence}
        planDone={planDone}
        interview={interview}
      />
    </>
  );
}
