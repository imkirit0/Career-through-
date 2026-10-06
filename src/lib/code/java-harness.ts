import type { RunResult } from "./run";

// Java has no eval, so every check is compiled into a Main class that calls the student's
// Solution class and prints each value as JSON after a marker line. Pure, so it is testable
// without a JVM.

export const RESULTS_MARK = "@@CT-RESULTS@@";

const JSON_WRITER = `
final class Json {
  static String of(Object v) {
    if (v == null) return "null";
    if (v instanceof String s) return str(s);
    if (v instanceof Character c) return str(String.valueOf(c));
    if (v instanceof Float f) return of(Double.parseDouble(f.toString()));
    if (v instanceof Double d) return d.isNaN() || d.isInfinite() ? str(d.toString()) : d.toString();
    if (v instanceof Number || v instanceof Boolean) return v.toString();
    if (v instanceof java.util.Optional<?> o) return of(o.orElse(null));
    StringBuilder b = new StringBuilder();
    if (v instanceof java.util.Map<?, ?> m) {
      b.append('{');
      for (var e : m.entrySet()) {
        if (b.length() > 1) b.append(',');
        b.append(str(String.valueOf(e.getKey()))).append(':').append(of(e.getValue()));
      }
      return b.append('}').toString();
    }
    if (v instanceof Iterable<?> it) {
      b.append('[');
      for (Object x : it) b.append(b.length() > 1 ? "," : "").append(of(x));
      return b.append(']').toString();
    }
    if (v.getClass().isArray()) {
      b.append('[');
      for (int i = 0; i < java.lang.reflect.Array.getLength(v); i++) b.append(i > 0 ? "," : "").append(of(java.lang.reflect.Array.get(v, i)));
      return b.append(']').toString();
    }
    return str(v.toString());
  }

  static String str(String s) {
    StringBuilder b = new StringBuilder("\\"");
    for (char c : s.toCharArray()) {
      if (c == '"' || c == '\\\\') b.append('\\\\').append(c);
      else if (c < 0x20) b.append(String.format("\\\\u%04x", (int) c));
      else b.append(c);
    }
    return b.append('"').toString();
  }
}
`;

export function buildJavaMain(checks: string[]): string {
  const calls = checks
    .map((c) => `    try { out.add(Json.of(${c})); } catch (Throwable e) { out.add("!" + e.getClass().getSimpleName() + (e.getMessage() == null ? "" : ": " + e.getMessage())); }`)
    .join("\n");
  return `import java.util.*;
import java.util.stream.*;

public class Main {
  public static void main(String[] args) {
    List<String> out = new ArrayList<>();
${calls}
    System.out.flush();
    System.out.println();
    System.out.println("${RESULTS_MARK}" + Json.of(out));
  }
}
${JSON_WRITER}`;
}

/** Split the student's own printing from the marked results. */
export function readJavaRun(stdout: string, stderr: string, exitCode: number): RunResult {
  const at = stdout.lastIndexOf(RESULTS_MARK);
  if (at < 0) return { ok: false, error: stderr || `The program stopped before finishing (exit code ${exitCode}).`, output: stdout.trimEnd() };
  const output = stdout.slice(0, at).replace(/\n$/, "").trimEnd();
  try {
    return { ok: true, output, results: JSON.parse(stdout.slice(at + RESULTS_MARK.length)) as string[] };
  } catch {
    return { ok: false, error: "Could not read the results of the run.", output };
  }
}
