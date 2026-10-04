import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, ClipboardCheck, FolderCheck, LockOpen, TrendingUp } from "lucide-react";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Chip, EmptyState, Panel, ScoreRing } from "@/components/bits";
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
import { describeActivity, localHour, streakDays } from "@/lib/activity";
import { Greeting, PlanSteps, RecentActivity } from "./parts";
import { Tour, type TourStep } from "@/components/tour";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { user, profile, role } = await requireCandidate();
  const state = await getCandidateState(user.id, profile, role);
  const { readiness, matches, evidence, snapshots, journey, baselineDone, unlock } = state;
  const baselineHref = `/assessment/${encodeURIComponent(`baseline:${role.id}`)}`;
  const first = profile.name.split(" ")[0] || "there";

  // What each part of the platform is for, in the order a student meets it. Steps whose
  // section is not on the page (the cards before a baseline, say) are left out by the tour.
  const tour: TourStep[] = [
    { id: "welcome", title: `Welcome, ${first}`, body: "This is a one-minute tour of your dashboard and what each section is for. You can replay it any time with the tour button." },
    { id: "journey", target: "#tour-journey", title: "Your career journey", body: "The stages from choosing a role to holding a Career Card. The highlighted stage is where you are now." },
    { id: "baseline", target: "#tour-baseline", title: "Start here", body: `The baseline assessment measures every ${role.title} skill, so we can show your real starting point and what to work on first.` },
    { id: "next-step", target: "[data-tour=next-step]", title: "Your next step", body: "Always the single most useful thing to do now. If you only look at one part of this page, look here." },
    { id: "readiness", target: "#tour-readiness", title: "Role readiness", body: `How close you are to ready for ${role.title}, out of 100. It only moves when you prove something in an assessment or a project, never from studying alone.` },
    { id: "plan", target: "#tour-plan", title: "Current plan", body: "The skills to work on, in order, with your level in each. The first one is what your next step is about." },
    { id: "milestone", target: "#tour-milestone", title: "Next milestone", body: "The closest opportunity you can unlock, and exactly what it still needs from you." },
    { id: "activity", target: "#tour-activity", title: "Recent activity", body: "What you have done lately. Doing something on consecutive days builds your streak." },
    { id: "nav-plan", target: "[data-tour=nav-plan]", title: "My Plan", body: "A day-by-day study plan for each skill you need to improve." },
    { id: "nav-practice", target: "[data-tour=nav-practice]", title: "Practice", body: "Drills, mock tests, interview rehearsal and code challenges. Nothing here counts against you, so it is the place to get things wrong." },
    { id: "nav-arena", target: "[data-tour=nav-arena]", title: "Arena", body: `Timed quiz rounds against other ${role.title} students, with a weekly leaderboard. It never changes your readiness.` },
    { id: "nav-assessments", target: "[data-tour=nav-assessments]", title: "Assessments", body: "Timed tests marked on the server. These are what prove a skill and move your readiness." },
    { id: "nav-evidence", target: "[data-tour=nav-evidence]", title: "Evidence", body: "Everything that backs up your skills: assessment results, projects, and what you listed on your resume." },
    { id: "nav-jobs", target: "[data-tour=nav-jobs]", title: "Jobs", body: "Opportunities that unlock as your readiness and skills reach what each one asks for." },
    { id: "nav-card", target: "[data-tour=nav-card]", title: "Career Card", body: "Your verified profile to share with recruiters. It is issued after your final verification." },
    { id: "nav-profile", target: "[data-tour=nav-profile]", title: "Profile", body: "Your details, your resume and your target role." },
    { id: "done", title: "You're set", body: baselineDone ? "Start with your next step at the top of the dashboard." : "Start with the baseline assessment: everything else builds on it." },
  ];

  const header = (
    <Greeting hour={localHour()} name={first} roleTitle={role.title} streak={streakDays(state.recent.map((e) => e.createdAt))}>
      <Tour steps={tour} storageKey="ct:tour:dashboard" />
    </Greeting>
  );

  if (!baselineDone) {
    return (
      <>
        {header}
        <Panel id="tour-journey" title="Your career journey" className="mb-5"><Journey stages={journey} /></Panel>
        <div id="tour-baseline">
        <EmptyState
          icon={ClipboardCheck}
          title="Take your baseline to see how ready you are"
          body={`Your profile is a starting claim. The baseline measures every ${role.title} skill so we can show your real readiness, your gaps and what to do first.`}
          href={baselineHref}
          cta="Start baseline assessment"
        />
        </div>
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
        {nba ? <NextMove action={nba} upNext={upNext} formulaVersion={readiness.formulaVersion} totalJobs={matches.length} /> : null}

        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:gap-6">
          <Panel id="tour-readiness" className="rise" style={{ ["--i" as string]: 3 }} title="Role readiness" action={<ReadinessWhy role={role} readiness={readiness} contentVersion={CONTENT_VERSION} />}>
            <ScoreRing score={readiness.score} label={`${role.title} readiness`} />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <Chip className="bg-secondary text-secondary-foreground ring-transparent">{readiness.band.label}</Chip>
              {delta ? (
                <Chip className={delta > 0 ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30" : "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/30"}>
                  <TrendingUp className="size-3" aria-hidden />{delta > 0 ? "+" : ""}{delta} since last assessment
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
            id="tour-plan"
            title="Current plan"
            action={<Link href="/plan" className="text-xs font-medium text-primary hover:underline">View plan →</Link>}
          >
            {readiness.nextActions.length ? (
              <>
                <PlanSteps steps={readiness.nextActions.slice(0, 5)} />
                {readiness.nextActions.length > 5 ? (
                  <p className="mt-3 text-xs text-muted-foreground">Plus {readiness.nextActions.length - 5} more in your plan.</p>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Nothing queued: every role skill meets its target.</p>
            )}
          </Panel>

          <Panel
            className="rise md:col-span-2 xl:col-span-1"
            style={{ ["--i" as string]: 5 }}
            id="tour-milestone"
            title={unlock ? "Next milestone" : "Opportunities"}
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

        <RecentActivity className="rise" style={{ ["--i" as string]: 6 }} items={describeActivity(state.recent, state.attempts).slice(0, 4)} />

        <Panel className="rise" style={{ ["--i" as string]: 7 }} title="Your career journey"><Journey stages={journey} /></Panel>

        <Tabs defaultValue="gaps" className="rise gap-4" style={{ ["--i" as string]: 8 }}>
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
