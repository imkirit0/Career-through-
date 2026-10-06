import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { BarChart3, Code2, FileText, Flame, Lightbulb, Mic, Monitor, Target, Timer, Trophy, Users, type LucideIcon } from "lucide-react";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { ChoicePicker, PageHeader, StatusChip } from "@/components/bits";
import { LinkArrow } from "@/components/pending";
import { challengesForSkill } from "@/content/challenges";
import { getSkill } from "@/content/skills";
import { streakDays } from "@/lib/activity";
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

  const week = log.filter((l) => withinWeek(l.createdAt));
  const asked = week.reduce((n, l) => n + l.total, 0);
  const accuracy = asked ? Math.round((week.reduce((n, l) => n + l.correct, 0) / asked) * 100) : null;
  const streak = streakDays(log.map((l) => new Date(l.createdAt)));

  return (
    <>
      <PageHeader title="Practice" subtitle="Get it wrong here, where it costs nothing. Practice never changes your readiness.">
        <span className="flex items-center gap-2 rounded-2xl border border-foreground/10 bg-card/70 px-4 py-2.5 text-sm font-semibold tabular-nums shadow-sm backdrop-blur">
          <Flame className="size-4 text-orange-500" aria-hidden /> {streak} day streak
        </span>
      </PageHeader>

      <ChoicePicker
        label="Practising"
        current={skillId}
        options={role.skills.map((s) => ({ id: s.skillId, label: getSkill(s.skillId).name, href: `/practice?skill=${s.skillId}` }))}
      />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-3">
        {/* The recommended start: one obvious thing to do. */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-[oklch(0.3_0.08_290)] p-6 text-white shadow-xl sm:p-8 lg:col-span-2">
          <div className="pointer-events-none absolute -right-16 -top-16 size-72 rounded-full bg-primary/30 blur-[90px]" aria-hidden />
          <CodeWindow className="absolute -right-6 top-1/2 hidden w-[46%] -translate-y-1/2 rotate-[-4deg] md:block" />

          <div className="relative max-w-md md:max-w-[55%]">
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">Recommended for you</p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
              Warm up with a <span className="text-violet-300">{name}</span> drill
            </h2>
            <p className="mt-3 text-sm text-white/75">
              {PRACTICE_MODES.drill.count} questions, no timer. After each one you see the answer and why, starting with the topics you missed last time.
            </p>

            {sr ? (
              <div className="mt-6 rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10 backdrop-blur">
                <div className="mb-2.5 flex items-center justify-between gap-2 text-sm">
                  <span className="text-white/80">
                    Level <strong className="text-white">{sr.level}</strong> of {sr.target} target
                  </span>
                  <StatusChip status={sr.status} />
                </div>
                <div
                  role="meter"
                  aria-label={`${name} level`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={sr.level}
                  aria-valuetext={`${sr.level}% of a ${sr.target}% target`}
                  className="relative h-1.5 rounded-full bg-white/10"
                >
                  <div className="h-full rounded-full bg-primary" style={{ width: `${sr.level}%` }} />
                  <div className="absolute top-1/2 h-4 w-1.5 -translate-y-1/2 rounded-full bg-white ring-2 ring-zinc-900" style={{ left: `calc(${sr.target}% - 3px)` }} aria-hidden />
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link href={`/practice/drill?skill=${skillId}`} className={cn(buttonVariants(), "h-11 px-6 font-semibold shadow-lg shadow-primary/30")}>
                Start a drill <LinkArrow />
              </Link>
              <span className="text-sm text-white/70">{last("drill")}</span>
            </div>
          </div>
        </section>

        {/* What practice has looked like this week. */}
        <section className="rounded-3xl border border-foreground/10 bg-card/70 p-6 shadow-sm backdrop-blur">
          <h2 className="font-semibold tracking-tight">Your practice this week</h2>
          <dl className="mt-5 grid grid-cols-2 gap-3">
            <Stat icon={Target} tone="bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300" label="Sessions" value={String(week.length)} />
            <Stat
              icon={BarChart3}
              tone="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
              label="Accuracy"
              value={accuracy === null ? "–" : `${accuracy}%`}
            />
          </dl>
          {log.length ? (
            <ul className="mt-5 space-y-3.5">
              {log.slice(0, 3).map((l, i) => {
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
            <div className="mt-5 flex gap-3 rounded-2xl bg-primary/5 p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
                <Lightbulb className="size-5" aria-hidden />
              </span>
              <div>
                <p className="font-semibold">Start with a drill</p>
                <p className="mt-0.5 text-sm text-muted-foreground">A few questions a day is the quickest way to find what to study before the real assessment.</p>
              </div>
            </div>
          )}
        </section>
      </div>

      <h2 className="mb-4 mt-8 text-lg font-semibold tracking-tight">More ways to practise</h2>
      <div className={cn("grid grid-cols-[minmax(0,1fr)] gap-5 md:grid-cols-2", codeSkill ? "xl:grid-cols-3" : "xl:grid-cols-2")}>
        <Door
          icon={FileText}
          tone="bg-rose-100 text-rose-500 dark:bg-rose-500/15 dark:text-rose-300"
          tag={{ icon: Timer, label: `${PRACTICE_MODES.mock.minutes} min` }}
          art={<MockArt />}
          title={PRACTICE_MODES.mock.label}
          body={`${PRACTICE_MODES.mock.count} timed questions, like the real assessment. Answers come at the end.`}
          meta={last("mock")}
          href={`/practice/mock?skill=${skillId}`}
          cta="Start a mock test"
        />
        {codeSkill ? (
          <Door
            icon={Code2}
            tone="bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300"
            tag={{ icon: Monitor, label: "In browser" }}
            art={<CodeWindow className="w-28 rotate-[-6deg]" small />}
            title="Code challenges"
            body={
              codeSkill === skillId
                ? "Write real code and check it against the examples."
                : `None for ${name} yet. ${getSkill(codeSkill).name} has ${codePool.length} to work through.`
            }
            meta={`${codeDone} of ${codePool.length} solved`}
            progress={codeDone / codePool.length}
            href={`/practice/code?skill=${codeSkill}`}
            cta="Open the editor"
          />
        ) : null}
        <Door
          icon={Users}
          tone="bg-pink-100 text-pink-500 dark:bg-pink-500/15 dark:text-pink-300"
          tag={{ icon: Mic, label: "Voice or text" }}
          art={<ChatArt />}
          title="Interview practice"
          body="Talk through real interview questions, out loud or typed, and hear what to tighten."
          meta="Any role skill"
          href="/practice/interview"
          cta="Start an interview"
        />
      </div>

      <section className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/10 to-primary/5 p-5">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
          <Trophy className="size-6" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Feeling ready? Make it count.</p>
          <p className="text-sm text-muted-foreground">The {name} assessment is what moves your readiness. Aim for {READY_PCT}% in practice first.</p>
        </div>
        <Link href={`/assessment/skill:${skillId}`} className={cn(buttonVariants(), "h-11 px-5 font-semibold")}>
          Take the assessment <LinkArrow />
        </Link>
      </section>
    </>
  );
}

function Stat({ icon: Icon, tone, label, value }: { icon: LucideIcon; tone: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-foreground/[0.03] p-3 ring-1 ring-foreground/5">
      <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl", tone)}>
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <dd className="text-2xl font-semibold leading-none tabular-nums">{value}</dd>
        <dt className="mt-1 truncate text-xs text-muted-foreground">{label}</dt>
      </div>
    </div>
  );
}

/** One way to practise: what it is in a sentence, where you stand, and a single button. */
function Door({
  icon: Icon,
  tone,
  tag,
  art,
  title,
  body,
  meta,
  progress,
  href,
  cta,
}: {
  icon: LucideIcon;
  tone: string;
  tag: { icon: LucideIcon; label: string };
  art: ReactNode;
  title: string;
  body: string;
  meta: string;
  progress?: number;
  href: string;
  cta: string;
}) {
  const TagIcon = tag.icon;
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-foreground/10 bg-card/70 p-6 shadow-sm backdrop-blur transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <span className={cn("grid size-11 place-items-center rounded-xl", tone)}>
          <Icon className="size-5" aria-hidden />
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-background/80 px-2.5 py-1 text-xs font-medium text-muted-foreground ring-1 ring-foreground/10">
          <TagIcon className="size-3.5" aria-hidden /> {tag.label}
        </span>
      </div>
      <div className="mt-4 flex flex-1 gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{body}</p>
        </div>
        <div className="hidden shrink-0 items-center transition-transform duration-300 group-hover:scale-105 sm:flex" aria-hidden>
          {art}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-xs text-muted-foreground">{meta}</p>
        {progress !== undefined ? (
          <div className="mt-2 h-1.5 rounded-full bg-foreground/5">
            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        ) : null}
      </div>
      <Link href={href} className={cn(buttonVariants({ variant: "outline" }), "mt-4 h-11 bg-background/80 font-semibold")}>
        {cta} <LinkArrow />
      </Link>
    </article>
  );
}

// ── Decorative art, drawn in CSS so the page ships no images. ──

const CODE_LINES = [
  ["w-10 bg-fuchsia-400", "w-16 bg-sky-400"],
  ["ml-3 w-8 bg-violet-400", "w-20 bg-emerald-400"],
  ["ml-6 w-14 bg-amber-300", "w-8 bg-sky-400"],
  ["ml-6 w-24 bg-zinc-500"],
  ["ml-3 w-6 bg-fuchsia-400", "w-12 bg-emerald-400"],
  ["w-4 bg-violet-400"],
];

function CodeWindow({ className, small }: { className?: string; small?: boolean }) {
  return (
    <div className={cn("pointer-events-none overflow-hidden rounded-xl bg-zinc-900 shadow-2xl ring-1 ring-white/10", className)} aria-hidden>
      <div className="flex gap-1.5 border-b border-white/5 px-3 py-2">
        <span className="size-2 rounded-full bg-rose-400" />
        <span className="size-2 rounded-full bg-amber-300" />
        <span className="size-2 rounded-full bg-emerald-400" />
      </div>
      <div className={cn("space-y-2 p-4", small && "space-y-1.5 p-3")}>
        {(small ? CODE_LINES.slice(0, 5) : [...CODE_LINES, ...CODE_LINES]).map((line, i) => (
          <div key={i} className="flex gap-1.5">
            {line.map((c, j) => (
              <span key={j} className={cn("rounded-full opacity-80", small ? "h-1" : "h-1.5", c)} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MockArt() {
  return (
    <div className="relative h-20 w-24">
      <div className="absolute left-1 top-0 h-20 w-16 rotate-[-6deg] space-y-2 rounded-lg bg-background p-2.5 shadow-md ring-1 ring-foreground/10">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-primary/40" />
            <span className="h-1 flex-1 rounded-full bg-foreground/10" />
          </div>
        ))}
      </div>
      <span className="absolute bottom-0 right-0 grid size-10 place-items-center rounded-full bg-background text-primary shadow-md ring-1 ring-foreground/10">
        <Timer className="size-5" />
      </span>
    </div>
  );
}

function ChatArt() {
  return (
    <div className="relative h-20 w-24">
      <div className="absolute left-0 top-1 flex h-9 w-16 items-center justify-center gap-1 rounded-xl rounded-bl-sm bg-violet-200 dark:bg-violet-500/30">
        {[0, 1, 2].map((i) => <span key={i} className="size-1.5 rounded-full bg-white" />)}
      </div>
      <div className="absolute bottom-1 right-0 flex h-9 w-16 items-center justify-center gap-1 rounded-xl rounded-br-sm bg-primary/80 shadow-md">
        {[0, 1, 2].map((i) => <span key={i} className="size-1.5 rounded-full bg-white" />)}
      </div>
    </div>
  );
}

function withinWeek(date: Date | string, now = new Date()) {
  return now.getTime() - new Date(date).getTime() < WEEK_MS;
}
