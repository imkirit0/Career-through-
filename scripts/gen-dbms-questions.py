#!/usr/bin/env python3
"""Generate data/dbms-questions.csv: 5,000 multiple-choice questions for a `dbms` skill.

No answer is typed by hand. SQL questions are run in an in-memory SQLite database and the
real result is the correct option; theory questions (closures, candidate keys, normal
forms, serializability, recovery, index maths) are worked out by the small algorithms in
this file. Definitions come from the fact lists and are asked in both directions.

Needs only the standard library.   Run:  python3 scripts/gen-dbms-questions.py
"""
import itertools
import math
import re
import sqlite3
from pathlib import Path

from qbank import Bank, Q, facts, g, nq, uniq

OUT = Path(__file__).resolve().parent.parent / "data" / "dbms-questions.csv"

# proposed topicIds for a `dbms` skill, in teaching order
RM, NF, SQ, TX = "dbms-relational-model", "dbms-normalization", "dbms-sql", "dbms-transactions-storage"
bank = Bank("dbms", "dbms", [RM, NF, SQ, TX])
t = bank.t

NAMES = ["Asha", "Ravi", "Meera", "Kiran", "Divya", "Arjun", "Neha", "Rahul", "Priya", "Vikram"]
DEPTS = ["HR", "IT", "Ops"]


# ───────────────────────── helpers ─────────────────────────

def cell(v):
    return "NULL" if v is None else g(v)


def table(name, cols, rows):
    """A table the way a textbook prints it."""
    return "\n".join([f"{name}({', '.join(cols)})"] + [" | ".join(cell(v) for v in row) for row in rows])


def result(con, sql):
    try:
        rows = con.execute(sql).fetchall()
    except sqlite3.Error:
        return None
    if not rows:
        return "(no rows)"
    if len(rows[0]) == 1:
        return ", ".join(cell(row[0]) for row in rows)
    return "; ".join("(" + ", ".join(cell(v) for v in row) + ")" for row in rows)


def pad(ans):
    out = []
    if re.fullmatch(r"-?\d+(\.\d+)?", ans):
        v = float(ans)
        out = [g(x) for x in (v + 1, v - 1 if v >= 1 else v + 2, v * 2, v + 3)]
    return out + ["(no rows)", "NULL", "0"]


def sqlq(r, tables, forms, why, extra=()):
    """Run one (query, wrong queries) form against the tables; the real result is the answer."""
    sql, wrong_sql = r.choice(forms)
    con = sqlite3.connect(":memory:")
    con.execute("PRAGMA case_sensitive_like = ON")
    for name, cols, rows in tables:
        con.execute(f"CREATE TABLE {name} ({', '.join(cols)})")
        con.executemany(f"INSERT INTO {name} VALUES ({', '.join('?' * len(cols))})", rows)
    ans = result(con, sql)
    assert ans is not None, sql
    wrong = [w for w in (result(con, q) for q in wrong_sql) if w is not None]
    prompt = "\n\n".join(table(*tb) for tb in tables) + f"\n\nWhat does this query return?\n\n{sql}"
    return Q(prompt, ans, wrong + list(extra) + pad(ans), why)


def mkemp(r, nulls=False):
    n = r.randint(5, 6)
    names = r.sample(NAMES, n)
    rows = [(i + 1, names[i], r.choice(DEPTS), r.choice([30, 40, 50, 60, 70, 80])) for i in range(n)]
    if nulls:
        i = r.randrange(n)
        rows[i] = rows[i][:3] + (None,)
    emp = ("emp", ["id", "name", "dept", "salary"], rows)
    dept = ("dept", ["dept", "city"], [("HR", "Pune"), ("IT", "Delhi"), ("Fin", "Kochi")])
    return emp, dept, rows


def script(setup, stmts):
    """Run statements one at a time in autocommit mode; return (first failing number or None, connection)."""
    con = sqlite3.connect(":memory:")
    con.isolation_level = None
    con.execute("PRAGMA foreign_keys = ON")
    con.executescript(setup)
    fail = None
    for i, s in enumerate(stmts, 1):
        try:
            con.execute(s)
        except sqlite3.Error:
            fail = fail or i
    return fail, con


def closure(xs, fds):
    res = set(xs)
    while True:
        new = {a for lhs, rhs in fds if set(lhs) <= res for a in rhs} - res
        if not new:
            return res
        res |= new


def cand_keys(attrs, fds):
    out = []
    for n in range(1, len(attrs) + 1):
        for c in itertools.combinations(attrs, n):
            if closure(c, fds) == set(attrs) and not any(set(k) <= set(c) for k in out):
                out.append("".join(c))
    return out


def normal_form(attrs, fds):
    keys = cand_keys(attrs, fds)
    prime = set("".join(keys))
    superkey = lambda x: closure(x, fds) == set(attrs)
    deps = [(lhs, a) for lhs, rhs in fds for a in rhs if a not in lhs]
    if all(superkey(lhs) for lhs, _ in deps):
        return "BCNF"
    if all(superkey(lhs) or a in prime for lhs, a in deps):
        return "3NF"
    partial = any(a not in prime for k in keys for n in range(1, len(k))
                  for s in itertools.combinations(k, n) for a in closure(s, fds) - set(s))
    return "1NF" if partial else "2NF"


# the theory helpers, checked against textbook cases
assert closure("A", [("A", "B"), ("B", "C")]) == set("ABC")
assert cand_keys("ABC", [("AB", "C"), ("C", "B")]) == ["AB", "AC"]
assert normal_form("ABC", [("AB", "C"), ("C", "B")]) == "3NF"
assert normal_form("ABC", [("A", "B"), ("B", "C")]) == "2NF"
assert normal_form("ABCD", [("AB", "C"), ("A", "D")]) == "1NF"
assert normal_form("ABC", [("A", "B"), ("A", "C")]) == "BCNF"


def rand_fds(r, attrs, k):
    fds = set()
    while len(fds) < k:
        lhs = "".join(sorted(r.sample(attrs, r.choice([1, 1, 2]))))
        fds.add((lhs, r.choice([x for x in attrs if x not in lhs])))
    return sorted(fds)


def show(fds):
    return ", ".join(f"{lhs} → {rhs}" for lhs, rhs in fds)


def fs(s):
    return "{" + ", ".join(sorted(s)) + "}"


def rel(attrs):
    return f"R({', '.join(attrs)})"


# ───────────────────────── Relational model ─────────────────────────

facts(bank, RM, "Core concepts", 1, [
    [("A primary key", "The candidate key chosen to identify each row; it must be unique and cannot be NULL."),
     ("A foreign key", "A column whose values must match a key in another table (or be NULL), linking the two tables."),
     ("A candidate key", "A minimal set of attributes that uniquely identifies every row; a table can have several."),
     ("A superkey", "Any set of attributes that uniquely identifies every row, whether minimal or not."),
     ("A composite key", "A key made of two or more columns taken together."),
     ("A surrogate key", "An artificial identifier, such as an auto-increment number, with no business meaning."),
     ("An alternate key", "A candidate key that was not chosen as the primary key.")],
    [("A tuple", "One row of a relation."),
     ("An attribute", "One named column of a relation."),
     ("A domain", "The set of values an attribute is allowed to take."),
     ("The degree of a relation", "The number of attributes (columns) it has."),
     ("The cardinality of a relation", "The number of tuples (rows) it holds."),
     ("A schema", "The structure of a database: its tables, columns, types and constraints."),
     ("A database instance", "The actual data stored in the database at one moment."),
     ("A view", "A stored query that behaves like a virtual table and holds no data of its own."),
     ("A materialized view", "A query result that is physically stored and must be refreshed when the base data changes.")],
    [("DDL", "Statements that define or change structure, such as CREATE, ALTER and DROP."),
     ("DML", "Statements that read or change rows, such as SELECT, INSERT, UPDATE and DELETE."),
     ("DCL", "Statements that control permissions, such as GRANT and REVOKE."),
     ("TCL", "Statements that control transactions, such as COMMIT, ROLLBACK and SAVEPOINT.")],
    [("Entity integrity", "No part of a primary key may be NULL."),
     ("Referential integrity", "Every foreign key value must match an existing key in the referenced table, or be NULL."),
     ("A CHECK constraint", "A rule that every row must satisfy, such as age >= 18."),
     ("A UNIQUE constraint", "No two rows may share the same value in the column."),
     ("A NOT NULL constraint", "The column must hold a value in every row."),
     ("A DEFAULT constraint", "Supplies a value when an INSERT does not provide one.")],
])


@t(RM, "Keys from data", 1)
def _(r):
    cols = ["roll", "name", "city", "marks"]
    n = r.randint(4, 5)
    u = r.randrange(4)
    pool = {"roll": range(101, 130), "name": NAMES, "city": ["Pune", "Delhi", "Kochi"], "marks": [55, 60, 70, 85]}
    data = {}
    for i, c in enumerate(cols):
        if i == u:
            data[c] = r.sample(list(pool[c]) if c != "city" and c != "marks" else list(range(n)), n)
            if c == "city":
                data[c] = r.sample(["Pune", "Delhi", "Kochi", "Jaipur", "Mumbai", "Surat"], n)
            if c == "marks":
                data[c] = r.sample(range(40, 99), n)
        else:
            vals = r.sample(list(pool[c]), min(n - 1, len(pool[c]), 3))
            data[c] = [r.choice(vals) for _ in range(n - 2)] + [vals[0], vals[0]]
            r.shuffle(data[c])
    rows = list(zip(*(data[c] for c in cols)))
    return Q(table("student", cols, rows) + "\n\nJudging only by these rows, which single column could be a candidate key?", cols[u],
             [c for c in cols if c != cols[u]], f"A candidate key must be unique in every row. Only {cols[u]} has no repeated value here; each of the other columns repeats at least once.")


