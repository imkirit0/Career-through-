import Link from "next/link";
import { BadgeCheck, BriefcaseBusiness, CalendarCheck, ClipboardCheck, Code2, Dumbbell, Flame, FolderCheck, ListChecks, Mic, Trophy, UserCheck, type LucideIcon } from "lucide-react";
import { cn } from "cn";
import { Panel } from "@/components/bits";
import type { ActivityItem, ActivityKind } from "@/lib/activity";
import { timeAgo } from "@/lib/format";
import type { NextAction } from "@/lib/next-action";

/** "Improve SQL" and "Verify SQL" are both about SQL: the plan lists the thing, not the verb. */
export const moveLabel = (a: NextAction) => a.title.replace(/^(Improve|Verify) /, "");

export function Greeting({ hour, name, roleTitle, streak }: { hour: number; name: string; roleTitle: string; streak: number }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{hour < 12 ? "Good morning," : hour < 17 ? "Good afternoon," : "Good evening,"}</p>
        <h1 className="rise mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
          Welcome back, <span className="text-gradient-primary">{name}</span>
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
          You&apos;re working towards <span className="font-semibold text-foreground">{roleTitle}</span>.
        </p>
      </div>
      {streak > 0 ? (
        <div className="rise flex items-center gap-3 rounded-2xl border border-foreground/10 bg-card/70 px-4 py-3 shadow-sm backdrop-blur" style={{ ["--i" as string]: 1 }}>
          <CalendarCheck className="size-6 text-muted-foreground" aria-hidden />
          <div>
            <p className="text-sm font-semibold tabular-nums">{streak} day streak</p>
            <p className="text-xs text-muted-foreground">{streak === 1 ? "Come back tomorrow to keep it" : "Keep going!"}</p>
          </div>
          <span className="grid size-9 place-items-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
            <Flame className="size-5" aria-hidden />
          </span>
        </div>
      ) : null}
    </header>
  );
}

/** The queue of moves as a short vertical path: the first is what the hero is about. */
export function PlanSteps({ steps }: { steps: NextAction[] }) {
  return (
    <ol className="relative before:absolute before:bottom-5 before:left-[15px] before:top-5 before:w-px before:bg-foreground/20">
      {steps.map((a, n) => (
        <li key={a.id}>
          <Link
            href={a.href}
            aria-current={n === 0 ? "step" : undefined}
            className={cn("relative flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm transition-colors hover:bg-foreground/5", n === 0 && "bg-primary/10 hover:bg-primary/15")}
          >
            <span className={cn("relative grid size-4 shrink-0 place-items-center rounded-full", n === 0 ? "bg-primary ring-4 ring-primary/20" : "bg-muted-foreground/40 ring-4 ring-background")}>
              {n === 0 ? <span className="size-1.5 rounded-full bg-white" /> : null}
            </span>
            <span className={cn("min-w-0 flex-1 truncate", n === 0 ? "font-semibold" : "font-medium text-foreground/80")}>{moveLabel(a)}</span>
            <span className="shrink-0 tabular-nums text-muted-foreground">{a.current !== null ? `${a.current}%` : "—"}</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

const ACTIVITY_ICON: Record<ActivityKind, [LucideIcon, string]> = {
  assessment: [ClipboardCheck, "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"],
  practice: [Dumbbell, "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300"],
  code: [Code2, "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"],
  arena: [Trophy, "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"],
  interview: [Mic, "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"],
  plan: [ListChecks, "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"],
  project: [FolderCheck, "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"],
  job: [BriefcaseBusiness, "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"],
  card: [BadgeCheck, "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"],
  profile: [UserCheck, "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300"],
};

export function RecentActivity({ items, className, style }: { items: ActivityItem[]; className?: string; style?: React.CSSProperties }) {
  if (!items.length) return null;
  return (
    <Panel title="Recent activity" className={className} style={style}>
      <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        {items.map((item, n) => {
          const [Icon, tone] = ACTIVITY_ICON[item.kind];
          return (
            <li key={n}>
              <Link href={item.href} className="flex items-center gap-3 rounded-2xl border border-foreground/10 bg-card/60 p-3 transition-colors hover:border-primary/30 hover:bg-card">
                <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", tone)}><Icon className="size-5" aria-hidden /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{item.title}</span>
                  <span className="flex items-baseline justify-between gap-2 text-xs text-muted-foreground">
                    <span className="truncate">{item.detail}</span>
                    <span className="shrink-0">{timeAgo(item.at)}</span>
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
