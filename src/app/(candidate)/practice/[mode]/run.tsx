"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Clock, TriangleAlert, X } from "lucide-react";
import { cn } from "cn";
import { Button, buttonVariants } from "@/components/ui/button";
import { LinkArrow, Spinner } from "@/components/pending";
import { PRACTICE_MODES, type PracticeMode } from "@/lib/practice";
import { checkPractice, finishPractice, type PracticeCheck, type PracticeReview } from "../../../actions";

type Q = { id: string; topic: string; prompt: string; options: string[] };
type Checked = Exclude<PracticeCheck, { error: string }>;
type Result = Exclude<PracticeReview, { error: string }>;

const mmss = (s: number) => `${Math.floor(Math.max(s, 0) / 60)}:${String(Math.max(s, 0) % 60).padStart(2, "0")}`;

/**
 * One question per screen. A drill explains each answer as you go; a mock test holds
 * everything back until the end, against a clock. Neither is recorded as evidence.
 */
export function PracticeRun({ mode, skillId, skillName, questions: served }: { mode: PracticeMode; skillId: string; skillName: string; questions: Q[] }) {
  const router = useRouter();
  const { label, minutes } = PRACTICE_MODES[mode];
  // Held from mount: a server re-render must not swap the questions under the student.
  const [questions] = useState(served);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState<Record<string, Checked>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [left, setLeft] = useState((minutes ?? 0) * 60);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const timedOut = useRef(false);

  const q = questions[index];
  const choice = answers[q.id];
  const feedback = checked[q.id];
  const isLast = index + 1 === questions.length;

  const finish = useCallback(() => {
    setError(null);
    start(async () => {
      try {
        const res = await finishPractice({ mode, skillId, questionIds: questions.map((x) => x.id), answers });
        if ("error" in res) setError(res.error);
        else setResult(res);
      } catch {
        setError("We couldn't reach the server. Try again.");
      }
    });
  }, [mode, skillId, questions, answers]);

  function check() {
    setError(null);
    start(async () => {
      try {
        const res = await checkPractice({ questionId: q.id, choice });
        if ("error" in res) setError(res.error);
        else setChecked((c) => ({ ...c, [q.id]: res }));
      } catch {
        setError("We couldn't reach the server. Try again.");
      }
    });
  }

  const timed = minutes !== null && !result;
  useEffect(() => {
    if (!timed) return;
    const t = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [timed]);

  useEffect(() => {
    if (timed && left <= 0 && !timedOut.current) {
      timedOut.current = true;
      finish();
    }
  }, [timed, left, finish]);

  if (result) {
    const missed = [...new Set(questions.filter((x) => answers[x.id] !== result.review.find((r) => r.id === x.id)?.answer).map((x) => x.topic))];
    return (
      <div className="space-y-5">
        <section className="card-soft p-6 text-center sm:p-8">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{skillName} · {label}</p>
          <p className="mt-3 text-5xl font-semibold tabular-nums tracking-tight">
            {result.correct}
            <span className="text-2xl font-medium text-muted-foreground"> of {result.total}</span>
          </p>
          <p className="mt-3 font-medium">
            {result.ready ? "That's solid. You're ready to prove it." : "Not there yet, and that's what practice is for."}
          </p>
          {missed.length ? <p className="mt-1 text-sm text-muted-foreground">Worth another look: {missed.join(", ")}.</p> : null}

          <div className="mt-6 flex flex-col items-center gap-3">
            <Link
              href={result.ready ? `/assessment/skill:${skillId}` : `/plan/${skillId}`}
              className={cn(buttonVariants(), "h-11 px-6 text-base")}
            >
              {result.ready ? `Take the ${skillName} assessment` : `Review the ${skillName} plan`} <LinkArrow />
            </Link>
            <p className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm">
              <button
                onClick={() => router.push(`/practice/${mode}?skill=${skillId}&run=${Date.now()}`)}
                className="font-medium text-primary hover:underline"
              >
                Practise again
              </button>
              <Link href={`/practice?skill=${skillId}`} className="font-medium text-primary hover:underline">All practice</Link>
            </p>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">Practice doesn&apos;t change your readiness. Only the assessment does.</p>
        </section>

        {mode === "mock" ? (
          <section aria-labelledby="review">
            <h2 id="review" className="text-sm font-semibold">Review your answers</h2>
            <ul className="mt-3 space-y-2">
              {questions.map((x, i) => {
                const key = result.review.find((r) => r.id === x.id)!;
                const right = answers[x.id] === key.answer;
                return (
                  <li key={x.id}>
                    <details className="card-soft p-4 text-sm">
                      <summary className="flex cursor-pointer list-none items-start gap-2.5 [&::-webkit-details-marker]:hidden">
                        {right ? <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-label="Correct" /> : <X className="mt-0.5 size-4 shrink-0 text-rose-600" aria-label="Incorrect" />}
                        <span className="whitespace-pre-wrap font-medium">{i + 1}. {x.prompt}</span>
                      </summary>
                      <dl className="mt-3 space-y-2 pl-6.5">
                        <div>
                          <dt className="text-xs text-muted-foreground">Your answer</dt>
                          <dd className="whitespace-pre-wrap">{x.options[answers[x.id]] ?? "Not answered"}</dd>
                        </div>
                        {!right ? (
                          <div>
                            <dt className="text-xs text-muted-foreground">Correct answer</dt>
                            <dd className="whitespace-pre-wrap">{x.options[key.answer]}</dd>
                          </div>
                        ) : null}
                        <dd className="rounded-xl bg-muted/60 p-3 text-muted-foreground">{key.explanation}</dd>
                      </dl>
                    </details>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
      </div>
    );
  }

  const low = left < 60;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <Link href={`/practice?skill=${skillId}`} className="text-sm text-muted-foreground hover:text-foreground">← Practice</Link>
        {minutes !== null ? (
          <p
            role="timer"
            aria-live={low ? "polite" : "off"}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold tabular-nums",
              low ? "bg-rose-50 text-rose-700" : "bg-secondary text-secondary-foreground",
            )}
          >
            <Clock className="size-3.5" aria-hidden />
            {mmss(left)}
          </p>
        ) : null}
      </div>

      <h1 className="mt-3 text-xl font-semibold tracking-tight">{skillName} · {label}</h1>
      <div
        className="mt-3 h-1.5 rounded-full bg-muted"
        role="progressbar"
        aria-label="Questions done"
        aria-valuemin={0}
        aria-valuemax={questions.length}
        aria-valuenow={index}
      >
        <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${(index / questions.length) * 100}%` }} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Question {index + 1} of {questions.length}</p>

      <fieldset className="card-soft mt-5 p-5 sm:p-6" disabled={pending || Boolean(feedback)}>
        <legend className="sr-only">Question {index + 1}</legend>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{q.topic}</p>
        <p className="mt-2 whitespace-pre-wrap font-medium leading-relaxed">{q.prompt}</p>
        <div className="mt-5 space-y-2.5" role="radiogroup" aria-label="Options">
          {q.options.map((opt, i) => {
            const isAnswer = feedback?.answer === i;
            const isWrongPick = feedback && choice === i && !feedback.correct;
            return (
              <label
                key={i}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-3.5 text-sm transition-colors focus-within:ring-2 focus-within:ring-ring",
                  isAnswer
                    ? "border-emerald-300 bg-emerald-50"
                    : isWrongPick
                      ? "border-rose-300 bg-rose-50"
                      : choice === i
                        ? "border-primary bg-secondary"
                        : !feedback && "cursor-pointer hover:bg-muted/60",
                )}
              >
                <input
                  type="radio"
                  name={q.id}
                  className="mt-0.5 accent-[var(--primary)]"
                  checked={choice === i}
                  onChange={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                />
                <span className="flex-1 whitespace-pre-wrap">{opt}</span>
                {isAnswer ? <Check className="mt-0.5 size-4 shrink-0 text-emerald-700" aria-label="Correct answer" /> : null}
                {isWrongPick ? <X className="mt-0.5 size-4 shrink-0 text-rose-700" aria-label="Your answer" /> : null}
              </label>
            );
          })}
        </div>
      </fieldset>

      {feedback ? (
        <div role="status" className={cn("mt-4 rounded-xl border p-4 text-sm", feedback.correct ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900")}>
          <p className="font-semibold">{feedback.correct ? "Correct" : "Not quite"}</p>
          <p className="mt-1">{feedback.explanation}</p>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="mt-4 flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex justify-end">
        {mode === "drill" && !feedback ? (
          <Button className="h-10 px-5" disabled={pending || choice === undefined} onClick={check}>
            {pending ? <Spinner /> : null}
            Check answer
          </Button>
        ) : isLast || (minutes !== null && left <= 0) ? (
          <Button className="h-10 px-5" disabled={pending} onClick={finish}>
            {pending ? <Spinner /> : null}
            {mode === "drill" ? "See how you did" : "Finish test"}
          </Button>
        ) : (
          <Button className="h-10 px-5" onClick={() => setIndex(index + 1)}>
            {mode === "mock" && choice === undefined ? "Skip question" : "Next question"}
          </Button>
        )}
      </div>
    </div>
  );
}