@t(RM, "Keys from data", 2)
def _(r):
    n, k = r.randint(4, 8), r.randint(1, 3)
    attrs = "ABCDEFGH"[:n]
    key = attrs[:k]
    forms = [
        (f"{rel(attrs)} has exactly one candidate key, {fs(key)}. How many superkeys does R have?", 2 ** (n - k), [2 ** n, 2 ** (n - k) - 1, n - k + 1, 2 ** k]),
        (f"{rel(attrs)} has {n} attributes. What is the largest number of superkeys it could have (every non-empty attribute set being a superkey)?", 2 ** n - 1, [2 ** n, n * n, math.factorial(n)]),
        (f"{rel(attrs)} has exactly one candidate key, {fs(key)}. How many attributes are prime (part of some candidate key)?", k, [n, n - k, 1 if k != 1 else 2]),
        (f"{rel(attrs)} has exactly one candidate key, {fs(key)}. How many attributes does the largest superkey contain?", n, [k, n - k, k + 1]),
    ]
    p, a, w = r.choice(forms)
    return nq(p, a, w, "Every superkey is a candidate key plus any subset of the remaining attributes, so one key of size k in a relation of n attributes gives 2^(n - k) superkeys. The whole attribute set is always a superkey.")


SCHEMA = ("CREATE TABLE dept (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE);\n"
          "CREATE TABLE emp (id INTEGER PRIMARY KEY, dept_id INTEGER REFERENCES dept(id), age INTEGER CHECK (age >= 18));\n"
          "INSERT INTO dept VALUES (1, 'HR'), (2, 'IT');")
CON = "Integrity constraints"


@t(RM, CON, 2)
def _(r):
    ids = uniq(r, 4, 10, 40)
    stmts = [f"INSERT INTO emp VALUES ({i}, {r.randint(1, 2)}, {r.randint(18, 60)})" for i in ids]
    kind, j = r.choice(["PRIMARY KEY", "UNIQUE", "NOT NULL", "CHECK", "FOREIGN KEY", None]), r.randint(1, 3)
    bad = {"PRIMARY KEY": f"INSERT INTO emp VALUES ({ids[0]}, 1, 30)", "UNIQUE": "INSERT INTO dept VALUES (3, 'HR')",
           "NOT NULL": "INSERT INTO dept VALUES (3, NULL)", "CHECK": f"INSERT INTO emp VALUES ({ids[j]}, 2, {r.randint(10, 17)})",
           "FOREIGN KEY": f"INSERT INTO emp VALUES ({ids[j]}, {r.randint(3, 9)}, 25)"}
    if kind:
        stmts[j] = bad[kind]
    fail, con = script(SCHEMA, stmts)
    if (fail or 0) != (j + 1 if kind else 0):
        return None
    base = f"Foreign keys are enforced.\n\n{SCHEMA}\n\nThese statements then run one at a time, in order:\n\n" + "\n".join(f"{i}. {s};" for i, s in enumerate(stmts, 1))
    why = "PRIMARY KEY and UNIQUE reject a repeated value, NOT NULL rejects NULL, CHECK rejects a row that breaks its rule, and a FOREIGN KEY rejects a value with no matching parent row. A failed statement changes nothing; the others still apply."
    which = [f"Statement {i}" for i in range(1, 5)] + ["None; all four succeed"]
    form = r.randint(0, 2)
    if form == 0:
        ans = which[fail - 1] if fail else which[4]
        return Q(base + "\n\nWhich statement is the first to fail?", ans, r.sample([w for w in which if w != ans], 3), why)
    if form == 1 and kind:
        return Q(base + f"\n\nStatement {fail} fails. Which constraint does it violate?", kind, r.sample([k for k in bad if k != kind], 3), why)
    return nq(base + "\n\nHow many rows does emp contain afterwards?", con.execute("SELECT COUNT(*) FROM emp").fetchone()[0], [4, 3, 2, 5], why)


@t(RM, CON, 3)
def _(r):
    clause, n1, n2 = r.choice(["", " ON DELETE CASCADE", " ON DELETE SET NULL"]), r.randint(1, 4), r.randint(1, 3)
    setup = ("CREATE TABLE dept (id INTEGER PRIMARY KEY, name TEXT);\n"
             f"CREATE TABLE emp (id INTEGER PRIMARY KEY, dept_id INTEGER REFERENCES dept(id){clause});\n"
             "INSERT INTO dept VALUES (1, 'HR'), (2, 'IT');\n"
             "INSERT INTO emp VALUES " + ", ".join(f"({i + 1}, {1 if i < n1 else 2})" for i in range(n1 + n2)) + ";")
    fail, con = script(setup, ["DELETE FROM dept WHERE id = 1"])
    left, nulls = con.execute("SELECT COUNT(*), SUM(dept_id IS NULL) FROM emp").fetchone()
    opts = {"reject": "The DELETE is rejected and nothing changes",
            "cascade": f"The dept row is deleted together with its {n1} emp row(s); emp keeps {n2}",
            "setnull": f"The dept row is deleted; emp keeps all {n1 + n2} rows, {n1} of them with dept_id NULL",
            "dangling": f"The dept row is deleted; emp keeps all {n1 + n2} rows, still pointing at dept 1"}
    ans = "reject" if fail else "cascade" if left == n2 else "setnull" if nulls == n1 else "dangling"
    return Q(f"Foreign keys are enforced.\n\n{setup}\n\nDELETE FROM dept WHERE id = 1;\n\nWhat happens?", opts[ans], [v for k, v in opts.items() if k != ans],
             "With no ON DELETE clause a parent row that still has children cannot be deleted. ON DELETE CASCADE deletes the children too, and ON DELETE SET NULL keeps them but clears their foreign key.")


RA = "Relational algebra"


@t(RM, RA, 2)
def _(r):
    m, n, a, b, c = r.randint(3, 40), r.randint(3, 40), r.randint(2, 6), r.randint(2, 6), r.randint(1, 2)
    p, ans, w = r.choice([
        (f"R has {m} tuples and S has {n} tuples. How many tuples are in the Cartesian product R × S?", m * n, [m + n, max(m, n), m * n - 1]),
        (f"R and S are union-compatible, with {m} and {n} tuples. What is the largest possible number of tuples in R ∪ S?", m + n, [m * n, max(m, n), min(m, n)]),
        (f"R and S are union-compatible, with {m} and {n} tuples. What is the smallest possible number of tuples in R ∪ S?", max(m, n), [m + n, min(m, n), 0]),
        (f"R and S are union-compatible, with {m} and {n} tuples. What is the largest possible number of tuples in R ∩ S?", min(m, n), [max(m, n), m + n, 0]),
        (f"R and S are union-compatible, with {m} and {n} tuples. What is the smallest possible number of tuples in R − S?", max(m - n, 0), [m, abs(m - n) + 1, n]),
        (f"R and S are union-compatible, with {m} and {n} tuples. What is the largest possible number of tuples in R − S?", m, [max(m - n, 0), m + n, n]),
        (f"R has {a} attributes and S has {b} attributes. How many attributes does R × S have?", a + b, [a * b, max(a, b), a + b - 1]),
        (f"R has {a + c} attributes and S has {b + c} attributes; {c} attribute name(s) are common to both. How many attributes does the natural join R ⋈ S have?", a + b + c, [a + b + 2 * c, a + b, (a + c) * (b + c)]),
        (f"R has {m} tuples and S has {n} tuples. R has a foreign key that references the primary key of S and is never NULL. How many tuples does the natural join on that key have?", m, [n, m * n, min(m, n) if m != min(m, n) else m + n]),
    ])
    return nq(p, ans, w, "A product pairs every tuple of R with every tuple of S (sizes multiply, attribute counts add). Union removes duplicates, so its size ranges from the larger input to the sum. A natural join keeps one copy of each common attribute.")


