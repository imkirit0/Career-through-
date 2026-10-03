#!/usr/bin/env python3
"""Generate data/python-questions.csv: 5,000 multiple-choice questions for the `python` skill.

Every question is a small program. The correct option is whatever that program really
prints, captured by running it here, so an answer key can never be mistyped. Wrong options
come from running a common mistake, then from near-misses of the right answer.

Needs numpy and pandas:  pip install numpy pandas
Run:                     python3 scripts/gen-python-questions.py
"""
from pathlib import Path

from qbank import Bank, body, expr, ints, sub, uniq

OUT = Path(__file__).resolve().parent.parent / "data" / "python-questions.csv"

# topicIds of the `python` skill in src/content/skills/data.ts, in teaching order
B, NP, PS, PG = "python-basics", "python-numpy", "python-pandas-selection", "python-pandas-groupby-merge"
bank = Bank("python", "py", [B, NP, PS, PG])
t = bank.t

WORDS = ["python", "data", "pandas", "numpy", "engineer", "science", "model", "table", "query", "vector",
         "matrix", "stream", "batch", "schema", "column", "record", "index", "filter", "merge", "pivot"]
NAMES = ["Asha", "Ravi", "Meera", "Kiran", "Divya", "Arjun", "Neha", "Rahul", "Priya", "Vikram"]
CITIES = ["Pune", "Delhi", "Kochi", "Jaipur"]
NPRE = "import numpy as np\n"
PPRE = "import pandas as pd\n"


def mkdf(r, n=5):
    names, cities = r.sample(NAMES, n), [r.choice(CITIES[:3]) for _ in range(n)]
    sales, units = uniq(r, n, 10, 99), ints(r, n, 1, 9)
    pre = (f'{PPRE}df = pd.DataFrame({{\n    "name": {names},\n    "city": {cities},\n'
           f'    "sales": {sales},\n    "units": {units},\n}})\n')
    return pre, names, cities, sales, units


def mkplan(r, n=6):
    cities = [r.choice(CITIES[:3]) for _ in range(n)]
    plans = ["A", "B"] + [r.choice("AB") for _ in range(n - 2)]
    r.shuffle(plans)
    sales = uniq(r, n, 10, 99)
    pre = f'{PPRE}df = pd.DataFrame({{\n    "city": {cities},\n    "plan": {plans},\n    "sales": {sales},\n}})\n'
    return pre, cities, plans, sales


# ───────────────────────── Core Python ─────────────────────────

NUM = "Numbers and operators"


@t(B, NUM, 1)
def _(r):
    a, b = r.randint(10, 99), r.randint(2, 9)
    return expr(r, "", [(f"{a} // {b}, {a} % {b}", [f"{a} / {b}, {a} % {b}", f"{a} % {b}, {a} // {b}", f"round({a} / {b}), {a} % {b}"])],
                "// is floor division (it drops the fraction) and % gives the remainder.")


@t(B, NUM, 1)
def _(r):
    a, b = r.randint(2, 12), r.randint(2, 4)
    return expr(r, "", [(f"{a} ** {b}", [f"{a} * {b}", f"{a} ^ {b}", f"{b} ** {a}"])],
                "** is the power operator. ^ is bitwise XOR, not power.")


@t(B, NUM, 1)
def _(r):
    a, b, c = ints(r, 3, 2, 12)
    o1, o2 = r.choice("+-"), r.choice(["*", "//", "%"])
    return expr(r, "", [(f"{a} {o1} {b} {o2} {c}", [f"({a} {o1} {b}) {o2} {c}", f"{a} {o1} {b}", f"{b} {o2} {c}"])],
                "*, // and % bind tighter than + and -, so they are evaluated first.")


@t(B, NUM, 2)
def _(r):
    a, b = r.randint(2, 15), r.randint(2, 4)
    return expr(r, "", [(f"-{a} ** {b}", [f"(-{a}) ** {b}", f"-{a} * {b}", f"{a} ** {b}"])],
                "** binds tighter than the unary minus, so the power is taken first and the result is then negated.")


@t(B, NUM, 1)
def _(r):
    b = r.randint(2, 9)
    a = b * r.randint(2, 12)
    return expr(r, "", [(f"{a} / {b}", [f"{a} // {b}", f"{a} % {b}", f"{a} * {b}"])],
                "/ always returns a float in Python 3, even when the division is exact.")


@t(B, NUM, 2)
def _(r):
    a, b = r.randint(5, 40), r.randint(2, 9)
    return expr(r, "", [(f"-{a} // {b}", [f"-({a} // {b})", f"{a} // {b}", f"-{a} / {b}"])],
                "Floor division rounds down towards negative infinity, not towards zero.")


@t(B, NUM, 1)
def _(r):
    a, b, c = r.randint(1, 20), r.randint(1, 9), r.randint(2, 5)
    op = r.choice(["*=", "//=", "%=", "-="])
    return body(r, f"x = {a}\n", [(f"x += {b}\nx {op} {c}\nprint(x)", [f"x {op} {c}\nx += {b}\nprint(x)", f"x += {b}\nprint(x)", f"x {op} {c}\nprint(x)"])],
                "Augmented assignments run top to bottom, each one updating x.")


@t(B, NUM, 1)
def _(r):
    a, b, c = ints(r, 3, 1, 20)
    o1, o2 = r.choice(["<", "<=", ">"]), r.choice(["<", "<=", ">", "!="])
    return expr(r, "", [(f"{a} {o1} {b} {o2} {c}", [])], "A chained comparison a < b < c means (a < b) and (b < c).")


@t(B, NUM, 2)
def _(r):
    a = r.randint(1, 50)
    f = r.choice(["True + True", "True * 3", "True + False", "False * 5", "True - False"])
    return expr(r, "", [(f"{f} + {a}", [f"{a}", f"{a} + 3"])],
                "bool is a subclass of int: True counts as 1 and False as 0 in arithmetic.")


@t(B, NUM, 1)
def _(r):
    a, b = r.randint(10, 200), r.randint(2, 12)
    return body(r, "", [(f"q, rem = divmod({a}, {b})\nprint(q, rem)", [f"print({a} % {b}, {a} // {b})", f"print({a} / {b}, {a} % {b})"])],
                "divmod(a, b) returns the pair (a // b, a % b).")


@t(B, NUM, 2)
def _(r):
    x = f"{r.randint(1, 99)}.{r.choice([5, 25, 75, 4, 6, 49, 51])}"
    f, s = r.choice(["int", "round"]), r.choice(["", "-"])
    g = "round" if f == "int" else "int"
    return body(r, "", [(f"print({f}({s}{x}))", [f"print({g}({s}{x}))", f"import math\nprint(math.floor({s}{x}))", f"import math\nprint(math.ceil({s}{x}))"])],
                "int() truncates towards zero; round() goes to the nearest integer, and exact halves go to the even neighbour.")


@t(B, NUM, 1)
def _(r):
    a, b = r.randint(1, 20), r.randint(1, 20)
    e = r.choice([f"{a} / {b}", f"{a} // {b}", f"{a} * {b}.0", f"{a} + {b}", f"{a} > {b}", f"str({a})", f"{a} % {b}", f"float({a})", f"{a} == {b}", f"[{a}, {b}]", f"({a}, {b})", f"{a} / {a}"])
    return expr(r, "", [(f"type({e}).__name__", [])],
                "The operator decides the result type: / gives float, // and % on ints give int, comparisons give bool.")


VAR = "Variables and type conversion"


@t(B, VAR, 1)
def _(r):
    a, b = r.randint(1, 99), r.randint(2, 4)
    return expr(r, "", [
        (f'int("{a}") + {b}', [f'"{a}" + "{b}"', f'int("{a}") * {b}']),
        (f'"{a}" + "{b}"', [f"{a} + {b}", f"{a} * {b}"]),
        (f'"{a}" * {b}', [f"{a} * {b}", f'"{a}" + "{b}"']),
        (f"str({a}) + str({b})", [f"{a} + {b}", f"{a} * {b}"]),
        (f'"{a}" + {b}', [f"{a} + {b}", f'"{a}" + "{b}"']),
        (f'int("{a}.5")', [f'int(float("{a}.5"))', f'float("{a}.5")']),
        (f'float("{a}") + {b}', [f"{a} + {b}", f'"{a}" + "{b}"']),
        (f"int({a}.9) + {b}", [f"round({a}.9) + {b}", f"{a}.9 + {b}"]),
        (f"len(str({a * 100 + b}))", [f"{a * 100 + b}", "1"]),
        (f'int("{a}") == {a}, "{a}" == {a}', ["True, True", "False, False", "False, True"]),
    ], "Strings concatenate and repeat; numbers add. Mixing str and int with + raises TypeError, and int() cannot parse a string that has a decimal point.")


@t(B, VAR, 1)
def _(r):
    a, b, c = r.sample(['0', '""', '"0"', '[]', '[0]', 'None', '0.0', '" "', '{}', '"False"', '1', '-1', '()', '[[]]'], 3)
    return expr(r, "", [(f"bool({a}), bool({b}), bool({c})", [f"not bool({a}), bool({b}), bool({c})", f"bool({a}), not bool({b}), bool({c})", f"bool({a}), bool({b}), not bool({c})"])],
                'Empty containers, 0, 0.0, None and "" are falsy. Everything else is truthy, including "0", " " and [0].')


@t(B, VAR, 1)
def _(r):
    a, b, c = uniq(r, 3, 1, 50)
    return body(r, "", [
        (f"a, b = {a}, {b}\na, b = b, a\nprint(a, b)", [f"print({a}, {b})", f"print({b}, {b})", f"print({a}, {a})"]),
        (f"a = {a}\nb = a\na = {c}\nprint(b)", [f"print({c})", f"print({a + c})"]),
        (f"a, b, c = {a}, {b}, {c}\na, b, c = c, a, b\nprint(a, b, c)", [f"print({a}, {b}, {c})", f"print({c}, {b}, {a})", f"print({b}, {c}, {a})"]),
        (f"a = b = {a}\nb = b + {b}\nprint(a, b)", [f"print({a + b}, {a + b})", f"print({a}, {a})"]),
        (f"a = {a}\nb = a + {b}\na = a * 2\nprint(b)", [f"print({a * 2 + b})", f"print({a * 2})"]),
    ], "The right-hand side is evaluated fully before any name is rebound, and rebinding one name never changes another name that holds a number.")


@t(B, VAR, 2)
def _(r):
    xs = uniq(r, r.randint(4, 6), 1, 30)
    return body(r, "", [
        (f"first, *rest = {xs}\nprint(rest)", [f"print({xs}[1])", f"print({xs}[:-1])"]),
        (f"*head, last = {xs}\nprint(head)", [f"print({xs}[0])", f"print({xs}[1:])"]),
        (f"a, *mid, z = {xs}\nprint(mid)", [f"print({xs}[1:])", f"print({xs}[:-1])"]),
        (f"a, *mid, z = {xs}\nprint(a + z)", [f"print(sum({xs}))", f"print({xs}[0] + {xs}[1])"]),
        (f"a, b = {xs}\nprint(a)", [f"print({xs}[0])", f"print({xs}[:2])"]),
        (f"a, b, *c = {xs}\nprint(len(c), b)", [f"print(1, {xs[1]})", f"print({len(xs)}, {xs[1]})"]),
    ], "A starred name collects all leftover items into a list. Without a star the number of names must match the number of items.")


STR = "Strings"


@t(B, STR, 1)
def _(r):
    s = r.choice(WORDS)
    n = len(s)
    i, j = r.randint(1, n - 2), r.randint(2, n - 1)
    return expr(r, f's = "{s}"\n', [
        (f"s[{i}]", [f"s[{i + 1}]", f"s[{i - 1}]"]),
        (f"s[-{j}]", [f"s[{j}]", f"s[-{j - 1}]", f"s[{j - 1}]"]),
        (f"s[{n}]", ["s[-1]", "s[0]"]),
        ("s[-1]", ["s[0]", "s[-2]"]),
        ("len(s)", ["len(s) - 1", "len(s) + 1"]),
        (f"s[0] + s[-1]", ["s[0] + s[1]", "s[-1] + s[0]", "s[1] + s[-1]"]),
    ], "Indexes start at 0 and negative indexes count from the end. An index equal to len(s) is out of range.")


@t(B, STR, 1)
def _(r):
    s = r.choice(WORDS)
    n = len(s)
    a = r.randint(0, n - 2)
    b, k = r.randint(a + 1, n - 1), r.randint(1, n - 1)
    return expr(r, f's = "{s}"\n', [
        (f"s[{a}:{b}]", [f"s[{a}:{b + 1}]", f"s[{a + 1}:{b}]", f"s[{a + 1}:{b + 1}]"]),
        (f"s[:{b}]", [f"s[:{b + 1}]", f"s[{b}:]", f"s[{b}]"]),
        (f"s[{a}:]", [f"s[{a + 1}:]", f"s[:{a}]", f"s[{a}]"]),
        ("s[::-1]", ["s", "s[-1]", "s[1:][::-1]"]),
        ("s[::2]", ["s[1::2]", "s[:2]", "s[2:]"]),
        (f"s[-{k}:]", [f"s[:-{k}]", f"s[-{k}]", f"s[{k}:]"]),
        (f"s[:-{k}]", [f"s[-{k}:]", f"s[:{k}]"]),
        (f"s[{a}:{n + 5}]", [f"s[{a + 1}:]", f"s[:{a}]"]),
    ], "A slice s[a:b] includes index a and stops before index b. A negative step walks backwards, and a stop past the end is simply cut off.")


@t(B, STR, 1)
def _(r):
    a, b = r.sample(WORDS, 2)
    s = r.choice([f"{a} {b}", f"{a.title()} {b}", f"{a.upper()} {b}", f"{a} {b.title()}"])
    return expr(r, f's = "{s}"\n', [
        ("s.upper()", ["s.title()", "s.lower()", "s.capitalize()"]),
        ("s.title()", ["s.capitalize()", "s.upper()", "s.lower()"]),
        ("s.capitalize()", ["s.title()", "s.upper()", "s"]),
        ("s.lower()", ["s.title()", "s.upper()", "s.capitalize()"]),
        ("s.swapcase()", ["s.upper()", "s.lower()", "s.title()"]),
        ("s.upper().isupper(), s.islower()", ["True, True", "False, False", "False, True", "True, False"]),
    ], "title() capitalises every word, capitalize() only the first letter of the string (and lowers the rest).")


@t(B, STR, 1)
def _(r):
    a, b = r.sample(WORDS, 2)
    s = " " * r.randint(1, 3) + f"{a} {b}" + " " * r.randint(1, 3)
    return expr(r, f's = "{s}"\n', [
        ("len(s.strip())", ["len(s)", "len(s.replace(' ', ''))", "len(s.lstrip())"]),
        ("len(s.lstrip())", ["len(s)", "len(s.strip())", "len(s.rstrip())"]),
        ("len(s.rstrip())", ["len(s)", "len(s.strip())", "len(s.lstrip())"]),
        ("len(s.replace(' ', ''))", ["len(s.strip())", "len(s)"]),
        ("len(s.split())", ["len(s.split(' '))", "len(s)"]),
        ("len(s.split(' '))", ["len(s.split())", "len(s)"]),
        ("s.strip().split()", ["s.split(' ')", "[s.strip()]"]),
    ], "strip() removes whitespace only at the two ends. split() with no argument ignores extra spaces; split(' ') keeps empty pieces.")


@t(B, STR, 1)
def _(r):
    s = r.choice(WORDS)
    ch, miss = r.choice(s), r.choice([c for c in "zqxjw" if c not in s])
    return expr(r, f's = "{s}"\n', [
        (f's.find("{ch}")', [f's.rfind("{ch}") + 1', f's.find("{ch}") + 1', f's.count("{ch}")']),
        (f's.find("{miss}")', ["0", "None", f's.index("{miss}")']),
        (f's.index("{miss}")', [f's.find("{miss}")', "None", "0"]),
        (f's.count("{ch}")', [f's.find("{ch}")', "len(s)"]),
        (f'"{ch}" in s, "{miss}" in s', ["True, True", "False, False", "False, True"]),
        (f's.replace("{ch}", "{ch.upper()}")', ["s.upper()", "s", "s.capitalize()"]),
        (f's.startswith("{s[:2]}"), s.endswith("{s[:2]}")', ["True, True", "False, True", "False, False"]),
        (f's.count("{miss}") + len(s)', ["len(s) + 1", "len(s) - 1"]),
    ], "find() returns the first position or -1 when missing; index() raises ValueError instead. count() counts occurrences.")


@t(B, STR, 2)
def _(r):
    ws = r.sample(WORDS, r.randint(3, 4))
    sep, j = r.choice([",", "-", " ", "|"]), r.choice(["-", "_", "", "+"])
    s, i = sep.join(ws), r.randint(0, len(ws) - 1)
    return expr(r, f's = "{s}"\n', [
        (f's.split("{sep}")[{i}]', [f's.split("{sep}")[{i - 1}]', f"s[{i}]", f's.split("{sep}")[{(i + 1) % len(ws)}]']),
        (f'len(s.split("{sep}"))', ["len(s)", f's.count("{sep}")']),
        (f'"{j}".join(s.split("{sep}"))', ["s", f's.split("{sep}")', f'"{j}".join(s)[:12]']),
        (f's.split("{sep}")[-1].upper()', ["s.upper()", f's.split("{sep}")[0].upper()']),
        (f's.split("{sep}", 1)', [f's.split("{sep}")', f's.split("{sep}")[:2]']),
        (f'[len(w) for w in s.split("{sep}")]', [f'len(s.split("{sep}"))', "[len(s)]"]),
        (f's.split("{sep}")[0][0] + s.split("{sep}")[-1][-1]', ["s[0] + s[1]", "s[-1] + s[0]"]),
    ], "split(sep) cuts a string into a list at every separator; sep.join(list) glues a list back into one string.")


