import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, ClipboardCheck, FolderCheck, LockOpen, Target, TrendingUp } from "lucide-react";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Chip, EmptyState, Gauge, Panel } from "@/components/bits";
import { Journey } from "@/components/journey";
import { NextMove } from "@/components/next-move";
import { NextUnlock } from "@/components/next-unlock";
import { SkillCard, SkillLine } from "@/components/skill-card";
import { WhyNotReady } from "@/components/why-not-ready";
import { ReadinessWhy } from "@/components/readiness-why";
import { ReadinessTrend, SkillsRadar } from "@/components/charts";
import { CONTENT_VERSION } from "@/content/version";
import { DIMENSION_LABELS } from "@/content/taxonomy";
import { getJob } from "@/content/jobs";
import { CONFIDENCE_LABELS } from "@/lib/readiness";
import { getCandidateState, requireCandidate } from "@/lib/data";
import { shortDate, timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { user, profile, role } = await requireCandidate();
  const state = await getCandidateState(user.id, profile, role);
  const { readiness, matches, evidence, snapshots, journey, baselineDone, unlock } = state;
  const baselineHref = `/assessment/${encodeURIComponent(`baseline:${role.id}`)}`;
  const first = profile.name.split(" ")[0] || "there";

  const header = (
    <header className="mb-8">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
        <Target className="size-3.5" aria-hidden />
        {role.title}
      </p>
      <h1 className="rise mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        Welcome back, <span className="text-gradient-primary">{first}</span>
      </h1>
    </header>
  );

  if (!baselineDone) {
    return (
      <>
        {header}
        <Panel title="Your career journey" className="mb-5"><Journey stages={journey} /></Panel>
        <EmptyState
          icon={ClipboardCheck}
          title="Take your baseline to see how ready you are"
          body={`Your profile is a starting claim. The baseline measures every ${role.title} skill so we can show your real readiness, your gaps and what to do first.`}
          href={baselineHref}
          cta="Start baseline assessment"
        />
      </>
    );
  }

  const [nba, ...upNext] = readiness.nextActions;
  const bySkill = new Map(readiness.perSkill.map((p) => [p.skillId, p]));
  const critical = readiness.gaps.critical.map((id) => bySkill.get(id)!);
  const gapSkills = readiness.perSkill.filter((p) => p.gap < 0);
  const shownGaps = critical.length ? critical : gapSkills;
  const unlocked = matches.filter((m) => m.unlocked);
  const conf = { strong: 0, medium: 0, low: 0, none: 0 };
  for (const p of readiness.perSkill) conf[p.confidence]++;
  const prev = snapshots.at(-2);
  const delta = prev ? readiness.score - prev.score : 0;
  const nextBand = role.bands.find((b) => b.min > readiness.score);
  const baselineScore = snapshots.find((s) => s.trigger.startsWith("baseline"))?.score;
  const stale = readiness.perSkill.filter((p) => p.reassessRecommended);
  // Several snapshots often land on one day, which would repeat the same axis label.
  const days = new Set(snapshots.map((s) => new Date(s.createdAt).toDateString()));
  const trend = snapshots.map((s) => ({
    date: new Date(s.createdAt).toLocaleString("en-IN", days.size > 1 ? { day: "numeric", month: "short" } : { hour: "numeric", minute: "2-digit" }),
    score: s.score,
  }));
  const zeroStart = readiness.score === 0;

  // Three things up front: what to do, where you stand, what it opens. The rest is one tab away.
  return (
    <>
      {header}

      <div className="space-y-5 2xl:space-y-6">
        {nba ? (
          <NextMove
            action={nba}
            upNext={upNext}
            formulaVersion={readiness.formulaVersion}
            readiness={{ score: readiness.score, ready: role.readyThreshold }}
            jobs={{ total: matches.length, unlocked: unlocked.length }}
          />
        ) : null}

        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 md:grid-cols-2 2xl:gap-6">
          <Panel className="rise" style={{ ["--i" as string]: 3 }} title="Where do I stand?" action={<ReadinessWhy role={role} readiness={readiness} contentVersion={CONTENT_VERSION} />}>
            <Gauge score={readiness.score} label={`${role.title} readiness`} />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <Chip className="bg-secondary text-secondary-foreground ring-transparent">{readiness.band.label}</Chip>
              {delta ? (
                <Chip className={delta > 0 ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-rose-50 text-rose-700 ring-rose-200"}>
                  <TrendingUp className="size-3" aria-hidden />{delta > 0 ? "+" : ""}{delta} since last update
                </Chip>
              ) : null}
            </div>
            {zeroStart ? (
              <p className="mt-4 rounded-xl bg-muted/60 p-3 text-center text-sm">
                <span className="font-medium">This is your starting measurement, not a verdict.</span> 0 means we haven&apos;t proven these skills yet —
                we&apos;ve identified {readiness.perSkill.length} to work through, starting with the one above.
              </p>
            ) : (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {readiness.band.access}.{nextBand ? ` ${nextBand.label} starts at ${nextBand.min}% for this role.` : ""}
              </p>
            )}
            <div className="mt-4 flex justify-center">
              <WhyNotReady role={role} readiness={readiness} contentVersion={CONTENT_VERSION} />
            </div>
            <details className="group mt-5 border-t pt-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium [&::-webkit-details-marker]:hidden">
                Breakdown by area
                <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <dl className="mt-3 space-y-3">
                {readiness.dimensions.map((d) => {
                  const interviewNote =
                    state.interview.average !== null
                      ? `${state.interview.average}%`
                      : state.interview.answered
                        ? `${state.interview.answered} recorded, awaiting evaluation`
                        : d.note;
                  return (
                    <div key={d.dimension}>
                      <div className="flex items-baseline justify-between gap-2 text-sm">
                        <dt className="text-muted-foreground">{DIMENSION_LABELS[d.dimension]}</dt>
                        <dd className={cn("font-medium tabular-nums", d.pct === null && "text-xs font-normal text-muted-foreground")}>
                          {d.pct !== null ? `${d.pct}%` : d.dimension === "interview" ? interviewNote : d.note}
                        </dd>
                      </div>
                      {d.pct !== null ? (
                        <div className="mt-1 h-1.5 rounded-full bg-muted">
                          <div className="grow-x h-full rounded-full bg-primary/70" style={{ width: `${d.pct}%` }} />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </dl>
            </details>
          </Panel>

          <Panel
            className="rise"
            style={{ ["--i" as string]: 4 }}
            title={unlock ? "Next unlock" : "Opportunities"}
            action={
              <Link href="/jobs" className="text-xs font-medium text-primary hover:underline">
                {unlocked.length} of {matches.length} unlocked →
              </Link>
            }
          >
            {unlock ? (
              <>
                <NextUnlock unlock={unlock} />
                {unlocked.length ? (
                  <ul className="mt-4 space-y-1.5 border-t pt-3 text-sm">
                    {unlocked.slice(0, 3).map((m) => (
                      <li key={m.jobId} className="flex gap-2">
                        <LockOpen className="mt-0.5 size-3.5 shrink-0 text-emerald-600" aria-hidden />
                        <span>
                          {getJob(m.jobId)?.title}
                          <span className="text-muted-foreground"> · already open</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </>
            ) : (
              <div className="flex h-full flex-col justify-center text-center">
                <p className="text-3xl font-semibold tabular-nums">{unlocked.length}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {unlocked.length === matches.length
                    ? `Every ${role.title} opportunity is unlocked. Keep your evidence fresh to stay eligible.`
                    : "opportunities unlocked"}
                </p>
                <Link href="/jobs" className={cn(buttonVariants({ variant: "secondary" }), "mt-4 h-9")}>View opportunities</Link>
              </div>
            )}
          </Panel>
        </div>

        <Panel className="rise" style={{ ["--i" as string]: 5 }} title="Your career journey"><Journey stages={journey} /></Panel>

        <Tabs defaultValue="gaps" className="rise gap-4" style={{ ["--i" as string]: 6 }}>
          <TabsList aria-label="More detail" className="max-w-full overflow-x-auto">
            <TabsTrigger value="gaps" className="px-3">Skill gaps</TabsTrigger>
            <TabsTrigger value="skills" className="px-3">All skills</TabsTrigger>
            <TabsTrigger value="progress" className="px-3">Progress</TabsTrigger>
            <TabsTrigger value="evidence" className="px-3">Evidence</TabsTrigger>
          </TabsList>

          <TabsContent value="gaps" className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
            <Panel
              title={critical.length ? `Critical gaps (${critical.length})` : gapSkills.length ? `Skill gaps (${gapSkills.length})` : "Skill gaps"}
              action={<Link href="/plan" className="text-xs font-medium text-primary hover:underline">Open my plan →</Link>}
            >
              {gapSkills.length === 0 ? (
                <p className="text-sm text-muted-foreground">Every role skill meets its target. Keep your evidence fresh and move to final verification.</p>
              ) : (
                <>
                  <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-3 xl:grid-cols-3">
                    {shownGaps.slice(0, 3).map((s) => (
                      <SkillCard key={s.skillId} skill={s} evidence={evidence} formulaVersion={readiness.formulaVersion} />
                    ))}
                  </div>
                  {shownGaps.length > 3 ? (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Plus {shownGaps.length - 3} more — <Link href="/plan" className="text-primary hover:underline">see your full plan</Link>.
                    </p>
                  ) : null}
                </>
              )}
            </Panel>
          </TabsContent>

          <TabsContent value="skills" className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
            <Panel title="My skills vs the role target">
              <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-6 lg:grid-cols-2">
                <SkillsRadar data={readiness.perSkill.map((p) => ({ skill: p.name.length > 16 ? p.name.slice(0, 15) + "…" : p.name, level: p.level, target: p.target }))} />
                <div className="min-w-0 divide-y">
                  {readiness.perSkill.map((s) => <SkillLine key={s.skillId} skill={s} />)}
                </div>
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="progress" className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
            <Panel title="Progress">
              {snapshots.length > 1 ? (
                <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                  <ReadinessTrend data={trend} />
                  <div>
                    <dl className="space-y-1.5 text-sm">
                      {baselineScore !== undefined ? (
                        <div className="flex justify-between gap-2">
                          <dt className="text-muted-foreground">Since baseline</dt>
                          <dd className="font-semibold tabular-nums">{readiness.score - baselineScore >= 0 ? "+" : ""}{readiness.score - baselineScore} points</dd>
                        </div>
                      ) : null}
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Critical gaps</dt>
                        <dd className="font-semibold tabular-nums">{readiness.gaps.critical.length}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Assessments completed</dt>
                        <dd className="font-semibold tabular-nums">{state.completed.length}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Verified skills</dt>
                        <dd className="font-semibold tabular-nums">{readiness.perSkill.filter((p) => p.assessed && p.gap >= 0).length}</dd>
                      </div>
                    </dl>
                    <p className="mt-3 text-xs text-muted-foreground">{snapshots.length} snapshots since {shortDate(snapshots[0].createdAt)}, each versioned so past scores stay reproducible.</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Your trend appears after your next piece of evidence. Readiness only moves when evidence does — not when you study.</p>
              )}
            </Panel>
          </TabsContent>

          <TabsContent value="evidence" className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
            <div className="grid grid-cols-[minmax(0,1fr)] gap-5 md:grid-cols-2 2xl:gap-6">
              <Panel title="How strong is my evidence?">
                <p className="text-sm">
                  <span className="text-2xl font-semibold tabular-nums">{readiness.evidenceCoverage.assessed}</span>
                  <span className="text-muted-foreground"> of {readiness.evidenceCoverage.total} skills assessed</span>
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  {(["strong", "medium", "low", "none"] as const).map((k) => (
                    <li key={k} className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">{CONFIDENCE_LABELS[k]}</span>
                      <span className="font-semibold tabular-nums">{conf[k]}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-muted-foreground">Claim → assess → practise → verify. Resume claims cap at 30%; a project raises confidence on assessed skills.</p>
                {stale.length ? (
                  <p className="mt-3 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-900">
                    {stale.length} {stale.length === 1 ? "skill needs" : "skills need"} reassessment: {stale.map((s) => s.name).join(", ")}
                  </p>
                ) : null}
              </Panel>

              <Panel title="Recent evidence" action={<Link href="/evidence" className="text-xs font-medium text-primary hover:underline">All →</Link>}>
                <ul className="space-y-2.5 text-sm">
                  {evidence.slice(0, 5).map((e) => (
                    <li key={e.id} className="flex gap-2">
                      <FolderCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                      <span>
                        {bySkill.get(e.skillId)?.name ?? e.skillId}
                        {e.type === "assessment" && e.score !== null ? ` — ${Math.round(e.score)}%` : e.type === "project" ? " — project" : " — resume claim"}
                        <span className="block text-xs text-muted-foreground">{timeAgo(e.createdAt)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