@t(RM, RA, 2)
def _(r):
    n = r.randint(5, 7)
    rows = [(r.choice("abc"), r.randint(1, 4)) for _ in range(n)]
    rows = list(dict.fromkeys(rows))
    k, x = r.randint(1, 3), r.choice("abc")
    srows = list(dict.fromkeys((r.randint(1, 4), r.choice(["p", "q"])) for _ in range(3)))
    join = sum(1 for a, b in rows for b2, c in srows if b == b2)
    base = table("R", ["A", "B"], rows)
    p, ans, w = r.choice([
        (base + "\n\nHow many tuples does the projection π_A(R) contain?", len({a for a, _ in rows}), [len(rows), len({b for _, b in rows})]),
        (base + "\n\nHow many tuples does the projection π_B(R) contain?", len({b for _, b in rows}), [len(rows), len({a for a, _ in rows})]),
        (base + f"\n\nHow many tuples does the selection σ_(B > {k})(R) contain?", sum(b > k for _, b in rows), [sum(b >= k for _, b in rows), sum(b < k for _, b in rows), len(rows)]),
        (base + f"\n\nHow many tuples does σ_(A = '{x}' ∧ B > {k})(R) contain?", sum(a == x and b > k for a, b in rows), [sum(a == x or b > k for a, b in rows), sum(a == x for a, _ in rows), sum(b > k for _, b in rows)]),
        (base + f"\n\nHow many tuples does π_A(σ_(B > {k})(R)) contain?", len({a for a, b in rows if b > k}), [sum(b > k for _, b in rows), len({a for a, _ in rows})]),
        (base + "\n\n" + table("S", ["B", "C"], srows) + "\n\nHow many tuples does the natural join R ⋈ S contain?", join, [len(rows) * len(srows), len(rows), len(srows)]),
    ])
    return nq(p, ans, w, "Projection keeps the named columns and removes duplicate tuples. Selection keeps the tuples that satisfy the condition. A natural join pairs tuples that agree on the common attribute.")


# ───────────────────────── Normalization ─────────────────────────

FDS = "Functional dependencies"


@t(NF, FDS, 2)
def _(r):
    n = r.randint(4, 5)
    rows = [tuple(r.randint(1, 3) for _ in range(3)) for _ in range(n)]
    holds = lambda x, y: all(a[y] == b[y] for a in rows for b in rows if a[x] == b[x])
    cands = [(x, y) for x in range(3) for y in range(3) if x != y]
    r.shuffle(cands)
    true = [c for c in cands if holds(*c)]
    false = [c for c in cands if not holds(*c)]
    if len(true) < 1 or len(false) < 3:
        return None
    name = lambda c: f"{'ABC'[c[0]]} → {'ABC'[c[1]]}"
    return Q(table("R", ["A", "B", "C"], rows) + "\n\nWhich functional dependency holds in this instance?", name(true[0]), [name(c) for c in false[:3]],
             "X → Y holds when any two rows that agree on X also agree on Y. One pair of rows with the same X but different Y is enough to break it.")


@t(NF, FDS, 2)
def _(r):
    attrs = "ABCD"
    fds = rand_fds(r, attrs, r.randint(2, 3))
    cands = [(x, y) for x in ["A", "B", "C", "D", "AB", "AC", "AD", "BC", "BD", "CD"] for y in attrs if y not in x and (x, y) not in fds]
    r.shuffle(cands)
    implied = [c for c in cands if c[1] in closure(c[0], fds)]
    not_implied = [c for c in cands if c[1] not in closure(c[0], fds)]
    if not implied or len(not_implied) < 3:
        return None
    name = lambda c: f"{c[0]} → {c[1]}"
    return Q(f"{rel(attrs)} has the functional dependencies {show(fds)}.\n\nWhich of these dependencies can be inferred from them?", name(implied[0]), [name(c) for c in not_implied[:3]],
             f"X → Y follows when Y is in the closure of X. Here {fs(implied[0][0])}+ = {fs(closure(implied[0][0], fds))}.")


@t(NF, "Attribute closure", 2)
def _(r):
    attrs = "ABCDE"[:r.randint(4, 5)]
    fds = rand_fds(r, attrs, r.randint(2, 4))
    x = "".join(sorted(r.sample(attrs, r.randint(1, 2))))
    ans = closure(x, fds)
    wrong = [set(x), set(attrs), ans - {r.choice(sorted(ans))} | set(x), ans | {r.choice(attrs)}, closure(x, fds[:-1]), set(x) | {a for lhs, a in fds if set(lhs) <= set(x)}]
    r.shuffle(wrong)
    return Q(f"{rel(attrs)} has the functional dependencies {show(fds)}.\n\nWhat is the closure of {fs(x)}, written {fs(x)}+?", fs(ans), [fs(w) for w in wrong] + [fs(set(x) | {a}) for a in attrs],
             "Start with the given attributes and keep adding the right side of every dependency whose left side is already included, until nothing new can be added.")


CK = "Candidate keys"


@t(NF, CK, 3)
def _(r):
    attrs = "ABCDE"[:r.randint(4, 5)]
    fds = rand_fds(r, attrs, r.randint(2, 4))
    keys = cand_keys(attrs, fds)
    base = f"{rel(attrs)} has the functional dependencies {show(fds)}.\n\n"
    why = f"A candidate key is a minimal attribute set whose closure is the whole relation. Here the candidate keys are: {', '.join(keys)}."
    form = r.randint(0, 3)
    if form == 0:
        return nq(base + "How many candidate keys does R have?", len(keys), [len(fds), len(attrs)], why)
    if form == 1:
        subsets = ["".join(c) for n in range(1, len(attrs) + 1) for c in itertools.combinations(attrs, n)]
        non = [s for s in subsets if s not in keys]
        r.shuffle(non)
        non.sort(key=lambda s: abs(len(s) - len(keys[0])))  # near-misses first: same size, or a key plus one attribute
        return Q(base + "Which of these is a candidate key of R?", fs(r.choice(keys)), [fs(s) for s in non[:6]], why)
    if form == 2:
        prime = set("".join(keys))
        cands = [prime - {a} for a in sorted(prime)] + [prime | {a} for a in attrs if a not in prime] + [set(attrs) - prime, set(attrs), set(keys[0])]
        r.shuffle(cands)
        return Q(base + "Which attributes are prime (they appear in at least one candidate key)?", fs(prime), [fs(c) for c in cands if c], why)
    x = "".join(sorted(r.sample(attrs, r.randint(2, 3))))
    opts = ["A candidate key", "A superkey but not a candidate key", "Not a superkey", "A candidate key but not a superkey"]
    ans = opts[0] if x in keys else opts[1] if closure(x, fds) == set(attrs) else opts[2]
    return Q(base + f"What is {fs(x)}?", ans, [o for o in opts if o != ans], why)


NFS = "Normal forms"

facts(bank, NF, NFS, 2, [
    [("First normal form (1NF)", "Every column holds a single atomic value; there are no repeating groups."),
     ("Second normal form (2NF)", "In 1NF, and no non-key attribute depends on only part of a composite candidate key."),
     ("Third normal form (3NF)", "In 2NF, and no non-key attribute depends on the key only through another non-key attribute."),
     ("Boyce-Codd normal form (BCNF)", "For every non-trivial functional dependency, the left side is a superkey."),
     ("A partial dependency", "A non-key attribute depends on only part of a composite candidate key."),
     ("A transitive dependency", "A non-key attribute depends on the key only through another non-key attribute."),
     ("An insertion anomaly", "A fact cannot be stored until some unrelated fact is also available."),
     ("A deletion anomaly", "Removing one fact unintentionally removes another, unrelated fact."),
     ("An update anomaly", "The same fact is stored in several rows, so changing only some of them leaves the data inconsistent."),
     ("Denormalization", "Deliberately adding redundancy to speed up reads, at the cost of harder updates."),
     ("A functional dependency X → Y", "Any two rows that agree on X must also agree on Y."),
     ("A lossless-join decomposition", "Splitting a table so that joining the parts gives back exactly the original rows.")],
])


@t(NF, NFS, 3)
def _(r):
    attrs = "ABCDE"[:r.randint(3, 5)]
    fds = rand_fds(r, attrs, r.randint(1, 3))
    ans = normal_form(attrs, fds)
    return Q(f"{rel(attrs)} has atomic attributes and the functional dependencies {show(fds)}.\n\nWhat is the highest normal form R satisfies?", ans, [x for x in ["1NF", "2NF", "3NF", "BCNF"] if x != ans],
             f"The candidate keys are {', '.join(cand_keys(attrs, fds))}. BCNF needs every determinant to be a superkey; 3NF also allows a dependency whose right side is a prime attribute; 2NF only forbids a non-prime attribute depending on part of a key.")


@t(NF, NFS, 3)
def _(r):
    a, b, c, d = r.choice(["ABCD", "PQRS", "WXYZ"])  # few letterings on purpose: there are only four real cases
    kind = r.choice(["partial", "transitive", "trivial", "full"])
    fd = {"partial": f"{a} → {c}", "transitive": f"{c} → {d}", "trivial": f"{a}{b} → {r.choice([a, b])}", "full": f"{a}{b} → {c}"}[kind]
    names = {"partial": "A partial dependency", "transitive": "The second step of a transitive dependency", "trivial": "A trivial dependency", "full": "A full dependency on the key"}
    return Q(f"R({a}, {b}, {c}, {d}) has the single candidate key {{{a}, {b}}}. Attributes {c} and {d} are non-prime.\n\nWhat kind of dependency is {fd}?", names[kind], [v for k, v in names.items() if k != kind],
             "A dependency is trivial when the right side is part of the left side, partial when a non-prime attribute depends on only part of the key, and transitive when a non-prime attribute depends on another non-prime attribute.")


