import Link from "next/link";
import { ArrowRight, Circle, CircleDot, Code2, Dumbbell, Sparkles, TrendingUp } from "lucide-react";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { getJob } from "@/content/jobs";
import type { NextAction } from "@/lib/next-action";
import { Why } from "./why";

/**
 * The single highest-priority action. Deliberately one main button: the dashboard's job is to
 * answer "what should I do next", not to offer a menu. The picture on the right is drawn in
 * CSS, and its floating checklist is the student's real queue of moves.
 */
export function NextMove({ action, upNext, formulaVersion, totalJobs }: { action: NextAction; upNext: NextAction[]; formulaVersion: string; totalJobs: number }) {
  const impact = action.impact;
  const unlocks = impact?.unlockedJobIds.map((id) => getJob(id)).filter((j) => j !== undefined) ?? [];
  const i = (n: number) => ({ ["--i" as string]: n });
  const hasLevel = action.current !== null && action.target !== null;
  const steps = [action, ...upNext.slice(0, 2)].map((a) => a.title.replace(/^(Improve|Verify) /, ""));

  return (
    <section
      aria-labelledby="next-move"
      data-tour="next-step"
      className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/[0.16] via-primary/[0.06] to-background shadow-[0_24px_60px_-36px_oklch(0.5_0.24_290/0.55)]"
    >
      <div className="relative grid grid-cols-[minmax(0,1fr)] gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] xl:grid-cols-[minmax(0,1fr)_minmax(0,440px)]">
        <div>
          <p className="rise flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary" style={i(0)}>
            <Sparkles className="size-3.5" aria-hidden />
            Your next step
          </p>
          <h2 id="next-move" className="rise mt-2.5 text-3xl font-semibold tracking-tight sm:text-4xl" style={i(1)}>{action.title}</h2>

          {hasLevel ? (
            <div className="rise mt-4 max-w-xl" style={i(2)}>
              <p className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold tabular-nums text-foreground/70">{action.current}%</span>
                <ArrowRight className="size-4 self-center text-primary" aria-label="to" />
                <span className="text-3xl font-semibold tabular-nums text-primary">{action.target}%</span>
                <span className="text-sm text-muted-foreground">{action.kind === "final" ? "readiness threshold" : "target"}</span>
              </p>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-primary/15">
                <div className="grow-x h-full rounded-full bg-gradient-to-r from-primary to-violet-400" style={{ width: `${Math.min((action.current! / Math.max(action.target!, 1)) * 100, 100)}%` }} />
              </div>
            </div>
          ) : (
            <p className="rise mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground" style={i(2)}>{action.why}</p>
          )}

          <p className="rise mt-4 flex max-w-xl items-start gap-2 text-sm text-foreground/80" style={i(3)}>
            <TrendingUp className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
            <span>
              {impact ? (
                <>
                  Reaching {impact.to}% adds <span className="font-semibold text-foreground">{impact.deltaScore} readiness point{impact.deltaScore === 1 ? "" : "s"}</span>
                  {unlocks.length
                    ? ` and unlocks ${unlocks.map((j) => j.title).join(", ")}`
                    : action.blocksJobs
                      ? ` and clears a requirement on ${action.blocksJobs} of ${totalJobs} opportunities`
                      : ""}
                  .
                </>
              ) : action.kind === "project" ? (
                "Satisfies the project requirement on opportunities that ask for one, and raises evidence confidence."
              ) : action.kind === "final" ? (
                "Issues your Career Card. It re-tests every role skill, so your levels can move either way."
              ) : (
                "May unlock opportunities requiring this skill."
              )}
            </span>
          </p>

          <div className="rise mt-6 flex flex-wrap items-center gap-x-5 gap-y-3" style={i(4)}>
            <Link href={action.href} className={cn(buttonVariants(), "group h-auto min-h-12 max-w-full whitespace-normal px-7 py-3 text-base shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5")}>
              {action.action} <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
            {action.skillId ? (
              <Link href={`/practice?skill=${action.skillId}`} className="inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:text-primary hover:underline">
                <Dumbbell className="size-4" aria-hidden />
                Practise first
              </Link>
            ) : null}
          <span>
            <Why label="Why this?" title="Why this action, ahead of everything else" description={action.why}>
              <div>
                <p className="mb-2 font-medium">How the order is decided</p>
                <ol className="space-y-1 text-xs text-muted-foreground">
                  <li>1. Critical role skills below target</li>
                  <li>2. Skills blocking the most opportunities</li>
                  <li>3. Heaviest weight in the role</li>
                  <li>4. Closest to its target, so the quickest win</li>
                  <li>5. A skill&apos;s prerequisite always comes before it</li>
                </ol>
              </div>
              {impact ? (
                <div className="rounded-xl bg-muted/60 p-3 text-xs">
                  <p className="font-medium text-foreground">How the impact is calculated</p>
                  <p className="mt-1 text-muted-foreground">
                    We re-run the same readiness and matching engines over your real evidence with one change: {action.title.replace(/^(Improve|Verify) /, "")} at
                    its {impact.to}% target. That produces +{impact.deltaScore} points and {unlocks.length} new {unlocks.length === 1 ? "unlock" : "unlocks"}. It is
                    what would happen if you reach the target — not a prediction of your score.
                  </p>
                </div>
              ) : null}
              {upNext.length ? (
                <div>
                  <p className="mb-2 font-medium">Queued after this</p>
                  <ol className="space-y-1 text-xs text-muted-foreground">
                    {upNext.slice(0, 4).map((a, i) => <li key={a.id}>{i + 2}. {a.title}</li>)}
                  </ol>
                </div>
              ) : null}
              <p className="text-xs text-muted-foreground">Formula {formulaVersion}. Ranking is rule-based and deterministic — the same evidence always produces the same recommendation.</p>
            </Why>
          </span>
          </div>
        </div>

        {/* A desk scene in CSS: an editor window, with the queue of moves floating beside it. */}
        <div className="relative hidden min-h-60 lg:block">
          <div aria-hidden className="absolute right-4 top-1/2 h-52 w-80 -translate-y-1/2 rounded-full bg-primary/25 blur-3xl" />
          <div aria-hidden className="float absolute bottom-0 left-0 w-[64%] -rotate-3 rounded-2xl bg-slate-900 p-4 shadow-2xl shadow-primary/30 ring-1 ring-white/10" style={i(1)}>
            <div className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-rose-400" />
              <span className="size-2.5 rounded-full bg-amber-400" />
              <span className="size-2.5 rounded-full bg-emerald-400" />
            </div>
            <div className="mt-4 space-y-2.5">
              <div className="flex gap-2"><span className="h-2 w-10 rounded-full bg-violet-400" /><span className="h-2 w-20 rounded-full bg-slate-500" /></div>
              <div className="flex gap-2 pl-4"><span className="h-2 w-14 rounded-full bg-sky-400" /><span className="h-2 w-10 rounded-full bg-slate-600" /><span className="h-2 w-8 rounded-full bg-emerald-400" /></div>
              <div className="flex gap-2 pl-4"><span className="h-2 w-8 rounded-full bg-violet-400" /><span className="h-2 w-24 rounded-full bg-slate-600" /></div>
              <div className="flex gap-2 pl-8"><span className="h-2 w-16 rounded-full bg-amber-300" /><span className="h-2 w-10 rounded-full bg-slate-500" /></div>
              <div className="flex gap-2 pl-4"><span className="h-2 w-12 rounded-full bg-sky-400" /></div>
              <div className="flex gap-2"><span className="h-2 w-6 rounded-full bg-violet-400" /></div>
            </div>
            <span className="absolute -right-4 -top-4 grid size-11 place-items-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/40">
              <Code2 className="size-5" />
            </span>
          </div>
          <ol aria-label="Your next steps" className="absolute right-2 top-3 w-[60%] space-y-2.5">
            {steps.map((label, n) => (
              <li
                key={`${n}-${label}`}
                className={cn(
                  "float flex items-center gap-2 rounded-xl border bg-card/90 px-3 py-2.5 text-xs font-medium shadow-lg shadow-primary/10 backdrop-blur",
                  n === 0 ? "border-primary/40 text-foreground" : "border-foreground/10 text-foreground/75",
                )}
                style={{ ...i(n + 2), marginLeft: n * 14 }}
              >
                {n === 0 ? <CircleDot className="size-4 shrink-0 text-primary" aria-hidden /> : <Circle className="size-4 shrink-0 text-muted-foreground/50" aria-hidden />}
                <span className="truncate">{label}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
