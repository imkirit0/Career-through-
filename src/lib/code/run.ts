"use client";

import type { Challenge, ChallengeLanguage } from "@/content/taxonomy";

// Runs student code in the browser, each language in its own Web Worker so a runaway
// loop can be killed. SQLite and Python arrive as WebAssembly from a CDN on first use.

export type Table = { columns: string[]; values: unknown[][] };

export type RunResult =
  | {
      ok: true;
      output: string;
      /** One JSON value per check, for marking. */
      results: string[];
      /** python: the same values as Python writes them (None, True, tuples), for showing. */
      display?: string[];
      /** sql: the last statement's result. */
      rows?: Table;
    }
  | { ok: false; error: string; output?: string };

const PYODIDE = "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/";
const SQLJS = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/";

/** Seconds a single run may take before the worker is killed. Python is slower to start. */
const TIMEOUT: Record<ChallengeLanguage, number> = { javascript: 3, sql: 5, python: 10 };

const WORKER_SOURCE: Record<ChallengeLanguage, string> = {
  javascript: `
    postMessage({ ready: true });
    self.onmessage = (e) => {
      const { code, checks } = e.data;
      const logs = [];
      const fmt = (v) => (typeof v === "string" ? v : JSON.stringify(v));
      const log = (...a) => logs.push(a.map(fmt).join(" "));
      const console = { log, error: log, warn: log, info: log };
      try {
        const run = new Function("console", "__checks", code + "\\n;return __checks.map((c) => { try { return JSON.stringify(eval(c)) ?? 'undefined' } catch (e) { return '!' + e.message } })");
        postMessage({ ok: true, output: logs.join("\\n"), results: run(console, checks) });
      } catch (err) {
        postMessage({ ok: false, error: String((err && err.message) || err), output: logs.join("\\n") });
      }
    };`,

  python: `
    importScripts("${PYODIDE}pyodide.js");
    const ready = loadPyodide({ indexURL: "${PYODIDE}" }).then((py) => { postMessage({ ready: true }); return py; });
    const HARNESS = \`
import json, sys, io, traceback
_buf = io.StringIO(); _old = sys.stdout; sys.stdout = _buf
_g = {}; _err = None; _results = []; _shown = []
try:
    exec(__code, _g)
except Exception:
    _err = "".join(traceback.format_exception_only(*sys.exc_info()[:2])).strip()
if _err is None:
    for _c in __checks:
        try:
            _v = eval(_c, _g); _j = json.dumps(_v, separators=(",", ":")); _r = repr(_v)
            _results.append(_j); _shown.append(_r)
        except Exception as _e:
            _results.append("!" + type(_e).__name__ + ": " + str(_e)); _shown.append("")
sys.stdout = _old
json.dumps({"ok": _err is None, "error": _err, "output": _buf.getvalue(), "results": _results, "display": _shown})
\`;
    self.onmessage = async (e) => {
      const py = await ready;
      try {
        py.globals.set("__code", e.data.code);
        py.globals.set("__checks", py.toPy(e.data.checks));
        postMessage(JSON.parse(py.runPython(HARNESS)));
      } catch (err) {
        postMessage({ ok: false, error: String((err && err.message) || err) });
      }
    };`,

  sql: `
    importScripts("${SQLJS}sql-wasm.js");
    const ready = initSqlJs({ locateFile: (f) => "${SQLJS}" + f }).then((SQL) => { postMessage({ ready: true }); return SQL; });
    self.onmessage = async (e) => {
      const SQL = await ready;
      const db = new SQL.Database();
      try {
        if (e.data.setup) db.run(e.data.setup);
        const res = db.exec(e.data.code);
        const last = res[res.length - 1];
        postMessage({ ok: true, output: "", results: [], rows: last ? { columns: last.columns, values: last.values } : { columns: [], values: [] } });
      } catch (err) {
        postMessage({ ok: false, error: String((err && err.message) || err) });
      } finally {
        db.close();
      }
    };`,
};

type Slot = { worker: Worker; ready: Promise<void> };
const slots: Partial<Record<ChallengeLanguage, Slot>> = {};