@t(NF, "Decomposition", 3)
def _(r):
    attrs = "ABCD"
    fds = rand_fds(r, attrs, r.randint(1, 3))
    common = "".join(sorted(r.sample(attrs, r.choice([0, 1, 1, 1, 2]))))
    rest = [x for x in attrs if x not in common]
    r.shuffle(rest)
    cut = r.randint(1, len(rest) - 1)
    r1, r2 = "".join(sorted(common + "".join(rest[:cut]))), "".join(sorted(common + "".join(rest[cut:])))
    c = closure(common, fds) if common else set()
    d1, d2 = set(r1) <= c, set(r2) <= c
    if d1 and d2:
        return None
    opts = [f"Lossless: the common attributes {fs(common)} determine all of R1", f"Lossless: the common attributes {fs(common)} determine all of R2",
            "Lossy: the common attributes determine neither R1 nor R2", "Lossy: R1 and R2 have no attribute in common"]
    if not common:
        opts[0], opts[1] = "Lossless: every attribute of R appears in R1 or R2", "Lossless: R1 and R2 are both in BCNF"
    ans = opts[3] if not common else opts[0] if d1 else opts[1] if d2 else opts[2]
    return Q(f"{rel(attrs)} has the functional dependencies {show(fds)}. It is decomposed into R1{fs(r1)} and R2{fs(r2)}.\n\nIs the decomposition lossless?", ans, [o for o in opts if o != ans],
             "A decomposition into two relations is lossless exactly when their common attributes functionally determine all of R1 or all of R2. With nothing in common, the join is a Cartesian product.")


# ───────────────────────── SQL ─────────────────────────

@t(SQ, "Filtering rows", 1)
def _(r):
    emp, dept, rows = mkemp(r)
    k, d, x = r.choice([40, 50, 60, 70]), r.choice(DEPTS), rows[0][1][0]
    lo = r.choice([30, 40, 50])
    hi = lo + r.choice([10, 20, 30])
    c = "SELECT COUNT(*) FROM emp"
    return sqlq(r, [emp], [
        (f"{c} WHERE salary > {k}", [f"{c} WHERE salary >= {k}", c, f"{c} WHERE salary < {k}"]),
        (f"SELECT name FROM emp WHERE salary BETWEEN {lo} AND {hi} ORDER BY name", [f"SELECT name FROM emp WHERE salary > {lo} AND salary < {hi} ORDER BY name", f"SELECT name FROM emp WHERE salary >= {lo} ORDER BY name", f"SELECT name FROM emp WHERE salary <= {hi} ORDER BY name"]),
        (f"{c} WHERE name LIKE '{x}%'", [f"{c} WHERE name LIKE '%{x.lower()}%'", f"{c} WHERE name LIKE '%{x}'", c]),
        (f"{c} WHERE name LIKE '%a'", [f"{c} WHERE name LIKE '%a%'", f"{c} WHERE name LIKE 'a%'", f"{c} WHERE name LIKE 'A%'"]),
        ("SELECT COUNT(DISTINCT dept) FROM emp", ["SELECT COUNT(dept) FROM emp", "SELECT COUNT(*) + 1 FROM (SELECT DISTINCT dept FROM emp)"]),
        ("SELECT name FROM emp ORDER BY salary DESC, name LIMIT 1", ["SELECT name FROM emp ORDER BY salary, name LIMIT 1", "SELECT name FROM emp ORDER BY name LIMIT 1", "SELECT name FROM emp ORDER BY salary DESC, name DESC LIMIT 1"]),
        ("SELECT name FROM emp ORDER BY salary DESC, name LIMIT 1 OFFSET 1", ["SELECT name FROM emp ORDER BY salary DESC, name LIMIT 1", "SELECT name FROM emp ORDER BY salary DESC, name LIMIT 1 OFFSET 2", "SELECT name FROM emp ORDER BY salary, name LIMIT 1 OFFSET 1"]),
        (f"{c} WHERE dept IN ('HR', 'IT')", [f"{c} WHERE dept NOT IN ('HR', 'IT')", f"{c} WHERE dept = 'HR'", c]),
        (f"{c} WHERE dept = 'HR' OR dept = 'IT' AND salary > {k}", [f"{c} WHERE (dept = 'HR' OR dept = 'IT') AND salary > {k}", f"{c} WHERE dept = 'IT' AND salary > {k}", f"{c} WHERE dept = 'HR' OR dept = 'IT'"]),
        (f"SELECT name FROM emp WHERE dept = '{d}' AND salary >= {k} ORDER BY name", [f"SELECT name FROM emp WHERE dept = '{d}' OR salary >= {k} ORDER BY name", f"SELECT name FROM emp WHERE dept = '{d}' ORDER BY name", f"SELECT name FROM emp WHERE salary >= {k} ORDER BY name"]),
        (f"{c} WHERE NOT (salary > {k} OR dept = '{d}')", [f"{c} WHERE NOT salary > {k} OR dept = '{d}'", f"{c} WHERE salary > {k} OR dept = '{d}'", f"{c} WHERE salary <= {k}"]),
        ("SELECT name FROM emp ORDER BY name LIMIT 2", ["SELECT name FROM emp ORDER BY name DESC LIMIT 2", "SELECT name FROM emp ORDER BY id LIMIT 2", "SELECT name FROM emp ORDER BY name LIMIT 2 OFFSET 1"]),
    ], "WHERE keeps the rows for which the condition is true. BETWEEN includes both ends, AND binds tighter than OR, % in LIKE matches any run of characters, and LIMIT n OFFSET m skips m rows first.")


@t(SQ, "NULL handling", 2)
def _(r):
    emp, dept, rows = mkemp(r, nulls=True)
    k = r.choice([40, 50, 60, 70])
    nid = next(row[0] for row in rows if row[3] is None)
    c = "SELECT COUNT(*) FROM emp"
    return sqlq(r, [emp], [
        (f"{c} WHERE salary = NULL", [f"{c} WHERE salary IS NULL", c, f"{c} WHERE salary IS NOT NULL"]),
        (f"{c} WHERE salary IS NULL", [f"{c} WHERE salary = NULL", f"{c} WHERE salary IS NOT NULL", c]),
        ("SELECT COUNT(salary) FROM emp", [c, f"{c} WHERE salary IS NULL", "SELECT COUNT(DISTINCT salary) FROM emp"]),
        (f"{c} WHERE salary <> {k}", [f"{c} WHERE salary <> {k} OR salary IS NULL", f"{c} WHERE salary = {k}", c]),
        ("SELECT ROUND(AVG(salary), 1) FROM emp", ["SELECT ROUND(SUM(salary) * 1.0 / COUNT(*), 1) FROM emp", "SELECT MAX(salary) FROM emp", "SELECT NULL"]),
        ("SELECT ROUND(AVG(COALESCE(salary, 0)), 1) FROM emp", ["SELECT ROUND(AVG(salary), 1) FROM emp", "SELECT SUM(salary) FROM emp", "SELECT NULL"]),
        (f"{c} WHERE salary NOT IN ({k}, NULL)", [f"{c} WHERE salary NOT IN ({k})", c, f"{c} WHERE salary IS NOT NULL"]),
        ("SELECT SUM(salary) FROM emp WHERE dept = 'Legal'", [f"{c} WHERE dept = 'Legal'", "SELECT SUM(salary) FROM emp", "SELECT MIN(salary) FROM emp"]),
        (f"{c} WHERE salary > {k} OR salary <= {k}", [c, f"{c} WHERE salary IS NULL", f"{c} WHERE salary > {k}"]),
        (f"SELECT COALESCE(salary, 0) FROM emp WHERE id = {nid}", [f"SELECT salary FROM emp WHERE id = {nid}", "SELECT MIN(salary) FROM emp", f"SELECT name FROM emp WHERE id = {nid}"]),
        (f"{c} WHERE NOT (salary > {k})", [f"{c} WHERE salary <= {k} OR salary IS NULL", f"{c} WHERE salary > {k}", c]),
        ("SELECT SUM(salary) FROM emp", ["SELECT NULL", "SELECT SUM(COALESCE(salary, 0)) + 10 FROM emp", "SELECT MAX(salary) FROM emp"]),
        ("SELECT COUNT(*) - COUNT(salary) FROM emp", [c, "SELECT COUNT(salary) FROM emp", "SELECT 0"]),
    ], "Any comparison with NULL (even = NULL or <> value) is unknown, so the row is filtered out; use IS NULL instead. COUNT(column), SUM and AVG skip NULLs, COUNT(*) counts every row, and SUM over no rows is NULL.")


