"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { HelpCircle, X } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";

/** One stop on the tour. With no `target` the card sits in the middle of the screen. */
export type TourStep = { id: string; target?: string; title: string; body: string };

const CARD_WIDTH = 340;
/** Enough for the longest step; only used to decide which side of the target has room. */
const CARD_HEIGHT = 230;
const GAP = 14;

/** The element a step points at: the visible one, since the sidebar and the phone menu both exist in the page. */
function find(selector?: string): HTMLElement | null {
  if (!selector) return null;
  return [...document.querySelectorAll<HTMLElement>(selector)].find((el) => el.getClientRects().length > 0) ?? null;
}

type Box = { top: number; left: number; width: number; height: number };

function cardPosition(box: Box | null, vw: number, vh: number): { top: number; left: number; width: number } {
  const width = Math.min(CARD_WIDTH, vw - 24);
  const clampX = (x: number) => Math.min(Math.max(x, 12), vw - width - 12);
  const clampY = (y: number) => Math.min(Math.max(y, 12), vh - CARD_HEIGHT - 12);
  if (!box) return { top: clampY(vh / 2 - CARD_HEIGHT / 2), left: clampX(vw / 2 - width / 2), width };
  // On a phone the card takes the half of the screen the target is not in.
  if (vw < 640) return { top: box.top + box.height / 2 < vh / 2 ? vh - CARD_HEIGHT - 12 : 12, left: 12, width };
  const middleY = clampY(box.top + box.height / 2 - CARD_HEIGHT / 2);
  if (box.left + box.width + GAP + width <= vw - 12) return { top: middleY, left: box.left + box.width + GAP, width };
  if (box.top + box.height + GAP + CARD_HEIGHT <= vh - 12) return { top: box.top + box.height + GAP, left: clampX(box.left + box.width / 2 - width / 2), width };
  if (box.top - GAP - CARD_HEIGHT >= 12) return { top: box.top - GAP - CARD_HEIGHT, left: clampX(box.left + box.width / 2 - width / 2), width };
  // A target taller than the screen: sit over its lower edge.
  return { top: vh - CARD_HEIGHT - 12, left: clampX(box.left + box.width / 2 - width / 2), width };
}

/**
 * A guided tour of the page: each step dims everything except the part it is explaining.
 * It opens by itself for steps this browser has not shown before, and the button replays
 * it. What has been seen is remembered in the browser, not the account.
 * ponytail: per-browser memory, so a new device shows the tour again. Move it to the
 * profile if that turns out to annoy people.
 */
export function Tour({ steps, storageKey, label = "Take the tour" }: { steps: TourStep[]; storageKey: string; label?: string }) {
  const [run, setRun] = useState<TourStep[] | null>(null);
  const [index, setIndex] = useState(0);
  const [box, setBox] = useState<Box | null>(null);
  const [viewport, setViewport] = useState({ vw: 0, vh: 0 });

  const seen = useCallback((): Set<string> => {
    try {
      return new Set(JSON.parse(window.localStorage.getItem(storageKey) ?? "[]"));
    } catch {
      return new Set();
    }
  }, [storageKey]);

  /** Steps whose target is on the page right now; steps without a target always count. */
  const available = useCallback(() => steps.filter((s) => !s.target || find(s.target)), [steps]);

  const close = useCallback(() => {
    setRun((current) => {
      if (current) {
        try {
          window.localStorage.setItem(storageKey, JSON.stringify([...new Set([...seen(), ...current.map((s) => s.id)])]));
        } catch {
          // Without storage the tour simply offers itself again next time.
        }
      }
      return null;
    });
  }, [seen, storageKey]);

  const start = useCallback(
    (all: boolean) => {
      const done = seen();
      const list = available();
      const fresh = list.filter((s) => !done.has(s.id));
      // Nothing new to point at: the opening and closing cards alone are not worth showing.
      if (!all && !fresh.some((s) => s.target)) return;
      setIndex(0);
      setRun(all ? list : fresh);
    },
    [available, seen],
  );

  // First visit: wait for the page to settle, then offer whatever has not been shown yet.
  useEffect(() => {
    const t = window.setTimeout(() => start(false), 1200);
    return () => window.clearTimeout(t);
  }, [start]);

  const step = run?.[index];

  // Keep the highlight on its target while the page scrolls or resizes.
  useEffect(() => {
    if (!step) return;
    const el = find(step.target);
    // Sidebar items are always on screen; a dashboard section may need scrolling to.
    el?.scrollIntoView({ block: el.closest("nav") ? "nearest" : "center", inline: "center" });
    const measure = () => {
      const r = el?.getBoundingClientRect();
      setBox(r ? { top: r.top, left: r.left, width: r.width, height: r.height } : null);
      setViewport({ vw: window.innerWidth, vh: window.innerHeight });
    };
    const frame = window.requestAnimationFrame(measure);
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [step]);

  useEffect(() => {
    if (!run) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, run.length - 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [run, close]);

  const last = run ? index === run.length - 1 : false;
  const card = cardPosition(box, viewport.vw, viewport.vh);

  return (
    <>
      <button
        onClick={() => start(true)}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-foreground/10 bg-card/70 px-3.5 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-foreground"
      >
        <HelpCircle className="size-4" aria-hidden />
        {label}
      </button>

      {/* In the body, not here: the page's main area and its phone header are separate layers, and the tour has to sit above both. */}
      {run && step && viewport.vw ? createPortal(
        <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label={`Tour: ${step.title}`}>
          {/* Catches clicks so the page underneath cannot be used mid-tour. */}
          <div className={cn("absolute inset-0", box ? "" : "bg-black/60")} />
          {box ? (
            <div
              aria-hidden
              className="pointer-events-none absolute rounded-2xl ring-2 ring-primary transition-all duration-300 ease-out"
              style={{ top: box.top - 6, left: box.left - 6, width: box.width + 12, height: box.height + 12, boxShadow: "0 0 0 200vmax rgb(0 0 0 / 0.6)" }}
            />
          ) : null}

          <div
            className="absolute rounded-2xl border border-foreground/10 bg-card p-5 text-card-foreground shadow-2xl transition-all duration-300 ease-out"
            style={{ top: card.top, left: card.left, width: card.width }}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">{index + 1} of {run.length}</p>
              <button onClick={close} aria-label="Close the tour" className="-m-1.5 rounded-lg p-1.5 text-muted-foreground hover:bg-foreground/5 hover:text-foreground">
                <X className="size-4" aria-hidden />
              </button>
            </div>
            <h2 className="mt-1.5 text-lg font-semibold tracking-tight">{step.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            <div className="mt-4 flex items-center justify-between gap-2">
              {last ? <span /> : <button onClick={close} className="text-sm font-medium text-muted-foreground hover:text-foreground">Skip tour</button>}
              <div className="flex gap-2">
                {index > 0 ? <Button variant="outline" className="h-9 px-3.5" onClick={() => setIndex(index - 1)}>Back</Button> : null}
                <Button key={index} autoFocus className="h-9 px-4" onClick={() => (last ? close() : setIndex(index + 1))}>{last ? "Got it" : "Next"}</Button>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
