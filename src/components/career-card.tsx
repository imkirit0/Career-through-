import { BadgeCheck, Check, FolderGit2 } from "lucide-react";
import { cn } from "cn";
import type { BandId, Role } from "@/content/taxonomy";
import type { EvidenceItem, Readiness } from "@/lib/readiness";
import { shortDate } from "@/lib/format";
import { LogoMark } from "./logo-mark";

type Status = "Ready" | "Developing" | "Not yet ready";
type Skill = Readiness["perSkill"][number];

/** Card tier follows the readiness band, the way a player card's colour follows the rating. */
const TIER: Record<BandId, { name: string; face: string; ink: string; dim: string; line: string }> = {
  foundation: { name: "Bronze", face: "linear-gradient(160deg,#c98b5a 0%,#8a5a33 45%,#b97b4c 70%,#6f4425 100%)", ink: "text-[#2a160a]", dim: "text-[#2a160a]/60", line: "bg-[#2a160a]/25" },
  developing: { name: "Silver", face: "linear-gradient(160deg,#eef1f4 0%,#aeb6bf 45%,#d7dde3 70%,#8d96a0 100%)", ink: "text-[#1b2129]", dim: "text-[#1b2129]/60", line: "bg-[#1b2129]/20" },
  entry_ready: { name: "Gold", face: "linear-gradient(160deg,#f6e27a 0%,#d4a92c 45%,#f1d56b 70%,#a97f16 100%)", ink: "text-[#2b1f05]", dim: "text-[#2b1f05]/60", line: "bg-[#2b1f05]/20" },
  strong: { name: "Gold", face: "linear-gradient(160deg,#f6e27a 0%,#d4a92c 45%,#f1d56b 70%,#a97f16 100%)", ink: "text-[#2b1f05]", dim: "text-[#2b1f05]/60", line: "bg-[#2b1f05]/20" },
  highly_ready: { name: "Elite", face: "linear-gradient(160deg,#2a1b5e 0%,#120a33 40%,#4b2aa6 75%,#0b0620 100%)", ink: "text-white", dim: "text-white/60", line: "bg-white/25" },
};

/** Short codes for the six stat slots, like a player card's PAC/SHO/PAS. */
const CODE: Record<string, string> = {
  sql: "SQL", python: "PY", excel: "XLS", statistics: "STA", "data-viz": "VIZ", "data-cleaning": "CLN",
  "html-css": "HTM", javascript: "JS", react: "RCT", typescript: "TS", "web-apis": "WEB", git: "GIT",
  "programming-fundamentals": "PRG", "api-design": "API", "auth-security": "SEC", "testing-basics": "TST", "system-design": "SYS",
  "manual-testing": "MAN", "test-case-design": "TCD", "sdlc-stlc": "SDL", "api-testing": "APT", "bug-reporting": "BUG", "test-automation": "AUT",
  linux: "LNX", "ci-cd": "CI", docker: "DKR", "cloud-fundamentals": "CLD", networking: "NET", iac: "IAC", monitoring: "MON",
  "apt-numerical": "NUM", "apt-logical": "LOG", "comm-written": "COM", "soft-workplace": "WRK",
};
const POSITION: Record<string, string> = { "data-analyst": "DA", "frontend-developer": "FE", "backend-developer": "BE", "qa-engineer": "QA", "devops-engineer": "OPS" };
const RANK = { critical: 0, important: 1, nice: 2 };

// Shield outline for a 320×470 card: straight sides, tapering to a rounded point.
const SHIELD = "path('M 26 0 H 294 Q 320 0 320 26 V 356 Q 320 392 292 406 L 178 464 Q 160 472 142 464 L 28 406 Q 0 392 0 356 V 26 Q 0 0 26 0 Z')";

/** The verified career identity. Same component for the private view and the public page. */
export function CareerCard({ name, headline, role, readiness, evidence, status, issuedAt }: { name: string; headline?: string; role: Role; readiness: Readiness; evidence: EvidenceItem[]; status: Status; issuedAt?: Date | null }) {
  const technical = readiness.perSkill.filter((p) => p.dimension === "technical");
  const other = readiness.perSkill.filter((p) => p.dimension !== "technical");
  const stale = readiness.perSkill.filter((p) => p.reassessRecommended);
  const project = evidence.find((e) => e.type === "project");
  const assessed = evidence.filter((e) => e.type === "assessment");
  const lastVerified = assessed[0]?.createdAt;
  const atTarget = readiness.perSkill.filter((p) => p.assessed && p.gap >= 0).length;

  return (
    <div className="grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start">
      <PlayerCard name={name} role={role} readiness={readiness} lastVerified={lastVerified} />

      <article className="overflow-hidden rounded-3xl border border-foreground/10 bg-card shadow-sm">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-foreground/10 p-6 sm:p-8">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{name}</h1>
            {headline ? <p className="mt-1 text-sm text-muted-foreground sm:text-base">{headline}</p> : null}
            <p className="mt-3 text-sm"><span className="text-muted-foreground">Target role · </span><span className="font-semibold">{role.title}</span></p>
          </div>
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset", status === "Ready" ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30" : "bg-foreground/5 text-foreground/80 ring-foreground/10")}>
            {status === "Ready" ? <BadgeCheck className="size-3.5" aria-hidden /> : null}
            {status}
          </span>
        </header>

        <dl className="grid grid-cols-2 gap-px border-b border-foreground/10 bg-foreground/10 sm:grid-cols-4">
          <Figure label="Readiness" value={`${readiness.score} · ${readiness.band.label}`} />
          <Figure label="Skills at target" value={`${atTarget} of ${readiness.perSkill.length}`} />
          <Figure label="Project" value={project ? "Submitted" : "None yet"} />
          <Figure label="Last verified" value={lastVerified ? shortDate(lastVerified) : "Not yet"} />
        </dl>

        <div className="space-y-8 p-6 sm:p-8">
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

        <footer className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-foreground/10 bg-foreground/[0.03] px-6 py-4 text-xs text-muted-foreground sm:px-8">
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
    </div>
  );
}

