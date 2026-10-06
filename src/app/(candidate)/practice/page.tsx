import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Code2, History, MessageSquare, ShieldCheck, Timer, Zap, type LucideIcon } from "lucide-react";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { ChoicePicker, LevelBar, PageHeader, Panel, StatusChip } from "@/components/bits";
import { LinkArrow } from "@/components/pending";
import { challengesForSkill } from "@/content/challenges";
import { getSkill } from "@/content/skills";
import { getPracticeLog, getSolvedChallenges, liveReadiness, requireCandidate } from "@/lib/data";
import { timeAgo } from "@/lib/format";
import { PRACTICE_MODES, READY_RATIO, type PracticeMode } from "@/lib/practice";

export const metadata: Metadata = { title: "Practice" };

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const READY_PCT = Math.round(READY_RATIO * 100);

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
  const sr = readiness.perSkill.find((s) => s.skillId === skillId);
  // Code challenges exist for the runnable skills only; a role with none gets two doors.
  const codeSkills = role.skills.map((s) => s.skillId).filter((id) => challengesForSkill(id).length);
  const codeSkill = codeSkills.includes(skillId) ? skillId : codeSkills[0];
  const codePool = codeSkill ? challengesForSkill(codeSkill) : [];
  const codeDone = codePool.filter((c) => solved.has(c.id)).length;
  const last = (m: PracticeMode) => {
    const run = log.find((l) => l.skillId === skillId && l.mode === m);
    return run ? `Last: ${run.correct}/${run.total} · ${timeAgo(run.createdAt)}` : "Not tried yet";
  };

  const now = Date.now();
  const thisWeek = log.filter((l) => now - new Date(l.createdAt).getTime() < WEEK_MS).length;
  const skillRuns = log.filter((l) => l.skillId === skillId);
  const asked = skillRuns.reduce((n, l) => n + l.total, 0);
  const accuracy = asked ? Math.round((skillRuns.reduce((n, l) => n + l.correct, 0) / asked) * 100) : null;

  return (
    <>
      <PageHeader title="Practice" subtitle="Get it wrong here, where it costs nothing. Practice never changes your readiness." />

      <ChoicePicker
        label="Practising"
        current={skillId}
        options={role.skills.map((s) => ({ id: s.skillId, label: getSkill(s.skillId).name, href: `/practice?skill=${s.skillId}` }))}
      />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-3">
        {/* The recommended start: one obvious thing to do. */}
        <section className="surface-hero relative overflow-hidden rounded-3xl p-6 text-white shadow-xl sm:p-8 lg:col-span-2">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/70">
            <Zap className="size-4" aria-hidden /> Recommended for you
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Warm up with a {name} drill</h2>
          <p className="mt-2 max-w-xl text-sm text-white/80">
            {PRACTICE_MODES.drill.count} questions, no timer. After each one you see the answer and why, starting with the topics you missed last time.
          </p>

          {sr ? (
            <div className="mt-6 max-w-md rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur">
              <div className="mb-2 flex items-center justify-between gap-2 text-sm">
                <span className="text-white/80">
                  Level <strong className="text-white">{sr.level}</strong> of {sr.target} target
                </span>
                <StatusChip status={sr.status} />
              </div>
              <LevelBar level={sr.level} target={sr.target} status={sr.status} label={`${name} level`} />
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href={`/practice/drill?skill=${skillId}`} className={cn(buttonVariants(), "h-11 bg-white px-5 font-semibold text-primary shadow-lg hover:bg-white/90")}>
              Start a drill <LinkArrow />
            </Link>
            <span className="text-sm text-white/70">{last("drill")}</span>
          </div>
        </section>

        {/* What practice has looked like so far. */}
        <Panel title="Your practice" action={<History className="size-4 text-muted-foreground" aria-hidden />} className="sm:p-6">
          <dl className="grid grid-cols-2 gap-3">
            <Stat label="Sessions this week" value={String(thisWeek)} />
            <Stat label={`${name} accuracy`} value={accuracy === null ? "–" : `${accuracy}%`} good={accuracy !== null && accuracy >= READY_PCT} />
          </dl>
          {log.length ? (
            <ul className="mt-5 space-y-3">
              {log.slice(0, 4).map((l, i) => {
                const pct = Math.round((l.correct / l.total) * 100);
                return (
                  <li key={i} className="text-sm">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate font-medium">{getSkill(l.skillId).name}</span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">{l.correct}/{l.total}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {PRACTICE_MODES[l.mode].label} · {timeAgo(l.createdAt)}
                    </p>
                    <div className="mt-1.5 h-1.5 rounded-full bg-foreground/5">
                      <div className={cn("h-full rounded-full", pct >= READY_PCT ? "bg-emerald-500" : "bg-primary")} style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-5 text-sm text-muted-foreground">Your sessions will show up here. Start with a drill, it takes about three minutes.</p>
          )}
        </Panel>
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wider text-muted-foreground">More ways to practise</h2>
      <div className={cn("grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2", codeSkill ? "xl:grid-cols-3" : "xl:grid-cols-2")}>
        <Door
          icon={Timer}
          tag={`${PRACTICE_MODES.mock.minutes} min`}
          title={PRACTICE_MODES.mock.label}
          body={`${PRACTICE_MODES.mock.count} timed questions, like the real assessment. Answers come at the end.`}
          meta={last("mock")}
          href={`/practice/mock?skill=${skillId}`}
          cta="Start a mock test"
        />
        {codeSkill ? (
          <Door
            icon={Code2}
            tag="In browser"
            title="Code challenges"
            body={
              codeSkill === skillId
                ? `Write real ${getSkill(codeSkill).name} and check it against the examples.`
                : `None for ${name} yet. ${getSkill(codeSkill).name} has ${codePool.length} to work through.`
            }
            meta={`${codeDone} of ${codePool.length} solved`}
            progress={codeDone / codePool.length}
            href={`/practice/code?skill=${codeSkill}`}
            cta="Open the editor"
          />
        ) : null}
        <Door
          icon={MessageSquare}
          tag="Voice or text"
          title="Interview"
          body="Talk through real interview questions, out loud or typed, and hear what to tighten."
          meta="Any role skill"
          href="/practice/interview"
          cta="Start an interview"
        />
      </div>

      <Link
        href={`/assessment/skill:${skillId}`}
        className="group mt-8 flex flex-wrap items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5 transition-colors hover:bg-primary/10"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
          <ShieldCheck className="size-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">Feeling ready? Make it count.</span>
          <span className="block text-sm text-muted-foreground">
            The {name} assessment is what moves your readiness. Aim for {READY_PCT}% in practice first.
          </span>
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
          Take the assessment <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </Link>
    </>
  );
}

function Stat({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="rounded-xl bg-foreground/[0.03] p-3 ring-1 ring-foreground/5">
      <dt className="truncate text-xs text-muted-foreground">{label}</dt>
      <dd className={cn("mt-1 text-2xl font-semibold tabular-nums", good && "text-emerald-600")}>{value}</dd>
    </div>
  );
}

/** One way to practise: what it is in a sentence, where you stand, and a single button. */
function Door({ icon: Icon, tag, title, body, meta, progress, href, cta }: { icon: LucideIcon; tag: string; title: string; body: string; meta: string; progress?: number; href: string; cta: string }) {
  return (
    <article className="card-soft flex h-full flex-col p-5 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden />
        </span>
        <span className="rounded-full bg-background/70 px-2.5 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-foreground/10">{tag}</span>
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1 flex-1 text-sm text-muted-foreground">{body}</p>
      <div className="mt-4 border-t border-foreground/5 pt-3">
        <p className="text-xs text-muted-foreground">{meta}</p>
        {progress !== undefined ? (
          <div className="mt-2 h-1.5 rounded-full bg-foreground/5">
            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        ) : null}
      </div>
      <Link href={href} className={cn(buttonVariants({ variant: "outline" }), "mt-4 h-10 bg-background/60")}>
        {cta} <LinkArrow />
      </Link>
    </article>
  );
}