@t(B, STR, 2)
def _(r):
    n, a, b = r.choice(NAMES), r.randint(18, 40), r.randint(2, 9)
    x, k, big, p = round(r.uniform(1, 99), 3), r.randint(1, 9999), r.randint(10000, 9999999), r.randint(1, 99) / 100
    return body(r, "", [
        (sub('name, age = "@0", @1\nprint(f"{name} is {age + 1}")', n, a), [sub('print("@0 is @1")', n, a), 'print("{name} is {age + 1}")', sub('print("@0 is @1 + 1")', n, a)]),
        (sub('x = @0\nprint(f"{x:.2f}")', x), [sub("print(@0)", x), sub('print(f"{@0:.1f}")', x), sub("print(int(@0 * 100) / 100)", x)]),
        (sub('n = @0\nprint(f"{n:06d}")', k), [sub("print(@0)", k), sub('print(f"{@0:<06d}")', k), sub('print(f"{@0:07d}")', k)]),
        (sub('n = @0\nprint(f"{n:,}")', big), [sub("print(@0)", big), sub('print(f"{@0:_}")', big), sub('print(f"{@0:.2f}")', big)]),
        (sub('a, b = @0, @1\nprint(f"{a} + {b} = {a + b}")', a, b), ['print("{a} + {b} = {a + b}")', sub('print("@0 + @1 = @0@1")', a, b), sub('print("a + b = @0")', a + b)]),
        (sub('p = @0\nprint(f"{p:.0%}")', p), [sub("print(@0)", p), sub('print(f"{@0:.0f}%")', p), sub('print(f"{@0:.1%}")', p)]),
        (sub('w = "@0"\nprint(f"{w!r} has {len(w)} letters")', n), [sub('print("@0 has @1 letters")', n, len(n)), sub('print("w has @0 letters")', len(n))]),
        (sub('x = @0\nprint(f"{x * 2}" + "1")', a), [sub("print(@0 * 2 + 1)", a), sub('print("x * 21")', a)]),
    ], "Inside an f-string, {} holds an expression that is evaluated; the part after : is a format spec such as .2f, 06d, a comma or %.")


@t(B, STR, 2)
def _(r):
    s, c = r.choice(WORDS), r.choice("XYZ")
    return body(r, f's = "{s}"\n', [
        (f's[0] = "{c}"\nprint(s)', [f'print("{c + s[1:]}")', "print(s)"]),
        ("s.upper()\nprint(s)", ["print(s.upper())", "print(None)"]),
        (f't = s.replace("{s[0]}", "{c}")\nprint(s)', [f'print(s.replace("{s[0]}", "{c}"))', "print(None)"]),
        (f's = s + "{c}"\nprint(s, len(s))', [f'print("{s}", {len(s)})', f'print("{s}{c}", {len(s)})']),
        (f'print(s * 2 + "{c}")', [f'print(s + "{c}" * 2)', f'print(s + "2{c}")']),
        (f's += "{c}"\ns.lower()\nprint(s)', [f'print("{s}")', f'print("{s}{c.lower()}")']),
        ("t = s\ns = s.upper()\nprint(t)", ["print(s.upper())", "print(None)"]),
    ], "Strings are immutable: methods return a new string and leave the original alone, and item assignment raises TypeError.")


LST = "Lists"


@t(B, LST, 1)
def _(r):
    xs = uniq(r, r.randint(5, 7), 1, 60)
    n = len(xs)
    a = r.randint(0, n - 3)
    b, k = r.randint(a + 1, n - 1), r.randint(1, 3)
    return expr(r, f"a = {xs}\n", [
        (f"a[{a}]", [f"a[{a + 1}]", f"a[{a - 1}]"]),
        (f"a[-{k}]", [f"a[{k}]", f"a[{k - 1}]"]),
        (f"a[{a}:{b}]", [f"a[{a}:{b + 1}]", f"a[{a + 1}:{b + 1}]", f"a[{a + 1}:{b}]"]),
        (f"a[-{k}:]", [f"a[:-{k}]", f"a[-{k}]"]),
        ("a[::-1]", ["sorted(a)", "sorted(a, reverse=True)", "a"]),
        ("a[::2]", ["a[1::2]", "a[:2]"]),
        (f"a[{n}]", ["a[-1]", "None"]),
        (f"a[{n}:]", ["a[-1:]", "None", "a[-1]"]),
        (f"len(a[{a}:{b}])", [f"{b - a + 1}", f"{b}"]),
        (f"a[{a}] + a[-1]", [f"a[{a + 1}] + a[-1]", f"a[{a}] + a[0]"]),
    ], "Slices include the start index and exclude the stop. Indexing past the end raises IndexError, but slicing past the end just returns what exists.")


@t(B, LST, 1)
def _(r):
    xs = uniq(r, r.randint(3, 5), 1, 30)
    x, y = uniq(r, 2, 31, 60)
    i = r.randint(0, len(xs) - 1)
    return body(r, f"a = {xs}\n", [
        (f"a.append([{x}, {y}])\nprint(len(a))", [f"a.extend([{x}, {y}])\nprint(len(a))", "print(len(a))"]),
        (f"a.extend([{x}, {y}])\nprint(a)", [f"a.append([{x}, {y}])\nprint(a)", "print(a)"]),
        (f"a.insert({i}, {x})\nprint(a)", [f"a[{i}] = {x}\nprint(a)", f"a.insert({i + 1}, {x})\nprint(a)", f"a.append({x})\nprint(a)"]),
        ("x = a.pop()\nprint(x, len(a))", ["x = a.pop(0)\nprint(x, len(a))", "print(a[-1], len(a))"]),
        (f"a.pop({i})\nprint(a)", ["a.pop()\nprint(a)", "print(a)", "a.pop(0)\nprint(a)"]),
        (f"a.remove({xs[i]})\nprint(a)", ["a.pop()\nprint(a)", "print(a)", "a.pop(0)\nprint(a)"]),
        (f"a.remove({x})\nprint(a)", ["print(a)", "print(None)"]),
        (f"a += [{x}]\na.append({y})\nprint(a[-2:])", [f"print([{y}, {x}])", "print(a[-2:])"]),
        (f"del a[{i}]\nprint(len(a), a[0])", ["print(len(a), a[0])", "a.pop()\nprint(len(a), a[0])"]),
        (f"print({xs[i]} in a, {x} in a, a.index({xs[i]}))", [f"print(True, False, {i + 1})", f"print(True, True, {i})", f"print(False, False, {i})"]),
        (f"a = a + [{x}] * 2\nprint(a.count({x}), len(a))", [f"print(1, {len(xs) + 1})", f"print(2, {len(xs) + 1})"]),
    ], "append adds one item (even if that item is a list); extend adds each element. pop removes by position, remove by value.")


@t(B, LST, 2)
def _(r):
    xs, x = uniq(r, r.randint(3, 4), 1, 20), r.randint(21, 40)
    mk = r.choice(["b = a", "b = a.copy()", "b = a[:]", "b = list(a)"])
    op = r.choice([f"b.append({x})", f"b[0] = {x}", "b.pop()", f"b += [{x}]", f"b = b + [{x}]"])
    what = r.choice(["a", "len(a)", "a is b", "a == b", "a[0]"])
    alt = "b = a.copy()" if mk == "b = a" else "b = a"
    return body(r, f"a = {xs}\n", [(f"{mk}\n{op}\nprint({what})", [f"{alt}\n{op}\nprint({what})", f"{mk}\nprint({what})", f"{mk}\n{op}\nprint(b)"])],
                "b = a makes a second name for the same list. a.copy(), a[:] and list(a) make a new list, and b = b + [...] rebinds b to a new list too.")


@t(B, LST, 2)
def _(r):
    xs = uniq(r, r.randint(4, 5), 1, 40)
    return body(r, f"a = {xs}\n", [
        ("print(a.sort())", ["print(sorted(a))", "print(a)"]),
        ("b = sorted(a)\nprint(a)", ["print(sorted(a))", "print(a[::-1])"]),
        ("a.sort()\nprint(a[0], a[-1])", ["print(a[0], a[-1])", "print(max(a), min(a))"]),
        ("a.sort(reverse=True)\nprint(a)", ["print(sorted(a))", "print(a[::-1])", "print(a)"]),
        ("b = a.reverse()\nprint(b)", ["print(a[::-1])", "print(a)"]),
        ("a.reverse()\nprint(a)", ["print(sorted(a, reverse=True))", "print(a)", "print(None)"]),
        ("print(sorted(a)[1])", ["print(a[1])", "print(sorted(a)[0])", "print(sorted(a)[-1])"]),
        ("print(sorted(a, reverse=True)[:2])", ["print(sorted(a)[:2])", "print(a[:2])"]),
        ("print(max(a) - min(a))", ["print(a[-1] - a[0])", "print(max(a) + min(a))"]),
        ("print(sum(a), len(a))", ["print(len(a), sum(a))", "print(max(a), len(a))"]),
        ("b = sorted(a)\nb.append(0)\nprint(len(a), len(b))", [f"print({len(xs) + 1}, {len(xs) + 1})", f"print({len(xs)}, {len(xs)})"]),
    ], "list.sort() and list.reverse() change the list in place and return None. sorted() returns a new list and leaves the original alone.")


@t(B, LST, 2)
def _(r):
    m = [uniq(r, 3, 1, 50) for _ in range(3)]
    i, j = r.randint(0, 2), r.randint(0, 2)
    return expr(r, f"m = {m}\n", [
        (f"m[{i}][{j}]", [f"m[{j}][{i}]", f"m[{i}]", f"m[{(i + 1) % 3}][{j}]"]),
        (f"[row[{j}] for row in m]", [f"m[{j}]", f"[row[{(j + 1) % 3}] for row in m]"]),
        ("len(m), len(m[0])", ["len(m) * len(m[0])", "len(m)"]),
        (f"sum(m[{i}])", [f"sum(row[{i}] for row in m)", "sum(sum(row) for row in m)"]),
        ("m[-1][-1] + m[0][0]", ["m[-1][0] + m[0][-1]", "m[0][0] + m[1][1]"]),
        ("max(max(row) for row in m)", ["max(m[0])", "max(m[-1])", "max(len(row) for row in m)"]),
        ("[m[i][i] for i in range(3)]", ["m[0]", "[row[0] for row in m]", "[m[i][2 - i] for i in range(3)]"]),
        ("sum(len(row) for row in m)", ["len(m)", "sum(sum(row) for row in m)"]),
    ], "m[i][j] picks row i first, then item j inside that row. A column needs a loop or comprehension over the rows.")


@t(B, LST, 3)
def _(r):
    n, m, v = r.randint(2, 3), r.randint(2, 4), r.randint(1, 9)
    i = r.randint(1, m - 1)
    return body(r, "", [
        (f"g = [[0] * {n}] * {m}\ng[0][0] = {v}\nprint(g[{i}][0])", [f"print({v})", "print(0)"]),
        (f"g = [[0] * {n} for _ in range({m})]\ng[0][0] = {v}\nprint(g[{i}][0])", [f"print({v})", "print(0)"]),
        (f"g = [[0] * {n}] * {m}\ng[0][0] = {v}\nprint(sum(sum(row) for row in g))", [f"print({v})", f"print({v * n * m})", "print(0)"]),
        (f"g = [[0] * {n} for _ in range({m})]\ng[0][0] = {v}\nprint(sum(sum(row) for row in g))", [f"print({v * m})", f"print({v * n * m})", "print(0)"]),
        (f"a = [{v}] * {m}\na[0] = 0\nprint(a)", [f"print([0] * {m})", f"print([{v}] * {m})"]),
        (f"print(len([[0] * {n}] * {m}), len([0] * {n} * {m}))", [f"print({n}, {m})", f"print({m}, {m})", f"print({n * m}, {n * m})"]),
        (f"row = [{v}] * {n}\ng = [row, row]\nrow.append(0)\nprint(len(g[1]))", [f"print({n})", "print(2)"]),
    ], "[[0] * n] * m repeats a reference to the same inner list m times, so changing one row changes them all. A comprehension builds separate rows.")


TUP = "Tuples"


@t(B, TUP, 1)
def _(r):
    xs = tuple(uniq(r, r.randint(3, 5), 1, 30))
    v, i = r.randint(31, 60), r.randint(0, 2)
    return body(r, "", [
        (f"t = {xs}\nt[{i}] = {v}\nprint(t)", [f"t = list({xs})\nt[{i}] = {v}\nprint(tuple(t))", f"print({xs})"]),
        (f"t = {xs}\nprint(t + ({v},))", [f"print({xs})", f"print(list({xs}) + [{v}])"]),
        (f"t = ({v})\nprint(type(t).__name__)", []),
        (f"t = ({v},)\nprint(type(t).__name__, len(t))", ["print('int', 1)", "print('list', 1)", "print('tuple', 2)"]),
        (f"t = {xs}\na, *b = t\nprint(type(b).__name__, len(b))", [f"print('tuple', {len(xs) - 1})", f"print('list', {len(xs)})", f"print('int', 1)"]),
        (f"t = {xs}\nprint(t[{i}], len(t))", [f"t = {xs}\nprint(t[{i + 1}], len(t))", f"t = {xs}\nprint(t[{i}], len(t) - 1)"]),
        (f"t = ({xs[0]}, [{xs[1]}, {xs[2]}])\nt[1].append({v})\nprint(t)", [f"print(({xs[0]}, [{xs[1]}, {xs[2]}]))", f"print(({xs[0]}, {xs[1]}, {xs[2]}, {v}))"]),
        (f"a = {xs}\nb = {xs}\nprint(a == b, a < a + ({v},))", ["print(True, False)", "print(False, True)", "print(False, False)"]),
        (f"t = {xs}\nprint(t.index({xs[i]}), t.count({v}))", [f"print({i + 1}, 0)", f"print({i}, 1)"]),
        (f"x, y = ({v}, {xs[0]})\nx, y = y, x\nprint((x, y))", [f"print(({v}, {xs[0]}))", f"print([{xs[0]}, {v}])"]),
        (f"t = {xs}\nt.append({v})\nprint(len(t))", [f"print({len(xs) + 1})", f"print({len(xs)})"]),
    ], "Tuples are immutable: no item assignment and no append. (5) is just the number 5; a one-item tuple needs a trailing comma. A list stored inside a tuple can still be changed.")


DCT = "Dictionaries"


def mkd(r, n=3):
    return dict(zip(r.sample(NAMES, n), uniq(r, n, 10, 99)))


@t(B, DCT, 1)
def _(r):
    d = mkd(r)
    k, miss, v = r.choice(list(d)), r.choice([n for n in NAMES if n not in d]), r.randint(1, 9)
    return expr(r, f"d = {d}\n", [
        (f'd["{k}"]', ["len(d)", f'list(d).index("{k}")']),
        (f'd["{miss}"]', ["None", "0"]),
        (f'd.get("{miss}")', [f'd["{miss}"]', "0"]),
        (f'd.get("{miss}", {v})', [f'd.get("{miss}")', f'd["{miss}"]']),
        (f'd.get("{k}", {v})', [f"{v}", "None"]),
        (f'"{k}" in d, {d[k]} in d', ["True, True", "False, True", "False, False"]),
        ("len(d)", ["len(d) * 2", "len(d) - 1"]),
        ("list(d)", ["list(d.values())", "list(d.items())"]),
        ("sum(d.values())", ["len(d)", "max(d.values())"]),
        ("max(d, key=d.get)", ["max(d)", "max(d.values())", "min(d, key=d.get)"]),
        ("sorted(d.values())[-1]", ["list(d.values())[-1]", "min(d.values())"]),
        ("list(d.items())[0]", ["list(d)[0]", "list(d.values())[0]"]),
    ], "d[key] raises KeyError for a missing key; d.get(key) returns None or the default you pass. `in` and iteration look at keys, not values.")


