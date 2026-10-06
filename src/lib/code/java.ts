import "server-only";

import { Sandbox } from "@vercel/sandbox";
import { buildJavaMain, readJavaRun } from "./java-harness";
import type { RunResult } from "./run";

// Java cannot run in the browser like Python and SQL, so each run gets its own Vercel
// Sandbox: a throwaway microVM with no network, forked from a base sandbox that has a JDK.
// Student code never touches this server's process, environment or secrets.

/** The base sandbox. Made on the first Java run ever (about a minute), then reused. */
const BASE = "ct-java-jdk";
/** Seconds the student's program may run once compiled. */
const RUN_SECONDS = 6;
const DIR = "/vercel/sandbox";

let base: Promise<void> | null = null;

/** Make sure the JDK base exists and is stopped, so its filesystem is saved for forks. */
function ensureBase(): Promise<void> {
  base ??= (async () => {
    const sandbox = await Sandbox.getOrCreate({
      name: BASE,
      image: "vercel/sandbox/ubuntu",
      resources: { vcpus: 2 },
      timeout: 15 * 60_000,
      persistent: true,
      snapshotExpiration: 0,
      keepLastSnapshots: { count: 1, deleteEvicted: true },
      onCreate: async (s) => {
        const install = await s.runCommand({ cmd: "bash", args: ["-c", "apt-get update && apt-get install -y --no-install-recommends default-jdk-headless"], sudo: true });
        if (install.exitCode === 0) return;
        await s.delete().catch(() => {});
        throw new Error(`JDK install failed: ${await install.stderr()}`);
      },
    });
    // A no-op when it was already stopped; after a fresh install this saves the snapshot.
    await sandbox.stop();
  })().catch((err) => {
    base = null;
    throw err;
  });
  return base;
}

export async function runJava(code: string, checks: string[]): Promise<RunResult> {
  let sandbox: Sandbox | undefined;
  try {
    await ensureBase();
    sandbox = await Sandbox.fork({ sourceSandbox: BASE, resources: { vcpus: 1 }, timeout: 60_000, persistent: false, networkPolicy: "deny-all" });
    await sandbox.writeFiles([
      { path: `${DIR}/Solution.java`, content: Buffer.from(code) },
      { path: `${DIR}/Main.java`, content: Buffer.from(buildJavaMain(checks)) },
    ]);

    const compile = await sandbox.runCommand({ cmd: "javac", args: ["-J-XX:TieredStopAtLevel=1", "-d", "out", "Solution.java", "Main.java"], cwd: DIR });
    // 127: no javac yet, because another request is still installing the base.
    if (compile.exitCode === 127) return { ok: false, error: "Java is still being set up. Try again in a minute." };
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