function slot(language: ChallengeLanguage): Slot {
  const existing = slots[language];
  if (existing) return existing;
  const worker = new Worker(URL.createObjectURL(new Blob([WORKER_SOURCE[language]], { type: "text/javascript" })));
  const ready = new Promise<void>((resolve, reject) => {
    const onReady = (e: MessageEvent) => {
      if (e.data?.ready) {
        worker.removeEventListener("message", onReady);
        resolve();
      }
    };
    worker.addEventListener("message", onReady);
    worker.addEventListener("error", (e) => reject(new Error(e.message || "The runtime failed to load.")), { once: true });
  });
  return (slots[language] = { worker, ready });
}

// One run at a time: a worker has a single reply handler, so overlapping runs would
// answer each other. The page runs the reference solution while the student is typing.
let queue: Promise<unknown> = Promise.resolve();

export function runCode(language: ChallengeLanguage, code: string, checks: string[], setup?: string): Promise<RunResult> {
  const run = queue.then(() => runNow(language, code, checks, setup));
  queue = run;
  return run;
}

async function runNow(language: ChallengeLanguage, code: string, checks: string[], setup?: string): Promise<RunResult> {
  const s = slot(language);
  try {
    await s.ready;
  } catch (err) {
    delete slots[language];
    return { ok: false, error: err instanceof Error ? err.message : "The runtime failed to load. Check your connection and try again." };
  }
  return new Promise<RunResult>((resolve) => {
    const timer = setTimeout(() => {
      // A stuck worker cannot be interrupted, only replaced.
      s.worker.terminate();
      delete slots[language];
      resolve({ ok: false, error: `Stopped after ${TIMEOUT[language]} seconds. Is there a loop that never ends?` });
    }, TIMEOUT[language] * 1000);
    s.worker.onmessage = (e: MessageEvent<RunResult>) => {
      clearTimeout(timer);
      resolve(e.data);
    };
    s.worker.postMessage({ code, checks, setup });
  });
}

// ── Marking ────────────────────────────────────────────────────

export type CheckOutcome = { label: string; expected: string; got: string; pass: boolean };
export type Verdict = { pass: boolean; checks: CheckOutcome[] };

const EPSILON = 1e-9;

function same(a: unknown, b: unknown): boolean {
  if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) <= EPSILON * Math.max(1, Math.abs(a), Math.abs(b));
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => same(x, b[i]));
  if (a && b && typeof a === "object" && typeof b === "object") {
    const ka = Object.keys(a).sort();
    const kb = Object.keys(b).sort();
    return same(ka, kb) && ka.every((k) => same((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
  }
  return a === b;
}

function parse(json: string): unknown {
  try {
    return JSON.parse(json);
  } catch {
    return json;
  }
}

/** sql: a solution that sorts makes row order part of the answer. */
export const rowOrderMatters = (challenge: Challenge) => /\border\s+by\b/i.test(challenge.solution);

/** Compare a student's run with the reference solution's run of the same challenge. */
export function mark(challenge: Challenge, student: RunResult, reference: RunResult): Verdict {
  if (!student.ok || !reference.ok) return { pass: false, checks: [] };

  if (challenge.language === "sql") {
    const ordered = rowOrderMatters(challenge);
    const key = (r: unknown[]) => JSON.stringify(r);
    const norm = (rows: unknown[][]) => (ordered ? rows : [...rows].sort((a, b) => key(a).localeCompare(key(b))));
    const got = norm(student.rows?.values ?? []);
    const expected = norm(reference.rows?.values ?? []);
    const pass = same(got, expected);
    return {
      pass,
      checks: [{ label: ordered ? "Rows, in order" : "Rows", expected: `${expected.length} row${expected.length === 1 ? "" : "s"}`, got: `${got.length} row${got.length === 1 ? "" : "s"}${pass ? "" : ", not the same"}`, pass }],
    };
  }

  const checks = challenge.checks.map((label, i) => {
    const expected = reference.results[i] ?? "";
    const got = student.results[i] ?? "";
    return {
      label,
      expected: reference.display?.[i] || expected,
      got: got.startsWith("!") ? got : student.display?.[i] || got,
      pass: !got.startsWith("!") && same(parse(got), parse(expected)),
    };
  });
  return { pass: checks.length > 0 && checks.every((c) => c.pass), checks };
}
