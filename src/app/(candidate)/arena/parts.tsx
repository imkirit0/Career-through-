import Link from "next/link";
import { ArrowLeft, Check, ChevronRight, Clock, Minus, Play, Trophy, X } from "lucide-react";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Panel } from "@/components/bits";
import { SubmitButton } from "@/components/pending";
import { ARENA_SUBJECTS, arenaSubjectName, type ArenaSubjectId } from "@/content/arena";
import { POINTS, ROUND, type ArenaQuestion, type RoundScore } from "@/lib/arena";
import type { Board, BoardEntry } from "@/lib/arena-data";
import { QuestionPrompt } from "./prompt";

type Start = (form: FormData) => Promise<void>;

/** The rules, in the words the result page uses. One place, so the two never disagree. */
export function ScoringRules() {
  const minutes = ROUND.seconds / 60;
  return (
    <div className="space-y-3">
      <p>Every round is {ROUND.count} questions in {minutes} minutes: {ROUND.mix[1]} easy, {ROUND.mix[2]} medium and {ROUND.mix[3]} hard, so every round can earn the same maximum.</p>
      <table className="w-full text-left text-xs">
        <tbody className="divide-y">
          <tr><th className="py-1.5 pr-3 font-medium">Correct</th><td className="py-1.5 tabular-nums text-muted-foreground">+{POINTS.right[1]} easy · +{POINTS.right[2]} medium · +{POINTS.right[3]} hard</td></tr>
          <tr><th className="py-1.5 pr-3 font-medium">Wrong</th><td className="py-1.5 tabular-nums text-muted-foreground">−{POINTS.wrong[1]} · −{POINTS.wrong[2]} · −{POINTS.wrong[3]} (guessing does not pay)</td></tr>
          <tr><th className="py-1.5 pr-3 font-medium">Skipped</th><td className="py-1.5 text-muted-foreground">0</td></tr>
          <tr><th className="py-1.5 pr-3 font-medium">Streak</th><td className="py-1.5 text-muted-foreground">+{POINTS.streak} for each correct answer straight after another</td></tr>
          <tr><th className="py-1.5 pr-3 font-medium">Speed</th><td className="py-1.5 text-muted-foreground">up to +{POINTS.speedShare * 100}% with {POINTS.speedMinCorrect} or more correct; full bonus for finishing within {ROUND.speedFullWithinSeconds / 60} minutes</td></tr>
        </tbody>
      </table>
      <p className="font-medium">What keeps the board fair</p>
      <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
        <li>Each subject gives {ROUND.rankedPerSubjectPerDay} ranked rounds a day. Every round dealt uses one, finished or not. More rounds that day are practice and score nothing.</li>
        <li>A round scores zero if it is handed in after the clock, answered faster than anyone can read ({ROUND.minSecondsPerAnswer} seconds a question), or if you leave the tab more than {ROUND.maxTabSwitches} times.</li>
        <li>You are not dealt a question you have already had until you have been through them all.</li>
        <li>Questions are dealt and marked on the server, each round counts once, and a round never scores below zero.</li>
      </ul>
      <p className="text-xs text-muted-foreground">Arena points are for the leaderboard only: they never change your readiness.</p>
    </div>
  );
}

export function ArenaStats({ week }: { week: Board }) {
  const you = week.you;
  const tiles = [
    { label: "Points this week", value: String(you?.points ?? 0), sub: you ? "resets Monday" : "play a round to get on the board" },
    { label: "Your rank", value: you ? `#${you.rank}` : "—", sub: you ? `of ${week.players} this week` : week.players ? `${week.players} ranked so far` : "nobody is ranked yet" },
    { label: "Rounds this week", value: String(you?.rounds ?? 0), sub: `${ROUND.count} questions · ${ROUND.seconds / 60} minutes each` },
  ];
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-3">
      {tiles.map((t) => (
        <div key={t.label} className="card-soft p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t.label}</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">{t.value}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{t.sub}</p>
        </div>
      ))}
    </div>
  );
}

