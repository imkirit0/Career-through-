import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Code2, MessageSquare, Timer, Zap, type LucideIcon } from "lucide-react";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { ChoicePicker, PageHeader } from "@/components/bits";
import { LinkArrow } from "@/components/pending";
import { challengesForSkill } from "@/content/challenges";
import { getSkill } from "@/content/skills";
import { getPracticeLog, getSolvedChallenges, liveReadiness, requireCandidate } from "@/lib/data";
import { timeAgo } from "@/lib/format";
import { PRACTICE_MODES, type PracticeMode } from "@/lib/practice";

export const metadata: Metadata = { title: "Practice" };

export default async function PracticePage({ searchParams }: { searchParams: Promise<{ skill?: string; set?: string; mode?: string }> }) {
  const { skill, set, mode } = await searchParams;
  // Interview practice used to live at this address.
  if (set || mode) redirect(`/practice/interview?${new URLSearchParams({ ...(set ? { set } : {}), ...(mode ? { mode } : {}) })}`);

  const { user, role } = await requireCandidate();
  const [{ readiness }, log, solved] = await Promise.all([liveReadiness(user.id, role), getPracticeLog(user.id), getSolvedChallenges(user.id)]);

  // Default to the skill the student's next move is about, so practice feeds the plan.
  const suggested = readiness.nextActions.find((a) => a.skillId)?.skillId ?? role.skills[0].skillId;
  const skillId = role.skills.some((s) => s.skillId === skill) ? skill! : suggested;
  const name = getSkill(skillId).name;
  // Code challenges exist for the runnable skills only; a role with none gets three doors.
  const codeSkills = role.skills.map((s) => s.skillId).filter((id) => challengesForSkill(id).length);
  const codeSkill = codeSkills.includes(skillId) ? skillId : codeSkills[0];
  const codePool = codeSkill ? challengesForSkill(codeSkill) : [];
  const codeDone = codePool.filter((c) => solved.has(c.id)).length;
  const last = (m: PracticeMode) => {
    const run = log.find((l) => l.skillId === skillId && l.mode === m);
    return run ? `Last time: ${run.correct} of ${run.total} · ${timeAgo(run.createdAt)}` : undefined;
  };

  return (
    <>
      <PageHeader title="Practice" subtitle="Get it wrong here, where it costs nothing. Practice never changes your readiness." />

      <ChoicePicker
        label="Practising"
        current={skillId}
        options={role.skills.map((s) => ({ id: s.skillId, label: getSkill(s.skillId).name, href: `/practice?skill=${s.skillId}` }))}
      />

      <div className={cn("grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2", codeSkill ? "xl:grid-cols-4" : "xl:grid-cols-3")}>
        <Door
          icon={Zap}
          title={PRACTICE_MODES.drill.label}
          body={`${PRACTICE_MODES.drill.count} questions, no timer. After each one you see the answer and why.`}
          meta={last("drill")}
          href={`/practice/drill?skill=${skillId}`}
          cta="Start a drill"
          primary
        />
        <Door
          icon={Timer}
          title={PRACTICE_MODES.mock.label}
          body={`${PRACTICE_MODES.mock.count} questions in ${PRACTICE_MODES.mock.minutes} minutes, like the real assessment. Answers come at the end.`}
          meta={last("mock")}
          href={`/practice/mock?skill=${skillId}`}
          cta="Start a mock test"
        />
        {codeSkill ? (
          <Door
            icon={Code2}
            title="Code challenges"
            body={
              codeSkill === skillId
                ? `Write real ${getSkill(codeSkill).name} in the browser and check it against the examples.`
                : `None for ${name} yet. ${getSkill(codeSkill).name} has ${codePool.length} to work through.`
            }
            meta={codeDone ? `${codeDone} of ${codePool.length} solved` : `${codePool.length} challenges`}
            href={`/practice/code?skill=${codeSkill}`}
            cta="Open the editor"
          />
        ) : null}
        <Door
          icon={MessageSquare}
          title="Interview"
          body="Talk through real interview questions, out loud or typed, and hear what to tighten."
          href="/practice/interview"
          cta="Start an interview"
        />
      </div>

      <p className="mt-5 text-sm text-muted-foreground">
        Feeling ready?{" "}
        <Link href={`/assessment/skill:${skillId}`} className="font-medium text-primary hover:underline">
          Take the {name} assessment
        </Link>{" "}
        to make it count.
      </p>
    </>
  );
}

/** One way to practise: what it is in a sentence, and a single button. */
function Door({ icon: Icon, title, body, meta, href, cta, primary }: { icon: LucideIcon; title: string; body: string; meta?: string; href: string; cta: string; primary?: boolean }) {
  return (
    <article className="card-soft flex h-full flex-col p-5 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
        <Icon className="size-5" aria-hidden />
      </span>
      <h2 className="mt-3 font-semibold">{title}</h2>
      <p className="mt-1 flex-1 text-sm text-muted-foreground">{body}</p>
      {meta ? <p className="mt-3 text-xs text-muted-foreground">{meta}</p> : null}
      <Link href={href} className={cn(buttonVariants({ variant: primary ? "default" : "secondary" }), "mt-4 h-10")}>
        {cta} <LinkArrow />
      </Link>
    </article>
  );
}
