import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BadgeCheck, Check, ChevronRight, LockOpen, TrendingUp, TriangleAlert } from "lucide-react";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { Panel } from "@/components/bits";
import { LinkArrow } from "@/components/pending";
import type { Impact } from "@/lib/impact";
import type { NextAction } from "@/lib/next-action";
import { KNOWLEDGE_ONLY_CAP } from "@/lib/readiness";

/** One line of the breakdown: a skill (with the role's target) or, in a single-skill assessment, a topic. */
export type ResultLine = { id: string; name: string; pct: number; correct: number; total: number; target?: number; href?: string };

export type ResultViewProps = {
  title: string;
  kind: "baseline" | "skill" | "final";
  verified: boolean;
  score: { pct: number; correct: number; total: number };
  impact: Impact;
  lines: ResultLine[];
  /** Lines are topics of one skill rather than skills. */
  topics: boolean;
  capped: { name: string; cappedFrom: number; level: number }[];
  interview: { id: string; prompt: string; skipped: boolean; words: number; score: number | null; pending: boolean; summary?: string }[];
  interviewScored: boolean;
  next?: NextAction;
  practise: { skillId: string; name: string } | null;
  unlocked: { title: string; company: string }[];
  /** Final assessment only: whether it cleared the bar for the Career Card. */
  finalPassed: boolean | null;
};

/** A topic has no role target, so it is judged against a fixed bar. */
const TOPIC_BAR = 75;
/** Lines shown before "show all": enough to see where the work is, not a wall of bars. */
const FIRST = 5;

const shortfall = (l: ResultLine) => l.pct - (l.target ?? TOPIC_BAR);

/**
 * What an assessment result says, in the order a student needs it: the score and what it did to
 * readiness, three takeaways, the one thing to do next, then the detail for anyone who wants it.
 */
