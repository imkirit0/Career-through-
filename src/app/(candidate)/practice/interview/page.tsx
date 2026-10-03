import type { Metadata } from "next";
import Link from "next/link";
import { ChoicePicker, PageHeader } from "@/components/bits";
import { promptsForRole, promptsForSkill } from "@/content/interview";
import { getSkill } from "@/content/skills";
import type { InterviewPrompt } from "@/content/taxonomy";
import { requireCandidate } from "@/lib/data";
import { PracticeClient, type PracticePrompt } from "./practice-client";
import { PracticeCall } from "./call";

export const metadata: Metadata = { title: "Interview practice" };

const KIND_LABEL = { behavioural: "Behavioural", technical: "Technical", situational: "Situational" };

export default async function InterviewPracticePage({ searchParams }: { searchParams: Promise<{ set?: string; mode?: string }> }) {
  const { set, mode } = await searchParams;
  const { role } = await requireCandidate();

  // Sets: the role's own interview, plus one per role skill so you can rehearse a weak area.
  const sets = [
    { id: "role", label: `${role.title} interview` },
    ...role.skills.map((s) => ({ id: s.skillId, label: getSkill(s.skillId).name })),
  ];
  const active = sets.find((s) => s.id === set) ?? sets[0];
  const source: InterviewPrompt[] = active.id === "role" ? promptsForRole(role.id) : promptsForSkill(active.id);
  const href = (id: string, written = false) => {
    const q = new URLSearchParams({ ...(id === "role" ? {} : { set: id }), ...(written ? { mode: "written" } : {}) }).toString();
    return `/practice/interview${q ? `?${q}` : ""}`;
  };

  const prompts: PracticePrompt[] = source.map((p) => ({
    id: p.id,
    kind: p.kind,
    depth: p.depth,
    prompt: p.prompt,
    context: p.context,
    lookFor: p.lookFor,
    minWords: p.minWords,
    label: `${KIND_LABEL[p.kind]} · ${p.depth === 1 ? "warm-up" : p.depth === 2 ? "core" : "probing"}`,
  }));

  return (
    <div className="flex-1 flex flex-col h-full">
      <PageHeader title="Interview practice" subtitle="A real conversation, out loud or typed. Nothing here counts as evidence, so you can be bad at it first.">
        <Link href="/practice" className="text-sm text-muted-foreground hover:text-foreground">← All practice</Link>
      </PageHeader>

      <ChoicePicker
        label="Questions from"
        current={active.id}
        options={sets.map((s) => ({ id: s.id, label: s.label, href: href(s.id, mode === "written") }))}
      />

      <div className="flex-1 flex flex-col min-h-0">
        {!prompts.length ? (
          <p className="rounded-2xl border bg-muted/40 p-6 text-sm text-muted-foreground">No practice questions for this set yet.</p>
        ) : mode === "written" ? (
          <>
            <PracticeClient key={active.id} prompts={prompts} />
            <p className="mt-3 text-center text-sm text-muted-foreground">
              Prefer to talk?{" "}
              <Link href={href(active.id)} className="font-medium text-primary hover:underline">Switch to the spoken interview</Link>.
            </p>
          </>
        ) : (
          <>
            <PracticeCall
              key={active.id}
              setId={active.id}
              title="Interviewer"
              subtitle={`Career Through · ${active.label} · practice, not recorded`}
              durationMin={12}
            />
            <p className="mt-3 text-center text-sm text-muted-foreground">
              Answer out loud, or{" "}
              <Link href={href(active.id, true)} className="font-medium text-primary hover:underline">practise in writing instead</Link>.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
