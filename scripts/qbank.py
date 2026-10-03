"""Shared engine for the question-bank generators (scripts/gen-*-questions.py).

A generator registers templates on a Bank. A template is a function of a seeded random
generator and returns one question in either of two shapes:

  (code, wrong_code, why)   a Python snippet. The engine runs it; whatever it prints is the
                            correct option, and each wrong snippet is run for a distractor.
  Q(prompt, answer, wrong, why)   the template worked the answer out itself (SQL run in
                            sqlite, arithmetic, a looked-up fact).

Either way the answer key is computed, never typed. Rows are written sorted
topic -> subtopic -> difficulty, in the order the templates were registered.
"""
import ast
import contextlib
import csv
import io
import itertools
import random
import re
import warnings
from collections import namedtuple

warnings.simplefilter("ignore")

Q = namedtuple("Q", "prompt answer wrong why")


def uniq(r, n, lo, hi):
    return r.sample(range(lo, hi + 1), n)


def ints(r, n, lo, hi):
    return [r.randint(lo, hi) for _ in range(n)]


def sub(tpl, *vals):
    """Fill @0, @1 ... placeholders; used where the snippet itself contains f-string braces."""
    for i, v in enumerate(vals):
        tpl = tpl.replace(f"@{i}", str(v))
    return tpl


def expr(r, pre, forms, why):
    """Pick one (expression, wrong expressions) form; each is shown inside print()."""
    e, wrong = r.choice(forms)
    return f"{pre}print({e})", [f"{pre}print({w})" for w in wrong], why


def body(r, pre, forms, why):
    """Pick one (code, wrong code) form; `pre` is the shared setup."""
    b, wrong = r.choice(forms)
    return pre + b, [pre + w for w in wrong], why


def g(x):
    """A number as a student would write it: 2.0 -> 2, 2.50 -> 2.5."""
    if isinstance(x, float):
        x = round(x, 2)
        return str(int(x)) if x == int(x) else str(x)
    return str(x)


def nq(prompt, ans, wrong, why, unit=""):
    """A numeric Q: formats the values and pads the wrong options with near-misses."""
    pad = [ans + 1, ans - 1, ans * 2, ans + 2, ans / 2, ans + 10]
    return Q(prompt, g(ans) + unit, [g(w) + unit for w in list(wrong) + pad if w >= 0 or ans < 0], why)


def ask(r, forms, why, unit=""):
    """Pick one (prompt, answer, wrong answers) form; numbers get near-miss padding."""
    p, a, w = r.choice(forms)
    return nq(p, a, w, why, unit) if isinstance(a, (int, float)) else Q(p, a, w, why)


def facts(bank, topic, sub_, level, groups):
    """Term/definition pairs asked both ways; distractors come from the same group."""
    pairs = [(term, text, grp) for grp in groups for term, text in grp]

    @bank.t(topic, sub_, level)
    def _(r):
        term, text, grp = r.choice(pairs)
        others = r.sample([p for p in grp if p[0] != term], 3)
        if r.random() < 0.5:
            return Q(f"Which term matches this description?\n\n{text}", term, [o[0] for o in others], f"{term}: {text}")
        shown = term[0].lower() + term[1:] if term.split()[0] in ("A", "An", "The") else term
        return Q(f"Which statement best describes {shown}?", text, [o[1] for o in others], f"{term}: {text}")


EXCS = ["TypeError", "ValueError", "IndexError", "KeyError", "AttributeError", "NameError", "ZeroDivisionError"]
TYPES = ["int", "float", "str", "bool", "list", "tuple", "dict", "set", "NoneType"]
FALLBACK = ["Raises TypeError", "Raises ValueError", "Raises IndexError", "Raises KeyError", "Raises AttributeError", "None"]


def run(code):
    buf = io.StringIO()
    try:
        with contextlib.redirect_stdout(buf):
            exec(code, {"__name__": "question"})
    except Exception as e:
        return f"Raises {type(e).__name__}"
    out = buf.getvalue()
    if not out:
        return "(prints nothing)"
    return out.rstrip("\n") or "(an empty line)"