export function ResultView({ title, kind, verified, score, impact, lines, topics, capped, interview, interviewScored, next, practise, unlocked, finalPassed }: ResultViewProps) {
  const weakestFirst = [...lines].sort((a, b) => shortfall(a) - shortfall(b));
  const onTarget = lines.filter((l) => shortfall(l) >= 0).length;
  const strongest = lines.reduce<ResultLine | null>((best, l) => (l.pct > 0 && (!best || l.pct > best.pct || (l.pct === best.pct && l.correct > best.correct)) ? l : best), null);
  const weakest = weakestFirst[0] && shortfall(weakestFirst[0]) < 0 ? weakestFirst[0] : null;
  const noun = topics ? "topic" : "skill";
  const answered = interview.filter((r) => !r.skipped);
  const skipped = interview.length - answered.length;

  return (
    <div className="space-y-5">
      <section className="surface-hero overflow-hidden rounded-3xl p-7 sm:p-9">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-white/80">{title}</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium ring-1 ring-inset ring-white/25">
            {verified ? <><Check className="size-3" aria-hidden />Verified result</> : "Recorded, not verified"}
          </span>
        </div>
        <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/70">Your score</p>
            <p className="mt-1 text-6xl font-semibold tabular-nums tracking-tight">{score.pct}%</p>
            <p className="mt-1 text-white/85">{score.correct} of {score.total} correct</p>
          </div>
          <div className="sm:border-l sm:border-white/20 sm:pl-6">
            <p className="text-xs font-medium uppercase tracking-wider text-white/70">Role readiness</p>
            <p className="mt-1 flex flex-wrap items-baseline gap-x-2 text-4xl font-semibold tabular-nums tracking-tight">
              {impact.scoreBefore !== null ? (
                <>
                  <span className="text-2xl text-white/60">{impact.scoreBefore}%</span>
                  <ArrowRight className="size-5 self-center text-white/60" aria-label="to" />
                </>
              ) : null}
              {impact.scoreAfter}%
            </p>
            <p className="mt-1 text-white/85">
              {impact.scoreBefore === null
                ? "Your first assessed readiness."
                : impact.delta > 0
                  ? `Up ${impact.delta} point${impact.delta === 1 ? "" : "s"}${impact.bandChanged ? ` · ${impact.bandChanged}` : ""}.`
                  : impact.delta < 0
                    ? `Down ${-impact.delta} point${impact.delta === -1 ? "" : "s"}. Readiness follows your latest result, not your best one.`
                    : "No change."}
            </p>
          </div>
        </div>
      </section>

      {!verified ? (
        <p role="status" className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          This attempt went over the time limit or had too many tab switches, so it is recorded but not marked verified. The score still counts; a clean retake will restore the verified mark.
        </p>
      ) : null}

      <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-3">
        <Takeaway label={`${topics ? "Topics" : "Skills"} at target`} value={`${onTarget} of ${lines.length}`} sub={onTarget === lines.length ? "every one of them" : `${lines.length - onTarget} still below`} tone={onTarget === lines.length ? "good" : undefined} />
        <Takeaway label="Strongest" value={strongest?.name ?? "None yet"} sub={strongest ? `${strongest.pct}% · ${strongest.correct} of ${strongest.total} correct` : `no ${noun} scored above 0%`} tone={strongest ? "good" : undefined} />
        <Takeaway label="Needs most work" value={weakest?.name ?? "Nothing"} sub={weakest ? `${weakest.pct}%${weakest.target !== undefined ? ` · target ${weakest.target}%` : ""}` : `every ${noun} is at target`} tone={weakest ? "bad" : "good"} />
      </div>

      {finalPassed !== null ? (
        <p className="flex gap-2 rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
          <BadgeCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
          {finalPassed
            ? "Final verification passed. Your Career Card has been issued — it's private until you choose to share it."
            : "Final verification recorded, but it surfaced gaps that must be closed before your Career Card is issued."}
        </p>
      ) : null}

      {next ? (
        <section className="rounded-3xl border border-primary/25 bg-primary/5 p-6 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Do this next</p>
          <h2 className="mt-1.5 text-xl font-semibold tracking-tight">{next.title}</h2>
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">{next.why}</p>
          {next.impact ? (
            <p className="mt-2 flex items-center gap-2 text-sm">
              <TrendingUp className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
              <span>
                Reaching {next.impact.to}% adds <span className="font-semibold">{next.impact.deltaScore} readiness point{next.impact.deltaScore === 1 ? "" : "s"}</span>
                {next.impact.unlockedJobIds.length ? ` and unlocks ${next.impact.unlockedJobIds.length} ${next.impact.unlockedJobIds.length === 1 ? "opportunity" : "opportunities"}` : ""}.
              </span>
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-3">
            {/* Action labels name the skill, so they are long: let them wrap on a phone instead of pushing the page sideways. */}
            <Link href={next.href} className={cn(buttonVariants(), "h-auto min-h-11 max-w-full whitespace-normal px-6 py-2.5 text-base")}>{next.action} <LinkArrow /></Link>
            {practise ? (
              <Link href={`/practice/drill?skill=${practise.skillId}`} aria-label={`Practise ${practise.name} first`} className={cn(buttonVariants({ variant: "outline" }), "h-11 px-5 text-base")}>
                Practise first
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}

      {impact.notes.length || unlocked.length ? (
        <Panel title="What this changed">
          <ul className="space-y-2 text-sm">
            {impact.notes.map((n) => (
              <li key={n} className="flex gap-2"><TrendingUp className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />{n}</li>
            ))}
            {unlocked.map((j) => (
              <li key={`${j.title} ${j.company}`} className="flex gap-2">
                <LockOpen className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <span>Unlocked: <Link href="/jobs" className="font-medium text-primary hover:underline">{j.title} at {j.company}</Link></span>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      {capped.length ? (
        <Panel title="Why your level is lower than your score">
          <p className="text-sm text-muted-foreground">
            Multiple-choice questions show knowledge. The top band is kept for demonstrated ability, so a level is held at {KNOWLEDGE_ONLY_CAP}% until
            there is{" "}
            <Link href="/plan#project" className="font-medium text-primary hover:underline">project evidence</Link> or a passed interview for it.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {capped.map((p) => (
              <li key={p.name} className="flex justify-between gap-3">
                <span className="font-medium">{p.name}</span>
                <span className="tabular-nums text-muted-foreground">scored {p.cappedFrom}% · level {p.level}%</span>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      <Panel title={topics ? "Topic by topic" : "Skill by skill"} action={lines.length > 1 ? <span className="text-xs text-muted-foreground">weakest first</span> : undefined}>
        <ul className="space-y-1">
          {weakestFirst.slice(0, FIRST).map((l) => <Line key={l.id} line={l} />)}
        </ul>
        {weakestFirst.length > FIRST ? (
          <details className="group mt-1">
            <summary className="mt-2 inline-flex cursor-pointer list-none items-center gap-1 rounded-lg text-sm font-medium text-primary hover:underline [&::-webkit-details-marker]:hidden">
              <span className="group-open:hidden">Show all {lines.length} {noun}s</span>
              <span className="hidden group-open:inline">Show fewer</span>
              <ChevronRight className="size-4 transition-transform group-open:rotate-90" aria-hidden />
            </summary>
            <ul className="mt-2 space-y-1">
              {weakestFirst.slice(FIRST).map((l) => <Line key={l.id} line={l} />)}
            </ul>
          </details>
        ) : null}
        {kind === "baseline" ? (
          <p className="mt-4 text-xs text-muted-foreground">Harder questions count for more, and the baseline asks only 3 per skill, so these levels are rough. A skill assessment gives a sharper reading.</p>
        ) : null}
      </Panel>

      {interview.length ? (
        <Panel title="Interview questions">
          {answered.length ? (
            <ul className="mb-3 space-y-3">
              {answered.map((r) => (
                <li key={r.id} className="rounded-xl border p-3">
                  <p className="text-sm font-medium">{r.prompt}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {r.words} words{r.score !== null ? ` · scored ${r.score}%` : r.pending ? " · awaiting evaluation" : ""}
                  </p>
                  {r.summary ? <p className="mt-1 text-sm text-muted-foreground">{r.summary}</p> : null}
                </li>
              ))}
            </ul>
          ) : null}
          <p className="text-sm text-muted-foreground">
            {answered.length ? `You answered ${answered.length} of ${interview.length}${skipped ? ` and skipped ${skipped}` : ""}. ` : `You skipped ${interview.length === 1 ? "the interview question" : `all ${interview.length} interview questions`}. `}
            {interviewScored ? "Answers are scored against a fixed rubric." : "Interview answers are saved but not scored yet, so they don't change your readiness."}
          </p>
        </Panel>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">
        {next ? (
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" aria-hidden /> Back to dashboard
          </Link>
        ) : (
          <Link href="/dashboard" className={cn(buttonVariants(), "h-11 px-6 text-base")}>Back to dashboard <LinkArrow /></Link>
        )}
        {kind === "final" ? <Link href="/card" className={cn(buttonVariants({ variant: "outline" }), "h-11 px-6 text-base")}>Open Career Card</Link> : null}
      </div>
    </div>
  );
}

function Takeaway({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: "good" | "bad" }) {
  return (
    <div className="card-soft p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("mt-1.5 text-lg font-semibold leading-snug", tone === "good" && "text-emerald-700 dark:text-emerald-400", tone === "bad" && "text-rose-600 dark:text-rose-400")}>{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function Line({ line }: { line: ResultLine }) {
  const ok = shortfall(line) >= 0;
  const body: ReactNode = (
    <>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium">{line.name}</span>
        <span className="shrink-0 font-semibold tabular-nums">{line.pct}%</span>
      </div>
      <div className="relative mt-2 h-1.5 rounded-full bg-foreground/10">
        <div className={cn("h-full rounded-full", ok ? "bg-emerald-500" : line.pct >= 50 ? "bg-amber-500" : "bg-rose-500")} style={{ width: `${line.pct}%` }} />
        {line.target !== undefined ? <div className="absolute -top-1 h-3.5 w-0.5 rounded bg-foreground/60" style={{ left: `${line.target}%` }} aria-hidden /> : null}
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        {line.correct} of {line.total} correct{line.target !== undefined ? (ok ? " · at target" : ` · target ${line.target}%`) : ""}
      </p>
    </>
  );
  return (
    <li>
      {line.href ? (
        <Link href={line.href} className="-mx-3 block rounded-xl px-3 py-2.5 transition-colors hover:bg-foreground/5">{body}</Link>
      ) : (
        <div className="py-2.5">{body}</div>
      )}
    </li>
  );
}
