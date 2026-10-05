import Link from "next/link";
import { ArrowRight, BadgeCheck, Check, Clock, FolderCheck, FolderGit2, MessageSquare, PartyPopper, Target, TrendingUp, type LucideIcon } from "lucide-react";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { Chip, EmptyState, LevelBar } from "@/components/bits";
import { SkillEvidence } from "@/components/skill-card";
import { EvidenceLine } from "@/components/skill-row";
import { PRIORITY_LABELS, SCORED_DIMENSIONS, type Priority, type Role } from "@/content/taxonomy";
import { getPlan } from "@/content/plans";
import { skillName } from "@/content/skills";
import { timeAgo } from "@/lib/format";
import type { NextAction } from "@/lib/next-action";
import type { EvidenceItem, Readiness, SkillReadiness, SkillStatus } from "@/lib/readiness";
import { ProjectForm } from "./project-form";

export const VIEWS = ["todo", "proven", "project", "history"] as const;
export type PlanViewId = (typeof VIEWS)[number];

const PROJECT_STATE = { none: "Not started", pending: "Validation pending", recorded: "Evidence recorded" };

const GROUPS: { priority: Priority; title: string; blurb: string }[] = [
  { priority: "critical", title: "Close these first", blurb: "Critical for the role. Each one holds back opportunities and your Career Card." },
  { priority: "important", title: "Then these", blurb: "Important to the role. Worth real readiness points once proven." },
  { priority: "nice", title: "When you have time", blurb: "Nice to have. They lift you above the bar rather than over it." },
];