@t(B, DCT, 2)
def _(r):
    d = mkd(r)
    k, new, v = r.choice(list(d)), r.choice([n for n in NAMES if n not in d]), r.randint(1, 9)
    return body(r, f"d = {d}\n", [
        (f'd["{new}"] = {v}\nprint(len(d))', ["print(len(d))", "print(len(d) + 2)"]),
        (f'd["{k}"] = {v}\nprint(len(d), d["{k}"])', [f'print(len(d) + 1, {v})', f'print(len(d), d["{k}"])']),
        (f'd["{k}"] += {v}\nprint(d["{k}"])', [f'print(d["{k}"])', f"print({v})"]),
        (f'd["{new}"] += {v}\nprint(d["{new}"])', [f"print({v})", "print(None)"]),
        (f'x = d.pop("{k}")\nprint(x, len(d))', [f'print(d["{k}"], len(d))', f'print("{k}", len(d) - 1)']),
        (f'd.update({{"{k}": {v}, "{new}": {v}}})\nprint(len(d), d["{k}"])', [f'print(len(d) + 2, {v})', f'print(len(d) + 1, d["{k}"])']),
        (f'x = d.setdefault("{k}", {v})\nprint(x)', [f"print({v})", "print(None)"]),
        (f'x = d.setdefault("{new}", {v})\nprint(x, len(d))', [f"print(None, len(d) + 1)", f"print({v}, len(d))"]),
        (f'del d["{k}"]\nprint("{k}" in d, len(d))', ["print(True, len(d))", "print(False, len(d))"]),
        (f'e = d\ne["{new}"] = {v}\nprint(len(d))', ["print(len(d))"]),
        (f'e = dict(d)\ne["{new}"] = {v}\nprint(len(d))', [f'd["{new}"] = {v}\nprint(len(d))']),
    ], "Assigning to a key adds it or overwrites it. += on a missing key raises KeyError; setdefault returns the existing value or stores the default.")


@t(B, DCT, 2)
def _(r):
    w = r.choice(WORDS + ["banana", "mississippi", "committee", "balloon", "success", "letter"])
    c = r.choice(w)
    loop = f'counts = {{}}\nfor ch in "{w}":\n    counts[ch] = counts.get(ch, 0) + 1\n'
    return body(r, loop, [
        (f'print(counts["{c}"])', [f'print("{w}".index("{c}"))', f'print(len("{w}"))']),
        ("print(len(counts))", [f'print(len("{w}"))', "print(max(counts.values()))"]),
        ("print(max(counts.values()))", ["print(len(counts))", "print(min(counts.values()))"]),
        ("print(max(counts, key=counts.get))", ["print(max(counts))", f'print("{w}"[-1])', "print(min(counts, key=counts.get))"]),
        ("print(sum(counts.values()))", ["print(len(counts))", "print(max(counts.values()))"]),
        ("print(list(counts)[:3])", ["print(sorted(counts)[:3])", f'print(list("{w}"[:3]))']),
        ("print(sorted(counts.items(), key=lambda kv: -kv[1])[0])", ["print(sorted(counts.items())[0])", "print(list(counts.items())[0])"]),
    ], "counts.get(ch, 0) + 1 is the standard counting pattern: start from 0 for a new key, otherwise add one. Dicts keep insertion order.")


@t(B, DCT, 2)
def _(r):
    ks, vs = r.sample(NAMES, 3), uniq(r, 3, 1, 50)
    th = sorted(vs)[1]
    return body(r, "", [
        (f"d = dict(zip({ks}, {vs}))\nprint(d[{ks[1]!r}])", [f"print({vs[0]})", f"print({ks[1]!r})", f"print({vs[2]})"]),
        (f"d = dict(zip({ks}, {vs[:2]}))\nprint(len(d))", ["print(3)", "print(5)"]),
        (f"d = {{k: v for k, v in zip({ks}, {vs}) if v >= {th}}}\nprint(sorted(d))", [f"print(sorted({ks}))", f"print(sorted(v for v in {vs} if v >= {th}))"]),
        (f"d = dict(zip({ks}, {vs}))\nprint(sorted(d, key=d.get))", [f"print(sorted({ks}))", f"print(sorted({vs}))", f"print({ks})"]),
        (f"d = dict(zip({ks}, {vs}))\nfor k in d:\n    d[k] *= 2\nprint(sum(d.values()))", [f"print(sum({vs}))", f"print(len({ks}) * 2)"]),
        (f"d = dict(zip({ks}, {vs}))\ninv = {{v: k for k, v in d.items()}}\nprint(inv[{vs[2]}])", [f"print({vs[2]})", f"print({ks[0]!r})"]),
        (f"d = {{}}\nfor k in {ks + ks[:1]}:\n    d[k] = d.get(k, 0) + 1\nprint(d[{ks[0]!r}], len(d))", ["print(1, 4)", "print(2, 4)", "print(1, 3)"]),
        (f"d = {{k: len(k) for k in {ks}}}\nprint(max(d.values()))", [f"print(len({ks}))", f"print(max({ks}))"]),
    ], "zip pairs items up to the shorter input; a dict comprehension builds {key: value} pairs and can filter with if.")


SET = "Sets"


@t(B, SET, 1)
def _(r):
    a, b = sorted(r.sample(range(1, 10), 4)), sorted(r.sample(range(1, 10), 4))
    op = r.choice("&|-^")
    others = [o for o in "&|-^" if o != op]
    return expr(r, f"a, b = set({a}), set({b})\n", [
        (f"sorted(a {op} b)", [f"sorted(a {o} b)" for o in others]),
        (f"len(a {op} b)", [f"len(a {o} b)" for o in others]),
        ("a.issubset(a | b), a.isdisjoint(b)", ["True, True", "False, False", "False, True", "True, False"]),
        ("sorted(a.union(b) - a.intersection(b))", ["sorted(a | b)", "sorted(a & b)", "sorted(a - b)"]),
    ], "& is intersection (in both), | is union (in either), - is difference (in the first only), ^ is symmetric difference (in exactly one).")


@t(B, SET, 1)
def _(r):
    xs, a, v, w = ints(r, r.randint(5, 8), 1, 6), sorted(r.sample(range(1, 10), 4)), r.randint(1, 9), r.choice(WORDS + ["banana", "letter", "balloon"])
    return body(r, "", [
        (f"print(len(set({xs})))", [f"print(len({xs}))", f"print(max({xs}))"]),
        (f"print(sorted(set({xs})))", [f"print(sorted({xs}))", f"print({xs})"]),
        (f"s = set({a})\ns.add({v})\ns.add({v})\nprint(len(s))", [f"print({len(a) + 2})", f"print({len(a)})", f"print({len(a) + 1})"]),
        (f'print(len(set("{w}")))', [f'print(len("{w}"))', f'print(len("{w}") - 1)']),
        (f"s = {{{a[0]}, {a[1]}}}\nprint(s[0])", [f"print({a[0]})", f"print({a[1]})"]),
        (f"print(type({{}}).__name__, type({{{v}}}).__name__)", ['print("set", "set")', 'print("dict", "dict")', 'print("set", "dict")']),
        (f"s = set({a})\nprint({v} in s, len(s - {{{v}}}))", [f"print(True, {len(a)})", f"print(False, {len(a) - 1})", f"print(True, {len(a) - 1})", f"print(False, {len(a)})"]),
        (f"s = set({a})\ns.discard({v})\ns.discard(99)\nprint(len(s))", [f"print({len(a)})", f"print({len(a) - 1})", f"print({len(a) - 2})"]),
        (f"print(len({xs}) == len(set({xs})))", []),
    ], "A set keeps each value once and has no order, so it cannot be indexed. {} is an empty dict, not an empty set.")


CND = "Conditionals and boolean logic"


@t(B, CND, 1)
def _(r):
    s = r.randint(30, 99)
    a, b = sorted(uniq(r, 2, 40, 90), reverse=True)
    code = f'score = {s}\nif score >= {a}:\n    grade = "A"\nelif score >= {b}:\n    grade = "B"\nelse:\n    grade = "C"\nprint(grade)'
    return code, ['print("A")', 'print("B")', 'print("C")', "print(None)"], "Branches are tested top to bottom and only the first true one runs."


@t(B, CND, 2)
def _(r):
    vals = ["0", '""', "[]", "None", str(r.randint(1, 9)), f'"{r.choice(WORDS)}"', f"[{r.randint(1, 9)}]", "0.0"]
    a, b, c = r.sample(vals, 3)
    e = r.choice(["{a} or {b}", "{a} and {b}", "{a} or {b} or {c}", "{a} and {b} or {c}", "not {a} and {b}", "{a} or {b} and {c}"]).format(a=a, b=b, c=c)
    return expr(r, "", [(e, [f"bool({e})", a, b, c])],
                "and/or return one of their operands, not necessarily True or False: `or` gives the first truthy value, `and` gives the first falsy one.")


@t(B, CND, 1)
def _(r):
    a, b = uniq(r, 2, 1, 50)
    n = r.randint(1, 60)
    return body(r, "", [
        (f'n = {n}\nprint("even" if n % 2 == 0 else "odd")', ['print("even")', 'print("odd")', "print(True)", f"print({n % 2})"]),
        (f"a, b = {a}, {b}\nprint(a if a > b else b)", [f"print(min({a}, {b}))", "print(True)", "print(False)"]),
        (f'n = {n}\nif n % 3 == 0 and n % 5 == 0:\n    print("FizzBuzz")\nelif n % 3 == 0:\n    print("Fizz")\nelif n % 5 == 0:\n    print("Buzz")\nelse:\n    print(n)', ['print("FizzBuzz")', 'print("Fizz")', 'print("Buzz")', f"print({n})"]),
        (f'x = {n}\nif x > {a}:\n    if x > {b}:\n        print("both")\n    else:\n        print("first")\nelse:\n    print("neither")', ['print("both")', 'print("first")', 'print("neither")', 'print("second")']),
        (f"x, y = {a}, {b}\nif x > y or not x:\n    r = x - y\nelif x == y:\n    r = 0\nelse:\n    r = y - x\nprint(r)", [f"print({a - b})", "print(0)", f"print({b - a})"]),
        (f"n = {n}\nprint(n > {a} and n < {b}, n > {a} or n < {b})", ["print(True, True)", "print(False, False)", "print(True, False)", "print(False, True)"]),
        (f'n = {n}\nif n > {a}:\n    size = "big"\nif n > {b}:\n    size = "huge"\nelse:\n    size = "small"\nprint(size)', ['print("big")', 'print("huge")', 'print("small")']),
        (f"n = {n}\nprint(not n > {a}, not (n > {a} and n > {b}))", ["print(True, True)", "print(False, False)", "print(True, False)", "print(False, True)"]),
    ], "A conditional expression `x if cond else y` picks one value. Separate if statements are each tested; an if/elif chain stops at the first match.")


LOP = "Loops"


@t(B, LOP, 1)
def _(r):
    a, b, s = r.randint(0, 5), r.randint(6, 15), r.randint(1, 4)
    return expr(r, "", [
        (f"list(range({a}, {b}, {s}))", [f"list(range({a}, {b + 1}, {s}))", f"list(range({a + 1}, {b}, {s}))", f"list(range({a}, {b}))[:{s}]"]),
        (f"list(range({b - a}))[-1]", [f"{b - a}", f"{b - a + 1}"]),
        (f"len(range({a}, {b}))", [f"{b - a + 1}", f"{b}"]),
        (f"sum(range({a}, {b}))", [f"sum(range({a}, {b + 1}))", f"{a + b}"]),
        (f"list(range({b}, {a}, -{s}))", [f"list(range({a}, {b}, {s}))[::-1]", f"list(range({b}, {a - 1}, -{s}))", "[]"]),
        (f"list(range({b}, {a}))", [f"list(range({a}, {b}))", f"list(range({b}, {a}, -1))"]),
        (f"list(range({a}, {b}))[{s}]", [f"{a + s + 1}", f"{s}"]),
    ], "range(start, stop, step) includes start and excludes stop. With a positive step and start >= stop it is empty.")


@t(B, LOP, 1)
def _(r):
    n, k, m = r.randint(3, 9), r.randint(2, 4), r.randint(20, 80)
    return body(r, "", [
        (f"total = 0\nfor i in range({n}):\n    total += i\nprint(total)", [f"print(sum(range({n + 1})))", f"print({n})"]),
        (f"total = 0\nfor i in range(1, {n} + 1):\n    if i % {k} == 0:\n        total += i\nprint(total)", [f"print(sum(range(1, {n + 1})))", f"print(len([i for i in range(1, {n + 1}) if i % {k} == 0]))"]),
        (f"n, steps = {m}, 0\nwhile n > 1:\n    n //= {k}\n    steps += 1\nprint(steps)", [f"print({m // k})", f"print({m} // {k} // {k})"]),
        (f"i = 0\nwhile i < {n}:\n    i += {k}\nprint(i)", [f"print({n})", f"print({n - 1})", f"print({n // k})"]),
        (f"count = 0\nfor i in range({n}):\n    for j in range(i):\n        count += 1\nprint(count)", [f"print({n * n})", f"print({n})", f"print({n * (n + 1) // 2})"]),
        (f"count = 0\nfor i in range({n}):\n    for j in range({k}):\n        count += 1\nprint(count)", [f"print({n + k})", f"print({n})", f"print({(n - 1) * (k - 1)})"]),
        (f's = ""\nfor i in range({n}):\n    s += str(i % {k})\nprint(s)', [f'print("".join(str(i) for i in range({n})))', f"print({n % k})"]),
        (f"x = 1\nfor _ in range({k + 2}):\n    x *= 2\nprint(x)", [f"print({2 * (k + 2)})", f"print({2 ** (k + 1)})", f"print({2 ** (k + 3)})"]),
        (f"n, digits = {m * 37}, 0\nwhile n:\n    digits += 1\n    n //= 10\nprint(digits)", [f"print({m * 37})", "print(0)"]),
    ], "Trace the loop one pass at a time: range(n) runs for 0 to n - 1, and a while loop checks its condition before every pass.")


@t(B, LOP, 2)
def _(r):
    xs = uniq(r, r.randint(5, 7), 1, 30)
    stop, k = r.choice(xs[1:]), r.randint(2, 3)
    tgt = r.choice([stop, 99])
    brk = f"total = 0\nfor x in {xs}:\n    if x == {stop}:\n        break\n    total += x\nprint(total)"
    cont = f"total = 0\nfor x in {xs}:\n    if x == {stop}:\n        continue\n    total += x\nprint(total)"
    return body(r, "", [
        (brk, [cont, f"print(sum({xs}))", f"print({stop})"]),
        (cont, [brk, f"print(sum({xs}))", f"print({stop})"]),
        (f"for x in {xs}:\n    if x == {tgt}:\n        print('found')\n        break\nelse:\n    print('missing')", ["print('found')", "print('missing')", "print(None)"]),
        (f"out = []\nfor i, x in enumerate({xs}):\n    if i % {k} == 0:\n        out.append(x)\nprint(out)", [f"print([x for x in {xs} if x % {k} == 0])", f"print({xs}[1::{k}])"]),
        (f"for i, x in enumerate({xs}, start=1):\n    pass\nprint(i, x)", [f"print({len(xs) - 1}, {xs[-1]})", f"print(1, {xs[0]})"]),
        (f"pairs = list(zip({xs[:3]}, {xs[3:]}))\nprint(len(pairs), pairs[0])", [f"print({len(xs)}, ({xs[0]}, {xs[3]}))", f"print(3, ({xs[0]}, {xs[1]}))"]),
        (f"evens = 0\nfor x in {xs}:\n    if x % 2:\n        continue\n    evens += 1\nprint(evens)", [f"print(len([x for x in {xs} if x % 2]))", f"print(len({xs}))"]),
        (f"for x in {xs}:\n    if x > {sorted(xs)[-2]}:\n        break\nprint(x)", [f"print({xs[-1]})", f"print({sorted(xs)[-2]})"]),
    ], "break leaves the loop at once; continue skips to the next item. A loop's else block runs only when the loop finished without break.")


FUN = "Functions"


@t(B, FUN, 2)
def _(r):
    a, b, c = uniq(r, 3, 2, 9)
    call = r.choice([f"f({a})", f"f({a}, {b})", f"f(b={a}, a={b})", f"f({a}, c={b})", "f()", f"f({a}, {b}, {c}, 1)", f"f({a}, {b}, c={c})"])
    pre = f"def f(a, b={c}, c=1):\n    return a * b - c\n\n"
    return pre + f"print({call})", [f"print({a * c - 1})", f"print({a * b - 1})", f"print({a * b - c})", f"print({a * c - b})"], \
        "Positional arguments fill parameters left to right, keyword arguments go by name, and anything not passed takes its default."


@t(B, FUN, 2)
def _(r):
    a, b = uniq(r, 2, 1, 20)
    return body(r, "", [
        (f"def add(a, b):\n    total = a + b\n\nprint(add({a}, {b}))", [f"print({a + b})", "print(0)"]),
        (f"def double(x):\n    x * 2\n\nprint(double({a}))", [f"print({a * 2})", f"print({a})"]),
        (f"def f(x):\n    if x > {b}:\n        return 'big'\n\nprint(f({a}))", ["print('big')", "print('small')", "print(False)", "print(None)"]),
        (f"def f(x):\n    return x + 1\n    return x + 2\n\nprint(f({a}))", [f"print({a + 2})", f"print({2 * a + 3})"]),
        (f"def f(a, b):\n    return a, b\n\nx = f({a}, {b})\nprint(type(x).__name__, len(x))", ["print('int', 1)", "print('list', 2)", "print('tuple', 1)"]),
        (f"def f(a, b):\n    return a + b, a * b\n\ns, p = f({a}, {b})\nprint(p - s)", [f"print({a + b})", f"print({a * b})", f"print({a + b - a * b})"]),
        (f"def f(x):\n    for i in range(x):\n        if i * i > {b}:\n            return i\n    return -1\n\nprint(f({a}))", [f"print({a})", f"print({b})"]),
    ], "A function without a return statement returns None. return ends the function immediately, and `return a, b` returns one tuple.")


