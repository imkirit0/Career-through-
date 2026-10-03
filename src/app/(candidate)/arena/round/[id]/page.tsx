import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { weekStart } from "@/lib/arena";
import { getBoard, getRound } from "@/lib/arena-data";
import { requireCandidate } from "@/lib/data";
import { startArenaRound } from "../../../../actions";
import { RoundResultView } from "../../parts";

export const metadata: Metadata = { title: "Arena result" };

export default async function ArenaRoundPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { user, role } = await requireCandidate();
  const round = await getRound(user.id, id);
  if (!round) notFound();
  // Still being played: answers are not shown until it is handed in.
  if (!round.finishedAt) redirect(`/arena/play/${id}`);
  const week = await getBoard(role.id, weekStart(), user.id);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <RoundResultView subject={round.subject} points={round.points} score={round.score} questions={round.questions} answers={round.answers ?? {}} week={week} roleTitle={role.title} start={startArenaRound} />
    </div>
  );
}
