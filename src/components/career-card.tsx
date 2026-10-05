import { BadgeCheck, Check, FolderGit2 } from "lucide-react";
import { cn } from "cn";
import type { Role } from "@/content/taxonomy";
import type { EvidenceItem, Readiness } from "@/lib/readiness";
import { shortDate } from "@/lib/format";
import { LogoMark } from "./logo-mark";
import { Gauge } from "./bits";

type Status = "Ready" | "Developing" | "Not yet ready";
type Skill = Readiness["perSkill"][number];

/** The verified career identity. Same component for the private view and the public page. */
export function CareerCard({ name, headline, role, readiness, evidence, status, issuedAt }: { name: string; headline?: string; role: Role; readiness: Readiness; evidence: EvidenceItem[]; status: Status; issuedAt?: Date | null }) {
  const technical = readiness.perSkill.filter((p) => p.dimension === "technical");
  const other = readiness.perSkill.filter((p) => p.dimension !== "technical");
  const stale = readiness.perSkill.filter((p) => p.reassessRecommended);
  const project = evidence.find((e) => e.type === "project");
  const assessed = evidence.filter((e) => e.type === "assessment");
  const attemptsTaken = new Set(assessed.map((e) => e.refId).filter(Boolean)).size;
  const lastVerified = assessed[0]?.createdAt;

  return (
    <article className="overflow-hidden rounded-3xl border border-foreground/10 bg-card shadow-[0_12px_40px_-12px_rgb(0,0,0,0.18)]">
      {/* The pass: who, what for, and how ready. */}
      <header className="surface-hero overflow-hidden p-6 sm:p-9">
        <LogoMark className="pointer-events-none !absolute -bottom-16 -right-10 size-72 opacity-[0.12] saturate-0 brightness-200" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
            <span className="grid size-8 place-items-center rounded-xl bg-white"><LogoMark className="size-5" /></span>
            Career Through · Career Card
          </p>
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold", status === "Ready" ? "bg-emerald-400 text-emerald-950" : "bg-white/15 text-white ring-1 ring-inset ring-white/25")}>
            {status === "Ready" ? <BadgeCheck className="size-3.5" aria-hidden /> : null}
            {status}
          </span>
        </div>

        <div className="mt-8 grid items-end gap-8 sm:grid-cols-[1fr_auto]">
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{name}</h1>
            {headline ? <p className="mt-1.5 max-w-xl text-sm text-white/75 sm:text-base">{headline}</p> : null}
            <p className="mt-6 text-xs font-medium uppercase tracking-[0.14em] text-white/60">Target role</p>
            <p className="mt-0.5 text-xl font-semibold">{role.title}</p>
          </div>
          <div className="w-44 justify-self-start sm:justify-self-end">
            <Gauge score={readiness.score} label={readiness.band.label} light />
          </div>
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/15 pt-5 sm:grid-cols-4">
          <Figure label="Skills at target" value={`${readiness.perSkill.filter((p) => p.assessed && p.gap >= 0).length} of ${readiness.perSkill.length}`} />
          <Figure label="Assessments" value={String(attemptsTaken)} />
          <Figure label="Project" value={project ? "Submitted" : "None yet"} />
          <Figure label="Last verified" value={lastVerified ? shortDate(lastVerified) : "Not yet"} />
        </dl>
      </header>

      <div className="space-y-8 p-6 sm:p-9">
        <SkillGroup title="Role skills" skills={technical} />
        <SkillGroup title="Aptitude & workplace" skills={other} />

        {project ? (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Project</h2>
            <div className="mt-3 flex items-start gap-3 rounded-2xl border border-foreground/10 p-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><FolderGit2 className="size-4" aria-hidden /></span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{project.detail?.title}</p>
                <a href={project.url ?? "#"} target="_blank" rel="noopener noreferrer nofollow" className="mt-0.5 block break-all text-sm text-primary hover:underline">{project.url}</a>
                <p className="mt-1 text-xs text-muted-foreground">Submitted {shortDate(project.createdAt)} · link {project.detail?.status === "recorded" ? "validated" : "pending"} · not human-reviewed</p>
              </div>
            </div>
          </section>
        ) : null}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-foreground/10 bg-foreground/[0.03] px-6 py-4 text-xs text-muted-foreground sm:px-9">
        <span className="flex items-center gap-1.5">
          <BadgeCheck className="size-4 text-primary" aria-hidden />
          Levels come from timed, server-scored assessments. Interview readiness is not assessed.
        </span>
        <span>
          {stale.length ? `${stale.length} skill${stale.length === 1 ? "" : "s"} due for a retest · ` : ""}
          {issuedAt ? `Issued ${shortDate(issuedAt)} · ` : ""}
          {readiness.formulaVersion}
        </span>
      </footer>
    </article>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col-reverse">
      <dt className="text-xs text-white/60">{label}</dt>
      <dd className="text-base font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

function SkillGroup({ title, skills }: { title: string; skills: Skill[] }) {
  if (!skills.length) return null;
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{title}</h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">{skills.map((p) => <CardSkill key={p.skillId} p={p} />)}</ul>
    </section>
  );
}

function CardSkill({ p }: { p: Skill }) {
  const proven = p.assessed && p.gap >= 0;
  return (
    <li className="rounded-2xl border border-foreground/10 p-4">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "grid size-7 shrink-0 place-items-center rounded-full",
            proven ? "bg-emerald-500 text-white" : p.assessed ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" : "bg-foreground/5 text-muted-foreground",
          )}
          aria-hidden
        >
          {proven ? <Check className="size-4" strokeWidth={3} /> : <span className="size-1.5 rounded-full bg-current" />}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">{p.name}</span>
        <span className="text-base font-semibold tabular-nums">{p.level}%</span>
      </div>
      {/* Thin level bar; the notch is the role's target. */}
      <div className="relative mt-3 h-1.5 rounded-full bg-foreground/10" role="meter" aria-label={p.name} aria-valuemin={0} aria-valuemax={100} aria-valuenow={p.level} aria-valuetext={`${p.level}% of a ${p.target}% target`}>
        <div className={cn("h-full rounded-full", proven ? "bg-emerald-500" : p.assessed ? "bg-amber-500" : "bg-foreground/30")} style={{ width: `${p.level}%` }} />
        <span className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 rounded-full bg-foreground" style={{ left: `${p.target}%` }} aria-hidden />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {proven ? "Verified" : p.assessed ? `Assessed, below the ${p.target}% target` : "Self-reported, not verified"}
        {p.lastVerifiedAt ? ` · ${shortDate(p.lastVerifiedAt)}` : ""}
      </p>
    </li>
  );
}
