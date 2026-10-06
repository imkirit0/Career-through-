import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Info, Trophy } from "lucide-react";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { Why } from "@/components/why";
import { ROUND, weekStart } from "@/lib/arena";
import { getBoard, getOpenRound, getRankedLeft } from "@/lib/arena-data";
import { requireCandidate } from "@/lib/data";
import { startArenaRound } from "../../actions";
import { ArenaStats, Leaderboard, ScoringRules, SubjectCards } from "./parts";

export const metadata: Metadata = { title: "Arena" };

export default async function ArenaPage() {
  const { user, role } = await requireCandidate();
  const [week, allTime, open, rankedLeft] = await Promise.all([getBoard(role.id, weekStart(), user.id), getBoard(role.id, null, user.id), getOpenRound(user.id), getRankedLeft(user.id)]);

  return (
    <>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Trophy className="size-7" aria-hidden />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Arena</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Ten questions, five minutes. Every point counts towards the {role.title} leaderboard, which resets each Monday.</p>
          </div>
        </div>
        <span className="rounded-full border border-foreground/10 bg-card/80 px-4 py-2 shadow-sm">
          <Why label="How scoring works" title="How Arena points work"><ScoringRules /></Why>
        </span>
      </header>

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

        <section className="rounded-3xl border border-foreground/10 bg-card/70 p-5 shadow-sm backdrop-blur sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight">Pick a subject</h2>
          <p className="mt-1 text-sm text-muted-foreground">Choose a topic, play a quick round, and earn points for the leaderboard.</p>
          <div className="mt-5">
            <SubjectCards start={startArenaRound} rankedLeft={rankedLeft} />
          </div>
          <p className="mt-5 flex gap-2.5 rounded-2xl bg-primary/5 px-4 py-3 text-xs text-muted-foreground">
            <Info className="mt-px size-4 shrink-0 text-primary" aria-hidden />
            Each subject has {ROUND.rankedPerSubjectPerDay} ranked rounds a day; after that you can keep playing for practice. Every subject counts towards the same board, and Arena points never change your readiness.
          </p>
        </section>

        <Leaderboard week={week} allTime={allTime} roleTitle={role.title} />
      </div>
    </>
  );
}