@t(SQ, "Aggregation and grouping", 2)
def _(r):
    emp, dept, rows = mkemp(r)
    k, d = r.choice([40, 50, 60, 70]), r.choice(rows)[2]
    g_ = "FROM emp GROUP BY dept"
    return sqlq(r, [emp], [
        (f"SELECT SUM(salary) FROM emp WHERE dept = '{d}'", [f"SELECT MAX(salary) FROM emp WHERE dept = '{d}'", f"SELECT COUNT(*) FROM emp WHERE dept = '{d}'", "SELECT SUM(salary) FROM emp"]),
        ("SELECT MAX(salary) - MIN(salary) FROM emp", ["SELECT MAX(salary) + MIN(salary) FROM emp", "SELECT MAX(salary) FROM emp", "SELECT MIN(salary) FROM emp"]),
        (f"SELECT dept {g_} HAVING COUNT(*) > 1 ORDER BY dept", [f"SELECT dept {g_} HAVING COUNT(*) >= 1 ORDER BY dept", f"SELECT dept {g_} HAVING COUNT(*) = 1 ORDER BY dept", f"SELECT dept {g_} HAVING COUNT(*) > 2 ORDER BY dept"]),
        (f"SELECT COUNT(*) FROM (SELECT dept {g_})", ["SELECT COUNT(*) FROM emp", f"SELECT MAX(c) FROM (SELECT COUNT(*) AS c {g_})", "SELECT 3"]),
        (f"SELECT dept, COUNT(*) {g_} ORDER BY dept", [f"SELECT dept, SUM(salary) {g_} ORDER BY dept", f"SELECT dept, COUNT(*) {g_} ORDER BY dept DESC", f"SELECT dept, COUNT(*) + 1 {g_} ORDER BY dept"]),
        (f"SELECT dept {g_} ORDER BY SUM(salary) DESC, dept LIMIT 1", [f"SELECT dept {g_} ORDER BY COUNT(*) DESC, dept DESC LIMIT 1", f"SELECT dept {g_} ORDER BY SUM(salary), dept LIMIT 1", f"SELECT dept {g_} ORDER BY dept LIMIT 1", f"SELECT dept {g_} ORDER BY dept DESC LIMIT 1"]),
        (f"SELECT dept {g_} HAVING MAX(salary) > {k} ORDER BY dept", [f"SELECT dept {g_} HAVING MIN(salary) > {k} ORDER BY dept", f"SELECT dept {g_} ORDER BY dept", f"SELECT dept {g_} HAVING MAX(salary) <= {k} ORDER BY dept"]),
        (f"SELECT dept, MAX(salary) {g_} ORDER BY dept", [f"SELECT dept, MIN(salary) {g_} ORDER BY dept", f"SELECT dept, SUM(salary) {g_} ORDER BY dept", f"SELECT dept, MAX(salary) {g_} ORDER BY dept DESC"]),
        (f"SELECT ROUND(AVG(salary), 1) FROM emp WHERE dept = '{d}'", ["SELECT ROUND(AVG(salary), 1) FROM emp", f"SELECT SUM(salary) FROM emp WHERE dept = '{d}'", f"SELECT MAX(salary) FROM emp WHERE dept = '{d}'"]),
        (f"SELECT COUNT(*) {g_} HAVING dept = '{d}'", ["SELECT COUNT(*) FROM emp", "SELECT COUNT(DISTINCT dept) FROM emp", f"SELECT SUM(salary) FROM emp WHERE dept = '{d}'"]),
        ("SELECT MIN(salary), MAX(salary) FROM emp", ["SELECT MAX(salary), MIN(salary) FROM emp", "SELECT MIN(salary), SUM(salary) FROM emp", "SELECT MIN(salary), MAX(salary) + 10 FROM emp"]),
        (f"SELECT COUNT(*) FROM emp WHERE salary > (SELECT MIN(salary) FROM emp)", ["SELECT COUNT(*) FROM emp", "SELECT COUNT(DISTINCT salary) FROM emp", "SELECT COUNT(*) - 1 FROM emp"]),
    ], "GROUP BY makes one output row per group and aggregates are computed inside each group. WHERE filters rows before grouping; HAVING filters the groups afterwards.")


JN = "Joins"


@t(SQ, JN, 2)
def _(r):
    emp, dept, rows = mkemp(r)
    x = r.choice(rows)[1]
    j, c = "FROM emp e {} JOIN dept d ON e.dept = d.dept", "SELECT COUNT(*) "
    inner, left, full = j.format("INNER"), j.format("LEFT"), j.format("FULL")
    return sqlq(r, [emp, dept], [
        (c + inner, [c + left, c + "FROM emp, dept", c + full, c + "FROM dept"]),
        (c + left, [c + inner, c + "FROM emp, dept", c + full, c + "FROM dept"]),
        (c + full, [c + inner, c + left, c + "FROM emp, dept"]),
        (c + "FROM emp, dept", [c + inner, c + left, "SELECT (SELECT COUNT(*) FROM emp) + (SELECT COUNT(*) FROM dept)"]),
        (f"SELECT e.name {left} WHERE d.dept IS NULL ORDER BY e.name", [f"SELECT e.name {inner} WHERE d.dept IS NULL ORDER BY e.name", "SELECT name FROM emp WHERE dept = 'HR' ORDER BY name", "SELECT name FROM emp WHERE dept = 'IT' ORDER BY name"]),
        ("SELECT d.dept FROM dept d LEFT JOIN emp e ON e.dept = d.dept WHERE e.id IS NULL ORDER BY d.dept", ["SELECT dept FROM dept ORDER BY dept", "SELECT DISTINCT dept FROM emp ORDER BY dept", "SELECT DISTINCT e.dept FROM emp e LEFT JOIN dept d ON e.dept = d.dept WHERE d.dept IS NULL"]),
        ("SELECT d.city, COUNT(e.id) FROM dept d LEFT JOIN emp e ON e.dept = d.dept GROUP BY d.city ORDER BY d.city", ["SELECT d.city, COUNT(*) FROM dept d LEFT JOIN emp e ON e.dept = d.dept GROUP BY d.city ORDER BY d.city", "SELECT d.city, COUNT(e.id) FROM dept d JOIN emp e ON e.dept = d.dept GROUP BY d.city ORDER BY d.city"]),
        (f"SELECT COUNT(DISTINCT d.city) {inner}", ["SELECT COUNT(*) FROM dept", "SELECT COUNT(DISTINCT dept) FROM emp", c + inner]),
        (f"SELECT d.city {inner} WHERE e.name = '{x}'", [f"SELECT d.city {left} WHERE e.name = '{x}'"], ),
        (f"SELECT d.city {left} WHERE e.name = '{x}'", [f"SELECT d.city {inner} WHERE e.name = '{x}'"]),
        (f"SELECT SUM(e.salary) {inner}", ["SELECT SUM(salary) FROM emp", f"SELECT SUM(e.salary) {inner} WHERE d.city = 'Pune'", c + inner]),
    ], "An inner join keeps only the pairs that match. A left join keeps every row of the left table and fills the right side with NULL when there is no match; a full join does that for both sides. With no join condition every row pairs with every row.",
        extra=["Pune", "Delhi", "Kochi"])


@t(SQ, JN, 3)
def _(r):
    n = 5
    names = r.sample(NAMES, n)
    rows = [(1, names[0], None)] + [(i + 1, names[i], r.randint(1, i)) for i in range(1, n)]
    x = r.choice(names[1:])
    staff = ("staff", ["id", "name", "manager_id"], rows)
    j = "FROM staff e JOIN staff m ON e.manager_id = m.id"
    others = [nm for nm in names if nm != x]
    return sqlq(r, [staff], [
        (f"SELECT m.name {j} WHERE e.name = '{x}'", [f"SELECT e.name {j} WHERE e.name = '{x}'", "SELECT name FROM staff WHERE manager_id IS NULL"]),
        (f"SELECT COUNT(*) {j}", ["SELECT COUNT(*) FROM staff", "SELECT COUNT(DISTINCT manager_id) FROM staff", "SELECT COUNT(*) FROM staff a, staff b"]),
        ("SELECT COUNT(DISTINCT manager_id) FROM staff", ["SELECT COUNT(manager_id) FROM staff", "SELECT COUNT(*) FROM staff", "SELECT COUNT(DISTINCT manager_id) + 1 FROM staff"]),
        (f"SELECT m.name {j} GROUP BY m.name ORDER BY COUNT(*) DESC, m.name LIMIT 1", [f"SELECT e.name {j} ORDER BY e.name LIMIT 1", "SELECT name FROM staff ORDER BY name DESC LIMIT 1"]),
        ("SELECT name FROM staff WHERE id NOT IN (SELECT manager_id FROM staff WHERE manager_id IS NOT NULL) ORDER BY name", ["SELECT name FROM staff WHERE id NOT IN (SELECT manager_id FROM staff) ORDER BY name", "SELECT name FROM staff WHERE id IN (SELECT manager_id FROM staff) ORDER BY name", "SELECT name FROM staff WHERE manager_id IS NULL"]),
        ("SELECT name FROM staff WHERE id NOT IN (SELECT manager_id FROM staff) ORDER BY name", ["SELECT name FROM staff WHERE id NOT IN (SELECT manager_id FROM staff WHERE manager_id IS NOT NULL) ORDER BY name", "SELECT name FROM staff WHERE id IN (SELECT manager_id FROM staff) ORDER BY name", "SELECT name FROM staff ORDER BY name"]),
        ("SELECT name FROM staff WHERE id IN (SELECT manager_id FROM staff) ORDER BY name", ["SELECT name FROM staff WHERE manager_id IS NOT NULL ORDER BY name", "SELECT name FROM staff WHERE manager_id IS NULL", "SELECT name FROM staff ORDER BY name"]),
        (f"SELECT COUNT(*) {j} WHERE m.name = '{names[0]}'", [f"SELECT COUNT(*) {j}", "SELECT COUNT(*) FROM staff", "SELECT 1"]),
    ], "A self join treats one table as two: e is the employee row and m is the row of that employee's manager. The top manager has no match and drops out of an inner join. NOT IN returns no rows at all if the list contains a NULL.",
        extra=others[:2])


