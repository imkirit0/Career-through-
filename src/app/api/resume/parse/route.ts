import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, profile } from "@/db";
import { getUser } from "@/lib/data";
import { logEvent } from "@/lib/events";
import { extractResume } from "@/lib/resume-parse";
import { supabaseAdmin } from "@/lib/supabase/server";

export const maxDuration = 60;

const MAX_BYTES = 5 * 1024 * 1024;
const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/**
 * The only AI call in the product. It is assistive: the result is a draft the
 * candidate must review and confirm before anything becomes (capped) evidence.
 */
export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return fail("Sign in to upload a resume.", 401);

  const file = (await request.formData().catch(() => null))?.get("file");
  if (!(file instanceof File)) return fail("Attach a PDF resume.", 400);
  if (file.size > MAX_BYTES) return fail("That file is larger than 5 MB.", 413);
  const bytes = new Uint8Array(await file.arrayBuffer());
  // Check the magic number, not just the client-declared type.
  if (file.type !== "application/pdf" || new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-") {
    return fail("Only PDF resumes are supported. You can also fill the profile in manually.", 415);
  }

  // Private bucket, server-side only. Storage failure should not block parsing.
  const path = `${user.id}/resume.pdf`;
  const upload = await supabaseAdmin().storage.from("resumes").upload(path, bytes, { contentType: "application/pdf", upsert: true });
  if (!upload.error) await db.update(profile).set({ resumePath: path }).where(eq(profile.userId, user.id));
  await logEvent(user.id, "RESUME_UPLOADED", { bytes: file.size, stored: !upload.error });

  try {
    return NextResponse.json({ resume: await extractResume(bytes) });
  } catch (e) {
    console.error("resume parse failed", e);
    // Billing/auth problems on the AI provider are ours, not the candidate's resume.
    if (e instanceof Error && /credit card|GatewayAuthentication|GatewayInternalServer|rate limit|quota|API key|high demand|overloaded|timeout|aborted/i.test(`${e.name} ${e.message}`)) {
      return fail("Automatic resume reading is unavailable right now — this is a problem on our side, not with your file. Your resume was saved. Please fill in your profile manually to continue.", 503);
    }
    return fail("We couldn't read that resume automatically. You can fill in your profile manually instead.", 502);
  }
}
