import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { arenaSubjectName } from "@/content/arena";
import { finishRound, getRound } from "@/lib/arena-data";
import { requireCandidate } from "@/lib/data";
import { ArenaRun } from "./run";

export const metadata: Metadata = { title: "Arena round" };

export default async function ArenaPlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { user } = await requireCandidate();
  const round = await getRound(user.id, id);
  if (!round) notFound();
  // Out of time with nothing handed in: close it (at zero) so the result page can show it.
  if (!round.finishedAt && round.expired) await finishRound(user.id, id, {});
  if (round.finishedAt || round.expired) redirect(`/arena/round/${id}`);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <ArenaRun
        roundId={round.id}
        subject={arenaSubjectName(round.subject)}
        secondsLeft={round.secondsLeft}
        practice={round.practice}
        // Answer keys and explanations stay on the server until the round is finished.
        questions={round.questions.map(({ id: qid, topic, difficulty, prompt, options }) => ({ id: qid, topic, difficulty, prompt, options }))}
      />
    </div>
  );
}