@t(B, FUN, 2)
def _(r):
    xs, ks = uniq(r, r.randint(3, 5), 1, 20), r.sample(["a", "b", "c", "x", "y"], 3)
    args = ", ".join(map(str, xs))
    return body(r, "", [
        (f"def f(*args):\n    return max(args) - min(args)\n\nprint(f({args}))", [f"print({xs[-1] - xs[0]})", f"print({len(xs)})"]),
        (f"def f(first, *rest):\n    return len(rest)\n\nprint(f({args}))", [f"print({len(xs)})", f"print({xs[0]})"]),
        (f"def f(first, *rest):\n    return first + sum(rest)\n\nprint(f({args}))", [f"print({xs[0]})", f"print({sum(xs[1:])})"]),
        (f"def f(**kw):\n    return sorted(kw)\n\nprint(f({ks[0]}=1, {ks[1]}=2, {ks[2]}=3))", ["print([1, 2, 3])", f"print({ks})"]),
        (f"def f(*args, **kw):\n    return len(args), len(kw)\n\nprint(f({xs[0]}, {xs[1]}, {ks[0]}={xs[2]}))", ["print((3, 0))", "print((2, 2))", "print((1, 2))"]),
        (f"def f(a, b, c):\n    return a - b + c\n\nargs = {xs[:3]}\nprint(f(*args))", [f"print({xs[0] + xs[1] - xs[2]})", f"print({xs[:3]})"]),
        (f"def f(a, b, c):\n    return a - b + c\n\nprint(f({xs[:3]}))", [f"print({xs[0] - xs[1] + xs[2]})", f"print({xs[:3]})"]),
        (f"def f(a, b):\n    return a * 10 + b\n\nd = {{'b': {xs[0] % 10}, 'a': {xs[1] % 10}}}\nprint(f(**d))", [f"print({xs[0] % 10 * 10 + xs[1] % 10})", f"print({xs[0] + xs[1]})"]),
    ], "*args gathers extra positional arguments into a tuple and **kwargs gathers keyword arguments into a dict. In a call, * and ** unpack instead.")


@t(B, FUN, 3)
def _(r):
    a, b = uniq(r, 2, 1, 20)
    return body(r, "", [
        (f"def add(x, items=[]):\n    items.append(x)\n    return items\n\nadd({a})\nprint(add({b}))", [f"print([{b}])", f"print([{a}])"]),
        (f"def add(x, items=None):\n    if items is None:\n        items = []\n    items.append(x)\n    return items\n\nadd({a})\nprint(add({b}))", [f"print([{a}, {b}])", f"print([{a}])"]),
        (f"x = {a}\ndef f():\n    x = {b}\nf()\nprint(x)", [f"print({b})", f"print({a + b})"]),
        (f"x = {a}\ndef f():\n    global x\n    x = {b}\nf()\nprint(x)", [f"print({a})", f"print({a + b})"]),
        (f"x = {a}\ndef f():\n    x += {b}\nf()\nprint(x)", [f"print({a + b})", f"print({a})"]),
        (f"def f(n):\n    n += {b}\nv = {a}\nf(v)\nprint(v)", [f"print({a + b})", "print(None)"]),
        (f"def f(lst):\n    lst.append({b})\nv = [{a}]\nf(v)\nprint(v)", [f"print([{a}])", "print(None)"]),
        (f"def f(lst):\n    lst = lst + [{b}]\nv = [{a}]\nf(v)\nprint(v)", [f"print([{a}, {b}])", "print(None)"]),
        (f"def outer():\n    n = {a}\n    def inner():\n        return n + {b}\n    return inner\n\nprint(outer()())", [f"print({a})", f"print({b})"]),
        (f"x = {a}\ndef f(x):\n    return x * 2\nprint(f({b}), x)", [f"print({b * 2}, {b})", f"print({a * 2}, {a})"]),
    ], "A default value is created once, so a mutable default is shared between calls. Assigning to a name inside a function makes it local unless it is declared global.")


@t(B, FUN, 2)
def _(r):
    n, a, big = r.randint(3, 8), r.randint(2, 9), r.randint(10, 99999)
    return body(r, "", [
        (f"def fact(n):\n    return 1 if n <= 1 else n * fact(n - 1)\n\nprint(fact({n}))", [f"print({n * (n - 1)})", f"print({n * (n + 1) // 2})"]),
        (f"def fib(n):\n    return n if n < 2 else fib(n - 1) + fib(n - 2)\n\nprint(fib({n + 2}))", [f"print({n + 2})", f"print({2 * n + 1})"]),
        (f"def total(n):\n    return 0 if n == 0 else n + total(n - 1)\n\nprint(total({n + a}))", [f"print({n + a})", f"print({(n + a) * (n + a - 1) // 2})"]),
        (f"sq = lambda x: x * x + {a}\nprint(sq({n}))", [f"print({n * 2 + a})", f"print({(n + a) ** 2})"]),
        (f"f = lambda a, b={a}: a * b\nprint(f({n}), f({n}, 2))", [f"print({n * a}, {n * a})", f"print({n * 2}, {n * 2})", f"print({n}, {n * 2})"]),
        (f"def digits(n):\n    return 1 if n < 10 else 1 + digits(n // 10)\n\nprint(digits({big}))", [f"print({big // 10})", f"print({sum(map(int, str(big)))})"]),
        (f"def power(b, e):\n    return 1 if e == 0 else b * power(b, e - 1)\n\nprint(power({a}, {n % 4 + 1}))", [f"print({a * (n % 4 + 1)})", f"print({a ** (n % 4)})"]),
    ], "A recursive function calls itself on a smaller input until it reaches the base case. A lambda is a one-expression function.")


CMP = "Comprehensions"


@t(B, CMP, 2)
def _(r):
    n, k, xs, ws = r.randint(5, 10), r.randint(2, 3), uniq(r, 5, 1, 20), r.sample(WORDS, 4)
    th = sorted(xs)[2]
    return expr(r, "", [
        (f"[x ** 2 for x in range({n}) if x % {k} == 0]", [f"[x ** 2 for x in range(1, {n + 1}) if x % {k} == 0]", f"[x for x in range({n}) if x % {k} == 0]", f"[x ** 2 for x in range({n})]"]),
        (f"[x if x % 2 else 0 for x in {xs}]", [f"[x for x in {xs} if x % 2]", f"[0 if x % 2 else x for x in {xs}]"]),
        (f"[x * {k} for x in {xs} if x > {th}]", [f"[x * {k} for x in {xs}]", f"[x for x in {xs} if x > {th}]", f"[x * {k} for x in {xs} if x >= {th}]"]),
        (f"len([x for x in {xs} if x % 2 == 0])", [f"len({xs})", f"sum(x for x in {xs} if x % 2 == 0)"]),
        (f"sum(x for x in range({n}) if x % 2)", [f"sum(range({n}))", f"sum(x for x in range({n}) if x % 2 == 0)"]),
        (f"[(i, j) for i in range(2) for j in range({k})][{k}]", [f"({k}, 0)", f"(0, {k})", "(1, 1)"]),
        (f"sorted({{x % {k} for x in {xs}}})", [f"[x % {k} for x in {xs}]", f"sorted(x % {k} for x in {xs})"]),
        (f"{{x: x * x for x in range({k + 1})}}", [f"[x * x for x in range({k + 1})]", f"{{x: x * 2 for x in range({k + 1})}}"]),
        (f"[w[0] for w in {ws}]", [f"[w[-1] for w in {ws}]", f"{ws}[0]"]),
        (f"[len(w) for w in {ws} if len(w) > 4]", [f"[len(w) for w in {ws}]", f"[w for w in {ws} if len(w) > 4]"]),
        (f"[[i * j for j in range(1, 3)] for i in range(1, {k + 1})]", [f"[i * j for j in range(1, 3) for i in range(1, {k + 1})]", f"[[i * j for j in range(1, {k + 1})] for i in range(1, 3)]"]),
        (f"[w.upper() for w in {ws} if 'a' in w]", [f"[w.upper() for w in {ws}]", f"[w for w in {ws} if 'a' in w]"]),
    ], "[expr for x in items if cond] filters with a trailing if; a leading `a if cond else b` transforms every item instead of filtering.")


FNC = "Built-in tools: map, filter, sorted, zip"


@t(B, FNC, 2)
def _(r):
    xs, ws, k = uniq(r, 5, 1, 30), r.sample(WORDS, 4), r.randint(2, 4)
    return expr(r, "", [
        (f"list(map(lambda x: x * {k}, {xs}))", [f"{xs} * {k}", f"[x + {k} for x in {xs}]"]),
        (f"list(filter(lambda x: x % 2 == 0, {xs}))", [f"list(filter(lambda x: x % 2, {xs}))", f"[x % 2 == 0 for x in {xs}]"]),
        (f"sorted({ws}, key=len)", [f"sorted({ws})", f"sorted({ws}, key=len, reverse=True)"]),
        (f"sorted({ws}, key=lambda w: w[-1])", [f"sorted({ws})", f"sorted({ws}, key=len)"]),
        (f"max({ws}, key=len)", [f"max({ws})", f"min({ws}, key=len)"]),
        (f"any(x > {k * 7} for x in {xs}), all(x > {k} for x in {xs})", ["True, True", "False, False", "True, False", "False, True"]),
        (f"list(zip({xs[:3]}, {ws[:2]}))", [f"list(zip({xs[:2]}, {ws[:2][::-1]}))", f"[{xs[:3]}, {ws[:2]}]"]),
        (f"dict(zip({ws[:3]}, {xs[:3]}))[{ws[1]!r}]", [f"{xs[0]}", f"{xs[2]}"]),
        (f"list(enumerate({ws[:3]}, start=1))[-1]", [f"(2, {ws[2]!r})", f"({ws[2]!r}, 3)"]),
        (f"sum(map(len, {ws}))", [f"len({ws})", f"max(map(len, {ws}))"]),
        (f"sorted({xs}, reverse=True)[:{k}]", [f"sorted({xs})[:{k}]", f"{xs}[:{k}]"]),
        (f"list(map(str, {xs[:3]}))", [f"{xs[:3]}", f"''.join(map(str, {xs[:3]}))"]),
        (f"min({xs}), max({xs}), sum({xs}) // len({xs})", [f"{xs[0]}, {xs[-1]}, {sum(xs) // 5}", f"max({xs}), min({xs}), {sum(xs) // 5}"]),
    ], "map applies a function to every item, filter keeps the items that pass a test, and sorted/min/max accept key= to decide what to compare.")


EXC = "Errors and exceptions"


@t(B, EXC, 2)
def _(r):
    bad, exc = r.choice([("x = 1 / 0", "ZeroDivisionError"), ('x = int("abc")', "ValueError"), ("x = [1, 2][5]", "IndexError"),
                         ('x = {}["k"]', "KeyError"), ('x = "a" + 1', "TypeError"), ("x = 1", "ValueError"), ('x = int("7")', "TypeError")])
    caught = r.choice([exc, exc, "Exception", r.choice(["ValueError", "KeyError", "TypeError"])])
    L = r.choice([("try", "after", "except", "else", "finally"), ("A", "B", "C", "D", "E"), (1, 2, 3, 4, 5), ("start", "work", "oops", "fine", "end")])
    has_else, has_fin = r.random() < 0.6, r.random() < 0.7
    code = f"out = []\ntry:\n    out.append({L[0]!r})\n    {bad}\n    out.append({L[1]!r})\nexcept {caught}:\n    out.append({L[2]!r})\n"
    code += f"else:\n    out.append({L[3]!r})\n" * has_else + f"finally:\n    out.append({L[4]!r})\n" * has_fin + "print(out)"
    paths = [[0, 2, 4], [0, 1, 3, 4], [0, 1, 2, 4], [0, 4], [0, 2], [0, 1, 4], [0, 1, 2, 3, 4]]
    wrong = [f"print({[L[i] for i in p if (i != 3 or has_else) and (i != 4 or has_fin)]!r})" for p in r.sample(paths, len(paths))]
    return code, wrong, "The try block stops at the failing line. except runs only for a matching error, else only when there was no error, and finally always runs."


@t(B, EXC, 2)
def _(r):
    a, k, w = r.randint(1, 99), r.randint(3, 9), r.choice(WORDS)
    return expr(r, "", [
        (f'int("{a}")', []), (f'int("{a}.0")', [f"{a}"]), (f'int("{w}")', ["0"]), (f"[1, 2, 3][{k}]", ["3", "None"]),
        (f'{{"a": {a}}}["b"]', ["None", f"{a}"]), (f'"{w}".push("x")', [f'"{w}x"']), (f"{w}_total + {a}", [f"{a}"]),
        (f"len({a})", [f"{len(str(a))}"]), (f"{a} / 0", ["0", '"inf"']), (f'"{a}" + {k}', [f"{a + k}", f'"{a}{k}"']),
        (f"[1, 2, 3].index({k})", ["-1", "None"]), (f"None + {a}", [f"{a}"]), (f'"{w}"[{k + 9}]', ['""', "None"]),
        ("int(None)", ["0"]), (f'float("{a}.5.1")', [f"{a}.5"]), (f'"{w}".upper(1)', [f'"{w}".upper()']),
        (f"sum([{a}, '{k}'])", [f"{a + k}"]), ("{1, 2}[0]", ["1"]), (f'"{w}"[{k + 9}:]', ["None"]),
        (f"[{a}, {k}].get(0)", [f"{a}"]), (f'dict([("{w}", {a})])["{w}"]', [f'"{w}"']), (f"int('{a}') + int('{k}')", [f'"{a}{k}"']),
    ], "Each kind of mistake has its own exception: TypeError for a wrong type, ValueError for a bad value, IndexError and KeyError for bad lookups, NameError for an unknown name, AttributeError for a missing method.")


@t(B, EXC, 3)
def _(r):
    a, b, d = r.randint(1, 20), r.choice([0, 0, 2, 4, 5]), r.randint(-3, 9)
    return body(r, "", [
        (f"def safe(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        return {d}\n\nprint(safe({a}, {b}))", [f"print({d})", "print(None)", f"print({a} // {b or 1})"]),
        (f"def f():\n    try:\n        return {a}\n    finally:\n        print('cleanup', end=' ')\n\nprint(f())", [f"print({a}, 'cleanup')", f"print({a})", "print('cleanup')"]),
        (f"def parse(s):\n    try:\n        return int(s)\n    except ValueError:\n        return {d}\n\nprint(parse('{a}') + parse('{a}x'))", [f"print({a * 2})", f"print({a})", f"print({d})"]),
        (f"try:\n    raise ValueError('bad {a}')\nexcept ValueError as e:\n    print(type(e).__name__, e)", [f"print('bad {a}')", "print('ValueError')"]),
        (f"def check(n):\n    if n < 0:\n        raise ValueError('negative')\n    return n * 2\n\ntry:\n    print(check({d}))\nexcept ValueError as e:\n    print('error:', e)", [f"print({d * 2})", "print('error: negative')", "print('negative')"]),
        (f"total = 0\nfor s in ['{a}', 'x', '{a + 1}']:\n    try:\n        total += int(s)\n    except ValueError:\n        total -= 1\nprint(total)", [f"print({a})", f"print({2 * a + 1})", f"print({a - 1})"]),
        (f"try:\n    x = int('{a}')\n    y = x / {b}\nexcept ValueError:\n    y = -1\nprint(y)", ["print(-1)", f"print({a})"]),
        (f"def f(x):\n    try:\n        return 10 // x\n    except ZeroDivisionError:\n        return 0\n    finally:\n        pass\n\nprint(f({b}) + f({d % 4 + 1}))", [f"print({10 // (d % 4 + 1)})", "print(0)"]),
    ], "An except clause only catches the error types it names; anything else keeps propagating. finally runs even when the try block returns.")


OOP = "Classes and objects"


@t(B, OOP, 2)
def _(r):
    n, k = r.choice(NAMES), r.randint(2, 6)
    a, b = uniq(r, 2, 1, 50)
    return body(r, "", [
        (f"class Account:\n    def __init__(self, balance):\n        self.balance = balance\n    def deposit(self, n):\n        self.balance += n\n\nacc = Account({a})\nacc.deposit({b})\nacc.deposit({b})\nprint(acc.balance)", [f"print({a + b})", f"print({a})", f"print({2 * b})"]),
        (f"class Dog:\n    count = 0\n    def __init__(self):\n        Dog.count += 1\n\nfor _ in range({k}):\n    Dog()\nprint(Dog.count)", ["print(0)", "print(1)", f"print({k - 1})"]),
        (f"class C:\n    x = {a}\n\np, q = C(), C()\np.x = {b}\nprint(q.x, C.x, p.x)", [f"print({b}, {b}, {b})", f"print({a}, {b}, {b})", f"print({a}, {a}, {a})"]),
        (f"class Bag:\n    items = []\n    def add(self, x):\n        self.items.append(x)\n\np, q = Bag(), Bag()\np.add({a})\nq.add({b})\nprint(len(p.items))", ["print(1)", "print(0)"]),
        (f"class Bag:\n    def __init__(self):\n        self.items = []\n    def add(self, x):\n        self.items.append(x)\n\np, q = Bag(), Bag()\np.add({a})\nq.add({b})\nprint(len(p.items))", ["print(2)", "print(0)"]),
        (f"class P:\n    def __init__(self, name):\n        self.name = name\n    def __str__(self):\n        return f'<{{self.name}}>'\n\nprint(P('{n}'))", [f"print('{n}')", "print('<name>')", "print('P')"]),
        (f"class P:\n    def __init__(self, v):\n        self.v = v\n\nprint(P({a}) == P({a}))", ["print(True)", "print(None)"]),
        (f"class P:\n    def __init__(self, v):\n        self.v = v\n    def __eq__(self, other):\n        return self.v == other.v\n\nprint(P({a}) == P({a}), P({a}) == P({b}))", ["print(False, False)", "print(True, True)", "print(False, True)"]),
        (f"class Team:\n    def __init__(self, n):\n        self.members = list(range(n))\n    def __len__(self):\n        return len(self.members)\n\nprint(len(Team({k})))", [f"print({k - 1})", "print(1)"]),
        (f"class P:\n    def __init__(self, v):\n        self.v = v\n\np = P({a})\nprint(p.value)", [f"print({a})", "print(None)"]),
        (f"class C:\n    def hi():\n        return {a}\n\nprint(C().hi())", [f"print({a})", "print(None)"]),
        (f"class P:\n    def __init__(self, v):\n        v = v\n\nprint(hasattr(P({a}), 'v'))", ["print(True)", f"print({a})"]),
    ], "Attributes set on self belong to one object; attributes set in the class body are shared by all instances. Every method takes self first.")