def near(ans, r):
    """Plausible wrong answers derived from the right one, best first."""
    if ans.startswith("Raises "):
        return [f"Raises {e}" for e in r.sample(EXCS, len(EXCS))] + ["None"]
    if ans in TYPES:
        return r.sample(TYPES, len(TYPES))
    out = []
    if re.fullmatch(r"\[[-\d. ]+\]", ans):  # a printed 1-D NumPy array
        xs = ans[1:-1].split()
        out += ["[" + " ".join(v) + "]" for v in (xs[::-1], xs[:-1], xs[1:])]
    toks = ans.split()
    if len(toks) > 1 and all(re.fullmatch(r"-?\d+|True|False", x) for x in toks):  # print(a, b)
        flip = lambda x: {"True": "False", "False": "True"}.get(x) or str(int(x) + 1)
        out += [" ".join(flip(x) if i == j else x for j, x in enumerate(toks)) for i in range(len(toks))]
        out.append(" ".join(toks[::-1]))
    try:
        v = ast.literal_eval(ans)
    except Exception:
        v = ...
    if isinstance(v, bool):
        out += [str(not v), "None"]
    elif isinstance(v, int):
        out += [str(x) for x in (v + 1, v - 1, v * 2, v + 2, -v)]
    elif isinstance(v, float):
        out += [str(x) for x in (int(v), round(v + 1, 2), round(v * 2, 2), round(v / 2, 2))]
    elif isinstance(v, (list, tuple)) and v:
        out += [repr(type(v)(x)) for x in (v[::-1], v[:-1], v[1:], list(v) + [v[-1]])]
    elif isinstance(v, dict) and v:
        out += [repr(dict(list(v.items())[:-1])), repr(list(v)), repr(list(v.values()))]
    return out + r.sample(FALLBACK, len(FALLBACK))


def usable(s, limit=90):
    return bool(s.strip()) and "\n" not in s and len(s) <= limit and "np." not in s


class Bank:
    def __init__(self, skill, prefix, topics):
        self.skill, self.prefix, self.topics = skill, prefix, topics
        self.T = []  # (topic, subtopic, difficulty, fn) in teaching order
        self.bad = []  # wrong-option snippets that are themselves broken; must stay empty

    def t(self, topic, sub_, level):
        def deco(fn):
            self.T.append((topic, sub_, level, fn))
            return fn
        return deco

    def build(self, r, topic, sub_, level, fn):
        res = fn(r)
        if res is None:
            return None
        if isinstance(res, Q):
            prompt, ans, why, limit = res.prompt, str(res.answer), res.why, 220
            cands = (str(w) for w in res.wrong)
        else:
            code, wrong, why = res
            prompt, ans, limit = f"What does this code print?\n\n{code}", run(code), 90
            assert ans not in ("Raises SyntaxError", "Raises IndentationError"), code

            def wrongs():
                for w in wrong:
                    out = run(w)
                    if out in ("Raises SyntaxError", "Raises NameError", "Raises IndentationError"):
                        self.bad.append((sub_, w))
                        continue
                    yield out
            cands = itertools.chain(wrongs(), near(ans, r))
        if not usable(ans, limit):
            return None
        opts = [ans]
        for cand in cands:
            if cand not in opts and usable(cand, limit):
                opts.append(cand)
            if len(opts) == 4:
                break
        if len(opts) < 4:
            return None
        r.shuffle(opts)
        return {"topic": topic, "sub": sub_, "level": level, "prompt": prompt, "opts": opts, "answer": "ABCD"[opts.index(ans)], "why": why, "key": ans}

    def generate(self, n, seed):
        r = random.Random(seed)
        seen, rows, live, turn = set(), [], {}, 0
        for tpl in self.T:
            live.setdefault(tpl[1], []).append(tpl)
        while len(rows) < n and live:  # round-robin over subtopics so each gets an even share
            for name in list(live):
                tpl = live[name][turn % len(live[name])]
                for _ in range(60):
                    q = self.build(r, *tpl)
                    # same prompt with a different right answer is a different question ("which of these ...")
                    if q and (q["prompt"], q["key"]) not in seen:
                        break
                else:  # this template has run out of fresh variants
                    live[name].remove(tpl)
                    if not live[name]:
                        del live[name]
                    continue
                seen.add((q["prompt"], q["key"]))
                rows.append(q)
                if len(rows) == n:
                    break
            turn += 1
        subs = list(dict.fromkeys(s for _, s, _, _ in self.T))
        rows.sort(key=lambda q: (self.topics.index(q["topic"]), subs.index(q["sub"]), q["level"], len(q["prompt"]), q["prompt"], q["key"]))
        return rows

    def write(self, out, n=5000, seed=2026):
        rows = self.generate(n, seed)
        # the check: fails loudly if the bank is short, repeats itself or has a broken option
        assert len(rows) == n, f"only {len(rows)} questions; add templates"
        assert len({(q["prompt"], q["key"]) for q in rows}) == n, "duplicate questions"
        assert all(len(set(q["opts"])) == 4 for q in rows), "options must be 4 distinct values"
        assert not self.bad, f"{len(self.bad)} broken wrong-option snippets, e.g. {self.bad[:3]}"
        out.parent.mkdir(exist_ok=True)
        with out.open("w", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow(["id", "skill_id", "topic_id", "subtopic", "difficulty", "prompt", "option_a", "option_b", "option_c", "option_d", "answer", "explanation"])
            for i, q in enumerate(rows, 1):
                w.writerow([f"{self.prefix}-{i:04d}", self.skill, q["topic"], q["sub"], q["level"], q["prompt"], *q["opts"], q["answer"], q["why"]])
        for topic in self.topics:
            print(f"{topic:36} {sum(q['topic'] == topic for q in rows)}")
        print(f"wrote {len(rows)} questions to {out}")
