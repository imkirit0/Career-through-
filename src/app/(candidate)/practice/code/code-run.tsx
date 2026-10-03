"use client";

import { useEffect, useState, useTransition, type KeyboardEvent, type ReactNode } from "react";
import Link from "next/link";
import { Check, Lightbulb, Play, RotateCcw } from "lucide-react";
import { cn } from "cn";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LinkArrow, Spinner } from "@/components/pending";
import type { Challenge } from "@/content/taxonomy";
import { mark, rowOrderMatters, runCode, type RunResult, type Table, type Verdict } from "@/lib/code/run";
import { completeChallenge } from "../../../actions";

const LANGUAGE_LABEL = { sql: "SQL · SQLite", javascript: "JavaScript", python: "Python" };
const RUNTIME_NOTE = { sql: "Loading SQLite (about 1 MB, once)…", javascript: "Starting…", python: "Loading Python (about 10 MB, once)…" };

/** Test cases the student can see and Run against. Submit also tries the rest, unseen. */
const SAMPLES = 3;
/** How many of those are also written out in the description as worked examples. */
const EXAMPLES = 2;

type Ran = { kind: "run" | "submit"; student: RunResult; verdict: Verdict | null };

const tableNames = (setup = "") => [...setup.matchAll(/create\s+table\s+(\w+)/gi)].map((m) => m[1]);

/**
 * One challenge: brief on the left; editor, test cases and result on the right.
 * Run tries the visible test cases, Submit tries them all. Marked in the browser.
 */