@t(SQ, "Subqueries and set operations", 3)
def _(r):
    emp, dept, rows = mkemp(r)
    c, u = "SELECT COUNT(*) FROM", "SELECT dept FROM emp {} SELECT dept FROM dept"
    return sqlq(r, [emp, dept], [
        ("SELECT name FROM emp WHERE salary > (SELECT AVG(salary) FROM emp) ORDER BY name", ["SELECT name FROM emp WHERE salary < (SELECT AVG(salary) FROM emp) ORDER BY name", "SELECT name FROM emp WHERE salary > (SELECT MIN(salary) FROM emp) ORDER BY name", "SELECT name FROM emp WHERE salary = (SELECT MAX(salary) FROM emp) ORDER BY name"]),
        (f"{c} emp WHERE dept IN (SELECT dept FROM dept)", [f"{c} emp WHERE dept NOT IN (SELECT dept FROM dept)", f"{c} emp", f"{c} dept"]),
        (f"{c} emp WHERE dept NOT IN (SELECT dept FROM dept)", [f"{c} emp WHERE dept IN (SELECT dept FROM dept)", f"{c} emp", f"{c} dept"]),
        (f"{c} dept d WHERE EXISTS (SELECT 1 FROM emp e WHERE e.dept = d.dept)", [f"{c} dept d WHERE NOT EXISTS (SELECT 1 FROM emp e WHERE e.dept = d.dept)", f"{c} dept", f"{c} emp WHERE dept IN (SELECT dept FROM dept)"]),
        ("SELECT dept FROM dept d WHERE NOT EXISTS (SELECT 1 FROM emp e WHERE e.dept = d.dept) ORDER BY dept", ["SELECT dept FROM dept d WHERE EXISTS (SELECT 1 FROM emp e WHERE e.dept = d.dept) ORDER BY dept", "SELECT dept FROM dept ORDER BY dept", u.format("EXCEPT")]),
        (f"{c} ({u.format('UNION')})", [f"{c} ({u.format('UNION ALL')})", f"{c} ({u.format('INTERSECT')})", f"{c} ({u.format('EXCEPT')})"]),
        (f"{c} ({u.format('UNION ALL')})", [f"{c} ({u.format('UNION')})", f"{c} ({u.format('INTERSECT')})", f"{c} emp"]),
        (u.format("INTERSECT") + " ORDER BY dept", [u.format("EXCEPT") + " ORDER BY dept", u.format("UNION") + " ORDER BY dept", "SELECT dept FROM dept EXCEPT SELECT dept FROM emp ORDER BY dept"]),
        (u.format("EXCEPT") + " ORDER BY dept", ["SELECT dept FROM dept EXCEPT SELECT dept FROM emp ORDER BY dept", u.format("INTERSECT") + " ORDER BY dept", u.format("UNION") + " ORDER BY dept"]),
        ("SELECT name FROM emp e WHERE salary = (SELECT MAX(salary) FROM emp WHERE dept = e.dept) ORDER BY name", ["SELECT name FROM emp WHERE salary = (SELECT MAX(salary) FROM emp) ORDER BY name", "SELECT name FROM emp e WHERE salary = (SELECT MIN(salary) FROM emp WHERE dept = e.dept) ORDER BY name", "SELECT name FROM emp ORDER BY name LIMIT 3"]),
        ("SELECT MAX(salary) FROM emp WHERE salary < (SELECT MAX(salary) FROM emp)", ["SELECT MAX(salary) FROM emp", "SELECT MIN(salary) FROM emp", "SELECT salary FROM emp ORDER BY salary DESC LIMIT 1 OFFSET 1"]),
    ], "A subquery runs first (or once per outer row if it is correlated) and its result feeds the outer query. UNION removes duplicates, UNION ALL keeps them, INTERSECT keeps values found in both inputs and EXCEPT keeps values found only in the first.")


@t(SQ, "Window functions and CASE", 3)
def _(r):
    emp, dept, rows = mkemp(r)
    x, i, k = r.choice(rows)[1], r.randint(1, len(rows)), r.choice([40, 50, 60, 70])
    rk = "SELECT r FROM (SELECT name, {} AS r FROM emp) WHERE name = '" + x + "'"
    rank, dense, rown = rk.format("RANK() OVER (ORDER BY salary DESC)"), rk.format("DENSE_RANK() OVER (ORDER BY salary DESC)"), rk.format("ROW_NUMBER() OVER (ORDER BY salary DESC, id)")
    return sqlq(r, [emp], [
        (rank, [dense, rown, rk.format("RANK() OVER (ORDER BY salary)")]),
        (dense, [rank, rown, rk.format("DENSE_RANK() OVER (ORDER BY salary)")]),
        (rown, [rank, dense, rk.format("ROW_NUMBER() OVER (ORDER BY salary, id)")]),
        (rk.format("ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC, id)"), [rown, rank, "SELECT COUNT(*) FROM emp"]),
        (f"SELECT s FROM (SELECT name, SUM(salary) OVER (PARTITION BY dept) AS s FROM emp) WHERE name = '{x}'", ["SELECT SUM(salary) FROM emp", f"SELECT salary FROM emp WHERE name = '{x}'", "SELECT MAX(salary) FROM emp"]),
        (f"SELECT s FROM (SELECT id, SUM(salary) OVER (ORDER BY id) AS s FROM emp) WHERE id = {i}", ["SELECT SUM(salary) FROM emp", f"SELECT salary FROM emp WHERE id = {i}", f"SELECT COALESCE(SUM(salary), 0) FROM emp WHERE id < {i}"]),
        (f"SELECT c FROM (SELECT name, COUNT(*) OVER (PARTITION BY dept) AS c FROM emp) WHERE name = '{x}'", ["SELECT COUNT(*) FROM emp", "SELECT COUNT(DISTINCT dept) FROM emp", "SELECT 1"]),
        (f"SELECT p FROM (SELECT id, LAG(salary) OVER (ORDER BY id) AS p FROM emp) WHERE id = {i}", [f"SELECT p FROM (SELECT id, LEAD(salary) OVER (ORDER BY id) AS p FROM emp) WHERE id = {i}", f"SELECT salary FROM emp WHERE id = {i}"]),
        (f"SELECT SUM(CASE WHEN salary >= {k} THEN 1 ELSE 0 END) FROM emp", [f"SELECT SUM(salary) FROM emp WHERE salary >= {k}", f"SELECT COUNT(*) FROM emp WHERE salary > {k}", "SELECT COUNT(*) FROM emp"]),
        (f"SELECT COUNT(CASE WHEN salary >= {k} THEN 1 ELSE 0 END) FROM emp", [f"SELECT COUNT(CASE WHEN salary >= {k} THEN 1 END) FROM emp", f"SELECT COUNT(*) FROM emp WHERE salary < {k}", "SELECT COUNT(DISTINCT salary) FROM emp"]),
        (f"SELECT COUNT(CASE WHEN salary >= {k} THEN 1 END) FROM emp", ["SELECT COUNT(*) FROM emp", f"SELECT COUNT(*) FROM emp WHERE salary < {k}", f"SELECT COUNT(*) FROM emp WHERE salary > {k}"]),
        (f"SELECT CASE WHEN salary >= 70 THEN 'high' WHEN salary >= 50 THEN 'mid' ELSE 'low' END FROM emp WHERE name = '{x}'", ["SELECT 'high'", "SELECT 'mid'", "SELECT 'low'", "SELECT NULL"]),
    ], "A window function adds a value to every row without collapsing rows. RANK leaves gaps after ties, DENSE_RANK does not, and ROW_NUMBER is always 1, 2, 3. PARTITION BY restarts the calculation per group. COUNT counts non-NULL values, so CASE ... ELSE 0 counts every row.")


# ───────────────────────── Transactions and storage ─────────────────────────

TXN = "Transactions"

facts(bank, TX, TXN, 1, [
    [("Atomicity", "A transaction's changes are applied completely or not at all."),
     ("Consistency", "A transaction takes the database from one valid state to another, keeping every constraint true."),
     ("Isolation", "Concurrent transactions do not see each other's unfinished changes."),
     ("Durability", "Once a transaction commits, its changes survive a crash."),
     ("COMMIT", "Makes all changes of the current transaction permanent."),
     ("ROLLBACK", "Undoes all changes of the current transaction."),
     ("A SAVEPOINT", "A marker inside a transaction that later statements can be rolled back to without undoing the whole transaction.")],
    [("A dirty read", "Reading data written by a transaction that has not committed yet."),
     ("A non-repeatable read", "Reading the same row twice in one transaction and getting different values because another transaction committed a change in between."),
     ("A phantom read", "Re-running a query in one transaction and getting extra or missing rows because another transaction inserted or deleted them."),
     ("A lost update", "Two transactions read the same value and both write it back, so one change overwrites the other."),
     ("A shared lock", "A lock that lets several transactions read an item at the same time but blocks writers."),
     ("An exclusive lock", "A lock that lets one transaction read and write an item and blocks everyone else."),
     ("Two-phase locking", "A transaction acquires all the locks it needs before it releases any of them."),
     ("A deadlock", "Two or more transactions each wait for a lock another one holds, so none can proceed."),
     ("Starvation", "A transaction waits indefinitely because others keep being served first."),
     ("Write-ahead logging", "The log record describing a change is written to disk before the change itself."),
     ("A checkpoint", "A point at which pending changes are flushed to disk so recovery need not replay the whole log.")],
])