export function SubjectCards({ start, rankedLeft }: { start: Start; rankedLeft: Record<ArenaSubjectId, number> }) {
  return (
    <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {ARENA_SUBJECTS.map((s) => {
        const left = rankedLeft[s.id];
        return (
          <li key={s.id} className="flex flex-col rounded-2xl border border-foreground/10 bg-card/60 p-4">
            <p className="font-semibold">{s.name}</p>
            <p className="mt-1 flex-1 text-sm text-muted-foreground">{s.blurb}</p>
            <p className={cn("mt-3 text-xs font-medium", left ? "text-primary" : "text-muted-foreground")}>
              {left ? `${left} ranked round${left === 1 ? "" : "s"} left today` : "Today's ranked rounds are used. Practice only until tomorrow."}
            </p>
            <form action={start} className="mt-2">
              <input type="hidden" name="subject" value={s.id} />
              <SubmitButton variant={left ? "default" : "outline"} className="h-10 w-full" pendingLabel="Dealing…">
                <Play className="size-4" aria-hidden /> {left ? "Play" : "Play for practice"}
              </SubmitButton>
            </form>
          </li>
        );
      })}
    </ul>
  );
}

function BoardRows({ board, empty }: { board: Board; empty: string }) {
  if (!board.top.length) return <p className="py-6 text-center text-sm text-muted-foreground">{empty}</p>;
  const outside = board.you && !board.top.some((e) => e.you) ? board.you : null;
  const row = (e: BoardEntry) => (
    <li key={`${e.rank}-${e.name}`} aria-current={e.you ? "true" : undefined} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm", e.you && "bg-primary/10 font-semibold")}>
      <span className={cn("grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold tabular-nums", e.rank <= 3 ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300" : "bg-foreground/5 text-muted-foreground")}>{e.rank}</span>
      <span className="min-w-0 flex-1 truncate">{e.name}{e.you ? " (you)" : ""}</span>
      <span className="hidden shrink-0 text-xs font-normal text-muted-foreground sm:inline">{e.rounds} round{e.rounds === 1 ? "" : "s"} · {Math.round(e.points / Math.max(e.rounds, 1))} a round</span>
      <span className="w-16 shrink-0 text-right tabular-nums">{e.points}</span>
    </li>
  );
  return (
    <ol className="space-y-0.5">
      {board.top.map(row)}
      {outside ? (
        <>
          <li aria-hidden className="px-3 text-muted-foreground">…</li>
          {row(outside)}
        </>
      ) : null}
    </ol>
  );
}

export function Leaderboard({ week, allTime, roleTitle }: { week: Board; allTime: Board; roleTitle: string }) {
  return (
    <Panel title={`${roleTitle} leaderboard`}>
      <Tabs defaultValue="week" className="gap-3">
        <TabsList aria-label="Leaderboard period">
          <TabsTrigger value="week" className="px-3">This week</TabsTrigger>
          <TabsTrigger value="all" className="px-3">All time</TabsTrigger>
        </TabsList>
        <TabsContent value="week"><BoardRows board={week} empty="Nobody has scored this week yet. Play a round and take first place." /></TabsContent>
        <TabsContent value="all"><BoardRows board={allTime} empty="Nobody has scored yet. Play a round and take first place." /></TabsContent>
      </Tabs>
    </Panel>
  );
}

export function RoundResultView({
  subject,
  points,
  score,
  questions,
  answers,
  week,
  roleTitle,
  start,
}: {
  subject: string;
  points: number;
  score: Omit<RoundScore, "marks"> | null;
  questions: ArenaQuestion[];
  answers: Record<string, number>;
  week: Board;
  roleTitle: string;
  start: Start;
}) {
  const voided = score?.voided ?? (score?.late ? "late" : null);
  const earned = score?.earned ?? points;
  const lines = score
    ? [
        { label: `${score.correct} correct`, value: score.base, sign: "+" },
        { label: `${score.wrong} wrong`, value: score.penalty, sign: "−" },
        { label: "Streak bonus", value: score.streak, sign: "+" },
        { label: "Speed bonus", value: score.speed, sign: "+" },
      ]
    : [];
  return (
    <div className="space-y-5">
      <section className="surface-hero overflow-hidden rounded-3xl p-7 sm:p-9">
        <p className="text-sm text-white/80">{arenaSubjectName(subject)} {score?.practice ? "practice round" : "round"}</p>
        <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/70">Points</p>
            <p className="mt-1 text-6xl font-semibold tabular-nums tracking-tight">{score?.practice ? earned : points}</p>
            <p className="mt-1 text-white/85">{score ? `${score.correct} of ${questions.length} correct${score.skipped ? ` · ${score.skipped} skipped` : ""}` : "Round closed"}</p>
          </div>
          <div className="sm:border-l sm:border-white/20 sm:pl-6">
            <p className="text-xs font-medium uppercase tracking-wider text-white/70">This week</p>
            <p className="mt-1 text-4xl font-semibold tabular-nums tracking-tight">{week.you ? `#${week.you.rank}` : "Unranked"}</p>
            <p className="mt-1 text-white/85">
              {week.you ? `${week.you.points} points among ${week.players} ${roleTitle} student${week.players === 1 ? "" : "s"}.` : "Score points in a round to get on the board."}
            </p>
          </div>
        </div>
      </section>

      {voided ? (
        <p role="status" className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <Clock className="mt-0.5 size-4 shrink-0" aria-hidden />
          {voided === "late"
            ? "This round was handed in after the clock ran out, so it scores zero."
            : voided === "too_fast"
              ? "This round was answered faster than the questions can be read, so it scores zero."
              : `You left the tab ${score?.tabSwitches ?? "several"} times during this round, so it scores zero.`}{" "}
          Your answers are still reviewed below.
        </p>
      ) : score?.practice ? (
        <p role="status" className="flex gap-2 rounded-xl border border-foreground/10 bg-foreground/5 p-3 text-sm">
          <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          This was a practice round: today&apos;s ranked rounds for this subject were already used, so these points are not on the leaderboard.
        </p>
      ) : null}

      {score && !voided ? (
        <Panel title="How the points add up">
          <dl className="space-y-1.5 text-sm">
            {lines.map((l) => (
              <div key={l.label} className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{l.label}</dt>
                <dd className="font-medium tabular-nums">{l.value ? `${l.sign}${l.value}` : "0"}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-3 border-t pt-2 font-semibold">
              <dt>Round total{score.base - score.penalty + score.streak + score.speed < 0 ? " (never below zero)" : ""}</dt>
              <dd className="tabular-nums">{earned}</dd>
            </div>
          </dl>
        </Panel>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <form action={start}>
          <input type="hidden" name="subject" value={subject} />
          <SubmitButton className="h-11 px-6 text-base" pendingLabel="Dealing…"><Play className="size-4" aria-hidden /> Play again</SubmitButton>
        </form>
        <Link href="/arena" className={cn(buttonVariants({ variant: "outline" }), "h-11 px-5 text-base")}><Trophy className="size-4" aria-hidden /> Leaderboard</Link>
      </div>

      <Panel title="Review your answers">
        <ul className="space-y-1.5">
          {questions.map((q, n) => {
            const choice = answers[q.id];
            const right = choice === q.answer;
            const skipped = choice === undefined;
            return (
              <li key={q.id}>
                <details className="group rounded-xl border border-foreground/10 bg-card/50">
                  <summary className="flex cursor-pointer list-none items-center gap-3 p-3 text-sm [&::-webkit-details-marker]:hidden">
                    <span className={cn("grid size-6 shrink-0 place-items-center rounded-full", right ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : skipped ? "bg-foreground/10 text-muted-foreground" : "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300")}>
                      {right ? <Check className="size-3.5" aria-label="Correct" /> : skipped ? <Minus className="size-3.5" aria-label="Skipped" /> : <X className="size-3.5" aria-label="Wrong" />}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium">{n + 1}. {q.topic}</span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" aria-hidden />
                  </summary>
                  <div className="space-y-3 border-t border-foreground/10 p-4">
                    <QuestionPrompt prompt={q.prompt} />
                    <ul className="space-y-1.5 text-sm">
                      {q.options.map((option, i) => (
                        <li key={i} className={cn("flex items-start gap-2 rounded-lg px-3 py-2", i === q.answer ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-200" : i === choice ? "bg-rose-50 text-rose-900 dark:bg-rose-500/10 dark:text-rose-200" : "text-muted-foreground")}>
                          <span className="font-semibold">{"ABCD"[i]}</span>
                          <span className="min-w-0 flex-1 whitespace-pre-wrap break-words">{option}</span>
                          {i === q.answer ? <span className="shrink-0 text-xs font-medium">correct answer</span> : i === choice ? <span className="shrink-0 text-xs font-medium">your answer</span> : null}
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm text-muted-foreground">{q.explanation}</p>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Link href="/arena" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> Back to the Arena
      </Link>
    </div>
  );
}
