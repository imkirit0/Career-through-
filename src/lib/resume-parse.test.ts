import { describe, expect, it } from "vitest";
import { GEMINI_MODELS, extractResume } from "./resume-parse";

/** A one-page PDF with the given lines of text, built by hand so the test needs no fixture file. */
function pdf(lines: string[]): Uint8Array {
  const text = lines.map((l, i) => `BT /F1 12 Tf 50 ${760 - i * 18} Td (${l.replace(/[()\\]/g, "\\$&")}) Tj ET`).join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${text.length} >>\nstream\n${text}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let out = "%PDF-1.4\n";
  const offsets = objects.map((body, i) => {
    const at = out.length;
    out += `${i + 1} 0 obj\n${body}\nendobj\n`;
    return at;
  });
  const xref = out.length;
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}`;
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(out);
}

// Calls Gemini for real: RESUME_PARSE_LIVE=1 GOOGLE_GENERATIVE_AI_API_KEY=... npx vitest run src/lib/resume-parse.test.ts
describe.skipIf(!process.env.RESUME_PARSE_LIVE)("resume parsing (live)", () => {
  const resume = pdf(["Rahul Menon", "Aspiring Data Analyst", "SKILLS: SQL, Python, Excel", "EDUCATION: B.Tech Computer Science, CUSAT, 2026"]);

  it("moves on to the next model when one is unavailable", async () => {
    const out = await extractResume(resume, [["no-such-model", 10_000], ...GEMINI_MODELS.slice(1)]);
    expect(out.name).toBe("Rahul Menon");
    expect(out.skills).toEqual(expect.arrayContaining(["SQL", "Python", "Excel"]));
  }, 60_000);

  it("reads a resume with the configured models", async () => {
    const out = await extractResume(resume);
    expect(out.name).toBe("Rahul Menon");
    expect(out.education[0]?.year).toBe("2026");
  }, 60_000);

  it("gives up with the last error when every model fails", async () => {
    await expect(extractResume(resume, [["no-such-model", 10_000], ["also-not-a-model", 10_000]])).rejects.toThrow();
  }, 30_000);
});
