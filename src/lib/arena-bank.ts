import "server-only";
import type { ArenaSubjectId } from "@/content/arena";
import type { ArenaQuestion } from "./arena";

// Answer keys live here and nowhere else: this module never reaches the browser.
// ponytail: 5,000 questions per subject held in memory once per server instance (about
// 3 MB of JSON each). Move the banks to a database table if they grow past that.
const FILES: Record<ArenaSubjectId, () => Promise<{ default: unknown }>> = {
  python: () => import("@/content/arena/python.json"),
  "python-ml": () => import("@/content/arena/python-ml.json"),
  dbms: () => import("@/content/arena/dbms.json"),
  "computing-fundamentals": () => import("@/content/arena/computing-fundamentals.json"),
  "cloud-fundamentals": () => import("@/content/arena/cloud-fundamentals.json"),
};

export type Bank = { all: ArenaQuestion[]; byId: Map<string, ArenaQuestion> };

const cache = new Map<ArenaSubjectId, Promise<Bank>>();

export function loadBank(subject: ArenaSubjectId): Promise<Bank> {
  let bank = cache.get(subject);
  if (!bank) {
    bank = FILES[subject]().then((m) => {
      const all = m.default as ArenaQuestion[];
      return { all, byId: new Map(all.map((q) => [q.id, q])) };
    });
    cache.set(subject, bank);
  }
  return bank;
}
