import { cn } from "cn";

/**
 * A bank question's text. Paragraphs are separated by blank lines; anything that spans
 * several lines, or does not read as a sentence, is code and keeps its spacing.
 */
export function QuestionPrompt({ prompt, className }: { prompt: string; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {prompt.split(/\n\s*\n/).map((block, i) =>
        !block.includes("\n") && /[.?:]$/.test(block.trim()) ? (
          <p key={i} className="text-base font-medium leading-relaxed">{block}</p>
        ) : (
          <pre key={i} className="overflow-x-auto rounded-xl bg-muted/60 p-3 font-mono text-sm leading-relaxed">{block}</pre>
        ),
      )}
    </div>
  );
}