const PRIORITY_TONE: Record<Priority, { chip: string; edge: string }> = {
  critical: { chip: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/30", edge: "bg-rose-500" },
  important: { chip: "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30", edge: "bg-amber-500" },
  nice: { chip: "bg-muted text-muted-foreground ring-border", edge: "bg-foreground/25" },
};

const RING: Record<SkillStatus, string> = {
  meets: "stroke-emerald-500",
  close: "stroke-amber-500",
  gap: "stroke-rose-500",
  no_evidence: "stroke-foreground/25",
};

const CARD = "relative overflow-hidden rounded-3xl border border-foreground/10 bg-card shadow-sm";

type Props = {
  view: PlanViewId;
  role: Role;
  readiness: Readiness;
  evidence: EvidenceItem[];
  planDone: Set<string>;
  interview: { answered: number; scored: number };
};

/** One page for the whole loop: what to work on, what is already proven, and the proof behind both. */
export function PlanView({ view, role, readiness, evidence, planDone, interview }: Props) {
  const bySkill = new Map(readiness.perSkill.map((p) => [p.skillId, p]));
  const actions = readiness.nextActions.filter((a) => a.skillId);
  // Confidence track: the non-technical skills the role is scored on.
  const soft = readiness.perSkill.filter((p) => p.dimension !== "technical" && SCORED_DIMENSIONS.includes(p.dimension));
  const softIds = new Set(soft.map((p) => p.skillId));
  const technical = actions.filter((a) => !softIds.has(a.skillId!));
  const proven = readiness.perSkill.filter((p) => p.status === "meets");
  const project = evidence.find((e) => e.type === "project" && e.refId === role.project.id);

  const minutes = technical.reduce((n, a) => n + planMinutes(a.skillId!), 0);
  const potential = technical.reduce((n, a) => n + (a.impact?.deltaScore ?? 0), 0);

  const tabs: { id: PlanViewId; label: string; count?: number }[] = [
    { id: "todo", label: "To work on", count: actions.length },
    { id: "proven", label: "Proven", count: proven.length },
    { id: "project", label: "Project" },
    { id: "history", label: "Evidence history", count: evidence.length },
  ];

  return (
    <>
      {/* The gap shows the darker backing through as hairline dividers. */}
      <dl className="mb-5 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-foreground/10 bg-foreground/10 shadow-sm lg:grid-cols-4">
        <Stat icon={Target} label="To work on" value={String(actions.length)} hint={`${readiness.gaps.critical.length} critical`} />
        <Stat icon={BadgeCheck} label="Proven" value={`${proven.length} of ${readiness.perSkill.length}`} hint="skills at their target" />
        <Stat icon={Clock} label="Study left" value={minutes ? `~${Math.round(minutes / 60)}h` : "—"} hint="across your plans" />
        <Stat icon={TrendingUp} label="Readiness available" value={potential ? `+${potential}` : "—"} hint="if you hit every target" />
      </dl>

      <nav aria-label="Plan sections" className="mb-6 flex gap-2 overflow-x-auto scrollbar-hide">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={t.id === "todo" ? "/plan" : `/plan?view=${t.id}`}
            aria-current={t.id === view ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              t.id === view ? "bg-foreground text-background" : "bg-foreground/5 text-foreground/80 hover:bg-foreground/10",
            )}
          >
            {t.label}
            {t.count !== undefined ? <span className={cn("tabular-nums", t.id === view ? "text-background/70" : "text-muted-foreground")}>{t.count}</span> : null}
          </Link>
        ))}
      </nav>

      {view === "todo" ? (
        <div className="space-y-8">
          {actions.length === 0 ? (
            <p className={cn(CARD, "flex items-center gap-2 p-5 text-sm")}>
              <PartyPopper className="size-4 shrink-0 text-primary" aria-hidden />
              No skill gaps left. Finish your project and take the final verification.
            </p>
          ) : null}

          {GROUPS.map(({ priority, title, blurb }) => {
            const group = technical.filter((a) => bySkill.get(a.skillId!)?.priority === priority);
            if (!group.length) return null;
            return (
              <section key={priority}>
                <h2 className="font-semibold">{title} <span className="font-normal text-muted-foreground">· {group.length}</span></h2>
                <p className="mt-0.5 text-sm text-muted-foreground">{blurb}</p>
                <ul className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-2">
                  {group.map((a) => (
                    <li key={a.id}>
                      <PlanCard action={a} skill={bySkill.get(a.skillId!)!} daysDone={countDone(planDone, a.skillId!)} evidence={evidence} formulaVersion={readiness.formulaVersion} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}

          {soft.length ? (
            <section>
              <h2 className="font-semibold">Confidence &amp; communication</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">How you explain your work is scored for {role.title}, like any technical skill.</p>
              <div className={cn(CARD, "mt-4 grid grid-cols-[minmax(0,1fr)] gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center")}>
                <ul className="space-y-4">
                  {soft.map((p) => (
                    <li key={p.skillId}>
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <Link href={`/plan/${p.skillId}`} className="font-medium hover:text-primary hover:underline">{p.name}</Link>
                        <span className="tabular-nums text-muted-foreground">{p.level}% / {p.target}%</span>
                      </div>
                      <div className="mt-1.5"><LevelBar level={p.level} target={p.target} status={p.status} label={p.name} /></div>
                    </li>
                  ))}
                </ul>
                <div className="lg:w-64">
                  <p className="text-sm text-muted-foreground">
                    {interview.answered
                      ? `${interview.answered} interview answers so far${interview.scored ? `, ${interview.scored} scored` : ""}.`
                      : "Rehearse real interview questions and get told exactly what is weak. Nothing is recorded as evidence."}
                  </p>
                  <Link href="/practice/interview" className={cn(buttonVariants({ variant: "secondary" }), "mt-3 h-10 w-full")}>
                    <MessageSquare className="size-4" aria-hidden /> Practise interviews
                  </Link>
                </div>
              </div>
            </section>
          ) : null}
        </div>
      ) : null}

      {view === "proven" ? (
        proven.length ? (
          <>
            <p className="mb-4 text-sm text-muted-foreground">Skills an assessment has put at or above what {role.title} needs. Assessed evidence is valid for 12 months.</p>
            <ul className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {proven.map((p) => (
                <li key={p.skillId} className={cn(CARD, "flex items-center gap-4 p-5")}>
                  <LevelRing level={p.level} target={p.target} status={p.status} />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold">{p.name}</h3>
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-emerald-700 dark:text-emerald-400">
                      <Check className="size-3.5" aria-hidden /> {p.gap > 0 ? `${p.gap} above the ${p.target}% target` : `Meets the ${p.target}% target`}
                    </p>
                    <p className={cn("mt-0.5 text-xs", p.reassessRecommended ? "text-amber-700 dark:text-amber-400" : "text-muted-foreground")}>
                      {p.lastVerifiedAt ? `Verified ${timeAgo(p.lastVerifiedAt)}` : "Not verified"}
                      {p.reassessRecommended ? " · due for a retest" : ""}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <SkillEvidence skill={p} evidence={evidence} formulaVersion={readiness.formulaVersion} />
                      {p.reassessRecommended ? <Link href={`/assessment/skill:${p.skillId}`} className="text-xs font-medium text-primary hover:underline">Retest →</Link> : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <EmptyState icon={BadgeCheck} title="Nothing proven yet" body="A skill moves here when an assessment puts it at or above its target. Work through a plan, then take the skill's assessment." href="/plan" cta="See what to work on" />
        )
      ) : null}

      {view === "project" ? <ProjectSection role={role} project={project} /> : null}

      {view === "history" ? (
        evidence.length ? (
          <>
            <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
              Every score traces back to something here. A resume claim counts for at most 30%, an assessment sets the level, and a project is what lifts a skill above 84%.
            </p>
            <ol className={cn(CARD, "space-y-6 p-5 sm:p-6")}>
              {evidence.map((e) => (
                <li key={e.id}>
                  <p className="mb-2 text-sm font-semibold">{skillName(e.skillId)}</p>
                  <ul><EvidenceLine e={e} /></ul>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <EmptyState icon={FolderCheck} title="No evidence yet" body="Evidence comes from assessments and projects. Start with the baseline to create your first verified evidence." href={`/assessment/${encodeURIComponent(`baseline:${role.id}`)}`} cta="Start baseline assessment" />
        )
      ) : null}
    </>
  );
}

const planMinutes = (skillId: string) => getPlan(skillId)?.days.reduce((m, d) => m + d.minutes, 0) ?? 0;

function countDone(planDone: Set<string>, skillId: string) {
  return (getPlan(skillId)?.days ?? []).filter((_, i) => planDone.has(`${skillId}:${i}`)).length;
}

function Stat({ label, value, hint, icon: Icon }: { label: string; value: string; hint: string; icon: LucideIcon }) {
  return (
    <div className="bg-card p-4 sm:px-6 sm:py-5">
      <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" aria-hidden />
        {label}
      </dt>
      <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">{value}</dd>
      <dd className="text-xs text-muted-foreground">{hint}</dd>
    </div>
  );
}

/** The level as a ring; the faint arc runs on to the role's target, so the gap is the pale part. */
function LevelRing({ level, target, status }: { level: number; target: number; status: SkillStatus }) {
  const r = 26;
  const len = 2 * Math.PI * r;
  return (
    <div className="relative size-[4.5rem] shrink-0" role="img" aria-label={`${level}% of a ${target}% target`}>
      <svg viewBox="0 0 64 64" className="size-full -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" strokeWidth="6" className="stroke-foreground/10" />
        <circle cx="32" cy="32" r={r} fill="none" strokeWidth="6" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - target / 100)} className={cn(RING[status], "opacity-25")} />
        {level > 0 ? <circle cx="32" cy="32" r={r} fill="none" strokeWidth="6" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - level / 100)} className={RING[status]} /> : null}
      </svg>
      <span className="absolute inset-0 grid place-content-center text-base font-semibold tabular-nums">{level}%</span>
    </div>
  );
}

function Fact({ icon: Icon, tone, value, label }: { icon: LucideIcon; tone: string; value: string; label: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col-reverse rounded-2xl bg-foreground/[0.04] px-3 py-2.5">
      <dt className="text-xs leading-tight text-muted-foreground">{label}</dt>
      <dd className={cn("flex items-center gap-1.5 text-lg font-semibold tabular-nums leading-snug", tone)}>
        <Icon className="size-4 shrink-0" aria-hidden />
        {value}
      </dd>
    </div>
  );
}

function PlanCard({ action, skill, daysDone, evidence, formulaVersion }: { action: NextAction; skill: SkillReadiness; daysDone: number; evidence: EvidenceItem[]; formulaVersion: string }) {
  const days = getPlan(skill.skillId)?.days ?? [];
  const tone = PRIORITY_TONE[skill.priority];
  const testHref = `/assessment/skill:${skill.skillId}`;
  // Untested skills and finished plans both lead to the test: it is the only thing that moves the level.
  const toTest = action.kind === "assess" || !days.length || daysDone >= days.length;
  const unlocks = action.impact?.unlockedJobIds.length ?? 0;

  return (
    <article className={cn(CARD, "flex h-full flex-col p-5 transition-shadow hover:shadow-lg sm:p-6")}>
      <span className={cn("absolute inset-y-0 left-0 w-1", tone.edge)} aria-hidden />

      <div className="flex items-center gap-4">
        <LevelRing level={skill.level} target={skill.target} status={skill.status} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="text-lg font-semibold tracking-tight">{skill.name}</h3>
            <Chip className={tone.chip}>{PRIORITY_LABELS[skill.priority]}</Chip>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {skill.assessed ? (
              <><span className="font-semibold text-foreground">{-skill.gap} points</span> short of the {skill.target}% this role needs</>
            ) : (
              <>Not tested yet. The role needs {skill.target}%</>
            )}
          </p>
        </div>
      </div>

      <dl className="mt-5 flex gap-2">
        {action.impact ? (
          <Fact icon={TrendingUp} tone="text-emerald-700 dark:text-emerald-400" value={`+${action.impact.deltaScore}`} label={unlocks ? `readiness, unlocks ${unlocks} ${unlocks === 1 ? "job" : "jobs"}` : "readiness at target"} />
        ) : null}
        {action.blocksJobs ? (
          <Fact icon={Target} tone="text-rose-700 dark:text-rose-400" value={String(action.blocksJobs)} label={`${action.blocksJobs === 1 ? "job" : "jobs"} held back`} />
        ) : null}
        {days.length ? <Fact icon={Clock} tone="text-foreground" value={`~${Math.round(planMinutes(skill.skillId) / 60)}h`} label={`${days.length}-day plan`} /> : null}
      </dl>

      {days.length ? (
        <div className="mt-5">
          <div className="flex gap-1" role="meter" aria-valuemin={0} aria-valuemax={days.length} aria-valuenow={daysDone} aria-label={`${skill.name} plan progress`}>
            {days.map((_, i) => <span key={i} className={cn("h-1.5 flex-1 rounded-full", i < daysDone ? "bg-primary" : "bg-foreground/10")} />)}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {daysDone === 0 ? "Plan not started" : daysDone >= days.length ? "Every day practised. Time to prove it" : `${daysDone} of ${days.length} days practised`}
          </p>
        </div>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-3 pt-5">
        <Link href={toTest ? testHref : `/plan/${skill.skillId}`} className={cn(buttonVariants(), "h-10 min-w-[150px] flex-1")}>
          {toTest ? "Take the test" : daysDone ? `Continue plan · day ${daysDone + 1}` : `Start ${days.length}-day plan`}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
        <Link href={`/practice?skill=${skill.skillId}`} className="text-sm font-medium text-primary hover:underline">Practise</Link>
        {toTest ? null : <Link href={testHref} className="text-sm font-medium text-primary hover:underline">Take the test</Link>}
        <SkillEvidence skill={skill} evidence={evidence} formulaVersion={formulaVersion} label="Evidence" />
      </div>
    </article>
  );
}

function ProjectSection({ role, project }: { role: Role; project: EvidenceItem | undefined }) {
  const state = !project ? "none" : project.detail?.status === "recorded" ? "recorded" : "pending";
  return (
    <section className={cn(CARD, "p-5 sm:p-6")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="flex items-center gap-2 font-semibold"><FolderGit2 className="size-4 text-primary" aria-hidden />{role.project.title}</h2>
        <Chip
          className={
            state === "recorded"
              ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30"
              : state === "pending"
                ? "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30"
                : "bg-muted text-muted-foreground ring-border"
          }
        >
          {PROJECT_STATE[state]}
        </Chip>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        {role.project.brief} A project is the only thing that lifts a skill above 84%: questions show knowledge, a project shows you can do the work.
      </p>
      <div className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Requirements</p>
          <ul className="mt-2 space-y-1.5 text-sm">{role.project.requirements.map((r) => <li key={r}>• {r}</li>)}</ul>
          <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">Skills this evidences</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {role.project.skillIds.map((s) => <Chip key={s} className="bg-background ring-border">{skillName(s)}</Chip>)}
          </div>
        </div>
        <div>
          <ProjectForm repoUrl={project?.url ?? ""} liveUrl={project?.detail?.liveUrl ?? ""} demoUrl={project?.detail?.demoUrl ?? ""} submitted={Boolean(project)} />
          <p className="mt-3 text-xs text-muted-foreground">
            We check the repository link is real and public. Projects are not human-reviewed in this version: they satisfy jobs
            that ask for project evidence and lift the 84% ceiling on the skills they cover, but they never set a level on their own.
          </p>
        </div>
      </div>
    </section>
  );
}
