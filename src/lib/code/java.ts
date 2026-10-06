import "server-only";

import { Sandbox } from "@vercel/sandbox";
import { buildJavaMain, readJavaRun } from "./java-harness";
import type { RunResult } from "./run";

// Java cannot run in the browser like Python and SQL, so each run gets its own Vercel
// Sandbox: a throwaway microVM with no network, booted from a snapshot that already has
// a JDK (make one with `node scripts/java-sandbox.mjs`). Student code never touches
// this server's process, environment or secrets.

/** Seconds the student's program may run once compiled. */
const RUN_SECONDS = 6;
const DIR = "/vercel/sandbox";

export async function runJava(code: string, checks: string[]): Promise<RunResult> {
  const snapshotId = process.env.JAVA_SANDBOX_SNAPSHOT;
  if (!snapshotId) return { ok: false, error: "Java is not set up on this server yet (JAVA_SANDBOX_SNAPSHOT is missing)." };

  let sandbox: Sandbox | undefined;
  try {
    sandbox = await Sandbox.create({
      source: { type: "snapshot", snapshotId },
      resources: { vcpus: 1 },
      timeout: 60_000,
      persistent: false,
      networkPolicy: "deny-all",
    });
    await sandbox.writeFiles([
      { path: `${DIR}/Solution.java`, content: Buffer.from(code) },
      { path: `${DIR}/Main.java`, content: Buffer.from(buildJavaMain(checks)) },
    ]);

    const compile = await sandbox.runCommand({ cmd: "javac", args: ["-J-XX:TieredStopAtLevel=1", "-d", "out", "Solution.java", "Main.java"], cwd: DIR });
    if (compile.exitCode !== 0) return { ok: false, error: tidy(await compile.stderr()) || "Your code did not compile." };

    const run = await sandbox.runCommand({ cmd: "timeout", args: [String(RUN_SECONDS), "java", "-XX:TieredStopAtLevel=1", "-Xss16m", "-cp", "out", "Main"], cwd: DIR });
    if (run.exitCode === 124) return { ok: false, error: `Stopped after ${RUN_SECONDS} seconds. Is there a loop that never ends?` };
    return readJavaRun(await run.stdout(), tidy(await run.stderr()), run.exitCode);
  } catch (err) {
    console.error("[java] sandbox run failed", err);
    return { ok: false, error: "The Java runner is not available right now. Try again in a minute." };
  } finally {
    await sandbox?.stop().catch(() => {});
  }
}

/** Drop the sandbox's directory from compiler messages so they read `Solution.java:4: error`. */
const tidy = (s: string) => s.replaceAll(`${DIR}/`, "").trim();