@t(B, OOP, 3)
def _(r):
    a, b = uniq(r, 2, 2, 9)
    return body(r, "", [
        (f"class A:\n    def value(self):\n        return {a}\n\nclass B(A):\n    def value(self):\n        return super().value() * {b}\n\nprint(B().value())", [f"print({a})", f"print({b})", f"print({a + b})"]),
        (f"class A:\n    def value(self):\n        return {a}\n    def double(self):\n        return self.value() * 2\n\nclass B(A):\n    def value(self):\n        return {b}\n\nprint(B().double())", [f"print({a * 2})", f"print({b})", f"print({a})"]),
        (f"class A:\n    def __init__(self):\n        self.x = {a}\n\nclass B(A):\n    def __init__(self):\n        self.y = {b}\n\nprint(B().x)", [f"print({a})", f"print({b})", "print(None)"]),
        (f"class A:\n    def __init__(self):\n        self.x = {a}\n\nclass B(A):\n    def __init__(self):\n        super().__init__()\n        self.y = {b}\n\nobj = B()\nprint(obj.x + obj.y)", [f"print({b})", f"print({a})"]),
        ("class A: pass\nclass B(A): pass\n\nb = B()\nprint(isinstance(b, A), type(b) == A, issubclass(A, B))", ["print(True, True, False)", "print(True, False, True)", "print(False, False, False)"]),
        (f"class A:\n    n = {a}\nclass B(A):\n    n = {b}\nclass C(B): pass\n\nprint(C.n, A.n)", [f"print({a}, {a})", f"print({b}, {b})", f"print({a}, {b})"]),
        (f"class A:\n    def who(self):\n        return 'A'\nclass B(A):\n    pass\nclass C(B):\n    def who(self):\n        return 'C' + super().who()\n\nprint(C().who(), B().who())", ["print('C', 'A')", "print('CA', 'B')", "print('CB', 'B')"]),
        (f"class A:\n    def __init__(self, x={a}):\n        self.x = x\nclass B(A):\n    pass\n\nprint(B().x, B({b}).x)", [f"print({a}, {a})", f"print({b}, {b})"]),
    ], "A subclass method overrides the parent's, and self.method() always resolves on the actual object. The parent __init__ runs only if the child calls super().__init__().")


GEN = "Iterators and generators"


@t(B, GEN, 3)
def _(r):
    n, k, xs = r.randint(3, 6), r.randint(2, 4), uniq(r, 4, 1, 30)
    s = sum(x * k for x in range(n))
    return body(r, "", [
        (f"def gen(n):\n    for i in range(n):\n        yield i * {k}\n\ng = gen({n})\nnext(g)\nprint(next(g))", ["print(0)", f"print({2 * k})", "print(1)"]),
        (f"g = (x * {k} for x in range({n}))\nprint(sum(g), sum(g))", [f"print({s}, {s})", f"print(0, {s})"]),
        (f"def gen():\n    yield {xs[0]}\n    yield {xs[1]}\n\ng = gen()\nprint(list(g), list(g))", [f"print([{xs[0]}, {xs[1]}], [{xs[0]}, {xs[1]}])", f"print([{xs[0]}], [{xs[1]}])"]),
        (f"it = iter({xs})\nnext(it)\nprint(list(it))", [f"print({xs})", f"print({xs[:1]})", f"print({xs[:-1]})"]),
        (f"it = iter({xs[:2]})\nnext(it)\nnext(it)\nprint(next(it))", ["print(None)", f"print({xs[0]})", f"print({xs[1]})"]),
        (f"it = iter({xs[:2]})\nnext(it)\nnext(it)\nprint(next(it, 'done'))", ["print(None)", f"print({xs[1]})"]),
        (f"g = (x for x in {xs})\nprint(type(g).__name__)", ["print('list')", "print('tuple')", "print('iterator')"]),
        (f"def countdown(n):\n    while n > 0:\n        yield n\n        n -= 1\n\nprint(list(countdown({n})))", [f"print(list(range({n})))", f"print(list(range({n}, -1, -1)))", f"print({n})"]),
        (f"z = zip({xs[:2]}, {xs[2:]})\nprint(len(list(z)), len(list(z)))", ["print(2, 2)", "print(4, 0)", "print(4, 4)"]),
        (f"m = map(lambda x: x + 1, {xs})\nprint({xs[0] + 1} in m, {xs[0] + 1} in m)", ["print(True, True)", "print(False, False)"]),
        (f"def evens(n):\n    for i in range(n):\n        if i % 2 == 0:\n            yield i\n\nprint(sum(evens({n + k})))", [f"print(sum(range({n + k})))", f"print({(n + k) // 2})"]),
    ], "A generator produces values one at a time and can be consumed only once; after that it is empty. next() on an exhausted iterator raises StopIteration unless a default is given.")


LIB = "Standard library"


@t(B, LIB, 2)
def _(r):
    w = r.choice(["banana", "mississippi", "committee", "balloon", "success", "engineering", "statistics", "parallel", "assessment", "bookkeeper"])
    xs, k, ws, ch = ints(r, 8, 1, 5), r.randint(1, 6), r.sample(WORDS, 5), r.choice(w)
    L = len(r.choice(ws))
    return body(r, "from collections import Counter, defaultdict\n", [
        (f'c = Counter("{w}")\nprint(c.most_common(1)[0])', [f'print(("{w[0]}", 1))', f'print(max("{w}"))', f'print(sorted(Counter("{w}").items())[0])']),
        (f'c = Counter("{w}")\nprint(c["{ch}"], c["?"])', [f'print("{w}".count("{ch}"), None)', f'print(len("{w}"), 0)']),
        (f"c = Counter({xs})\nprint(c[{k}])", [f"print({xs}[{k}])", f"print({k})"]),
        (f"c = Counter({xs})\nprint(len(c), sum(c.values()))", [f"print(len({xs}), sum({xs}))", f"print(len(set({xs})), sum(set({xs})))"]),
        (f"d = defaultdict(int)\nfor x in {xs}:\n    d[x] += 1\nprint(d[{k}], d[99])", [f"print({xs}.count({k}), None)", f"print({k}, 0)"]),
        (f"d = defaultdict(list)\nfor w in {ws}:\n    d[len(w)].append(w)\nprint(d[{L}])", [f"print({L})", f"print([w for w in {ws} if len(w) >= {L}])"]),
        (f"d = defaultdict(list)\nfor w in {ws}:\n    d[len(w)].append(w)\nprint(sorted(d))", [f"print(sorted({ws}))", f"print([len(w) for w in {ws}])"]),
        (f"d = defaultdict(int)\nprint(d[{k}], len(d))", ["print(0, 0)", "print(None, 0)", "print(None, 1)"]),
        (f"d = {{}}\nd[{k}] += 1\nprint(d)", [f"print({{{k}: 1}})", "print({})"]),
        (f"c = Counter({ws[:3] + ws[:1]})\nprint(c.most_common(1)[0][1], len(c))", ["print(1, 4)", "print(2, 4)", "print(1, 3)"]),
    ], "Counter counts items and returns 0 for anything unseen. defaultdict creates a default value the first time a missing key is read, which also adds that key.")


@t(B, LIB, 2)
def _(r):
    a, b, m, d, k, xs = r.randint(1, 30), r.randint(2, 9), r.randint(1, 12), r.randint(1, 28), r.randint(1, 40), uniq(r, 4, 1, 9)
    x = f"{a}.{r.randint(1, 9)}"
    return body(r, "", [
        (f"import math\nprint(math.floor(-{x}), math.ceil(-{x}))", [f"print(-{a}, -{a + 1})", f"print(-{a}, -{a})", f"print(-{a + 1}, -{a + 1})"]),
        (f"import math\nprint(math.floor({x}), math.ceil({x}), round({x}))", [f"print({a}, {a + 1}, {a + 1 if round(float(x)) == a else a})", f"print({a + 1}, {a}, {a})"]),
        (f"import math\nprint(math.sqrt({b * b}))", [f"print({b})", f"print({b * b / 2})"]),
        (f'import json\ns = json.dumps({{"a": {a}, "b": [1, 2]}})\nprint(type(s).__name__, len(json.loads(s)))', ['print("dict", 2)', 'print("str", 3)', 'print("dict", 3)']),
        (f"import json\nd = json.loads('{{\"n\": {a}, \"ok\": true, \"v\": null}}')\nprint(d['ok'], d['v'], d['n'] + 1)", [f"print('true', 'null', {a + 1})", f"print(True, None, '{a}1')"]),
        (f'import json\nprint(json.dumps({{"ok": True, "v": None, "n": {a}}}))', [f"print({{'ok': True, 'v': None, 'n': {a}}})", f"print('ok, v, n')"]),
        (f"from datetime import date, timedelta\nprint(date(2026, {m}, {d}) + timedelta(days={k}))", [f"print('2026-{m:02d}-{d + k:02d}')", f"from datetime import date\nprint(date(2026, {m}, {d}))", f"from datetime import date, timedelta\nprint(date(2026, {m}, {d}) + timedelta(days={k + 1}))"]),
        (f"from datetime import date\nprint((date(2026, {m}, {d}) - date(2026, 1, 1)).days)", [f"print({(m - 1) * 30 + d})", f"print({m * 30 + d})"]),
        (f"from datetime import date\nprint(date(2026, {m}, {d}).strftime('%d/%m/%Y'))", [f"print('{m:02d}/{d:02d}/2026')", f"print('2026-{m:02d}-{d:02d}')", f"print('{d}/{m}/26')"]),
        (f"from itertools import combinations\nprint(len(list(combinations({xs}, 2))))", ["print(12)", "print(16)", "print(8)"]),
        (f"from itertools import permutations\nprint(len(list(permutations({xs[:3]}, 2))))", ["print(3)", "print(9)", "print(8)"]),
        (f"from itertools import chain\nprint(list(chain({xs[:2]}, {xs[2:]})))", [f"print([{xs[:2]}, {xs[2:]}])", f"print(list(zip({xs[:2]}, {xs[2:]})))"]),
        (f"import math\nprint(math.pi > 3, math.isclose(0.1 + 0.2, 0.3), 0.1 + 0.2 == 0.3, {a})", [f"print(True, True, True, {a})", f"print(True, False, False, {a})"]),
    ], "math.floor rounds down and math.ceil rounds up, also for negatives. json turns Python objects into text and back (true/false/null become True/False/None). date arithmetic uses timedelta.")


MUT = "Mutability, copies and identity"


@t(B, MUT, 3)
def _(r):
    a, b, c = uniq(r, 3, 1, 9)
    v, w = r.randint(10, 99), r.choice(WORDS)
    return body(r, "", [
        (f"import copy\na = [[{a}, {b}], [{c}]]\nb = copy.copy(a)\nb[0].append({v})\nprint(len(a[0]))", ["print(2)", "print(1)"]),
        (f"import copy\na = [[{a}, {b}], [{c}]]\nb = copy.deepcopy(a)\nb[0].append({v})\nprint(len(a[0]))", ["print(3)", "print(1)"]),
        (f"a = [[{a}, {b}], [{c}]]\nb = a[:]\nb.append([{v}])\nb[1].append({v})\nprint(len(a), a[1])", [f"print(3, [{c}, {v}])", f"print(2, [{c}])", f"print(3, [{c}])"]),
        (f"a = [{a}, {b}]\nb = [{a}, {b}]\nprint(a == b, a is b)", ["print(True, True)", "print(False, False)", "print(False, True)"]),
        (f"a = [{a}, {b}]\nb = a\nprint(a == b, a is b)", ["print(True, False)", "print(False, False)", "print(False, True)"]),
        (f"a = [{a}, {b}]\nb = a\na += [{c}]\nprint(b)", [f"print([{a}, {b}])", f"print([{c}])"]),
        (f"a = [{a}, {b}]\nb = a\na = a + [{c}]\nprint(b)", [f"print([{a}, {b}, {c}])", f"print([{c}])"]),
        (f"a = ({a}, {b})\nb = a\na += ({c},)\nprint(b)", [f"print(({a}, {b}, {c}))", f"print(({c},))"]),
        (f's = "{w}"\nt = s\ns += "!"\nprint(t)', [f'print("{w}!")', 'print("!")']),
        (f"a = {{'k': [{a}]}}\nb = a.copy()\nb['k'].append({b})\nprint(a['k'])", [f"print([{a}])", f"print([{b}])"]),
        (f"a = {{'k': {a}}}\nb = a.copy()\nb['k'] = {b}\nprint(a['k'])", [f"print({b})", f"print({a + b})"]),
        (f"a = [{a}, {b}, {c}]\nb = a[::-1]\nb[0] = {v}\nprint(a[-1], a is b)", [f"print({v}, False)", f"print({v}, True)", f"print({c}, True)"]),
    ], "== compares values and `is` compares identity. A shallow copy makes a new outer container that still shares the inner objects; += changes a list in place but rebinds a tuple or string.")


# ───────────────────────── NumPy ─────────────────────────

@t(NP, "Arrays and element-wise arithmetic", 1)
def _(r):
    xs, k = uniq(r, r.randint(3, 4), 1, 9), r.randint(2, 4)
    return expr(r, f"{NPRE}a = np.array({xs})\n", [
        (f"a * {k}", [f"np.array({xs} * {k})", f"a + {k}", f"a ** {k}"]),
        ("a + a", [f"np.array({xs} + {xs})", "a ** 2"]),
        ("a ** 2", ["a * 2", f"np.array({xs} * 2)"]),
        (f"a - {k}", [f"a + {k}", "a[:-1]"]),
        (f"(a * {k}).sum()", ["a.sum()", f"a.sum() + {k}"]),
        (f"a > {k}", [f"a[a > {k}]", f"a >= {k}", f"a < {k}"]),
        (f"len({xs} * 2), len(a * 2)", ["len(a * 2), len(a * 2)", f"len({xs} * 2), len({xs} * 2)", f"len(a), len({xs} * 2)"]),
        (f"a // {k}", [f"a % {k}", f"a / {k}"]),
        ("a % 2 == 0", ["a[a % 2 == 0]", "a % 2", "a % 2 == 1"]),
        (f"a + np.array({xs[::-1]})", [f"np.array({xs} + {xs[::-1]})", f"a * np.array({xs[::-1]})"]),
    ], "NumPy arithmetic is element-wise: the operation is applied to every element. Multiplying a plain list repeats it instead.")


SHP = "Shape, reshape and indexing"


@t(NP, SHP, 1)
def _(r):
    rr, c = r.choice([(2, 3), (3, 2), (2, 4), (4, 2), (3, 4), (4, 3), (2, 5), (3, 5)])
    i, j = r.randint(0, rr - 1), r.randint(0, c - 1)
    return expr(r, f"{NPRE}a = np.arange({rr * c}).reshape({rr}, {c})\n", [
        ("a.shape", ["a.T.shape", "a.size", "(a.size,)"]),
        (f"a[{i}, {j}]", [f"a[{i}, {j}] + 1", f"{i + j}", f"a[{i}, {j}] - 1"]),
        (f"a[{i}]", [f"a[:, {i % c}]", f"a[{i}] + 1"]),
        (f"a[:, {j}]", [f"a[{j % rr}]", f"a[:, {j}] + 1"]),
        ("a.T.shape", ["a.shape", "a.size", "(a.size,)"]),
        ("a.size, a.ndim", ["a.shape", "a.ndim, a.size", "len(a), a.ndim"]),
        ("len(a)", ["a.size", "a.shape[1]", "a.ndim"]),
        ("a.reshape(-1).shape", ["a.shape", "a.size", "(1, a.size)"]),
        (f"a.reshape({c}, -1).shape", ["a.shape", "(a.size,)"]),
        (f"a.reshape({rr}, {c + 1}).shape", ["a.shape", f"({rr}, {c + 1})"]),
        ("a[-1, -1]", ["a.size", "a[0, 0]", "a[-1, 0]"]),
        (f"a[{i}].sum()", [f"a[:, {i % c}].sum()", "a.sum()"]),
        ("a[:, 1:].shape", ["a.shape", f"({rr - 1}, {c})"]),
    ], "shape is (rows, columns). a[i, j] picks one element, a[i] a whole row and a[:, j] a whole column. reshape must keep the same number of elements.")