export function CodeRun({ challenge, topic, number, solved, nextHref, skillId }: { challenge: Challenge; topic: string; number: number; solved: boolean; nextHref: string | null; skillId: string }) {
  const [code, setCode] = useState(challenge.starter);
  const [busy, setBusy] = useState<"run" | "submit" | null>(null);
  /** The reference solution's run: where every expected output comes from. */
  const [reference, setReference] = useState<RunResult | null>(null);
  const [tables, setTables] = useState<(Table | null)[]>([]);
  const [table, setTable] = useState(0);
  const [ran, setRan] = useState<Ran | null>(null);
  const [tab, setTab] = useState<"cases" | "result">(challenge.language === "sql" ? "result" : "cases");
  const [pick, setPick] = useState(0);
  const [passed, setPassed] = useState(solved);
  const [showSolution, setShowSolution] = useState(false);
  const [, start] = useTransition();

  const isSql = challenge.language === "sql";
  const names = tableNames(challenge.setup);
  const samples = challenge.checks.slice(0, SAMPLES);
  const hidden = challenge.checks.length - samples.length;

  // Expected outputs (and the SQL tables) are worked out here, while the student reads.
  useEffect(() => {
    let live = true;
    runCode(challenge.language, challenge.solution, challenge.checks, challenge.setup).then((r) => live && setReference(r));
    Promise.all(tableNames(challenge.setup).map((t) => runCode("sql", `SELECT * FROM ${t};`, [], challenge.setup))).then(
      (all) => live && setTables(all.map((r) => (r.ok ? r.rows ?? null : null))),
    );
    return () => {
      live = false;
    };
  }, [challenge]);

  async function execute(kind: "run" | "submit") {
    setBusy(kind);
    // Run stops at the visible cases, so nothing a hidden case prints leaks into the output.
    const tried = kind === "run" ? samples : challenge.checks;
    const student = await runCode(challenge.language, code, tried, challenge.setup);
    let verdict: Verdict | null = null;
    if (student.ok) {
      const ref = reference?.ok ? reference : await runCode(challenge.language, challenge.solution, challenge.checks, challenge.setup);
      setReference(ref);
      verdict = mark({ ...challenge, checks: tried }, student, ref);
    }
    setRan({ kind, student, verdict });
    setPick(Math.max(verdict?.checks.findIndex((c) => !c.pass) ?? 0, 0));
    setTab("result");
    if (kind === "submit" && verdict?.checks.length && verdict.checks.every((c) => c.pass) && !passed) {
      setPassed(true);
      start(async () => {
        await completeChallenge({ challengeId: challenge.id });
      });
    }
    setBusy(null);
  }

  // Tab indents instead of leaving the editor.
  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== "Tab") return;
    e.preventDefault();
    const el = e.currentTarget;
    const { selectionStart: s, selectionEnd: end } = el;
    const indent = challenge.language === "python" ? "    " : "  ";
    setCode(code.slice(0, s) + indent + code.slice(end));
    requestAnimationFrame(() => el.setSelectionRange(s + indent.length, s + indent.length));
  }

  // ── What the last run means ──────────────────────────────────
  const checks = ran?.verdict?.checks ?? [];
  const accepted = checks.length > 0 && checks.every((c) => c.pass);
  const failed = ran !== null && !accepted;
  // After Submit, the first hidden case that fails is shown so there is something to fix.
  const hiddenFail = checks.findIndex((c, i) => i >= SAMPLES && !c.pass);
  const shown = checks.map((c, i) => ({ ...c, i })).filter((c) => c.i < SAMPLES || c.i === hiddenFail);
  const current = shown.find((c) => c.i === pick) ?? shown[0];
  const sample = Math.min(pick, samples.length - 1);
  const expected = (i: number) => (reference?.ok ? reference.display?.[i] || reference.results[i] : null);
  const waiting = reference === null ? RUNTIME_NOTE[challenge.language] : "Could not load this. Check your connection, then press Run.";

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <section className="card-soft p-5 sm:p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{number}. {topic} · {LANGUAGE_LABEL[challenge.language]}</p>
        <h2 className="mt-1 text-lg font-semibold">{challenge.title}</h2>
        {challenge.brief.split(/\n\s*\n/).map((p, i) => (
          <p key={i} className="mt-3 text-sm leading-relaxed">{p}</p>
        ))}

        {isSql ? (
          <div className="mt-5 space-y-3">
            <p className="text-sm font-semibold">Example</p>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Sample input · the tables</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {names.map((n, i) => (
                  <Chip key={n} active={i === table} onClick={() => setTable(i)}><span className="font-mono">{n}</span></Chip>
                ))}
              </div>
              <div className="mt-1.5 overflow-hidden rounded-xl border">
                {tables[table] ? <Rows table={tables[table]} limit={4} /> : <p className="px-3 py-2 text-xs text-muted-foreground">{RUNTIME_NOTE.sql}</p>}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Expected output · {rowOrderMatters(challenge) ? "these rows, in this order" : "these rows, in any order"}</p>
              <div className="mt-1.5 overflow-hidden rounded-xl border">
                {reference?.ok && reference.rows ? <Rows table={reference.rows} /> : <p className="px-3 py-2 text-xs text-muted-foreground">{waiting}</p>}
              </div>
            </div>
          </div>
        ) : (
          samples.slice(0, EXAMPLES).map((input, i) => (
            <div key={input} className="mt-4">
              <p className="text-sm font-semibold">Example {i + 1}</p>
              <dl className="mt-1.5 space-y-1.5 rounded-xl bg-muted/60 px-3 py-2.5 text-xs leading-relaxed">
                <div className="flex gap-2">
                  <dt className="w-14 shrink-0 font-medium text-muted-foreground">Input</dt>
                  <dd className="min-w-0 whitespace-pre-wrap break-words font-mono">{input}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-14 shrink-0 font-medium text-muted-foreground">Output</dt>
                  <dd className="min-w-0 whitespace-pre-wrap break-words font-mono">{expected(i) ?? <span className="font-sans text-muted-foreground">{waiting}</span>}</dd>
                </div>
              </dl>
            </div>
          ))
        )}

        {challenge.hints.length ? (
          <details className="mt-4 text-sm">
            <summary className="inline-flex cursor-pointer items-center gap-1.5 text-primary hover:underline">
              <Lightbulb className="size-3.5" aria-hidden />
              Need a hint?
            </summary>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              {challenge.hints.map((h) => <li key={h}>• {h}</li>)}
            </ul>
          </details>
        ) : null}

        {failed && ran.student.ok ? (
          <div className="mt-4 text-sm">
            {showSolution ? (
              <pre className="overflow-x-auto rounded-xl bg-muted/60 p-3 font-mono text-xs leading-relaxed">{challenge.solution}</pre>
            ) : (
              <button onClick={() => setShowSolution(true)} className="text-muted-foreground hover:text-foreground hover:underline">
                Stuck? Show one way to solve it
              </button>
            )}
          </div>
        ) : null}
      </section>

      <section className="min-w-0 space-y-4">
        <div className="card-soft overflow-hidden">
          <label htmlFor="code" className="sr-only">Your code</label>
          <textarea
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={onKey}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            rows={Math.max(10, code.split("\n").length + 2)}
            className="block w-full resize-y bg-card p-4 font-mono text-sm leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/30 px-4 py-3">
            <button onClick={() => { setCode(challenge.starter); setRan(null); setTab(isSql ? "result" : "cases"); }} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              <RotateCcw className="size-3.5" aria-hidden /> Reset
            </button>
            <div className="flex items-center gap-2">
              <Button variant="secondary" className="h-9 px-4" disabled={busy !== null} onClick={() => execute("run")}>
                {busy === "run" ? <Spinner /> : <Play className="size-4" aria-hidden />} Run
              </Button>
              <Button className="h-9 px-4" disabled={busy !== null} onClick={() => execute("submit")}>
                {busy === "submit" ? <Spinner /> : <Check className="size-4" aria-hidden />} Submit
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "cases" | "result")} className="card-soft gap-0 p-4">
          <TabsList aria-label="Test cases and result">
            {isSql ? null : <TabsTrigger value="cases" className="px-3">Test cases</TabsTrigger>}
            <TabsTrigger value="result" className="px-3">
              Result
              {ran ? <span className={cn("size-1.5 rounded-full", accepted ? "bg-emerald-500" : "bg-rose-500")} aria-hidden /> : null}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cases" className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {samples.map((_, i) => <Chip key={i} active={i === sample} onClick={() => setPick(i)}>Case {i + 1}</Chip>)}
            </div>
            <Field label="Input">{samples[sample]}</Field>
            <Field label="Expected output">{expected(sample) ?? <span className="font-sans text-muted-foreground">{waiting}</span>}</Field>
            <p className="text-xs text-muted-foreground">
              Run tries these {samples.length} cases.{hidden > 0 ? ` Submit also tries ${hidden} hidden one${hidden === 1 ? "" : "s"}.` : ""}
            </p>
          </TabsContent>

          <TabsContent value="result" className="mt-4 space-y-3">
            {busy && reference === null ? <p role="status" className="text-muted-foreground">{RUNTIME_NOTE[challenge.language]}</p> : null}
            {!ran ? (
              busy ? null : <p className="text-muted-foreground">{isSql ? "Press Run to see what your query returns, next to the expected output." : "Press Run to try your code on the test cases."}</p>
            ) : !ran.student.ok ? (
              <div role="alert" className="space-y-3">
                <p className="text-base font-semibold text-rose-700">Error</p>
                <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-rose-50 px-3 py-2 font-mono text-xs leading-relaxed text-rose-900">{ran.student.error}</pre>
                {ran.student.output ? <Field label="Printed before the error">{ran.student.output}</Field> : null}
              </div>
            ) : (
              <>
                <div role="status">
                  <p className={cn("text-base font-semibold", accepted ? "text-emerald-700" : "text-rose-700")}>
                    {!accepted ? "Wrong answer" : ran.kind === "submit" ? "Accepted" : isSql ? "Output matches" : "Sample cases pass"}
                  </p>
                  <p className="mt-0.5 text-muted-foreground">
                    {isSql
                      ? accepted ? "Your rows match the expected output." : "Your rows are not the expected ones."
                      : `${checks.filter((c) => c.pass).length} of ${checks.length} test cases passed.`}
                    {accepted && ran.kind === "run" ? ` Press Submit to ${hidden > 0 ? "try the hidden cases too" : "finish this challenge"}.` : ""}
                  </p>
                </div>

                {isSql ? (
                  <>
                    <Labelled label="Your output"><Rows table={ran.student.rows ?? { columns: [], values: [] }} /></Labelled>
                    {!accepted && reference?.ok && reference.rows ? <Labelled label="Expected output"><Rows table={reference.rows} /></Labelled> : null}
                  </>
                ) : current ? (
                  <>
                    <div className="flex flex-wrap gap-1.5">
                      {shown.map((c) => (
                        <Chip key={c.i} active={c.i === current.i} onClick={() => setPick(c.i)}>
                          <span className={cn("size-1.5 rounded-full", c.pass ? "bg-emerald-500" : "bg-rose-500")} aria-hidden />
                          Case {c.i + 1}{c.i >= SAMPLES ? " · hidden" : ""}
                          <span className="sr-only">{c.pass ? ", passed" : ", failed"}</span>
                        </Chip>
                      ))}
                    </div>
                    <Field label="Input">{current.label}</Field>
                    <Field label="Your output" tone={current.pass ? undefined : "bad"}>{current.got.startsWith("!") ? current.got.slice(1) : current.got || "nothing"}</Field>
                    <Field label="Expected output">{current.expected}</Field>
                    {ran.student.output ? <Field label="Printed output">{ran.student.output}</Field> : null}
                  </>
                ) : null}

                {accepted && ran.kind === "submit" ? (
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    {nextHref ? (
                      <Link href={nextHref} className={cn(buttonVariants(), "h-9 px-4")}>Next challenge <LinkArrow /></Link>
                    ) : (
                      <Link href={`/practice?skill=${skillId}`} className={cn(buttonVariants(), "h-9 px-4")}>All done — back to practice <LinkArrow /></Link>
                    )}
                    <span className="text-xs text-muted-foreground">Practice only: this does not change your readiness.</span>
                  </div>
                ) : null}
              </>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-colors",
        active ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

function Field({ label, tone, children }: { label: string; tone?: "bad"; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <pre className={cn("mt-1 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-lg px-3 py-2 font-mono text-xs leading-relaxed", tone === "bad" ? "bg-rose-50 text-rose-900" : "bg-muted/60")}>
        {children}
      </pre>
    </div>
  );
}

function Labelled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-1 overflow-hidden rounded-xl border">{children}</div>
    </div>
  );
}

function Rows({ table, limit = 50 }: { table: Table; limit?: number }) {
  const { columns, values } = table;
  if (!columns.length) return <p className="px-3 py-2 text-xs text-muted-foreground">No rows.</p>;
  return (
    <div className="max-h-72 overflow-auto">
      <table className="w-full text-left font-mono text-xs">
        <thead className="sticky top-0 bg-muted">
          <tr>{columns.map((c, i) => <th key={i} className="whitespace-nowrap px-3 py-2 font-semibold">{c}</th>)}</tr>
        </thead>
        <tbody className="divide-y">
          {values.slice(0, limit).map((r, i) => (
            <tr key={i}>{r.map((v, j) => <td key={j} className="whitespace-nowrap px-3 py-1.5 tabular-nums">{v === null ? <span className="text-muted-foreground">NULL</span> : String(v)}</td>)}</tr>
          ))}
        </tbody>
      </table>
      {values.length > limit ? <p className="border-t px-3 py-1.5 font-sans text-xs text-muted-foreground">First {limit} of {values.length} rows</p> : null}
    </div>
  );
}