@t(TX, TXN, 2)
def _(r):
    a, b, x, y = r.choice([300, 400, 500, 600, 800]), r.choice([100, 200, 250, 700]), r.choice([50, 100, 150, 200]), r.choice([20, 30, 60])
    big = a + r.choice([50, 100])
    setup = f"CREATE TABLE acct (id INTEGER PRIMARY KEY, bal INTEGER CHECK (bal >= 0));\nINSERT INTO acct VALUES (1, {a}), (2, {b});"
    out, inn = lambda v: f"UPDATE acct SET bal = bal - {v} WHERE id = 1", lambda v: f"UPDATE acct SET bal = bal + {v} WHERE id = 2"
    stmts, total = r.choice([
        (["BEGIN", out(x), inn(x), "COMMIT"], False),
        (["BEGIN", out(x), inn(x), "ROLLBACK"], False),
        (["BEGIN", out(x), "SAVEPOINT s", out(y), "ROLLBACK TO s", "COMMIT"], False),
        (["BEGIN", out(x), "COMMIT", "BEGIN", out(y), "ROLLBACK"], False),
        (["BEGIN", out(x), "SAVEPOINT s", out(y), "RELEASE s", "ROLLBACK"], False),
        (["BEGIN", out(x), "SAVEPOINT s", out(y), "RELEASE s", "COMMIT"], False),
        ([inn(big), out(big)], True),
        (["BEGIN", inn(big), out(big), "ROLLBACK"], True),
        (["BEGIN", out(x), inn(x), "COMMIT"], True),
    ])
    _, con = script(setup, stmts)
    ans = con.execute("SELECT SUM(bal) FROM acct" if total else "SELECT bal FROM acct WHERE id = 1").fetchone()[0]
    ask = "What is the total of both balances afterwards?" if total else "What is the balance of account 1 afterwards?"
    wrong = [a + b, a + b + big, a + b - big, b + big] if total else [a, a - x, a - y, a - x - y, a + x]
    return nq(f"{setup}\n\n" + "\n".join(s + ";" for s in stmts) + f"\n\nA statement that breaks a constraint fails on its own and the script carries on. {ask}", ans, wrong,
              "COMMIT keeps everything since BEGIN and ROLLBACK discards it. ROLLBACK TO a savepoint undoes only the statements after that savepoint. Outside a transaction each statement stands alone, so a failure halfway leaves the earlier change in place.")


ISO = "Isolation and anomalies"
LEVELS = ["READ UNCOMMITTED", "READ COMMITTED", "REPEATABLE READ", "SERIALIZABLE"]
STILL = ["Dirty reads, non-repeatable reads and phantom reads", "Non-repeatable reads and phantom reads", "Phantom reads only", "None of the three"]


@t(TX, ISO, 2)
def _(r):
    why = "In the SQL standard READ UNCOMMITTED allows all three anomalies, READ COMMITTED prevents dirty reads, REPEATABLE READ also prevents non-repeatable reads, and SERIALIZABLE prevents phantoms too."
    a, b, n, x, y = r.choice([300, 500, 800]), r.choice([100, 200, 650]), r.randint(3, 6), r.choice([10, 20]), r.choice([5, 15])
    names = ["A dirty read", "A non-repeatable read", "A phantom read", "A lost update"]
    form = r.randint(0, 3)
    if form == 0:
        i = r.randrange(3)
        return Q(f"According to the SQL standard, what is the lowest isolation level that prevents {names[i].lower()}?", LEVELS[i + 1], [v for v in LEVELS if v != LEVELS[i + 1]], why)
    if form == 1:
        i = r.randrange(4)
        return Q(f"According to the SQL standard, which of these anomalies can still occur at {LEVELS[i]}?", STILL[i], [v for v in STILL if v != STILL[i]], why)
    if form == 2:
        return nq(f"A product has {a} units in stock. T1 and T2 both read {a}. T1 writes its value minus {x} and commits; then T2 writes its own value minus {y} and commits. What is the stock afterwards?",
                  a - y, [a - x - y, a - x, a], f"T2 still holds the old value {a}, so it writes {a} - {y} and T1's change is lost: a lost update. Run one after the other, the result would be {a - x - y}.")
    i = r.randrange(4)
    story = [f"T1 changes a balance from {a} to {b} but has not committed. T2 reads {b}. T1 then rolls back.",
             f"T1 reads a balance of {a}. T2 changes it to {b} and commits. T1 reads the same row again and now sees {b}.",
             f"T1 counts {n} orders above {a}. T2 inserts another order above {a} and commits. T1 repeats the count and gets {n + 1}.",
             f"T1 and T2 both read a stock of {a}. T1 writes {a - x} and commits. T2, still using {a}, writes {a - y} and commits."][i]
    return Q(f"{story}\n\nWhich anomaly is this?", names[i], [v for v in names if v != names[i]], why)


SER = "Serializability"


def schedule(r, nt):
    txs = {i: [(r.choice("RW"), r.choice("XY")) for _ in range(r.randint(2, 3))] for i in range(1, nt + 1)}
    order = [i for i, ops in txs.items() for _ in ops]
    r.shuffle(order)
    its = {i: iter(ops) for i, ops in txs.items()}
    return [(i, *next(its[i])) for i in order]


def conflicts(s):
    return {(a[0], b[0]) for i, a in enumerate(s) for b in s[i + 1:] if a[0] != b[0] and a[2] == b[2] and "W" in (a[1], b[1])}


def ops(s):
    return ", ".join(f"{op}{i}({x})" for i, op, x in s)


assert conflicts([(1, "R", "X"), (2, "W", "X"), (1, "W", "X")]) == {(1, 2), (2, 1)}
assert conflicts([(1, "R", "X"), (2, "R", "X")]) == set()


@t(TX, SER, 3)
def _(r):
    s = schedule(r, 2)
    e = conflicts(s)
    opts = ["Conflict serializable; equivalent only to T1 then T2", "Conflict serializable; equivalent only to T2 then T1",
            "Conflict serializable; equivalent to either serial order", "Not conflict serializable"]
    ans = opts[3] if len(e) == 2 else opts[0] if (1, 2) in e else opts[1] if (2, 1) in e else opts[2]
    why = "Draw an edge Ti → Tj when an operation of Ti comes before a conflicting operation of Tj (same item, different transactions, at least one write). The schedule is conflict serializable exactly when this graph has no cycle."
    if r.random() < 0.25:
        return nq(f"Schedule: {ops(s)}\n\nR is a read and W is a write. How many edges does the precedence graph have?", len(e), [len(s), 3], why)
    return Q(f"Schedule: {ops(s)}\n\nR is a read and W is a write. Which statement about the schedule is true?", ans, [o for o in opts if o != ans], why)


@t(TX, SER, 3)
def _(r):
    s = schedule(r, 3)
    e = conflicts(s)
    perms = list(itertools.permutations([1, 2, 3]))
    valid = [p for p in perms if all(p.index(a) < p.index(b) for a, b in e)]
    name = lambda p: "Equivalent to the serial order " + " → ".join(f"T{i}" for i in p)
    invalid = [p for p in perms if p not in valid]
    r.shuffle(invalid)
    if valid and len(invalid) < 2:
        return None
    ans, wrong = (name(r.choice(valid)), ["Not conflict serializable"] + [name(p) for p in invalid[:2]]) if valid else ("Not conflict serializable", [name(p) for p in invalid[:3]])
    return Q(f"Schedule: {ops(s)}\n\nR is a read and W is a write. Which statement about the schedule is true?", ans, wrong,
             "Build the precedence graph from the conflicting pairs. If it has a cycle the schedule is not conflict serializable; otherwise any order that follows all the edges is an equivalent serial order.")


DLK = "Deadlocks and locking"


@t(TX, DLK, 2)
def _(r):
    pairs = [(a, b) for a in range(1, 5) for b in range(1, 5) if a != b]
    e = r.sample(pairs, r.randint(3, 5))
    reach = {a: {b for x, b in e if x == a} for a in range(1, 5)}
    for _ in range(4):
        reach = {a: bs | {c for b in bs for c in reach[b]} for a, bs in reach.items()}
    cyc = [a for a in range(1, 5) if a in reach[a]]
    name = lambda ts: "A deadlock involving " + ", ".join(f"T{i}" for i in ts) if ts else "No deadlock"
    cands = [list(c) for n in (2, 3, 4) for c in itertools.combinations(range(1, 5), n)] + [[]]
    r.shuffle(cands)
    return Q("A wait-for graph has these edges (Ti → Tj means Ti waits for a lock held by Tj):\n\n" + ", ".join(f"T{a} → T{b}" for a, b in e) + "\n\nWhich transactions lie on a cycle?",
             name(cyc), [name(c) for c in cands if c != cyc], "A deadlock exists exactly when the wait-for graph has a cycle. A transaction that only waits for the cycle is blocked but is not part of the deadlock itself.")


