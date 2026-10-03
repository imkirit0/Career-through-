import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, Lock, LockOpen, Sparkles } from "lucide-react";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { getJob } from "@/content/jobs";
import type { NextAction } from "@/lib/next-action";
import { Why } from "./why";

/**
 * The single highest-priority action, and what it is worth. Deliberately one CTA: the
 * dashboard's job is to answer "what should I do next", not to offer a menu. The right-hand
 * side draws the answer to "why bother": where the skill, the readiness score and the
 * locked opportunities would be if the target is reached.
 */
export function NextMove({
  action,
  upNext,
  formulaVersion,
  readiness,
  jobs,
}: {
  action: NextAction;
  upNext: NextAction[];
  formulaVersion: string;
  /** Current readiness score and the score at which the role counts as ready. */
  readiness: { score: number; ready: number };
  jobs: { total: number; unlocked: number };
}) {
  const impact = action.impact;
  const unlocks = impact?.unlockedJobIds.map((id) => getJob(id)).filter((j) => j !== undefined) ?? [];
  const i = (n: number) => ({ ["--i" as string]: n });
  const hasLevel = action.current !== null && action.target !== null;
  // "Current 33% · target 75%" is drawn as a meter, so it is not repeated as a chip.
  const reasons = action.reasons.filter((r) => !/^current\b/i.test(r));

  // One marker per opportunity: open today, opened by this move, one requirement closer, untouched.
  const opened = Math.min(unlocks.length, Math.max(jobs.total - jobs.unlocked, 0));
  const closer = Math.min(Math.max(action.blocksJobs - opened, 0), Math.max(jobs.total - jobs.unlocked - opened, 0));
  const markers = Array.from({ length: jobs.total }, (_, n) =>
    n < jobs.unlocked ? "open" : n < jobs.unlocked + opened ? "opened" : n < jobs.unlocked + opened + closer ? "closer" : "locked",
  );

  return (
    <section aria-labelledby="next-move" className="surface-hero relative overflow-hidden rounded-3xl">
      {/* Soft colour fields, for depth. Decorative only. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="blob right-[-6%] top-[-40%] size-[360px] bg-white/25" />
        <span className="blob bottom-[-50%] left-[30%] size-[320px] bg-fuchsia-300/30" style={{ animationDelay: "-6s" }} />
      </div>

      <div className="relative grid grid-cols-[minmax(0,1fr)] gap-6 p-6 sm:p-7 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)] lg:gap-8">
        <div className="flex flex-col">
          <p className="rise flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/80" style={i(0)}>
            <Sparkles className="size-3.5" aria-hidden />
            Your next move
          </p>
          <h2 id="next-move" className="rise mt-2 text-2xl font-semibold tracking-tight sm:text-3xl" style={i(1)}>{action.title}</h2>
          <p className="rise mt-2 max-w-xl text-sm leading-relaxed text-white/85" style={i(2)}>{action.why}</p>

          {reasons.length ? (
            <ul className="rise mt-4 flex flex-wrap gap-2 text-xs" style={i(3)}>
              {reasons.map((r) => (
                <li key={r} className="rounded-full bg-white/10 px-3 py-1.5 font-medium text-white/90 ring-1 ring-inset ring-white/15">{r}</li>
              ))}
            </ul>
          ) : null}

          <div className="rise mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 lg:mt-auto lg:pt-6" style={i(4)}>
            <Link
              href={action.href}
              className={cn(buttonVariants(), "group h-auto min-h-11 max-w-full whitespace-normal bg-white px-6 py-2.5 text-base text-primary shadow-lg shadow-black/10 transition-transform hover:-translate-y-0.5 hover:bg-white")}
            >
              {action.action} <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
            {action.skillId ? (
              <Link href={`/practice?skill=${action.skillId}`} className="text-sm font-medium text-white/90 underline-offset-4 hover:text-white hover:underline">
                Practise first
              </Link>
            ) : null}
          <span className="text-white [&_button]:text-white/90 [&_button:hover]:text-white">
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

        <div className="rise self-start rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm" style={i(3)}>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/70">{impact ? `If you reach ${impact.to}%` : hasLevel ? "Where you are" : "What this does"}</p>

          <div className="mt-4 space-y-5">
            {!impact ? (
              <p className="text-sm leading-relaxed text-white/90">
                {action.kind === "project"
                  ? "Satisfies the project requirement on opportunities that ask for one, and raises evidence confidence."
                  : action.kind === "final"
                    ? "Issues your Career Card. It re-tests every role skill, so your levels can move either way."
                    : "May unlock opportunities requiring this skill."}
              </p>
            ) : null}
            {hasLevel ? (
              <Meter
                label={action.kind === "final" ? "Readiness" : "Skill level"}
                from={action.current!}
                to={action.target!}
                caption={`${Math.max(action.target! - action.current!, 0)} points to go${action.kind === "final" ? " to the readiness threshold" : ""}`}
              />
            ) : null}

            {impact ? (
              <Meter
                label="Role readiness"
                from={readiness.score}
                to={Math.min(readiness.score + impact.deltaScore, 100)}
                mark={readiness.ready}
                caption={`+${impact.deltaScore} point${impact.deltaScore === 1 ? "" : "s"} · the line marks job-ready at ${readiness.ready}%`}
              />
            ) : null}

            {jobs.total ? (
              <div>
                <p className="text-sm font-medium text-white/85">Opportunities</p>
                <ul className="mt-2 flex flex-wrap gap-1.5" aria-hidden>
                  {markers.map((m, n) => (
                    <li
                      key={n}
                      className={cn(
                        "grid size-8 place-items-center rounded-full",
                        m === "open" && "bg-white text-primary",
                        m === "opened" && "bg-emerald-300 text-emerald-950",
                        m === "closer" && "bg-white/20 text-white ring-2 ring-inset ring-white/70",
                        m === "locked" && "bg-white/10 text-white/50",
                      )}
                    >
                      {m === "open" || m === "opened" ? <LockOpen className="size-3.5" /> : <Lock className="size-3.5" />}
                    </li>
                  ))}
                </ul>
                <p className="mt-1.5 text-xs text-white/70">
                  {opened
                    ? `Unlocks ${opened} of ${jobs.total}: ${unlocks.slice(0, opened).map((j) => j.title).join(", ")}${closer ? `. Clears this requirement on ${closer} more.` : ""}`
                    : !action.blocksJobs
                      ? `No opportunity unlocks from this one alone. ${jobs.unlocked} of ${jobs.total} open today.`
                      : impact
                        ? `Clears this requirement on ${action.blocksJobs} of ${jobs.total}. Each still needs its other requirements.`
                        : `${action.blocksJobs} of ${jobs.total} ask for this. ${jobs.unlocked} open today.`}
                </p>
              </div>
            ) : null}

          </div>
        </div>
      </div>

      {upNext.length ? (
        <ol className="relative flex flex-wrap items-center gap-x-2 gap-y-2 border-t border-white/15 bg-black/10 px-6 py-3.5 text-xs text-white/85 sm:px-7">
          <li className="mr-1 font-semibold uppercase tracking-wider text-white/70">Your path</li>
          <li><Step n={1} current>This move</Step></li>
          {upNext.slice(0, 3).map((a, n) => (
            <li key={a.id} className="rise flex items-center gap-2" style={i(6 + n)}>
              <ChevronRight className="size-3.5 text-white/50" aria-hidden />
              <Step n={n + 2}>{a.title}</Step>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}

/** A track filled to where things are now, hatched out to where they would be. */
function Meter({ label, from, to, mark, caption }: { label: string; from: number; to: number; mark?: number; caption: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium text-white/85">{label}</p>
        <p className="flex items-baseline gap-1.5 tabular-nums">
          <span className="text-sm text-white/70">{from}%</span>
          <ArrowRight className="size-3.5 self-center text-white/60" aria-label="to" />
          <span className="text-xl font-semibold">{to}%</span>
        </p>
      </div>
      <div className="relative mt-2 h-2.5 rounded-full bg-white/15">
        <div
          className="absolute inset-y-0 rounded-full"
          style={{
            left: 0,
            width: `${Math.min(to, 100)}%`,
            backgroundImage: "repeating-linear-gradient(135deg, rgb(255 255 255 / 0.5) 0 4px, rgb(255 255 255 / 0.18) 4px 8px)",
          }}
          aria-hidden
        />
        <div className="grow-x relative h-full rounded-full bg-white" style={{ width: `${Math.min(from, 100)}%` }} />
        {mark !== undefined ? <div className="absolute -top-1 h-4.5 w-0.5 rounded bg-white" style={{ left: `${mark}%` }} aria-hidden /> : null}
      </div>
      <p className="mt-1.5 text-xs text-white/70">{caption}</p>
    </div>
  );
}

function Step({ n, current, children }: { n: number; current?: boolean; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1", current ? "bg-white font-semibold text-primary" : "bg-white/10 ring-1 ring-inset ring-white/15")}>
      <span className={cn("grid size-4 place-items-center rounded-full text-[10px] font-semibold tabular-nums", current ? "bg-primary text-white" : "bg-white/20")}>{n}</span>
      {children}
    </span>
  );
}