@t(NP, SHP, 2)
def _(r):
    xs = uniq(r, 6, 1, 30)
    i, j = sorted(r.sample(range(6), 2))
    return expr(r, f"{NPRE}a = np.array({xs})\n", [
        (f"a[[{i}, {j}]]", [f"a[{i}:{j}]", f"a[{i}:{j + 1}]", f"a[{i}] + a[{j}]"]),
        (f"a[{i}:{j + 1}]", [f"a[{i}:{j}]", f"a[[{i}, {j}]]"]),
        ("a[::-1]", ["np.sort(a)", "a[-1]", "np.sort(a)[::-1]"]),
        ("a[::2]", ["a[1::2]", "a[:2]"]),
        (f"a[-{j + 1}:]", [f"a[:-{j + 1}]", f"a[-{j + 1}]"]),
        ("a[[0, 0, -1]]", ["a[[0, -1]]", "a[0:-1]"]),
        (f"a[{i}:{j + 1}].sum()", [f"a[{i}:{j}].sum()", f"a[{i}] + a[{j}]"]),
        (f"a[{j}:{i}]", [f"a[{i}:{j}]", f"a[{i}:{j}][::-1]"]),
    ], "A list of positions inside the brackets (fancy indexing) picks exactly those elements; a slice a[i:j] takes a range and excludes j.")


@t(NP, "Creating arrays", 1)
def _(r):
    a, b, s, n = r.randint(0, 4), r.randint(6, 14), r.randint(2, 3), r.randint(3, 6)
    return expr(r, NPRE, [
        (f"np.arange({a}, {b}, {s})", [f"np.arange({a}, {b + 1}, {s})", f"np.arange({a}, {b})", f"np.arange({a + s}, {b}, {s})"]),
        (f"np.arange({n})", [f"np.arange(1, {n + 1})", f"np.arange({n + 1})"]),
        (f"np.linspace(0, {n - 1}, {n})", [f"np.arange(0, {n - 1})", f"np.arange(0, {n})"]),
        (f"np.zeros(({s}, {n})).shape", [f"({n}, {s})", f"{s * n}"]),
        (f"np.ones({n}).sum()", [f"{n}", "1.0"]),
        (f"np.zeros({n}).dtype", ['"int64"', '"bool"']),
        (f"np.full({n}, {b}).sum()", [f"{b}", f"{n + b}"]),
        (f"np.eye({s}).sum()", [f"{s * s}.0", f"{s}"]),
        (f"np.array([{a}, {b}.5, {n}]).dtype", ['"int64"', '"object"']),
        (f"np.array([[{a}, {b}], [{n}, {s}]]).shape", ["4", "(4,)", "(2,)"]),
        (f"len(np.linspace(0, 1, {n}))", [f"{n - 1}", f"{n + 1}"]),
        (f"np.arange({n}) * {s}", [f"np.arange({n * s})", f"np.arange({n}) + {s}"]),
        (f"np.ones(({s}, {n}), dtype=int).sum(axis=0)", [f"np.ones(({s}, {n}), dtype=int).sum(axis=1)", f"{s * n}"]),
    ], "np.arange excludes the stop value like range; np.linspace includes both ends and returns floats. zeros, ones and eye create float arrays by default.")


@t(NP, "Boolean masks and np.where", 2)
def _(r):
    xs = uniq(r, r.randint(5, 6), 1, 20)
    k, hi = sorted(xs)[r.randint(1, 3)], max(xs)
    return expr(r, f"{NPRE}a = np.array({xs})\n", [
        (f"a[a > {k}]", [f"a[a >= {k}]", f"a > {k}", f"a[a < {k}]"]),
        (f"(a > {k}).sum()", [f"a[a > {k}].sum()", f"(a >= {k}).sum()"]),
        (f"a[a > {k}].sum()", [f"(a > {k}).sum()", "a.sum()"]),
        (f"round(a[a > {k}].mean(), 2)", ["round(a.mean(), 2)", f"(a > {k}).sum()"]),
        (f"a[(a > {k}) & (a < {hi})]", [f"a[(a > {k}) | (a < {hi})]", f"a[a > {k}]"]),
        (f"np.where(a > {k}, 1, 0)", [f"np.where(a > {k})[0]", f"np.where(a > {k}, 0, 1)"]),
        (f"np.where(a > {k})[0]", [f"a[a > {k}]", f"np.where(a > {k}, 1, 0)"]),
        ("a[a % 2 == 0]", ["a[a % 2 == 1]", "a % 2 == 0"]),
        (f"a[(a > {k}) and (a < {hi})]", [f"a[(a > {k}) & (a < {hi})]", "a"]),
        (f"(a > {k}).any(), (a > {hi}).any()", ["True, True", "False, False", "False, True"]),
        (f"len(a[a != {k}])", ["len(a)", f"len(a[a > {k}])"]),
        (f"np.where(a > {k}, a, 0).sum()", ["a.sum()", f"(a > {k}).sum()"]),
    ], "A comparison on an array gives a True/False mask. a[mask] keeps the True positions; combine masks with & and |, never `and`/`or`. Summing a mask counts the Trues.")


@t(NP, "Aggregations and axes", 2)
def _(r):
    m = [uniq(r, 3, 1, 9) for _ in range(2)]
    return expr(r, f"{NPRE}m = np.array({m})\n", [
        ("m.sum(axis=0)", ["m.sum(axis=1)", "m.sum()"]),
        ("m.sum(axis=1)", ["m.sum(axis=0)", "m.sum()"]),
        ("m.sum()", ["m.sum(axis=0)", "m.sum(axis=1)", "m.size"]),
        ("m.max(axis=0)", ["m.max(axis=1)", "m.max()"]),
        ("m.max(axis=1)", ["m.max(axis=0)", "m.max()"]),
        ("m.mean(axis=0)", ["m.sum(axis=0)", "m.max(axis=0)"]),
        ("m.min(), m.max()", ["m.min(axis=0), m.max(axis=0)", "m.max(), m.min()"]),
        ("m.argmax()", ["m.max()", "m.argmax(axis=1)"]),
        ("m.sum(axis=0).shape", ["m.sum(axis=1).shape", "m.shape"]),
        ("m.argmax(axis=1)", ["m.max(axis=1)", "m.argmax(axis=0)"]),
        ("m.cumsum()", ["m.sum(axis=0)", "m.cumsum(axis=1)[0]"]),
        ("m.min(axis=1)", ["m.min(axis=0)", "m.min()"]),
    ], "axis=0 collapses the rows and gives one result per column; axis=1 collapses the columns and gives one result per row. With no axis the whole array is reduced.")


@t(NP, "Broadcasting", 3)
def _(r):
    m, v, c, k = [uniq(r, 3, 1, 9) for _ in range(2)], uniq(r, 3, 1, 5), uniq(r, 2, 1, 5), r.randint(2, 5)
    return expr(r, f"{NPRE}m = np.array({m})\nv = np.array({v})\n", [
        ("(m + v)[1]", ["m[1]", "(m + v)[0]", "m[1] + 1"]),
        ("(m * v)[0]", ["m[0]", "(m + v)[0]", "(m * v)[1]"]),
        ("(m + v).shape", ["v.shape", "(2, 6)", "(3, 2)"]),
        (f"(m + np.array({c})).shape", ["m.shape", "(2, 2)"]),
        (f"(m + np.array({c}).reshape(2, 1))[0]", [f"m[0] + {c[1]}", "m[0]"]),
        ("(v.reshape(3, 1) + v).shape", ["(3,)", "(6,)", "(3, 1)"]),
        (f"(m + {k})[0]", ["m[0]", f"m[0] * {k}"]),
        ("(m - m.mean(axis=0))[0]", ["m[0] - m.mean()", "m[0]"]),
        ("(v * v).sum(), v @ v", ["v.sum() ** 2, v @ v", "(v * v).sum(), v.sum()"]),
        ("(m * 2 + v)[1, 2]", ["m[1, 2] * 2", "(m + v)[1, 2] * 2"]),
    ], "Broadcasting stretches a smaller array across a larger one when the trailing dimensions match or are 1. A (2, 3) array works with shape (3,) or (2, 1), but not with (2,).")


@t(NP, "Views and copies", 3)
def _(r):
    xs, v = uniq(r, 5, 1, 20), r.randint(50, 99)
    return body(r, f"{NPRE}a = np.array({xs})\n", [
        (f"b = a[1:3]\nb[0] = {v}\nprint(a)", ["print(a)", f"a[0] = {v}\nprint(a)"]),
        (f"b = a[1:3].copy()\nb[0] = {v}\nprint(a)", [f"b = a[1:3]\nb[0] = {v}\nprint(a)", f"a[0] = {v}\nprint(a)"]),
        (f"b = a[[1, 2]]\nb[0] = {v}\nprint(a[1])", [f"print({v})", "print(a[2])"]),
        (f"b = a\nb[0] = {v}\nprint(a[0])", ["print(a[0])", "print(a[1])"]),
        (f"b = a * 1\nb[0] = {v}\nprint(a[0])", [f"print({v})", "print(a[1])"]),
        (f"b = a.reshape(5, 1)\nb[0, 0] = {v}\nprint(a[0])", ["print(a[0])", "print(a[1])"]),
        (f"lst = {xs}\nc = lst[1:3]\nc[0] = {v}\nb = a[1:3]\nb[0] = {v}\nprint(lst[1], a[1])", [f"print({v}, {v})", f"print({xs[1]}, {xs[1]})", f"print({v}, {xs[1]})"]),
        (f"a[a > {sorted(xs)[2]}] = 0\nprint(a)", ["print(a)", f"print(a[a > {sorted(xs)[2]}])"]),
        (f"a[1:4] = {v}\nprint(a)", ["print(a)", f"a[1] = {v}\nprint(a)"]),
        (f"b = a[::2]\nb += 100\nprint(a[0], a[1])", [f"print({xs[0]}, {xs[1]})", f"print({xs[0] + 100}, {xs[1] + 100})"]),
    ], "A basic slice of a NumPy array is a view on the same data, so writing through it changes the original. .copy(), fancy indexing and arithmetic create new arrays. List slices always copy.")


@t(NP, "Sorting, unique and cumulative", 2)
def _(r):
    xs = ints(r, 6, 1, 9)
    return expr(r, f"{NPRE}a = np.array({xs})\n", [
        ("np.sort(a)", ["a.argsort()", "np.sort(a)[::-1]", "np.unique(a)"]),
        ("np.unique(a)", ["np.sort(a)", "len(np.unique(a))"]),
        ("len(np.unique(a))", ["len(a)", "a.max()"]),
        ("a.argmax()", ["a.max()", "a.argmin()"]),
        ("a.argmin()", ["a.min()", "a.argmax()"]),
        ("a.argsort()[0]", ["np.sort(a)[0]", "a.argmax()"]),
        ("np.cumsum(a)", ["a.sum()", "np.diff(a)"]),
        ("np.diff(a)", ["np.cumsum(a)", "a[1:] + a[:-1]"]),
        ("np.sort(a)[-2:]", ["a[-2:]", "np.sort(a)[:2]"]),
        ("np.median(a)", ["round(a.mean(), 2)", "np.sort(a)[3]"]),
        ("a.max() - a.min()", ["a[-1] - a[0]", "a.max() + a.min()"]),
        ("np.sort(a)[0], a[0]", ["a[0], a[0]", "np.sort(a)[0], np.sort(a)[0]"]),
    ], "np.sort returns sorted values; argsort, argmax and argmin return positions. np.unique returns the distinct values in sorted order.")


@t(NP, "Combining arrays and dot products", 2)
def _(r):
    x, y = uniq(r, 3, 1, 9), uniq(r, 3, 1, 9)
    return expr(r, f"{NPRE}a = np.array({x})\nb = np.array({y})\n", [
        ("np.concatenate([a, b])", ["a + b", "a * b"]),
        ("a + b", ["np.concatenate([a, b])", "a * b"]),
        ("np.vstack([a, b]).shape", ["np.hstack([a, b]).shape", "(3, 2)"]),
        ("np.hstack([a, b]).shape", ["np.vstack([a, b]).shape", "(2, 3)"]),
        ("a @ b", ["a * b", "(a + b).sum()"]),
        ("a * b", ["a @ b", "a + b"]),
        ("np.dot(a, b)", ["a * b", "a.sum() * b.sum()"]),
        ("np.column_stack([a, b]).shape", ["np.vstack([a, b]).shape", "(6,)"]),
        ("np.append(a, b).size", ["2", "a.size"]),
        ("np.maximum(a, b)", ["max(a.max(), b.max())", "np.minimum(a, b)"]),
        ("np.vstack([a, b]).sum(axis=0)", ["np.vstack([a, b]).sum(axis=1)", "np.concatenate([a, b])"]),
    ], "a + b adds element by element; np.concatenate joins end to end. a * b is element-wise, while a @ b (np.dot) multiplies matching elements and sums them.")


@t(NP, "Data types and missing values", 2)
def _(r):
    a, b, c = uniq(r, 3, 1, 9)
    f1, f2 = f"{a}.{r.choice([2, 5, 7, 9])}", f"{b}.{r.choice([1, 4, 6, 8])}"
    return expr(r, NPRE, [
        (f"np.array([{f1}, {f2}]).astype(int)", [f"np.round(np.array([{f1}, {f2}])).astype(int)", f"np.array([{f1}, {f2}])"]),
        (f"np.array([{a}, {b}, {f1}]).dtype", ['"int64"', '"object"']),
        (f"np.array([True, False, True, {r.choice(['True', 'False'])}]).sum()", ["4", "True"]),
        (f"np.array([{a}, np.nan, {b}]).sum()", [f"{a + b}", f"{a + b}.0"]),
        (f"np.nansum(np.array([{a}, np.nan, {b}]))", ["np.nan", f"{a + b}"]),
        (f"np.nan == np.nan, {a} == {a}.0", ["True, True", "False, False", "True, False"]),
        (f"np.isnan(np.array([{a}, np.nan, {b}, np.nan])).sum()", ["0", "4"]),
        (f"np.nanmean(np.array([{a}, np.nan, {a + 2 * c}]))", ["np.nan", f"round(({a} + {a + 2 * c}) / 3, 2)"]),
        (f"np.array([{a}, {b}]) / 2", [f"np.array([{a}, {b}]) // 2", f"np.array([{a}, {b}]) * 2"]),
        (f"(np.array([{a}, {b}]) / 1).dtype", ['"int64"', '"int32"']),
        (f"np.array([{a}, {b}], dtype=float)", [f"np.array([{a}, {b}])", f"np.array([{a}, {b}]) / 2"]),
        (f"np.array([{a}, {b}, {c}]).astype(str).dtype.kind", ['"i"', '"O"']),
    ], "An array has one dtype: a single float turns the whole array into float64. astype(int) truncates. NaN spreads through sum and mean unless you use the nan-aware versions, and NaN never equals itself.")


# ───────────────────────── pandas: selecting ─────────────────────────

@t(PS, "DataFrame basics", 1)
def _(r):
    pre, names, cities, sales, units = mkdf(r, r.randint(4, 6))
    n = len(names)
    return expr(r, pre, [
        ("df.shape", ["df.shape[::-1]", "df.size", "len(df)"]),
        ("len(df)", ["df.size", "df.shape[1]"]),
        ("df.size", ["len(df)", "df.shape"]),
        ("list(df.columns)", ["list(df.index)", "df.shape[1]"]),
        ("df.shape[1]", ["df.shape[0]", "df.size"]),
        ('type(df["sales"]).__name__', ['"DataFrame"', '"list"', '"ndarray"']),
        ('type(df[["sales"]]).__name__', ['"Series"', '"list"', '"ndarray"']),
        ('df[["name", "sales"]].shape', ["df.shape", f"({n},)", "(2,)"]),
        ('df["sales"].sum()', ['df["units"].sum()', 'df["sales"].max()']),
        ('df["sales"].max()', ['df["sales"].min()', 'df["sales"].idxmax()']),
        ('df["sales"].idxmax()', ['df["sales"].max()', 'df["sales"].idxmin()']),
        ('df["name"].iloc[-1]', ['df["name"].iloc[0]', 'df["city"].iloc[-1]']),
        ('df.head(2)["name"].tolist()', ['df.tail(2)["name"].tolist()', 'df["name"].tolist()[:3]']),
        ('df.tail(2)["sales"].tolist()', ['df.head(2)["sales"].tolist()', 'df["sales"].tolist()[-3:]']),
        ('df["Sales"].sum()', ['df["sales"].sum()', "0"]),
        ('df["sales"].min(), df["units"].max()', ['df["sales"].max(), df["units"].min()', 'df["units"].max(), df["sales"].min()']),
    ], "shape is (rows, columns) and len(df) is the row count. df[\"col\"] gives a Series, df[[\"col\"]] a DataFrame. Column names are case-sensitive.")