/**
 * The collectible: readiness as the overall rating, the role as the position, the six
 * skills that matter most as the stats, and a tier colour set by the readiness band.
 */
function PlayerCard({ name, role, readiness, lastVerified }: { name: string; role: Role; readiness: Readiness; lastVerified?: Date }) {
  const tier = TIER[readiness.band.id];
  const stats = [...readiness.perSkill].sort((a, b) => RANK[a.priority] - RANK[b.priority] || b.weight - a.weight || a.name.localeCompare(b.name)).slice(0, 6);
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "?";
  const position = POSITION[role.id] ?? role.title.split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 3);

  return (
    <div className="mx-auto w-[320px] drop-shadow-[0_24px_40px_rgba(0,0,0,0.28)] lg:sticky lg:top-6" role="img" aria-label={`${name}, ${role.title}, readiness ${readiness.score} of 100, ${tier.name} tier`}>
      <div className={cn("relative h-[470px] w-[320px] select-none font-heading", tier.ink)} style={{ clipPath: SHIELD, background: tier.face }}>
        {/* Light: a sheen across the face and a soft glow behind the badge. */}
        <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(115deg,rgba(255,255,255,0) 35%,rgba(255,255,255,0.28) 50%,rgba(255,255,255,0) 65%)" }} aria-hidden />
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(60% 40% at 62% 36%,rgba(255,255,255,0.22),transparent 70%)" }} aria-hidden />
        <div className={cn("pointer-events-none absolute inset-x-[7%] top-[46%] h-px", tier.line)} aria-hidden />

        {/* Rating and position, as a player card's overall and position. */}
        <div className="absolute left-7 top-7 text-center leading-none">
          <p className="text-[64px] font-bold tabular-nums tracking-tighter" aria-hidden>{readiness.score}</p>
          <p className="mt-1 text-lg font-semibold tracking-[0.2em]" aria-hidden>{position}</p>
          <div className={cn("mx-auto my-3 h-px w-10", tier.line)} />
          <span className="mx-auto grid size-10 place-items-center rounded-xl bg-white/85 shadow-sm"><LogoMark className="size-7" /></span>
        </div>

        {/* The candidate, as a monogram where the player's picture would be. */}
        <div className="absolute right-6 top-14 grid size-[150px] place-items-center rounded-full bg-white/20 ring-2 ring-white/40" aria-hidden>
          <span className="text-[72px] font-bold tracking-tight">{initials}</span>
        </div>

        <div className="absolute inset-x-0 top-[47%] text-center" aria-hidden>
          <p className="truncate px-8 text-[22px] font-bold uppercase tracking-[0.12em]">{name}</p>
          <p className={cn("mt-0.5 text-[11px] font-semibold uppercase tracking-[0.22em]", tier.dim)}>{role.title}</p>
        </div>

        <dl className="absolute inset-x-9 top-[59%] grid grid-cols-2 gap-x-4 gap-y-1 text-[17px] leading-7" aria-hidden>
          {stats.map((p) => (
            <div key={p.skillId} className="flex items-center gap-2 border-b border-current/10 last:border-0 [&:nth-last-child(2)]:border-0">
              <dd className="w-9 text-right font-bold tabular-nums">{p.level}</dd>
              <dt className="flex-1 text-[13px] font-semibold tracking-[0.12em]">{CODE[p.skillId] ?? p.skillId.slice(0, 3).toUpperCase()}</dt>
              {p.assessed && p.gap >= 0 ? <Check className="size-3.5 opacity-80" strokeWidth={3} /> : null}
            </div>
          ))}
        </dl>

        <p className={cn("absolute inset-x-0 bottom-[68px] text-center text-[10px] font-semibold uppercase tracking-[0.2em]", tier.dim)} aria-hidden>
          {tier.name} · {readiness.band.label}{lastVerified ? ` · ${shortDate(lastVerified)}` : ""}
        </p>
      </div>
    </div>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col-reverse bg-card px-6 py-4 sm:px-8">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-semibold tabular-nums">{value}</dd>
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
