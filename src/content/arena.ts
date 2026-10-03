// The Arena's subjects. Each has a bank of generated questions in ./arena/<id>.json
// (built from data/*.csv by scripts/csv-to-arena.py), loaded on the server only.

export const ARENA_SUBJECTS = [
  { id: "python", name: "Python", blurb: "Core Python, NumPy and pandas: read the code, pick what it prints." },
  { id: "python-ml", name: "Python for ML", blurb: "Arrays, features, training and evaluation with scikit-learn." },
  { id: "dbms", name: "DBMS & SQL", blurb: "Relational model, normalisation, SQL queries and transactions." },
  { id: "computing-fundamentals", name: "Computing fundamentals", blurb: "Number systems, logic, algorithms, operating systems and networks." },
  { id: "cloud-fundamentals", name: "Cloud", blurb: "Service models, compute and storage, access rules, scaling and cost." },
] as const;

export type ArenaSubjectId = (typeof ARENA_SUBJECTS)[number]["id"];

export const isArenaSubject = (id: string): id is ArenaSubjectId => ARENA_SUBJECTS.some((s) => s.id === id);
export const arenaSubjectName = (id: string) => ARENA_SUBJECTS.find((s) => s.id === id)?.name ?? id;