@t(PS, "loc and iloc", 2)
def _(r):
    pre, names, cities, sales, units = mkdf(r, 5)
    i, a = r.randint(0, 4), r.randint(0, 2)
    b, idx = a + r.randint(1, 2), [10, 20, 30, 40, 50]
    return body(r, pre, [
        (f'print(df.iloc[{i}]["name"])', [f'print(df.iloc[{i - 1}]["name"])', f'print(df.iloc[{i}]["city"])']),
        (f"print(df.iloc[{i}, 2])", [f"print(df.iloc[{i}, 3])", f"print(df.iloc[{i}, 1])", f"print(df.iloc[2, {i % 4}])"]),
        (f'print(df.loc[{i}, "sales"])', [f'print(df.loc[{i}, "units"])', f'print(df.loc[{(i + 1) % 5}, "sales"])']),
        (f"print(len(df.iloc[{a}:{b}]), len(df.loc[{a}:{b}]))", [f"print({b - a}, {b - a})", f"print({b - a + 1}, {b - a + 1})", f"print({b - a + 1}, {b - a})"]),
        (f'print(df.loc[{a}:{b}, "name"].tolist())', [f'print(df.iloc[{a}:{b}]["name"].tolist())', f'print(df.loc[{a + 1}:{b}, "name"].tolist())']),
        (f'print(df.iloc[{a}:{b}]["name"].tolist())', [f'print(df.loc[{a}:{b}, "name"].tolist())', f'print(df.iloc[{a + 1}:{b + 1}]["name"].tolist())']),
        (f'df.index = {idx}\nprint(df.loc[{idx[i]}, "name"])', [f'print(df.iloc[{i - 1}]["name"])', f'print(df.iloc[{(i + 1) % 5}]["name"])']),
        (f'df.index = {idx}\nprint(df.loc[{i}, "name"])', [f'print(df.iloc[{i}]["name"])', "print(None)"]),
        (f'df.index = {idx}\nprint(df.iloc[{i}]["sales"])', [f'print(df.iloc[{i - 1}]["sales"])', f"print({idx[i]})"]),
        (f'df = df.set_index("name")\nprint(df.loc["{names[i]}", "sales"])', [f'print(df.iloc[{i - 1}]["sales"])', f'print(df.iloc[{i}]["units"])']),
        ('print(df.iloc[-1]["sales"], df.iloc[0]["sales"])', ['print(df.iloc[0]["sales"], df.iloc[-1]["sales"])', 'print(df["sales"].max(), df["sales"].min())']),
        (f'df.index = {idx}\nprint(df.iloc[{i}].name)', [f'print(df.iloc[{i}]["name"])', f"print({i})"]),
    ], "iloc selects by position and excludes the stop of a slice; loc selects by label and includes it. After the index is changed, loc needs the new labels.")


