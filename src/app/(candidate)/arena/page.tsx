import type { Metadata } from "next";
import Link from "next/link";
import { Clock } from "lucide-react";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader, Panel } from "@/components/bits";
import { Why } from "@/components/why";
import { weekStart } from "@/lib/arena";
import { getBoard, getOpenRound } from "@/lib/arena-data";
import { requireCandidate } from "@/lib/data";
import { startArenaRound } from "../../actions";
import { ArenaStats, Leaderboard, ScoringRules, SubjectCards } from "./parts";

export const metadata: Metadata = { title: "Arena" };

export default async function ArenaPage() {
  const { user, role } = await requireCandidate();
  const [week, allTime, open] = await Promise.all([getBoard(role.id, weekStart(), user.id), getBoard(role.id, null, user.id), getOpenRound(user.id)]);

  return (
    <>
      <PageHeader title="Arena" subtitle={`Ten questions, five minutes. Every point counts towards the ${role.title} leaderboard, which resets each Monday.`}>
        <Why label="How scoring works" title="How Arena points work"><ScoringRules /></Why>
      </PageHeader>

      <div className="space-y-5">
        {open ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-4">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Clock className="size-4 text-primary" aria-hidden />
              You have a round in progress and its clock is running.
            </p>
            <Link href={`/arena/play/${open.id}`} className={cn(buttonVariants(), "h-9 px-4")}>Resume round</Link>
          </div>
        ) : null}

        <ArenaStats week={week} />

        <Panel title="Pick a subject">
          <SubjectCards start={startArenaRound} />
          <p className="mt-4 text-xs text-muted-foreground">Any subject counts towards the same board. Arena points never change your readiness.</p>
        </Panel>

        <Leaderboard week={week} allTime={allTime} roleTitle={role.title} />
      </div>
    </>
  );
}
