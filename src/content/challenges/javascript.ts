import type { Challenge } from "../taxonomy";

export const challenges: Challenge[] = [
  {
    id: "javascript-c1",
    skillId: "javascript",
    topicId: "javascript-types-scope",
    language: "javascript",
    title: "Is it empty?",
    brief:
      "Write isEmpty(value). It returns true when value is null, undefined, an empty string, an empty array or an object with no keys of its own, and false for everything else. Numbers and booleans are never empty.\n\nExample: isEmpty('') is true, isEmpty([1]) is false, isEmpty(0) is false.",
    starter: `function isEmpty(value) {
  // your code
}`,
    solution: `function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" || Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}`,
    checks: [
      "isEmpty('')",
      "isEmpty([1])",
      "isEmpty(null)",
      "isEmpty({})",
      "isEmpty(0)",
      "isEmpty({ a: 1 })",
    ],
    hints: [
      "typeof null is 'object' and typeof [] is 'object' too, so check those two cases before the generic object case.",
      "Object.keys(obj).length tells you how many own keys an object has.",
    ],
  },
  {
    id: "javascript-c2",
    skillId: "javascript",
    topicId: "javascript-types-scope",
    language: "javascript",
    title: "Parse a score safely",
    brief:
      "Write parseScore(input). It accepts a number or a string and returns a finite number, or null when the input cannot honestly be read as one. Strings may have spaces around them; a blank string, a non-numeric string, NaN, Infinity and any other type all give null.\n\nExample: parseScore(' 7.5 ') is 7.5, parseScore('') is null (even though Number('') is 0).",
    starter: `function parseScore(input) {
  // your code
}`,
    solution: `function parseScore(input) {
  if (typeof input === "number") return Number.isFinite(input) ? input : null;
  if (typeof input !== "string" || input.trim() === "") return null;
  const n = Number(input);
  return Number.isFinite(n) ? n : null;
}`,
    checks: [
      "parseScore('42')",
      "parseScore(' 7.5 ')",
      "parseScore('abc')",
      "parseScore('')",
      "parseScore(10)",
      "parseScore(null)",
    ],
    hints: [
      "Number('') and Number('  ') are both 0, so rule out blank strings before converting.",
      "Number.isFinite(x) is false for NaN, Infinity and anything that is not a number.",
    ],
  },
  {
    id: "javascript-c3",
    skillId: "javascript",
    topicId: "javascript-functions-closures",
    language: "javascript",
    title: "Make a counter",
    brief:
      "Write makeCounter(start). It returns a function; each call to that function adds 1 to its own private count and returns the new value. start is optional and defaults to 0. Two counters made separately must never share a count.\n\nExample: const c = makeCounter(); c(); c() returns 2. A fresh makeCounter(10)() returns 11.",
    starter: `function makeCounter(start) {
  // your code
}`,
    solution: `function makeCounter(start = 0) {
  let count = start;
  return () => ++count;
}`,
    checks: [
      "(c => [c(), c(), c()])(makeCounter())",
      "(c => [c(), c()])(makeCounter(10))",
      "(a => (b => [a(), a(), b()])(makeCounter()))(makeCounter())",
      "typeof makeCounter()",
    ],
    hints: [
      "Declare the count inside makeCounter, then return an inner function that updates it. The inner function keeps access to that variable after makeCounter has returned.",
    ],
  },
  {
    id: "javascript-c4",
    skillId: "javascript",
    topicId: "javascript-functions-closures",
    language: "javascript",
    title: "Memoise a function",
    brief:
      "Write memoize(fn), where fn takes exactly one argument. It returns a new function that calls fn the first time it sees an argument, remembers the result, and returns the remembered result on every later call with the same argument without calling fn again. Different arguments are remembered separately.\n\nExample: const sq = memoize(n => n * n); sq(4); sq(4); sq(5) calls the original function only twice.",
    starter: `function memoize(fn) {
  // your code
}`,
    solution: `function memoize(fn) {
  const cache = new Map();
  return (arg) => {
    if (!cache.has(arg)) cache.set(arg, fn(arg));
    return cache.get(arg);
  };
}`,
    checks: [
      "(() => { let calls = 0; const sq = memoize(n => { calls++; return n * n; }); return [sq(4), sq(4), sq(5), calls]; })()",
      "(() => { let calls = 0; const up = memoize(s => { calls++; return s.toUpperCase(); }); up('a'); up('b'); up('a'); up('a'); return calls; })()",
      "memoize(n => n + 1)(0)",
      "(() => { const a = memoize(n => n * 2); const b = memoize(n => n * 3); return [a(2), b(2), a(2)]; })()",
    ],
    hints: [
      "Keep a Map (or plain object) inside memoize; the returned function closes over it, so it survives between calls.",
      "Check whether the argument is already a key before calling fn, not after.",
    ],
  },
  {
    id: "javascript-c5",
    skillId: "javascript",
    topicId: "javascript-arrays-objects",
    language: "javascript",
    title: "Top scorers",
    brief:
      "Write topScorers(students, n). students is an array of { name, score } objects. Return an array of the names of the n highest scores, best first; when two scores tie, order those names alphabetically. If n is larger than the array, return everyone. The input array must not be changed.\n\nExample: topScorers([{ name: 'Mia', score: 70 }, { name: 'Ben', score: 90 }, { name: 'Ava', score: 90 }], 2) is ['Ava', 'Ben'].",
    starter: `function topScorers(students, n) {
  // your code
}`,
    solution: `function topScorers(students, n) {
  return [...students]
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, n)
    .map((s) => s.name);
}`,
    checks: [
      "topScorers([{ name: 'Mia', score: 70 }, { name: 'Ben', score: 90 }, { name: 'Ava', score: 90 }], 2)",
      "topScorers([{ name: 'Mia', score: 70 }, { name: 'Ben', score: 90 }, { name: 'Ava', score: 85 }], 1)",
      "topScorers([{ name: 'Mia', score: 70 }, { name: 'Ben', score: 90 }], 5)",
      "topScorers([], 3)",
      "(() => { const s = [{ name: 'Mia', score: 70 }, { name: 'Ben', score: 90 }]; topScorers(s, 1); return s.map(x => x.name); })()",
    ],
    hints: [
      "Array.prototype.sort changes the array it is called on; copy it first with [...students] or students.slice().",
      "A comparator can fall through: when b.score - a.score is 0, compare the names instead.",
    ],
  },
  {
    id: "javascript-c6",
    skillId: "javascript",
    topicId: "javascript-async",
    language: "javascript",
    title: "Summarise settled promises",
    brief:
      "Promise.allSettled resolves to an array of { status: 'fulfilled', value } and { status: 'rejected', reason } objects. Write summarizeSettled(results) that takes such an array and returns { values, errors }: values holds every fulfilled value in order, errors holds every rejected reason converted with String(), in order.\n\nExample: summarizeSettled([{ status: 'fulfilled', value: 1 }, { status: 'rejected', reason: new Error('boom') }]) is { values: [1], errors: ['Error: boom'] }.",
    starter: `function summarizeSettled(results) {
  // your code
}`,
    solution: `function summarizeSettled(results) {
  const values = [];
  const errors = [];
  for (const r of results) {
    if (r.status === "fulfilled") values.push(r.value);
    else errors.push(String(r.reason));
  }
  return { values, errors };
}`,
    checks: [
      "summarizeSettled([{ status: 'fulfilled', value: 1 }, { status: 'rejected', reason: new Error('boom') }, { status: 'fulfilled', value: 'ok' }]).values",
      "summarizeSettled([{ status: 'fulfilled', value: 1 }, { status: 'rejected', reason: new Error('boom') }, { status: 'rejected', reason: 'timeout' }]).errors",
      "summarizeSettled([{ status: 'rejected', reason: 'a' }, { status: 'rejected', reason: 'b' }]).values",
      "summarizeSettled([]).errors",
      "Object.keys(summarizeSettled([{ status: 'fulfilled', value: null }])).sort()",
    ],
    hints: [
      "Loop over results once and push into one of two arrays depending on r.status.",
      "String(new Error('boom')) gives 'Error: boom'; you do not need to look at .message yourself.",
    ],
  },
];