@t(PS, "Filtering rows", 2)
def _(r):
    pre, names, cities, sales, units = mkdf(r, r.randint(5, 6))
    k, c, u, hi = sorted(sales)[r.randint(1, 3)], r.choice(cities), sorted(units)[len(units) // 2], max(sales)
    both = f'df[(df["city"] == "{c}") & (df["sales"] > {k})]["name"].tolist()'
    either = f'df[(df["city"] == "{c}") | (df["sales"] > {k})]["name"].tolist()'
    return expr(r, pre, [
        (f'len(df[df["sales"] > {k}])', [f'len(df[df["sales"] >= {k}])', "len(df)", f'len(df[df["sales"] < {k}])']),
        (f'df[df["city"] == "{c}"]["sales"].sum()', ['df["sales"].sum()', f'len(df[df["city"] == "{c}"])']),
        (both, [either, f'df[df["city"] == "{c}"]["name"].tolist()', f'df[df["sales"] > {k}]["name"].tolist()']),
        (either, [both, f'df[df["city"] == "{c}"]["name"].tolist()', f'df[df["sales"] > {k}]["name"].tolist()']),
        (f'df[df["city"] == "{c}" and df["sales"] > {k}]["name"].tolist()', [both, either]),
        (f'df[df["city"].isin(["{c}", "Goa"])].shape[0]', ["len(df)", f'len(df[df["city"] != "{c}"])']),
        (f'df[~(df["sales"] > {k})]["name"].tolist()', [f'df[df["sales"] > {k}]["name"].tolist()', f'df[df["sales"] < {k}]["name"].tolist()']),
        (f'df.query("sales > {k} and units >= {u}")["name"].tolist()', [f'df.query("sales > {k} or units >= {u}")["name"].tolist()', f'df.query("sales > {k}")["name"].tolist()']),
        (f'df[df["sales"] > {k}]["units"].max()', ['df["units"].max()', f'df[df["sales"] <= {k}]["units"].max()']),
        (f'(df["sales"] > {k}).sum()', [f'df[df["sales"] > {k}]["sales"].sum()', f'(df["sales"] >= {k}).sum()']),
        (f'df.loc[df["units"] >= {u}, "name"].tolist()', [f'df.loc[df["units"] > {u}, "name"].tolist()', f'df.loc[df["units"] < {u}, "name"].tolist()']),
        (f'df[df["sales"].between({k}, {hi})].shape[0]', [f'len(df[(df["sales"] > {k}) & (df["sales"] < {hi})])', "len(df)"]),
    ], "df[mask] keeps the rows where the mask is True. Combine conditions with & and | and put each one in parentheses; the keywords and/or raise ValueError. between() includes both ends.")


@t(PS, "Sorting and ranking", 2)
def _(r):
    pre, names, cities, sales, units = mkdf(r, 5)
    k = r.randint(2, 3)
    return body(r, pre, [
        ('print(df.sort_values("sales")["name"].iloc[0])', ['print(df.sort_values("sales", ascending=False)["name"].iloc[0])', 'print(df["name"].iloc[0])']),
        ('print(df.sort_values("sales", ascending=False)["name"].iloc[0])', ['print(df.sort_values("sales")["name"].iloc[0])', 'print(df["name"].iloc[0])']),
        (f'print(df.sort_values("sales", ascending=False).head({k})["name"].tolist())', [f'print(df.sort_values("sales").head({k})["name"].tolist())', f'print(df.head({k})["name"].tolist())']),
        (f'print(df.nlargest({k}, "sales")["name"].tolist())', [f'print(df.nsmallest({k}, "sales")["name"].tolist())', f'print(df.head({k})["name"].tolist())']),
        (f'print(df.nsmallest({k}, "sales")["sales"].tolist())', [f'print(df.nlargest({k}, "sales")["sales"].tolist())', f'print(df.head({k})["sales"].tolist())']),
        ('s = df.sort_values("sales")\nprint(s.iloc[0]["name"], s.loc[0, "name"])', ['print(df.loc[0, "name"], df.loc[0, "name"])', 's = df.sort_values("sales")\nprint(s.iloc[0]["name"], s.iloc[0]["name"])']),
        ('df.sort_values("sales")\nprint(df["sales"].iloc[0])', ['df = df.sort_values("sales")\nprint(df["sales"].iloc[0])', 'print(df["sales"].max())']),
        ('df = df.sort_values("sales").reset_index(drop=True)\nprint(df.loc[0, "name"])', ['print(df.loc[0, "name"])', 'print(df.sort_values("sales", ascending=False)["name"].iloc[0])']),
        ('print(df.sort_values(["city", "sales"])["name"].iloc[0])', ['print(df.sort_values("sales")["name"].iloc[0])', 'print(df.sort_values("city")["name"].iloc[-1])']),
        ('print(df.sort_values("sales").index.tolist())', ["print(list(range(len(df))))", 'print(df.sort_values("sales", ascending=False).index.tolist())']),
        ('print(df["sales"].rank().astype(int).tolist())', ['print(df["sales"].rank(ascending=False).astype(int).tolist())', 'print(sorted(df["sales"]))']),
        ('print(df.sort_values("name")["name"].iloc[-1])', ['print(df["name"].iloc[-1])', 'print(df.sort_values("name")["name"].iloc[0])']),
    ], "sort_values returns a new, sorted DataFrame and keeps the original index labels, so iloc[0] (first position) and loc[0] (label 0) can differ afterwards.")


@t(PS, "Counting and unique values", 1)
def _(r):
    pre, names, cities, sales, units = mkdf(r, r.randint(5, 6))
    c = r.choice(cities)
    return expr(r, pre, [
        ('df["city"].nunique()', ["len(df)", 'df["city"].value_counts().max()']),
        ('sorted(df["city"].unique())', ['sorted(df["city"])', 'df["city"].nunique()']),
        (f'df["city"].value_counts()["{c}"]', ['df["city"].nunique()', f'df[df["city"] == "{c}"]["sales"].sum()']),
        ('df["city"].value_counts().iloc[0]', ['df["city"].nunique()', "len(df)"]),
        ('len(df["city"].value_counts())', ["len(df)", 'df["city"].value_counts().max()']),
        ('df["city"].count()', ['df["city"].nunique()', "df.size"]),
        (f'(df["city"] == "{c}").sum()', [f'(df["city"] != "{c}").sum()', 'df["city"].nunique()']),
        (f'(df["city"] == "{c}").mean().round(2)', [f'(df["city"] == "{c}").sum()', f'(df["city"] != "{c}").mean().round(2)']),
        ('df["city"].drop_duplicates().tolist()', ['df["city"].tolist()', 'sorted(df["city"].unique())']),
        ('df["city"].is_unique, df["name"].is_unique', ["True, True", "False, False", "True, False", "False, True"]),
        ('df["city"].value_counts().sum()', ['df["city"].nunique()', 'df["city"].value_counts().max()']),
    ], "nunique() counts distinct values, count() counts non-missing rows, and value_counts() gives one count per distinct value, largest first.")


@t(PS, "Missing values", 2)
def _(r):
    vals, holes, f = uniq(r, 5, 10, 60), r.sample(range(5), r.randint(1, 2)), r.randint(1, 9)
    col = [None if i in holes else v for i, v in enumerate(vals)]
    pre = f'{PPRE}df = pd.DataFrame({{\n    "name": {r.sample(NAMES, 5)},\n    "score": {col},\n}})\n'
    return expr(r, pre, [
        ('df["score"].isna().sum()', ['df["score"].count()', "len(df)"]),
        ('df["score"].count()', ["len(df)", 'df["score"].isna().sum()']),
        ("df.dropna().shape[0]", ["len(df)", 'df["score"].isna().sum()']),
        ('df["score"].sum()', ['float("nan")', f"{sum(vals)}.0"]),
        (f'df["score"].fillna({f}).sum()', ['df["score"].sum()', f'df["score"].sum() + {f}' if len(holes) > 1 else f'df["score"].sum() + {2 * f}']),
        ('round(df["score"].mean(), 2)', ['round(df["score"].fillna(0).mean(), 2)', 'float("nan")']),
        ('df["score"].dtype', ['"int64"', '"object"']),
        ('len(df), df["score"].count()', ["len(df), len(df)", 'df["score"].count(), df["score"].count()']),
        ('df["score"].isna().tolist()', ['df["score"].notna().tolist()', "[False] * 5"]),
        (f'df["score"].fillna({f}).astype(int).tolist()', ['df["score"].dropna().astype(int).tolist()', 'df["score"].fillna(0).astype(int).tolist()']),
        ('df.dropna()["name"].tolist()', ['df["name"].tolist()', 'df[df["score"].isna()]["name"].tolist()']),
        ("df.dropna()\nprint(len(df))".replace("\nprint(len(df))", ".shape[0] == len(df), len(df)"), ["True, 5", f"False, {5 - len(holes)}"]),
    ], "None in a numeric column becomes NaN and makes the column float64. sum, mean and count skip NaN; fillna replaces it and dropna removes those rows.")


@t(PS, "Adding and transforming columns", 2)
def _(r):
    pre, names, cities, sales, units = mkdf(r, 4)
    k = sorted(sales)[1]
    return body(r, pre, [
        ('df["total"] = df["sales"] * df["units"]\nprint(df["total"].max())', ['print((df["sales"] * df["units"]).sum())', 'print(df["sales"].max() * df["units"].max())']),
        ('df["total"] = df["sales"] * df["units"]\nprint(df.shape)', ["print(df.shape)", "print((5, 4))"]),
        ('df.assign(total=df["sales"] * 2)\nprint("total" in df.columns)', ["print(True)", "print(None)"]),
        ('df = df.assign(total=df["sales"] * 2)\nprint(df["total"].sum())', ['print(df["sales"].sum())', 'print(df["sales"].sum() + 2)']),
        ('df.drop(columns=["units"])\nprint(df.shape[1])', ["print(3)", "print(5)"]),
        ('df = df.drop(columns=["units"])\nprint(list(df.columns))', ["print(list(df.columns))", 'print(["units"])']),
        ('df = df.rename(columns={"sales": "revenue"})\nprint("sales" in df.columns, "revenue" in df.columns)', ["print(True, True)", "print(True, False)", "print(False, False)"]),
        ('print(df["name"].str.upper().iloc[0])', ['print(df["name"].iloc[0])', 'print(df["name"].str.upper().iloc[-1])']),
        ('print(df["name"].str.len().tolist())', ['print(len(df["name"]))', 'print(df["city"].str.len().tolist())']),
        (f'df["big"] = df["sales"] > {k}\nprint(df["big"].sum())', [f'print(df[df["sales"] > {k}]["sales"].sum())', f'print((df["sales"] >= {k}).sum())']),
        (f'print(df["sales"].apply(lambda x: x * 2 if x > {k} else x).tolist())', ['print((df["sales"] * 2).tolist())', 'print(df["sales"].tolist())']),
        ('df["sales"] = df["sales"] + 1\nprint(df["sales"].tolist())', ['print(df["sales"].tolist())', 'print((df["sales"] + 2).tolist())']),
        ('print(df["city"].map(len).tolist())', ['print(df["name"].map(len).tolist())', 'print(len(df["city"]))']),
        ('df["units"] = 0\nprint(df["units"].sum(), len(df))', ['print(df["units"].sum(), len(df))', "print(0, 0)"]),
    ], "Assigning to df[\"new\"] adds a column in place. assign, drop and rename return a new DataFrame and leave the original unchanged unless you assign the result back.")


@t(PS, "Series", 1)
def _(r):
    v, ix = uniq(r, 4, 1, 40), r.sample(list("abcdef"), 4)
    k, i, v2 = sorted(v)[1], r.randint(0, 3), uniq(r, 3, 1, 9)
    ix2 = r.sample(ix, 2) + ["z"]
    return expr(r, f"{PPRE}s = pd.Series({v}, index={ix})\n", [
        (f's["{ix[i]}"]', [f"s.iloc[{(i + 1) % 4}]", f"s.iloc[{i - 1}]"]),
        (f"s.iloc[{i}]", [f"s.iloc[{(i + 1) % 4}]", f'"{ix[i]}"']),
        (f"s[s > {k}].index.tolist()", [f"s[s > {k}].tolist()", f"s[s >= {k}].index.tolist()"]),
        ("s.idxmax()", ["s.max()", "s.idxmin()"]),
        (f'(s * 2)["{ix[i]}"]', [f's["{ix[i]}"]', f's["{ix[i]}"] + 2']),
        ("s.sort_values().index[0]", ["s.index[0]", "s.min()", "s.sort_index().index[0]"]),
        ("s.sort_index().iloc[0]", ["s.iloc[0]", "s.min()"]),
        (f"(s + pd.Series({v2}, index={ix2})).isna().sum()", ["0", "1", "2"]),
        ("s.to_dict()", ["s.tolist()", "list(s.index)"]),
        (f'"{ix[i]}" in s, {v[i]} in s', ["True, True", "False, True", "False, False"]),
        ("s.sum(), len(s)", ["len(s), s.sum()", "s.max(), len(s)"]),
        (f's["{ix[i]}"] == s.iloc[{i}], s.index[{i}]', [f'False, "{ix[i]}"', f"True, {i}"]),
    ], "A Series pairs values with index labels. s[label] and s.iloc[position] both read a value; `in` checks the labels, and adding two Series matches labels, giving NaN where one side is missing.")


# ───────────────────────── pandas: grouping and merging ─────────────────────────

GRP = "groupby"


@t(PG, GRP, 2)
def _(r):
    pre, names, cities, sales, units = mkdf(r, r.randint(5, 6))
    c, g = r.choice(cities), 'df.groupby("city")'
    return expr(r, pre, [
        (f'{g}["sales"].sum()["{c}"]', [f'{g}["sales"].max()["{c}"]', 'df["sales"].sum()', f'{g}["sales"].count()["{c}"]']),
        (f'{g}["sales"].max()["{c}"]', [f'{g}["sales"].sum()["{c}"]', 'df["sales"].max()', f'{g}["sales"].min()["{c}"]']),
        (f'round({g}["sales"].mean()["{c}"], 2)', ['round(df["sales"].mean(), 2)', f'{g}["sales"].sum()["{c}"]']),
        (f'{g}["sales"].count()["{c}"]', [f'{g}["sales"].sum()["{c}"]', "len(df)", f"len({g})"]),
        (f'{g}.size()["{c}"]', [f"len({g})", "len(df)", f'{g}["units"].sum()["{c}"]']),
        (f"len({g})", ["len(df)", f'{g}.size().max()']),
        (f"{g}.ngroups", ["len(df)", f'{g}.size().max()']),
        (f'{g}["sales"].sum().idxmax()', [f'{g}["sales"].sum().max()', f'{g}["sales"].sum().idxmin()']),
        (f'{g}["sales"].sum().sort_values().index[0]', [f'{g}["sales"].sum().index[0]', f'{g}["sales"].sum().min()', f'{g}["sales"].sum().sort_values().index[-1]']),
        (f'type({g}["sales"].sum()).__name__', ['"DataFrame"', '"dict"', '"list"']),
        (f'{g}["name"].first()["{c}"]', [f'{g}["name"].last()["{c}"]', 'df["name"].iloc[0]']),
        (f'{g}["name"].nunique()["{c}"]', [f"len({g})", "len(df)"]),
        (f'{g}["sales"].sum().index.tolist()', ['df["city"].tolist()', 'df["city"].drop_duplicates().tolist()', f'{g}["sales"].sum().tolist()']),
        (f'{g}["units"].sum().sum()', [f'{g}["units"].sum().max()', f"len({g})"]),
    ], "groupby splits the rows by key, applies the aggregation inside each group and returns one row per group, indexed by the group keys in sorted order.")


@t(PG, "Aggregating with agg", 3)
def _(r):
    pre, names, cities, sales, units = mkdf(r, r.randint(5, 6))
    c = r.choice(cities)
    named = 'df.groupby("city").agg(total=("sales", "sum"), n=("units", "count"))'
    return expr(r, pre, [
        (f'{named}.loc["{c}", "total"]', [f'{named}.loc["{c}", "n"]', 'df["sales"].sum()']),
        (f'{named}.loc["{c}", "n"]', [f'{named}.loc["{c}", "total"]', f'df[df["city"] == "{c}"]["units"].sum()']),
        (f"{named}.shape", ["df.shape", "(len(df), 2)"]),
        (f'df.groupby("city")["sales"].agg(["min", "max"]).loc["{c}"].tolist()', ['[df["sales"].min(), df["sales"].max()]', f'df.groupby("city")["sales"].agg(["max", "min"]).loc["{c}"].tolist()']),
        (f'df.groupby("city")["sales"].agg(lambda s: s.max() - s.min())["{c}"]', ['df["sales"].max() - df["sales"].min()', f'df.groupby("city")["sales"].max()["{c}"]']),
        (f"list({named}.columns)", ['["sales", "units"]', '["city", "total", "n"]']),
        (f'df.groupby("city")[["sales", "units"]].sum().loc["{c}"].tolist()', ['df[["sales", "units"]].sum().tolist()', f'df.groupby("city")[["units", "sales"]].sum().loc["{c}"].tolist()']),
        ('df.groupby("city", as_index=False)["sales"].sum().shape', ['df.groupby("city")["sales"].sum().shape', "df.shape"]),
        ('list(df.groupby("city", as_index=False)["sales"].sum().columns)', ['["sales"]', '["index", "sales"]']),
        ('df.groupby("city")["sales"].agg(["sum", "count"]).shape[1]', ["1", "4"]),
    ], "agg applies one or several aggregations per group. Named aggregation, new=(column, function), sets the output column names; as_index=False keeps the key as a normal column.")


@t(PG, "transform and cumulative operations", 3)
def _(r):
    pre, names, cities, sales, units = mkdf(r, 5)
    return expr(r, pre, [
        ('df.groupby("city")["sales"].transform("sum").tolist()', ['df.groupby("city")["sales"].sum().tolist()', 'df["sales"].tolist()']),
        ('df["sales"].cumsum().tolist()', ['df["sales"].tolist()', 'df.groupby("city")["sales"].cumsum().tolist()']),
        ('df.groupby("city")["sales"].cumsum().tolist()', ['df["sales"].cumsum().tolist()', 'df.groupby("city")["sales"].transform("sum").tolist()']),
        ('len(df.groupby("city")["sales"].transform("mean")), len(df.groupby("city")["sales"].mean())', ['len(df), len(df)', 'df["city"].nunique(), df["city"].nunique()']),
        ('df.groupby("city").cumcount().tolist()', ["list(range(len(df)))", 'df.groupby("city")["sales"].transform("count").tolist()']),
        ('df.groupby("city")["sales"].rank().astype(int).tolist()', ['df["sales"].rank().astype(int).tolist()', 'df.groupby("city").cumcount().tolist()']),
        ('(df["sales"] / df.groupby("city")["sales"].transform("sum")).round(2).tolist()', ['(df["sales"] / df["sales"].sum()).round(2).tolist()', "[1.0] * len(df)"]),
        ('df["sales"].diff().fillna(0).astype(int).tolist()', ['df["sales"].cumsum().tolist()', 'df["sales"].tolist()']),
        ('df["sales"].shift(1).isna().sum(), df["sales"].shift(1).iloc[1]', ['0, df["sales"].iloc[1]', 'df["sales"].iloc[2], 1']),
        ('df["units"].cumsum().iloc[-1], df["units"].sum()', ['df["units"].iloc[-1], df["units"].sum()', 'df["units"].cumsum().iloc[0], df["units"].sum()']),
        ('df.groupby("city")["sales"].transform("max").eq(df["sales"]).sum()', ['df["city"].nunique() + 1', "len(df)"]),
    ], "transform returns one value per original row (the group result repeated), so it lines up with the DataFrame; an aggregation returns one value per group. cumsum is a running total.")


MRG = "merge"


def mkmerge(r):
    ia, ib = sorted(r.sample(range(1, 7), r.randint(3, 4))), sorted(r.sample(range(1, 7), r.randint(3, 4)))
    pre = (f'{PPRE}a = pd.DataFrame({{"id": {ia}, "x": {uniq(r, len(ia), 10, 99)}}})\n'
           f'b = pd.DataFrame({{"id": {ib}, "y": {uniq(r, len(ib), 10, 99)}}})\n')
    return pre, ia, ib


@t(PG, MRG, 2)
def _(r):
    pre, ia, ib = mkmerge(r)
    hows = ["inner", "left", "right", "outer"]
    how = r.choice(hows)
    others = [h for h in hows if h != how]
    return expr(r, pre, [
        (f'len(a.merge(b, on="id", how="{how}"))', [f'len(a.merge(b, on="id", how="{h}"))' for h in others]),
        ('len(pd.merge(a, b, on="id"))', ['len(a.merge(b, on="id", how="left"))', 'len(a.merge(b, on="id", how="outer"))', "len(a) + len(b)"]),
        (f'a.merge(b, on="id", how="{how}")["id"].tolist()', [f'a.merge(b, on="id", how="{h}")["id"].tolist()' for h in others]),
        ('a.merge(b, on="id", how="left")["y"].isna().sum()', ['a.merge(b, on="id", how="right")["x"].isna().sum()', "0", "len(a)"]),
        ('a.merge(b, on="id", how="outer").shape', ["(len(a) + len(b), 3)", 'a.merge(b, on="id").shape', "(len(a) + len(b), 4)"]),
        ('list(a.merge(b, on="id").columns)', ['["id", "x", "id", "y"]', '["x", "y"]']),
        (f'a.merge(b, on="id", how="{how}").isna().sum().sum()', [f'a.merge(b, on="id", how="{h}").isna().sum().sum()' for h in others]),
        ('a.merge(b, on="id", how="left")["y"].count()', ["len(a)", "len(b)"]),
    ], "inner keeps ids found in both tables, left keeps every row of the left table, right every row of the right, and outer keeps all ids. Unmatched cells become NaN.")


@t(PG, MRG, 3)
def _(r):
    k1, k2 = uniq(r, 2, 1, 5)
    na, nb = r.randint(1, 3), r.randint(1, 3)
    pre = (f'{PPRE}a = pd.DataFrame({{"id": {[k1] * na + [k2]}, "v": {uniq(r, na + 1, 10, 99)}}})\n'
           f'b = pd.DataFrame({{"id": {[k1] * nb + [k2 + 10]}, "v": {uniq(r, nb + 1, 10, 99)}}})\n')
    return expr(r, pre, [
        ('len(a.merge(b, on="id"))', [f"{na + nb}", f"{min(na, nb)}", f"{max(na, nb)}"]),
        ('len(a.merge(b, on="id", how="left"))', [f"{na + 1}", f"{na * nb}", f"{na + nb}"]),
        ('len(a.merge(b, on="id", how="outer"))', [f"{na + nb + 2}", f"{na * nb}", f"{na * nb + 1}"]),
        ('list(a.merge(b, on="id").columns)', ['["id", "v"]', '["id", "v", "v"]', '["id", "v_a", "v_b"]']),
        ('list(a.merge(b, on="id", suffixes=("_a", "_b")).columns)', ['["id", "v_x", "v_y"]', '["id", "v"]']),
        ('a.merge(b, on="id", how="left")["v_y"].isna().sum()', ["0", f"{na}"]),
        ('len(a.merge(b)), len(a.merge(b, on="id"))', [f"{na * nb}, {na * nb}", f"{na + nb}, {na * nb}"]),
        ('a.merge(b, on="id")["id"].nunique()', [f"{na * nb + 1}", "2"]),
    ], "When a key repeats on both sides, merge returns every combination (rows multiply). Columns with the same name on both sides get _x and _y suffixes, and merging without `on` uses all shared column names.")


@t(PG, "concat", 2)
def _(r):
    na, nb = r.randint(2, 3), r.randint(2, 3)
    pre = (f'{PPRE}a = pd.DataFrame({{"id": {uniq(r, na, 1, 9)}, "v": {uniq(r, na, 10, 99)}}})\n'
           f'b = pd.DataFrame({{"id": {uniq(r, nb, 1, 9)}, "v": {uniq(r, nb, 10, 99)}}})\n'
           f'c = pd.DataFrame({{"id": {uniq(r, 2, 1, 9)}, "w": {uniq(r, 2, 10, 99)}}})\n')
    return expr(r, pre, [
        ("len(pd.concat([a, b]))", ["len(a)", f"{max(na, nb)}", f"{na * nb}"]),
        ("pd.concat([a, b]).index.tolist()", [f"list(range({na + nb}))", "a.index.tolist()"]),
        ("pd.concat([a, b], ignore_index=True).index.tolist()", ["pd.concat([a, b]).index.tolist()", "a.index.tolist()"]),
        ("pd.concat([a, b], axis=1).shape", ["pd.concat([a, b]).shape", f"({na + nb}, 4)"]),
        ("pd.concat([a, c]).shape", [f"({na + 2}, 2)", f"({na + 2}, 4)", f"({max(na, 2)}, 3)"]),
        ('pd.concat([a, c])["w"].isna().sum()', ["0", "2"]),
        ('pd.concat([a, b])["v"].sum()', ['a["v"].sum()', 'b["v"].sum()']),
        ('pd.concat([a, b]).loc[0, "v"].tolist()', ['[a.loc[0, "v"]]', '[b.loc[0, "v"]]']),
        ('pd.concat([a, b], ignore_index=True).loc[len(a), "v"]', ['a.loc[0, "v"]', 'b.loc[1, "v"]']),
        ("list(pd.concat([a, c]).columns)", ['["id", "v"]', '["id", "v", "id", "w"]']),
    ], "concat stacks DataFrames on top of each other (axis=0) and keeps each one's index, so labels can repeat unless ignore_index=True. Columns missing from one side are filled with NaN.")


@t(PG, "Duplicates", 2)
def _(r):
    base = [(r.choice(CITIES[:3]), r.choice("AB")) for _ in range(3)]
    rows = base + [r.choice(base) for _ in range(r.randint(2, 3))]
    r.shuffle(rows)
    pre = f'{PPRE}df = pd.DataFrame({{\n    "city": {[c for c, _ in rows]},\n    "plan": {[p for _, p in rows]},\n}})\n'
    return body(r, pre, [
        ("print(df.duplicated().sum())", ["print(len(df.drop_duplicates()))", "print(df.duplicated(keep=False).sum())"]),
        ("print(len(df.drop_duplicates()))", ["print(df.duplicated().sum())", "print(len(df))", 'print(df["city"].nunique())']),
        ('print(len(df.drop_duplicates(subset="city")))', ["print(len(df.drop_duplicates()))", "print(len(df))"]),
        ('print(df.drop_duplicates(subset="city", keep="last").index.tolist())', ['print(df.drop_duplicates(subset="city").index.tolist())', "print(df.index.tolist())"]),
        ("print(df.duplicated().tolist())", ["print(df.duplicated(keep=False).tolist())", 'print(df.duplicated(keep="last").tolist())']),
        ("print(df.drop_duplicates().index.tolist())", ['print(df.drop_duplicates(keep="last").index.tolist())', "print(list(range(len(df.drop_duplicates()))))"]),
        ("df.drop_duplicates()\nprint(len(df))", ["print(len(df.drop_duplicates()))", "print(df.duplicated().sum())"]),
        ('print(df["city"].duplicated().sum())', ["print(df.duplicated().sum())", 'print(df["city"].nunique())']),
        ("print(df.duplicated(keep=False).sum())", ["print(df.duplicated().sum())", "print(len(df.drop_duplicates()))"]),
    ], "duplicated() marks every repeat after the first occurrence; keep=False marks all copies. drop_duplicates returns a new DataFrame, keeps the original index labels and compares whole rows unless subset is given.")


@t(PG, "pivot_table and crosstab", 3)
def _(r):
    pre, cities, plans, sales = mkplan(r)
    c = r.choice(cities)
    wide = 'df.pivot_table(index="city", columns="plan", values="sales", aggfunc="sum", fill_value=0)'
    return expr(r, pre, [
        (f'df.pivot_table(index="city", values="sales", aggfunc="sum").loc["{c}", "sales"]', [f'df.pivot_table(index="city", values="sales", aggfunc="max").loc["{c}", "sales"]', 'df["sales"].sum()']),
        (f"{wide}.shape", ["df.shape", '(df["city"].nunique(), 3)', '(2, df["city"].nunique())']),
        (f'{wide}.loc["{c}", "A"]', [f'{wide}.loc["{c}", "B"]', f'df[df["city"] == "{c}"]["sales"].sum()' if any(p == "B" and ci == c for ci, p in zip(cities, plans)) else 'df["sales"].max()']),
        (f'pd.crosstab(df["city"], df["plan"]).loc["{c}", "A"]', [f'{wide}.loc["{c}", "A"]', f'pd.crosstab(df["city"], df["plan"]).loc["{c}", "B"]']),
        ('pd.crosstab(df["city"], df["plan"]).values.sum()', ['df["sales"].sum()', 'df["city"].nunique() * 2']),
        (f'round(df.pivot_table(index="city", values="sales").loc["{c}", "sales"], 2)', [f'df.pivot_table(index="city", values="sales", aggfunc="sum").loc["{c}", "sales"]', 'round(df["sales"].mean(), 2)']),
        (f"list({wide}.columns)", ['["city", "A", "B"]', '["plan", "sales"]', '["sales"]']),
        ('df.pivot_table(index="city", columns="plan", values="sales", aggfunc="sum").isna().sum().sum()', [f"({wide} == 0).sum().sum() + 1", 'df["sales"].isna().sum() - 1']),
        (f"{wide}.values.sum()", ['df["sales"].max()', 'df["sales"].mean()']),
    ], "pivot_table groups by index (and columns) and aggregates values, using the mean unless aggfunc says otherwise. crosstab counts rows per combination.")


@t(PG, GRP, 3)
def _(r):
    pre, cities, plans, sales = mkplan(r)
    c, p = cities[0], plans[0]
    return expr(r, pre, [
        ('df.groupby(["city", "plan"]).size().max()', ['df.groupby("city").size().max()', 'len(df.groupby(["city", "plan"]))']),
        ('len(df.groupby(["city", "plan"]))', ['len(df.groupby("city"))', "len(df)", 'df["city"].nunique() * 2']),
        (f'df.groupby(["city", "plan"])["sales"].sum().loc[("{c}", "{p}")]', [f'df.groupby("city")["sales"].sum()["{c}"]', f'df.groupby("plan")["sales"].sum()["{p}"]']),
        ('df.groupby("city")["sales"].sum().reset_index().shape', ['df.groupby("city")["sales"].sum().shape', "df.shape"]),
        ('df.groupby("plan")["sales"].max().to_dict()', ['df.groupby("plan")["sales"].min().to_dict()', 'df.groupby("plan")["sales"].count().to_dict()']),
        ('df.groupby("city").filter(lambda g: len(g) > 1).shape[0]', ['(df.groupby("city").size() > 1).sum()', "len(df)"]),
        ('df.groupby("city")["sales"].apply(lambda s: s.max() - s.min()).max()', ['df["sales"].max() - df["sales"].min()', 'df.groupby("city")["sales"].max().max()']),
        ('df.groupby("plan")["city"].nunique().to_dict()', ['df.groupby("plan")["city"].count().to_dict()', 'df.groupby("city")["plan"].nunique().to_dict()']),
        ('df.groupby("city")["sales"].idxmax().tolist()', ['df.groupby("city")["sales"].max().tolist()', 'df.groupby("city")["sales"].idxmin().tolist()']),
        ('df.groupby("plan").size().to_dict()', ['df.groupby("plan")["sales"].sum().to_dict()', 'df.groupby("city").size().to_dict()']),
    ], "Grouping by two columns makes one group per combination that actually occurs. filter keeps whole groups that pass a test; idxmax returns the row label of each group's largest value.")


if __name__ == "__main__":
    bank.write(OUT)