@t(TX, DLK, 1)
def _(r):
    held, want, item = r.choice(["shared", "exclusive"]), r.choice(["shared", "exclusive"]), r.choice("XYZ")
    i, j = 1, 2  # only four real cases; renaming the transactions would just pad the bank
    opts = [f"T{j} is granted the lock immediately", f"T{j} waits until T{i} releases its lock", f"T{i} is rolled back so that T{j} can proceed", f"T{i}'s lock is downgraded and both continue"]
    ans = opts[0] if held == want == "shared" else opts[1]
    return Q(f"T{i} holds a{'n' if held == 'exclusive' else ''} {held} lock on item {item}. T{j} now requests a{'n' if want == 'exclusive' else ''} {want} lock on {item}. What happens?", ans, [o for o in opts if o != ans],
             "Shared locks are compatible with each other, so many readers can hold them together. An exclusive lock is compatible with nothing, so any request that involves one must wait.")


@t(TX, "Recovery", 3)
def _(r):
    n = r.randint(3, 4)
    times = r.sample(range(1, 40), 2 * n + 1)
    cp, ev, committed = times[-1], [], {}
    for i in range(n):
        s, c = sorted(times[2 * i:2 * i + 2])
        ev.append((s, f"<START T{i + 1}>"))
        if r.random() < 0.65:
            ev.append((c, f"<COMMIT T{i + 1}>"))
            committed[i + 1] = c
    ev.append((cp, "<CHECKPOINT>"))
    ev.sort()
    if ev[-1][1] == "<CHECKPOINT>" or ev[0][1] == "<CHECKPOINT>":
        return None
    redo = [i for i in range(1, n + 1) if committed.get(i, 0) > cp]
    undo = [i for i in range(1, n + 1) if i not in committed]
    name = lambda red, un: f"Redo: {', '.join(f'T{i}' for i in red) or 'none'}; Undo: {', '.join(f'T{i}' for i in un) or 'none'}"
    done = [i for i in committed if committed[i] < cp]
    wrong = [name(undo, redo), name(sorted(redo + done), undo), name(redo, sorted(undo + done)), name(sorted(committed), []), name([], undo), name(redo, []), name(list(range(1, n + 1)), [])]
    return Q("The log below is all that survives a crash. The checkpoint flushed every change made so far to disk.\n\n" + "\n".join(e for _, e in ev) + "\n(crash)\n\nWhat must recovery do?", name(redo, undo), wrong,
             "Transactions that committed before the checkpoint are already safely on disk. Those that committed after it must be redone from the log, and those that never committed must be undone.")


STO = "Storage and file organisation"


@t(TX, STO, 2)
def _(r):
    B, R, n, b = r.choice([512, 1024, 2048, 4096]), r.randint(40, 300), r.randint(200, 20000), r.randint(9, 5000)
    bf = B // R
    p, ans, w = r.choice([
        (f"A disk block holds {B} bytes and each record takes {R} bytes. Records are not split across blocks. How many records fit in one block?", bf, [bf + 1, B - R, B * R // 1000]),
        (f"A disk block holds {B} bytes and each record takes {R} bytes; records are not split across blocks. How many blocks does a file of {n} records need?", -(-n // bf), [n // bf, -(-n * R // B) if -(-n * R // B) != -(-n // bf) else n // bf + 2, n]),
        (f"A disk block holds {B} bytes and each record takes {R} bytes; records are not split across blocks. How many bytes are left unused in each full block?", B - bf * R, [R - B % R, R, 0 if B % R else R // 2]),
        (f"A sorted file occupies {b} blocks. At most how many block reads does a binary search for one record need?", math.ceil(math.log2(b)), [b // 2, b, math.ceil(math.log2(b)) * 2]),
        (f"An unsorted file occupies {2 * b} blocks. On average, how many blocks does a linear search read to find a record that exists?", b, [2 * b, math.ceil(math.log2(2 * b)), b // 2]),
        (f"A disk block holds {B} bytes. A file of {n} records uses {R}-byte records. Ignoring block boundaries, how many bytes of data does the file hold?", n * R, [n * B, n + R, n * R // B]),
    ])
    return nq(p, ans, w, "The blocking factor is floor(block size / record size). The file needs ceil(records / blocking factor) blocks. Binary search over b blocks reads about log2(b) of them; linear search reads half of them on average.")


IDX = "Indexing and hashing"


@t(TX, IDX, 3)
def _(r):
    B, K, P, m, f, h = r.choice([512, 1024, 2048, 4096]), r.randint(4, 20), r.randint(4, 12), r.randint(3, 200), r.choice([3, 4, 5, 10, 50, 100]), r.randint(2, 3)
    n, R, E = r.randint(1000, 50000), r.randint(50, 200), r.randint(8, 20)
    bf = B // R
    blocks = -(-n // bf)
    order = (B + K) // (P + K)
    levels = next(x for x in range(1, 40) if f ** x >= n)
    p, ans, w = r.choice([
        (f"A B+ tree node must fit in one {B}-byte block. A key takes {K} bytes and a pointer takes {P} bytes; a node with p pointers holds p - 1 keys. What is the largest possible p?", order, [B // (P + K) if B // (P + K) != order else order - 1, B // K, B // P]),
        (f"In a B-tree of order {m} (at most {m} children per node), what is the largest number of keys one node can hold?", m - 1, [m, m + 1, -(-m // 2)]),
        (f"In a B-tree of order {m} (at most {m} children per node), what is the smallest number of keys a non-root node may hold?", -(-m // 2) - 1, [-(-m // 2), m // 2 + 1, 1 if m > 4 else 3]),
        (f"Every node of a B+ tree has a fan-out of {f}. How many leaf entries can a tree with {h} levels of fan-out reach at most?", f ** h, [f * h, f ** (h - 1), f ** h - 1]),
        (f"An index has a fan-out of {f}. What is the smallest number of levels needed to reach {n} entries?", levels, [levels - 1 if levels > 1 else 3, levels + 2, math.ceil(n / f)]),
        (f"A data file has {n} records stored {bf} to a block. How many entries does a dense index on it have?", n, [blocks, n // 2, bf]),
        (f"A data file has {n} records stored {bf} to a block. How many entries does a sparse (one per block) index on it have?", blocks, [n, n // bf if n // bf != blocks else blocks + 2, bf]),
        (f"A dense index on {n} records uses {E}-byte entries and {B}-byte blocks. How many blocks does the index occupy?", -(-n // (B // E)), [n // (B // E) if n % (B // E) else n // (B // E) - 1, -(-n * E // B) + 1 if -(-n * E // B) == -(-n // (B // E)) else -(-n * E // B), n]),
    ])
    return nq(p, ans, w, "A node with p pointers and p - 1 keys fits when p * pointer + (p - 1) * key <= block size. A B-tree of order m holds at most m - 1 keys per node and at least ceil(m / 2) - 1. A dense index has one entry per record, a sparse index one per block.")


@t(TX, IDX, 2)
def _(r):
    m = r.choice([7, 10, 11, 13])
    keys = uniq(r, r.randint(4, 5), 10, 99)
    slots, at, coll = [None] * m, {}, 0
    for k in keys:
        i = k % m
        while slots[i] is not None:
            i, coll = (i + 1) % m, coll + 1
        slots[i], at[k] = k, i
    last, k0 = keys[-1], r.choice(keys)
    base = f"A hash table has {m} slots (0 to {m - 1}) and uses h(k) = k mod {m}."
    p, ans, w = r.choice([
        (f"{base} Which slot does key {k0} hash to?", k0 % m, [k0 // m, (k0 % m + 1) % m, k0 % 10 if k0 % 10 != k0 % m else m - 1]),
        (f"{base} Collisions are resolved by linear probing. The keys {', '.join(map(str, keys))} are inserted in that order. In which slot does {last} end up?", at[last], [last % m if last % m != at[last] else (at[last] + 2) % m, (at[last] + 1) % m, (at[last] - 1) % m]),
        (f"{base} Collisions are resolved by linear probing. The keys {', '.join(map(str, keys))} are inserted in that order. How many extra probes (steps past the home slot) are made in total?", coll, [len(keys), len(keys) - len({k % m for k in keys}) if len(keys) - len({k % m for k in keys}) != coll else coll + 2]),
        (f"{base} The keys {', '.join(map(str, keys))} are inserted with chaining. How many slots are still empty?", m - len({k % m for k in keys}), [m - len(keys) if len({k % m for k in keys}) != len(keys) else m - len(keys) + 2, len({k % m for k in keys}), m]),
    ])
    return nq(p, ans, w, "h(k) = k mod m gives the home slot. With linear probing a key whose home slot is taken moves to the next free slot, wrapping round at the end. With chaining, keys that share a slot are kept in a list at that slot.")


facts(bank, TX, IDX, 2, [
    [("A clustered index", "An index that determines the physical order of the rows; a table can have only one."),
     ("A non-clustered index", "A separate structure that points to the rows without changing their physical order."),
     ("A dense index", "An index with one entry for every record."),
     ("A sparse index", "An index with one entry per block, pointing to the first record in it."),
     ("A B+ tree", "A balanced tree whose leaves hold all the keys in sorted order and are linked for range scans."),
     ("A hash index", "An index that finds exact matches quickly but cannot answer range queries."),
     ("A composite index", "An index built on several columns, useful when queries filter on its leading columns."),
     ("A covering index", "An index that contains every column a query needs, so the table itself is never read."),
     ("OLTP", "Workloads of many short read-write transactions, such as placing orders."),
     ("OLAP", "Workloads of large analytical queries over historical data.")],
])


if __name__ == "__main__":
    bank.write(OUT)
