import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { cn } from "cn";
import { challengesForSkill } from "@/content/challenges";
import { getSkill } from "@/content/skills";
import type { Challenge } from "@/content/taxonomy";
import { getSolvedChallenges, requireCandidate } from "@/lib/data";
import { CodeRun } from "./code-run";

export const metadata: Metadata = { title: "Code challenges" };

export default async function CodePracticePage({ searchParams }: { searchParams: Promise<{ skill?: string; c?: string; lang?: string }> }) {
  const { skill: skillId, c, lang } = await searchParams;
  const { user, role } = await requireCandidate();
  const pool = skillId && role.skills.some((s) => s.skillId === skillId) ? challengesForSkill(skillId) : [];
  if (!skillId || !pool.length) redirect("/practice");

  const solved = await getSolvedChallenges(user.id);
  const active = pool.find((x) => x.id === c) ?? pool.find((x) => !solved.has(x.id)) ?? pool[0];
  const index = pool.indexOf(active);
  const next = pool.slice(index + 1).find((x) => !solved.has(x.id)) ?? pool.find((x) => !solved.has(x.id) && x.id !== active.id);
  const skill = getSkill(skillId);
  // Challenges with a Java version can be done in either language; the choice rides in the URL.
  const java = lang === "java" && active.java ? active.java : null;
  const challenge: Challenge = java ? { ...active, ...java, language: "java" } : active;
  const href = (id: string, l = java ? "java" : null) => `/practice/code?skill=${skillId}&c=${id}${l ? `&lang=${l}` : ""}`;

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href={`/practice?skill=${skillId}`} className="text-sm text-muted-foreground hover:text-foreground">← Practice</Link>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">{skill.name} · Code challenges</h1>
        </div>
        <nav aria-label="Challenges" className="flex flex-wrap gap-1.5">
          {pool.map((x, i) => (
            <Link
              key={x.id}
              href={href(x.id)}
              aria-current={x.id === active.id ? "page" : undefined}
              title={x.title}
              className={cn(
                "grid size-8 place-items-center rounded-full text-sm font-medium tabular-nums transition-colors",
                x.id === active.id ? "bg-primary text-primary-foreground" : solved.has(x.id) ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200" : "bg-secondary text-secondary-foreground hover:bg-muted",
              )}
            >
              {solved.has(x.id) && x.id !== active.id ? <Check className="size-4" aria-label={`${i + 1}, solved`} /> : i + 1}
            </Link>
          ))}
        </nav>
      </div>

      <CodeRun
        key={`${active.id}-${challenge.language}`}
        challenge={challenge}
        switcher={
          active.java ? (
            <nav aria-label="Language" className="flex w-fit gap-1 rounded-xl bg-secondary p-1">
              {[
                { id: null, label: "Python" },
                { id: "java", label: "Java" },
              ].map((l) => (
                <Link
                  key={l.label}
                  href={href(active.id, l.id)}
                  aria-current={(l.id === "java") === Boolean(java) ? "page" : undefined}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:bg-background aria-[current=page]:text-foreground aria-[current=page]:shadow-sm"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          ) : null
        }
        topic={skill.topics.find((t) => t.id === active.topicId)?.name ?? ""}
        number={index + 1}
        solved={solved.has(active.id)}
        nextHref={next ? href(next.id) : null}
        skillId={skillId}
      />
    </>
  );
}
