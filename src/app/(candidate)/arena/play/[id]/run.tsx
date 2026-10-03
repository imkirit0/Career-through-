"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/pending";
import type { ArenaPublicQuestion } from "@/lib/arena";
import { finishArenaRound } from "../../../../actions";
import { QuestionPrompt } from "../../prompt";

const LEVEL = { 1: "Easy", 2: "Medium", 3: "Hard" } as const;
const noop = () => () => {};

/**
 * One round, one question per screen. Nothing here decides the score: the clock shown is a
 * courtesy (the server keeps its own), and only the choices are sent when the round ends.
 */
export function ArenaRun({ roundId, subject, questions, secondsLeft }: { roundId: string; subject: string; questions: ArenaPublicQuestion[]; secondsLeft: number }) {
  const router = useRouter();
  const storageKey = `arena:${roundId}`;
  // False on the server and while hydrating, so choices restored from the tab's storage never mismatch the server's HTML.
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const [answers, setAnswers] = useState<Record<string, number>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(window.sessionStorage.getItem(storageKey) ?? "{}");
    } catch {
      return {};
    }
  });
  const [index, setIndex] = useState(0);
  const [deadline] = useState(() => Date.now() + secondsLeft * 1000);
  const [left, setLeft] = useState(secondsLeft);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const sent = useRef(false);

  const q = questions[index];
  const isLast = index + 1 === questions.length;
  const answered = questions.filter((x) => answers[x.id] !== undefined).length;

  const finish = useCallback(() => {
    if (sent.current) return;
    sent.current = true;
    setError(null);
    start(async () => {
      try {
        const res = await finishArenaRound({ roundId, answers });
        if ("error" in res) {
          sent.current = false;
          setError(res.error);
          return;
        }
        window.sessionStorage.removeItem(storageKey);
        router.replace(`/arena/round/${roundId}`);
      } catch {
        sent.current = false;
        setError("We couldn't reach the server. Your choices are kept: try again.");
      }
    });
  }, [roundId, answers, router, storageKey]);

  useEffect(() => {
    const t = setInterval(() => setLeft(Math.max(Math.ceil((deadline - Date.now()) / 1000), 0)), 500);
    return () => clearInterval(t);
  }, [deadline]);

  // Time is up: hand in whatever has been chosen.
  useEffect(() => {
    if (left === 0) finish();
  }, [left, finish]);

  function choose(option: number) {
    // Choosing the same option again clears it: a skip costs nothing, a wrong answer does.
    const { [q.id]: current, ...rest } = answers;
    const next = current === option ? rest : { ...rest, [q.id]: option };
    setAnswers(next);
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Storage is a convenience for a refresh; the round works without it.
    }
  }

  if (!mounted) return <div className="card-soft h-96 animate-pulse" aria-hidden />;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{subject} · Question {index + 1} of {questions.length}</p>
        <p
          role="timer"
          aria-label={`${Math.floor(left / 60)} minutes ${left % 60} seconds left`}
          className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold tabular-nums", left <= 30 ? "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300" : "bg-secondary text-secondary-foreground")}
        >
          <Clock className="size-4" aria-hidden />
          {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
        </p>
      </div>

      <nav aria-label="Questions" className="mb-4 flex flex-wrap gap-1.5">
        {questions.map((x, i) => (
          <button
            key={x.id}
            onClick={() => setIndex(i)}
            aria-current={i === index ? "step" : undefined}
            aria-label={`Question ${i + 1}${answers[x.id] !== undefined ? ", answered" : ""}`}
            className={cn(
              "grid size-8 place-items-center rounded-full text-xs font-semibold tabular-nums transition-colors",
              i === index ? "bg-primary text-primary-foreground" : answers[x.id] !== undefined ? "bg-primary/15 text-primary" : "bg-foreground/5 text-muted-foreground hover:bg-foreground/10",
            )}
          >
            {i + 1}
          </button>
        ))}
      </nav>

      <section className="card-soft p-5 sm:p-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{q.topic} · {LEVEL[q.difficulty]}</p>
        <QuestionPrompt prompt={q.prompt} />
        <div role="radiogroup" aria-label="Answers" className="mt-5 space-y-2.5">
          {q.options.map((option, i) => {
            const picked = answers[q.id] === i;
            return (
              <button
                key={i}
                role="radio"
                aria-checked={picked}
                onClick={() => choose(i)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-sm transition-colors",
                  picked ? "border-primary bg-primary/10" : "border-foreground/10 bg-card/60 hover:border-primary/40",
                )}
              >
                <span className={cn("grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold", picked ? "bg-primary text-primary-foreground" : "bg-foreground/10 text-muted-foreground")}>
                  {"ABCD"[i]}
                </span>
                <span className="min-w-0 whitespace-pre-wrap break-words pt-0.5">{option}</span>
              </button>
            );
          })}
        </div>
      </section>

      {error ? <p role="alert" className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">{error}</p> : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" className="h-10 px-4" disabled={index === 0 || pending} onClick={() => setIndex(index - 1)}>Back</Button>
        <p className="text-xs text-muted-foreground">{answered} of {questions.length} answered · skipping is free, a wrong answer costs points</p>
        {isLast ? (
          <Button className="h-10 px-5" disabled={pending} onClick={finish}>{pending ? <Spinner /> : null} Finish round</Button>
        ) : (
          <Button className="h-10 px-5" disabled={pending} onClick={() => setIndex(index + 1)}>{answers[q.id] === undefined ? "Skip" : "Next"}</Button>
        )}
      </div>
    </div>
  );
}
