#!/usr/bin/env python3
"""Generate data/computing-fundamentals-questions.csv: 5,000 multiple-choice questions.

Covers number systems and data representation, logic and computer organisation, algorithms
and data structures, and operating systems and networks. Every numeric or traced answer is
computed by the small simulators in this file (schedulers, page replacement, sorting passes,
tree traversals, subnet maths); definitions come from the fact lists.

Needs only the standard library.   Run:  python3 scripts/gen-computing-questions.py
"""
import ipaddress
import itertools
import math
import posixpath
from collections import deque
from pathlib import Path

from qbank import Bank, Q, ask, facts, ints, nq, uniq

OUT = Path(__file__).resolve().parent.parent / "data" / "computing-fundamentals-questions.csv"

# proposed topicIds for a `computing-fundamentals` skill, in teaching order
DR, LG, AL, OS = ("computing-fundamentals-data", "computing-fundamentals-logic",
                  "computing-fundamentals-algorithms", "computing-fundamentals-systems")
bank = Bank("computing-fundamentals", "comp", [DR, LG, AL, OS])
t = bank.t

WORDS = ["python", "data", "binary", "logic", "cache", "stack", "queue", "kernel", "router", "packet", "memory", "cloud"]


def seq(xs):
    return ", ".join(map(str, xs))


def bits(x, n=0):
    return format(x, f"0{n}b")


# ───────────────────────── Data representation ─────────────────────────

@t(DR, "Number systems", 1)
def _(r):
    n = r.randint(9, 255)
    b, h, o = bits(n), format(n, "X"), format(n, "o")
    return ask(r, [
        (f"What is the decimal number {n} in binary?", b, [bits(n + 1), bits(n - 1), bits(n ^ 2), bits(n ^ 4)]),
        (f"What is the binary number {b} in decimal?", n, [n + 1, n - 1, int(b[::-1], 2), n ^ 2]),
        (f"What is the decimal number {n} in hexadecimal?", h, [format(n + 1, "X"), format(n + 16, "X"), format(n - 1, "X"), str(n)]),
        (f"What is the hexadecimal number {h} in decimal?", n, [n + 16, n - 16 if n > 16 else n + 6, int(str(n)[::-1]) if str(n) != str(n)[::-1] else n + 10, n + 1]),
        (f"What is the binary number {bits(n, 8)} in hexadecimal?", format(n, "02X"), [format(n ^ 16, "02X"), format(n ^ 1, "02X"), format(n, "02X")[::-1], format((n + 17) % 256, "02X")]),
        (f"What is the hexadecimal number {format(n, '02X')} in binary (8 bits)?", bits(n, 8), [bits(n ^ 16, 8), bits(n ^ 1, 8), bits(n, 8)[::-1], bits(n ^ 8, 8)]),
        (f"What is the decimal number {n} in octal?", o, [format(n + 1, "o"), format(n + 8, "o"), h, format(n - 1, "o")]),
        (f"What is the octal number {o} in decimal?", n, [n + 8, n - 1, n + 1, int(o) if int(o) != n else n + 2]),
    ], "Each binary digit is a power of 2, each octal digit a power of 8 and each hexadecimal digit a power of 16. One hex digit stands for exactly four bits and one octal digit for three.")


@t(DR, "Binary arithmetic", 2)
def _(r):
    a, b, k = r.randint(5, 120), r.randint(3, 120), r.randint(1, 3)
    hi, lo = max(a, b), min(a, b)
    x, y = r.randint(130, 250), r.randint(20, 120)
    return ask(r, [
        (f"What is {bits(a)} + {bits(b)} in binary?", bits(a + b), [bits(a ^ b), bits(a | b), bits(a + b + 1), bits(a + b - 2)]),
        (f"What is {bits(hi + 1)} − {bits(lo)} in binary?", bits(hi + 1 - lo), [bits((hi + 1) ^ lo), bits(hi + 2 - lo), bits(hi - lo) if hi != lo else bits(3), bits(hi + 1 + lo)]),
        (f"An 8-bit unsigned register holds {x}. The value {y} is added and the carry out is discarded. What does the register hold now?", (x + y) % 256, [x + y, 255, (x + y) % 255]),
        (f"The binary number {bits(a)} is shifted left by {k} place(s). What is its value in decimal now?", a << k, [a * k if a * k != a << k else a + k, a + k, a << (k + 1)]),
        (f"The binary number {bits(a + 16)} is shifted right by {k} place(s), dropping the bits that fall off. What is its value in decimal now?", (a + 16) >> k, [(a + 16) << k, (a + 16) - k, ((a + 16) >> k) + 1]),
        (f"What is {bits(lo)} × {bits(k + 1)} in binary?", bits(lo * (k + 1)), [bits(lo + k + 1), bits(lo << (k + 1)), bits(lo * (k + 1) + 1), bits(lo * k) if k > 1 else bits(lo + 3)]),
        (f"Two 8-bit unsigned numbers, {x} and {y + 100}, are added. Does the true sum fit in 8 bits, and what is it?", f"{'Yes' if x + y + 100 < 256 else 'No'}; the sum is {x + y + 100}",
         [f"{'No' if x + y + 100 < 256 else 'Yes'}; the sum is {x + y + 100}", f"Yes; the sum is {(x + y + 100) % 256}", f"No; the sum is {(x + y + 100) % 256}"]),
    ], "Binary addition carries when a column reaches 2. Shifting left by k multiplies by 2^k and shifting right divides by 2^k, dropping the remainder. An 8-bit register can only hold 0 to 255, so a larger result wraps round modulo 256.")


@t(DR, "Signed numbers", 2)
def _(r):
    n, w = r.randint(1, 127), r.choice([4, 6, 8, 12, 16])
    v = r.randint(-128, -1)
    return ask(r, [
        (f"What is the 8-bit two's complement representation of −{n}?", bits(256 - n, 8), [bits(255 - n, 8), bits(128 + n, 8), bits(n, 8), bits((257 - n) % 256, 8)]),
        (f"The 8-bit pattern {bits(v + 256, 8)} is a two's complement number. What is its decimal value?", v, [v + 256, -((v + 256) & 127), v + 1, v - 1]),
        (f"What is the 8-bit one's complement of {bits(n, 8)}?", bits(255 - n, 8), [bits(256 - n, 8), bits(n, 8)[::-1], bits(n ^ 128, 8), bits(254 - n if n < 254 else 3, 8)]),
        (f"What is the largest value a {w}-bit two's complement integer can hold?", 2 ** (w - 1) - 1, [2 ** w - 1, 2 ** (w - 1), 2 ** w]),
        (f"What is the smallest value a {w}-bit two's complement integer can hold?", -(2 ** (w - 1)), [-(2 ** (w - 1)) + 1, -(2 ** w), -(2 ** w) + 1, 0]),
        (f"What is the largest value a {w}-bit unsigned integer can hold?", 2 ** w - 1, [2 ** w, 2 ** (w - 1) - 1, 2 ** (w - 1)]),
        (f"How many different values can {w} bits represent?", 2 ** w, [2 ** w - 1, 2 * w, w * w]),
        (f"In 8-bit sign-and-magnitude form, how is −{n} written?", bits(128 + n, 8), [bits(256 - n, 8), bits(255 - n, 8), bits(n, 8)]),
    ], "With n bits there are 2^n patterns. Unsigned numbers run from 0 to 2^n - 1; two's complement runs from -2^(n-1) to 2^(n-1) - 1. To negate in two's complement, invert every bit and add 1.")


@t(DR, "Bitwise operations", 2)
def _(r):
    a, b, k = r.randint(9, 63), r.randint(9, 63), r.randint(0, 5)
    ops = {"AND": a & b, "OR": a | b, "XOR": a ^ b}
    op = r.choice(list(ops))
    p2 = 2 ** r.randint(3, 9)
    non = [x for x in (p2 + 2, p2 - 2, p2 + p2 // 2, p2 * 3, p2 - 1, p2 + 4) if x & (x - 1)]
    return ask(r, [
        (f"What is {bits(a, 6)} {op} {bits(b, 6)}?", bits(ops[op], 6), [bits(v, 6) for o, v in ops.items() if o != op] + [bits(ops[op] ^ 1, 6), bits((a + b) % 64, 6)]),
        (f"What is the bitwise NOT of the 8-bit value {bits(a, 8)}?", bits(255 - a, 8), [bits(256 - a, 8), bits(a, 8)[::-1], bits(a ^ 15, 8), bits(a ^ 240, 8)]),
        (f"Bit positions are numbered from 0 at the right. Setting bit {k} of {bits(a, 6)} gives which decimal value?", a | (1 << k), [a & ~(1 << k), a ^ (1 << k) if a & (1 << k) else a + k, a + (1 << k) + 1]),
        (f"Bit positions are numbered from 0 at the right. Clearing bit {k} of {bits(a, 6)} gives which decimal value?", a & ~(1 << k), [a | (1 << k), a - k if a - k != a & ~(1 << k) else a + 1, (a & ~(1 << k)) + 1]),
        (f"How many 1 bits does the binary form of {a + b * 3} contain?", bin(a + b * 3).count("1"), [len(bin(a + b * 3)) - 2, bin(a + b * 3).count("0") - 1]),
        ("Which of these numbers is a power of two?", p2, non[:3]),
        (f"What is the decimal value of {a + 64} AND 15 (keeping only the low four bits)?", (a + 64) & 15, [(a + 64) >> 4, (a + 64) | 15, (a + 64) % 10]),
        (f"What is the decimal value of {a} XOR {a}?", 0, [a, 2 * a, 1]),
    ], "AND gives 1 only where both bits are 1, OR where at least one is 1, XOR where exactly one is 1. OR with a mask sets bits, AND with an inverted mask clears them, and a power of two has exactly one 1 bit.")


@t(DR, "Units and sizes", 1)
def _(r):
    k, n = r.randint(2, 64), r.randint(3, 2000)
    w, h, d = r.choice([64, 100, 200, 320, 640, 800]), r.choice([48, 100, 200, 240, 480, 600]), r.choice([8, 16, 24])
    s, rate, sb = r.randint(2, 60), r.choice([8000, 22050, 44100]), r.choice([8, 16])
    mb, mbps, gb, fmb = r.choice([10, 25, 50, 100, 200, 400]), r.choice([2, 4, 8, 10, 20, 40]), r.choice([4, 8, 16, 32, 64]), r.choice([4, 8, 16, 32, 256])
    return ask(r, [
        (f"How many bits are there in {k} bytes?", 8 * k, [k // 8 if k >= 8 else k + 8, 4 * k, 16 * k]),
        (f"How many bytes are there in {k} KB, taking 1 KB as 1024 bytes?", 1024 * k, [1000 * k, 1024 * k * 8, 1024 + k]),
        (f"How many MB are there in {k} GB, taking 1 GB as 1024 MB?", 1024 * k, [1000 * k, 1024 * 1024 * k, 8 * k]),
        (f"What is the smallest number of bits needed to give each of {n} items its own binary code?", math.ceil(math.log2(n)), [math.floor(math.log2(n)) if math.floor(math.log2(n)) != math.ceil(math.log2(n)) else math.ceil(math.log2(n)) + 2, n // 2, math.ceil(math.log2(n)) + 1]),
        (f"An uncompressed image is {w} × {h} pixels with a colour depth of {d} bits. How many bytes does it need?", w * h * d // 8, [w * h * d, w * h, w * h * d // 1024]),
        (f"{s} seconds of mono sound is sampled {rate} times per second at {sb} bits per sample. How many bytes is the uncompressed recording?", s * rate * sb // 8, [s * rate * sb, s * rate, s * rate * sb // 4]),
        (f"How many seconds does it take to send a {mb} MB file over a {mbps} Mbps link? (1 byte = 8 bits; ignore overheads.)", mb * 8 / mbps, [mb / mbps, mb * mbps / 8, mb * 8 * mbps]),
        (f"A {gb} GB drive is filled with {fmb} MB files. How many fit, taking 1 GB as 1024 MB?", gb * 1024 // fmb, [gb * 1000 // fmb, gb * fmb, gb * 1024 * fmb]),
        (f"A text of {n} characters is stored in ASCII using one byte per character. How many bits does it take?", 8 * n, [7 * n, n, 16 * n]),
    ], "A byte is 8 bits, and each step up (KB, MB, GB) is 1024 times the one before in binary units. Size = number of items × bits per item; divide by 8 for bytes. Link speeds are quoted in bits per second, file sizes in bytes.")


ENC = "Characters and error checking"


@t(DR, ENC, 1)
def _(r):
    k, word = r.randint(1, 25), r.choice(WORDS)
    up, low = chr(65 + k), chr(97 + k)
    d7, x, y = bits(r.randint(1, 126), 7), r.randint(0, 255), r.randint(0, 255)
    p = str(d7.count("1") % 2)
    return ask(r, [
        (f"The ASCII code of 'A' is 65. What is the ASCII code of '{up}'?", 65 + k, [64 + k, 66 + k, 97 + k, k]),
        (f"The ASCII code of 'a' is 97. What is the ASCII code of '{low}'?", 97 + k, [96 + k, 65 + k, 98 + k, k]),
        (f"The ASCII code of 'A' is 65. Which character has the code {65 + k}?", up, [chr(64 + k), chr(66 + k), low, chr(67 + k)]),
        (f"The ASCII code of '{up}' is {65 + k}. What is the code of '{low}'?", 97 + k, [65 + k, 33 + k, 96 + k, 98 + k]),
        (f"Even parity is used. The 7 data bits are {d7}. What is the 8-bit codeword once the parity bit is added at the end?", d7 + p, [d7 + str(1 - int(p)), p + d7[::-1], d7[::-1] + p, d7 + p + p]),
        (f"What is the Hamming distance between {bits(x, 8)} and {bits(y, 8)}?", bin(x ^ y).count("1"), [bin(x & y).count("1"), bin(x | y).count("1"), 8 - bin(x ^ y).count("1")]),
        (f'How many bytes does the word "{word}" take in ASCII, one byte per character?', len(word), [len(word) * 8, len(word) + 1, len(word) * 2]),
        (f'How many bits does the word "{word}" take in an encoding that uses 16 bits for every character?', len(word) * 16, [len(word) * 8, len(word) * 2, len(word) + 16]),
        (f"The ASCII code of '0' is 48. What is the code of the digit character '{k % 10}'?", 48 + k % 10, [k % 10, 49 + k % 10, 65 + k % 10, 47 + k % 10]),
    ], "ASCII codes run in order: 'A' to 'Z' are 65 to 90, 'a' to 'z' are 97 to 122 (32 higher), and '0' to '9' are 48 to 57. An even parity bit makes the total number of 1s even. Hamming distance counts the positions in which two codes differ.")


facts(bank, DR, ENC, 1, [
    [("A bit", "The smallest unit of data: a single 0 or 1."),
     ("A byte", "A group of 8 bits."),
     ("A nibble", "A group of 4 bits, written as one hexadecimal digit."),
     ("ASCII", "A character code that uses 7 bits to represent 128 characters."),
     ("Unicode", "A character standard that gives a number to every character of every writing system."),
     ("UTF-8", "A variable-length encoding of Unicode that uses 1 to 4 bytes per character and matches ASCII for the first 128."),
     ("Two's complement", "The usual way to store signed integers: a negative number is the bitwise inverse of its magnitude, plus one."),
     ("Overflow", "A result that is too large to fit in the number of bits available."),
     ("The most significant bit", "The leftmost bit, which carries the largest place value."),
     ("The least significant bit", "The rightmost bit, which carries a place value of 1."),
     ("A parity bit", "An extra bit added so that the number of 1s is always even (or always odd), used to detect single-bit errors."),
     ("Hexadecimal", "The base-16 number system, using the digits 0-9 and A-F."),
     ("Lossless compression", "Reducing file size in a way that lets the original data be rebuilt exactly."),
     ("Lossy compression", "Reducing file size by permanently discarding detail that is unlikely to be noticed."),
     ("Colour depth", "The number of bits used to store the colour of one pixel."),
     ("Sample rate", "The number of sound measurements taken per second.")],
])


# ───────────────────────── Logic and computer organisation ─────────────────────────

GATES = {"AND": lambda a, b: a & b, "OR": lambda a, b: a | b, "XOR": lambda a, b: a ^ b,
         "NAND": lambda a, b: 1 - (a & b), "NOR": lambda a, b: 1 - (a | b), "XNOR": lambda a, b: 1 - (a ^ b)}


def ev(text, **env):
    """Evaluate a bracketed gate expression such as "(A NAND B) OR (NOT C)" for 0/1 inputs."""
    toks = text.replace("(", " ( ").replace(")", " ) ").split()

    def operand(i):
        if toks[i] == "NOT":
            v, i = operand(i + 1)
            return 1 - v, i
        if toks[i] == "(":
            v, i = chain(i + 1)
            return v, i + 1
        return env[toks[i]], i + 1

    def chain(i):  # binary gates apply left to right; anything else is bracketed in the text
        v, i = operand(i)
        while i < len(toks) and toks[i] in GATES:
            w, j = operand(i + 1)
            v, i = GATES[toks[i]](v, w), j
        return v, i

    return chain(0)[0]


assert ev("NOT (A AND B)", A=1, B=1) == 0 and ev("(A NAND B) OR C", A=1, B=1, C=0) == 0 and ev("A XOR B XOR C", A=1, B=1, C=1) == 1

EXPRS = ["(A AND B) OR C", "A AND (B OR C)", "(NOT A) OR B", "(A XOR B) AND C", "NOT (A AND B)", "A OR (B AND (NOT C))",
         "(A NAND B) OR C", "(A NOR B) XOR C", "(NOT (A OR B)) OR C", "(A AND (NOT B)) OR ((NOT A) AND C)", "A XOR B XOR C",
         "(A OR B) AND (B OR C)", "(NOT A) AND (NOT B) AND C", "(A AND B) OR (B AND C) OR (A AND C)", "A AND (NOT (B XOR C))", "(A OR C) AND (NOT B)"]
ROWS = list(itertools.product([0, 1], repeat=3))


@t(LG, "Logic gates", 1)
def _(r):
    a, b = r.randint(0, 1), r.randint(0, 1)
    names = r.sample(list(GATES), 4)
    outs = [GATES[n](a, b) for n in names]
    flip = lambda i: seq(1 - o if j == i else o for j, o in enumerate(outs))
    return Q(f"Two inputs are A = {a} and B = {b}. What are the outputs of {names[0]}, {names[1]}, {names[2]} and {names[3]} gates, in that order?", seq(outs),
             [flip(0), flip(1), flip(2), flip(3), seq(1 - o for o in outs)],
             "AND is 1 only when both inputs are 1; OR is 1 when at least one is 1; XOR is 1 when the inputs differ. NAND, NOR and XNOR are the inverses of AND, OR and XOR.")


@t(LG, "Logic gates", 2)
def _(r):
    text = r.choice(EXPRS)
    f = lambda A, B, C: ev(text, A=A, B=B, C=C)
    rows = r.sample(ROWS, 3)
    outs = [f(*row) for row in rows]
    flip = lambda i: seq(1 - o if j == i else o for j, o in enumerate(outs))
    ones = sum(f(*row) for row in ROWS)
    why = "Work from the innermost brackets outwards, replacing each gate by its output. A three-input function has 8 input combinations."
    if r.random() < 0.15:
        return nq(f"F = {text}\n\nFor how many of the 8 combinations of A, B and C is F = 1?", ones, [8 - ones, ones + 1, ones - 1], why)
    return Q(f"F = {text}\n\nWhat is F for (A, B, C) = " + ", ".join(str(row).replace(" ", "") for row in rows) + ", in that order?", seq(outs), [flip(0), flip(1), flip(2), seq(1 - o for o in outs)], why)


BOOL = "Boolean algebra"
POOL = ["NOT (A AND B)", "(NOT A) OR (NOT B)", "NOT (A OR B)", "(NOT A) AND (NOT B)", "A OR (A AND B)", "A AND (A OR B)", "A",
        "A XOR B", "(A AND (NOT B)) OR ((NOT A) AND B)", "(A OR B) AND (NOT (A AND B))", "A OR ((NOT A) AND B)", "A OR B",
        "A AND ((NOT A) OR B)", "A AND B", "(A NAND B) NAND (A NAND B)", "A NAND A", "NOT A", "A XNOR B",
        "(A AND B) OR ((NOT A) AND (NOT B))", "(A NOR A) NOR (B NOR B)", "(A NAND A) NAND (B NAND B)", "NOT (A XOR B)",
        "(A OR B) AND (A OR (NOT B))", "(A AND B) OR (A AND (NOT B))", "B OR (A AND (NOT A))", "B", "B AND (A OR (NOT A))"]
TABLE = {text: tuple(ev(text, A=a, B=b) for a in (0, 1) for b in (0, 1)) for text in POOL}
assert TABLE["NOT (A AND B)"] == TABLE["(NOT A) OR (NOT B)"] and TABLE["A OR (A AND B)"] == TABLE["A"]


@t(LG, BOOL, 2)
def _(r):
    target = r.choice(list(TABLE))
    same = [x for x in TABLE if TABLE[x] == TABLE[target] and x != target]
    diff = [x for x in TABLE if TABLE[x] != TABLE[target]]
    if not same:
        return None
    return Q(f"Which expression is equivalent to {target}?", r.choice(same), r.sample(diff, 3),
             "Two expressions are equivalent when they give the same output for every input combination. De Morgan: NOT (A AND B) = (NOT A) OR (NOT B). Absorption: A OR (A AND B) = A.")


@t(LG, BOOL, 2)
def _(r):
    n = r.randint(2, 10)
    return ask(r, [
        (f"How many rows does the truth table of a circuit with {n} inputs have?", 2 ** n, [2 * n, n * n, 2 ** n - 1]),
        (f"How many different Boolean functions of {min(n, 4)} inputs are there?", 2 ** (2 ** min(n, 4)), [2 ** min(n, 4), (2 ** min(n, 4)) ** 2, 2 * min(n, 4)]),
        (f"A truth table has {2 ** n} rows. How many inputs does the circuit have?", n, [2 ** n // 2, n + 1, n - 1]),
    ], "n inputs give 2^n input combinations (rows). Each row can map to 0 or 1 independently, so there are 2^(2^n) different functions.")


facts(bank, LG, BOOL, 2, [
    [("The commutative law", "A + B = B + A"), ("The associative law", "(A + B) + C = A + (B + C)"),
     ("The distributive law", "A · (B + C) = A · B + A · C"), ("De Morgan's law", "(A · B)' = A' + B'"),
     ("The absorption law", "A + A · B = A"), ("The idempotent law", "A + A = A"),
     ("The identity law", "A + 0 = A"), ("The complement law", "A + A' = 1"),
     ("The double negation law", "(A')' = A"), ("The domination (annulment) law", "A + 1 = 1")],
])

CIR = "Adders and circuits"


@t(LG, CIR, 2)
def _(r):
    a, b, c = r.randint(0, 1), r.randint(0, 1), r.randint(0, 1)
    x, y = r.randint(1, 15), r.randint(1, 15)
    n, sel = r.randint(2, 4), 0
    sel = r.randint(0, 2 ** n - 1)
    total = a + b + c
    opts = [f"Sum {s}, carry {co}" for s in (0, 1) for co in (0, 1)]
    form = r.randint(0, 3)
    why = "A full adder adds three bits: the sum bit is their XOR and the carry is 1 when two or more inputs are 1. A multiplexer passes the data input whose number is on the select lines; a decoder activates the output whose number is on its inputs."
    if form == 0:
        ans = f"Sum {total % 2}, carry {total // 2}"
        return Q(f"A full adder has inputs A = {a}, B = {b} and carry-in = {c}. What are its outputs?", ans, [o for o in opts if o != ans], why)
    if form == 1:
        s, co = (x + y) % 16, (x + y) // 16
        return Q(f"A 4-bit adder adds {bits(x, 4)} and {bits(y, 4)}. What are the 4-bit sum and the carry out?", f"Sum {bits(s, 4)}, carry {co}",
                 [f"Sum {bits(s, 4)}, carry {1 - co}", f"Sum {bits(x ^ y, 4)}, carry {co}", f"Sum {bits((s + 1) % 16, 4)}, carry {co}", f"Sum {bits(x | y, 4)}, carry 0"], why)
    if form == 2:
        return Q(f"A {2 ** n}-to-1 multiplexer has data inputs I0 to I{2 ** n - 1}. Its select lines, most significant first, are {bits(sel, n)}. Which input is passed to the output?", f"I{sel}",
                 [f"I{int(bits(sel, n)[::-1], 2)}", f"I{(sel + 1) % 2 ** n}", f"I{2 ** n - 1 - sel}", f"I{(sel + 2) % 2 ** n}"], why)
    return Q(f"A {n}-to-{2 ** n} decoder has outputs Y0 to Y{2 ** n - 1}. Its inputs, most significant first, are {bits(sel, n)}. Which output is active?", f"Y{sel}",
             [f"Y{int(bits(sel, n)[::-1], 2)}", f"Y{(sel + 1) % 2 ** n}", f"Y{2 ** n - 1 - sel}", f"Y{(sel + 2) % 2 ** n}"], why)


@t(LG, CIR, 2)
def _(r):
    n, k = r.randint(2, 64), r.randint(1, 6)
    cnt = r.randint(3, 1000)
    return ask(r, [
        (f"How many select lines does a {2 ** k}-to-1 multiplexer need?", k, [2 ** k, k + 1, 2 ** k - 1]),
        (f"How many full adders does a ripple-carry adder for two {n}-bit numbers use (with no half adder)?", n, [n - 1, 2 * n, n * n]),
        (f"How many output lines does a decoder with {k} input lines have?", 2 ** k, [2 * k, k * k if k * k != 2 ** k else k + 3, 2 ** k - 1]),
        (f"How many flip-flops are needed to build a counter that counts through {cnt} different states?", math.ceil(math.log2(cnt)), [cnt, math.ceil(math.log2(cnt)) + 1, cnt // 2]),
        (f"A register is made of {n} flip-flops. How many bits does it store?", n, [2 ** min(n, 20), 2 * n, n // 2]),
        (f"How many data inputs does a multiplexer with {k} select lines have?", 2 ** k, [2 * k, k, 2 ** k - 1]),
    ], "k select lines choose between 2^k data inputs; a decoder with k inputs has 2^k outputs. Each flip-flop stores one bit, so n flip-flops give 2^n states, and an n-bit ripple-carry adder needs one full adder per bit.")


@t(LG, "CPU and memory", 2)
def _(r):
    n, k, w, op = r.randint(8, 32), r.randint(8, 24), r.choice([8, 16, 32, 64]), r.randint(3, 8)
    ic, cpi, f, ghz = r.choice([2, 4, 5, 8, 10, 20]), r.choice([1.5, 2, 2.5, 3, 4]), r.choice([100, 200, 400, 500, 1000, 2000]), r.choice([1, 2, 2.5, 4, 5])
    h, tc, tm = r.choice([80, 85, 90, 95, 98]), r.choice([2, 5, 10]), r.choice([50, 100, 200])
    p, s = r.choice([50, 60, 75, 80, 90]), r.choice([2, 4, 5, 10])
    return ask(r, [
        (f"A CPU has {n} address lines. How many memory locations can it address?", 2 ** n, [2 * n, 2 ** n - 1, 2 ** (n - 1)]),
        (f"How many address lines are needed to address {2 ** k} memory locations?", k, [2 ** k // 8, k + 1, k - 1]),
        (f"A memory has {2 ** k} locations of {w} bits each. What is its capacity in bytes?", 2 ** k * w // 8, [2 ** k * w, 2 ** k, 2 ** k // 8]),
        (f"A program executes {ic} billion instructions at an average of {cpi} clock cycles per instruction on a {ghz} GHz processor. How many seconds of CPU time does it take, to two decimal places?", ic * cpi / ghz, [ic / ghz, ic * cpi * ghz, ic * ghz / cpi]),
        (f"A cache has a hit ratio of {h}%. A cache access takes {tc} ns; on a miss, main memory is accessed instead and takes {tm} ns. What is the average access time in ns?", (h * tc + (100 - h) * tm) / 100, [(tc + tm) / 2, (h * tm + (100 - h) * tc) / 100, tc]),
        (f"{p}% of a program's run time can be made {s} times faster; the rest is unchanged. What is the overall speed-up, to two decimal places?", round(1 / ((100 - p) / 100 + p / 100 / s), 2), [float(s), round(p / 100 * s, 2), round(1 / ((100 - p) / 100), 2)]),
        (f"What is the clock period, in nanoseconds, of a {f} MHz clock?", 1000 / f, [float(f), f / 1000, 1_000_000 / f]),
        (f"How many different operations can a {op}-bit opcode field encode?", 2 ** op, [2 * op, op * op if op * op != 2 ** op else op + 5, 2 ** op - 1]),
        (f"A 16-bit instruction has a {op}-bit opcode; the remaining bits hold a memory address. How many locations can that address reach?", 2 ** (16 - op), [2 ** op, 16 - op, 2 ** 16]),
        (f"A {f} MHz processor averages {cpi} clock cycles per instruction. How many million instructions per second (MIPS) does it execute?", f / cpi, [f * cpi, float(f), cpi / f * 1000]),
    ], "n address lines reach 2^n locations. CPU time = instructions × cycles per instruction ÷ clock rate. Average access time = hit ratio × cache time + miss ratio × memory time. Amdahl's law: speed-up = 1 / ((1 - p) + p / s).")


facts(bank, LG, "Hardware and software", 1, [
    [("The ALU", "The part of the CPU that performs arithmetic and logical operations."),
     ("The control unit", "The part of the CPU that decodes instructions and directs the other components."),
     ("A register", "A very small, very fast storage location inside the CPU."),
     ("The program counter", "The register that holds the address of the next instruction to fetch."),
     ("The instruction register", "The register that holds the instruction currently being decoded and executed."),
     ("Cache memory", "Small, fast memory between the CPU and RAM that holds recently used data."),
     ("RAM", "Volatile main memory that holds running programs and their data."),
     ("ROM", "Non-volatile memory whose contents survive without power and normally hold start-up code."),
     ("Secondary storage", "Non-volatile storage, such as an SSD or hard disk, that keeps data when the power is off."),
     ("A bus", "A set of wires that carries data, addresses or control signals between components."),
     ("Virtual memory", "Using disk space to extend RAM so programs can use more memory than is physically installed."),
     ("The fetch-decode-execute cycle", "The repeating sequence in which the CPU gets an instruction, works out what it means and carries it out.")],
    [("An operating system", "Software that manages hardware resources and provides services to application programs."),
     ("A compiler", "A program that translates a whole source program into machine code before it runs."),
     ("An interpreter", "A program that translates and executes source code one statement at a time."),
     ("An assembler", "A program that translates assembly language into machine code."),
     ("A device driver", "Software that lets the operating system communicate with a particular hardware device."),
     ("Firmware", "Software stored permanently in a hardware device to control it."),
     ("The kernel", "The core of the operating system, which runs with full access to the hardware."),
     ("An application program", "Software that performs a task for the user, such as a word processor."),
     ("A linker", "A program that combines compiled modules and libraries into one executable."),
     ("A loader", "The part of the operating system that copies a program into memory and starts it."),
     ("Machine code", "Binary instructions that the CPU executes directly."),
     ("Assembly language", "A low-level language that uses short mnemonics for machine instructions.")],
])


# ───────────────────────── Algorithms and data structures ─────────────────────────

SQ_ = "Stacks and queues"


@t(AL, SQ_, 1)
def _(r):
    vals, plan, size = uniq(r, 7, 1, 30), [], 0
    for _ in range(r.randint(5, 7)):
        if size and r.random() < 0.4:
            plan.append(None)
            size -= 1
        else:
            plan.append(vals.pop())
            size += 1
    def run(kind):
        st, out = [], []
        for v in plan:
            if v is None:
                out.append(st.pop() if kind == "stack" else st.pop(0))
            else:
                st.append(v)
        return st, out
    (st, sout), (qu, qout) = run("stack"), run("queue")
    if not sout or not st:
        return None
    sops = seq("pop()" if v is None else f"push({v})" for v in plan)
    qops = seq("dequeue()" if v is None else f"enqueue({v})" for v in plan)
    return ask(r, [
        (f"An empty stack receives these operations in order:\n\n{sops}\n\nWhich values do the pop operations return, in order?", seq(sout), [seq(qout), seq(sout[::-1]), seq(sorted(sout)), seq(st)]),
        (f"An empty stack receives these operations in order:\n\n{sops}\n\nWhat does the stack contain afterwards, from bottom to top?", seq(st), [seq(qu), seq(st[::-1]), seq(sout), seq(sorted(st))]),
        (f"An empty queue receives these operations in order:\n\n{qops}\n\nWhich values do the dequeue operations return, in order?", seq(qout), [seq(sout), seq(qout[::-1]), seq(sorted(qout, reverse=True)), seq(qu)]),
        (f"An empty queue receives these operations in order:\n\n{qops}\n\nWhat does the queue contain afterwards, from front to rear?", seq(qu), [seq(st), seq(qu[::-1]), seq(qout), seq(sorted(qu, reverse=True))]),
        (f"An empty stack receives these operations in order:\n\n{sops}\n\nWhich value is on top afterwards?", st[-1], [st[0], sout[-1], qout[0]]),
        (f"An empty queue receives these operations in order:\n\n{qops}\n\nHow many items does it hold afterwards?", len(qu), [len(plan), len(qout), len(qu) + len(qout)]),
    ], "A stack is last in, first out: pop removes the most recently pushed item. A queue is first in, first out: dequeue removes the item that has waited longest.")


@t(AL, SQ_, 2)
def _(r):
    a, b, c, d = uniq(r, 4, 2, 9)
    o1, o2, o3 = (r.choice("+-*") for _ in range(3))
    ev = lambda x, o, y: x + y if o == "+" else x - y if o == "-" else x * y
    sym = lambda o: "×" if o == "*" else "−" if o == "-" else o
    s = r.choice(["()()", "(())", "(()", "())(", "((()))", "()(()", "(()())", ")(", "(()))(", "((())"])
    depth, best, ok = 0, 0, True
    for ch in s:
        depth += 1 if ch == "(" else -1
        ok, best = ok and depth >= 0, max(best, depth)
    ok = ok and depth == 0
    return ask(r, [
        (f"What is the value of the postfix expression  {a} {b} {sym(o1)} {c} {sym(o2)} ?", ev(ev(a, o1, b), o2, c), [ev(a, o1, ev(b, o2, c)), ev(ev(b, o1, a), o2, c), ev(ev(a, o2, b), o1, c)]),
        (f"What is the value of the postfix expression  {a} {b} {c} {sym(o1)} {sym(o2)} ?", ev(a, o2, ev(b, o1, c)), [ev(ev(a, o1, b), o2, c), ev(a, o1, ev(b, o2, c)), ev(ev(b, o1, c), o2, a)]),
        (f"What is the value of the postfix expression  {a} {b} {sym(o1)} {c} {d} {sym(o2)} {sym(o3)} ?", ev(ev(a, o1, b), o3, ev(c, o2, d)), [ev(ev(ev(a, o1, b), o2, c), o3, d), ev(ev(a, o1, b), o2, ev(c, o3, d)), ev(a, o1, ev(b, o3, ev(c, o2, d)))]),
        (f"Which postfix expression is equivalent to the infix expression  ({a} {sym(o1)} {b}) {sym(o2)} {c} ?", f"{a} {b} {sym(o1)} {c} {sym(o2)}", [f"{a} {b} {c} {sym(o1)} {sym(o2)}", f"{sym(o2)} {sym(o1)} {a} {b} {c}", f"{a} {sym(o1)} {b} {c} {sym(o2)}", f"{a} {b} {sym(o2)} {c} {sym(o1)}"]),
        (f"The string {s} is checked with a stack: push on '(' and pop on ')'. Is it balanced, and what is the largest stack size reached (stop at the first failed pop)?",
         f"{'Balanced' if ok else 'Not balanced'}; largest size {best}", [f"{'Not balanced' if ok else 'Balanced'}; largest size {best}", f"{'Balanced' if ok else 'Not balanced'}; largest size {best + 1}", f"{'Not balanced' if ok else 'Balanced'}; largest size {max(best - 1, 0)}", f"{'Balanced' if ok else 'Not balanced'}; largest size {len(s)}"]),
    ], "To evaluate postfix, push operands; on an operator pop the top two values, apply it (second-popped on the left) and push the result. Brackets are balanced when every pop finds a matching push and the stack ends empty.")


SRCH = "Searching"


def bsearch(a, x):
    lo, hi, seen = 0, len(a) - 1, []
    while lo <= hi:
        mid = (lo + hi) // 2
        seen.append(a[mid])
        if a[mid] == x:
            break
        lo, hi = (mid + 1, hi) if a[mid] < x else (lo, mid - 1)
    return seen


assert bsearch([1, 3, 5, 7, 9, 11, 13], 11) == [7, 11] and len(bsearch([1, 3, 5, 7, 9, 11, 13], 4)) == 3


@t(AL, SRCH, 1)
def _(r):
    a = uniq(r, r.randint(6, 9), 1, 60)
    x, miss = r.choice(a), 99
    i = a.index(x)
    return ask(r, [
        (f"A linear search looks for {x} in the list {seq(a)}, starting from the left. How many items does it compare before it stops?", i + 1, [i, len(a), i + 2]),
        (f"A linear search looks for {miss} in the list {seq(a)}. How many items does it compare before it gives up?", len(a), [len(a) - 1, len(a) + 1, len(a) // 2]),
        (f"A list has {len(a) * 100} items. In the worst case, how many comparisons does a linear search make?", len(a) * 100, [len(a) * 50, math.ceil(math.log2(len(a) * 100)), len(a) * 100 - 1]),
        (f"A list has {len(a) * 100} items and the target is equally likely to be anywhere in it. About how many comparisons does a linear search make on average?", len(a) * 50, [len(a) * 100, math.ceil(math.log2(len(a) * 100)), len(a) * 25]),
    ], "Linear search checks items one by one. It stops as soon as it finds the target, so the count is the target's position; if the target is missing, every item is compared.")


@t(AL, SRCH, 2)
def _(r):
    a = sorted(uniq(r, r.choice([7, 9, 11, 13, 15]), 1, 99))
    x = r.choice(a)
    miss = next(v for v in range(x + 1, 200) if v not in a)
    seen, n = bsearch(a, x), r.choice([100, 500, 1000, 5000, 10 ** 4, 10 ** 5, 10 ** 6]) + r.randint(0, 99)
    base = f"A binary search (middle index = (low + high) // 2) runs on the sorted list {seq(a)}."
    return ask(r, [
        (f"{base} It looks for {x}. How many items does it compare, including the match?", len(seen), [a.index(x) + 1 if a.index(x) + 1 != len(seen) else len(seen) + 2, len(a) // 2 if len(a) // 2 != len(seen) else len(seen) + 3, len(seen) + 1]),
        (f"{base} It looks for {x}. Which items does it examine, in order?", seq(seen), [seq(a[:a.index(x) + 1][-3:]), seq(seen[::-1]) if len(seen) > 1 else seq([a[0], x]), seq([a[len(a) // 2]] + seen), seq(seen + [a[-1]]), seq(a[:len(seen)])]),
        (f"{base} It looks for {miss}, which is not in the list. How many items does it compare before it stops?", len(bsearch(a, miss)), [len(a), len(bsearch(a, miss)) + 1, len(bsearch(a, miss)) - 1 or 5]),
        (f"What is the largest number of comparisons a binary search needs on a sorted list of {n} items?", math.floor(math.log2(n)) + 1, [n // 2, n, math.floor(math.log2(n)) - 1]),
        (f"{base} Which item does it examine first?", a[(len(a) - 1) // 2], [a[0], a[-1], a[(len(a) - 1) // 2 + 1], a[(len(a) - 1) // 2 - 1]]),
    ], "Binary search compares the target with the middle item and discards the half that cannot contain it, so a list of n items needs at most floor(log2 n) + 1 comparisons. It only works on sorted data.")


def bubble(a, k):
    a = a[:]
    for p in range(k):
        for i in range(len(a) - 1 - p):
            if a[i] > a[i + 1]:
                a[i], a[i + 1] = a[i + 1], a[i]
    return a


def selection(a, k):
    a = a[:]
    for p in range(k):
        m = min(range(p, len(a)), key=a.__getitem__)
        a[p], a[m] = a[m], a[p]
    return a


def insertion(a, k):
    return sorted(a[:k + 1]) + a[k + 1:]


assert bubble([5, 1, 4, 2, 8], 1) == [1, 4, 2, 5, 8] and selection([5, 1, 4, 2, 8], 1) == [1, 5, 4, 2, 8] and insertion([5, 1, 4, 2, 8], 2) == [1, 4, 5, 2, 8]


@t(AL, "Sorting", 2)
def _(r):
    a = uniq(r, r.randint(5, 6), 1, 40)
    k, n = r.randint(1, 3), r.randint(4, 60)
    inv = sum(a[i] > a[j] for i in range(len(a)) for j in range(i + 1, len(a)))
    x, y = sorted(uniq(r, 3, 1, 30)), sorted(uniq(r, 3, 1, 30))
    others = lambda f: [seq(h(a, k)) for h in (bubble, selection, insertion) if h is not f] + [seq(f(a, k + 1)), seq(sorted(a)), seq(f(a, k - 1) if k > 1 else a[::-1])]
    return ask(r, [
        (f"Bubble sort (ascending, each pass sweeping left to right) is applied to {seq(a)}. What is the list after {k} pass(es)?", seq(bubble(a, k)), others(bubble)),
        (f"Selection sort (ascending, each pass moving the smallest remaining item to the front by one swap) is applied to {seq(a)}. What is the list after {k} pass(es)?", seq(selection(a, k)), others(selection)),
        (f"Insertion sort (ascending) is applied to {seq(a)}. What is the list after {k} item(s) have been inserted into the sorted part on the left?", seq(insertion(a, k)), others(insertion)),
        (f"Bubble sort puts {seq(a)} into ascending order. How many swaps does it make in total?", inv, [len(a) - 1, len(a) * (len(a) - 1) // 2 if len(a) * (len(a) - 1) // 2 != inv else inv + 3, inv + 1]),
        (f"Bubble sort without an early exit sorts {n} items. How many comparisons does it make?", n * (n - 1) // 2, [n * n, n - 1, n * (n + 1) // 2]),
        (f"After the first pass of an ascending bubble sort on {seq(a)}, which value is guaranteed to be in its final position?", max(a), [min(a), a[0], a[-1] if a[-1] != max(a) else a[1]]),
        (f"The sorted lists {seq(x)} and {seq(y)} are merged into one sorted list. What are the first four items?", seq(sorted(x + y)[:4]), [seq((x + y)[:4]), seq(sorted(x + y)[-4:]), seq(x + y[:1]), seq(sorted(x + y, reverse=True)[:4])]),
        (f"Selection sort sorts {n} items. How many swaps does it make at most?", n - 1, [n * (n - 1) // 2, n, n * n]),
    ], "Bubble sort swaps adjacent items that are out of order, so each pass moves the largest remaining item to the end; its total swaps equal the number of out-of-order pairs. Selection sort makes one swap per pass. Insertion sort grows a sorted section at the left.")


CPX = "Complexity and loop counting"
LOOPS = [
    ("for i = 1 to n:\n    for j = 1 to n:\n        count = count + 1", lambda n: n * n, "O(n²)"),
    ("for i = 1 to n:\n    for j = i to n:\n        count = count + 1", lambda n: n * (n + 1) // 2, "O(n²)"),
    ("for i = 1 to n:\n    for j = 1 to i - 1:\n        count = count + 1", lambda n: n * (n - 1) // 2, "O(n²)"),
    ("i = 1\nwhile i < n:\n    i = i * 2\n    count = count + 1", lambda n: math.ceil(math.log2(n)), "O(log n)"),
    ("i = n\nwhile i > 0:\n    i = i div 2\n    count = count + 1", lambda n: math.floor(math.log2(n)) + 1, "O(log n)"),
    ("for i = 1 to n:\n    count = count + 1\nfor j = 1 to n:\n    count = count + 1", lambda n: 2 * n, "O(n)"),
    ("for i = 1 to n:\n    j = 1\n    while j < n:\n        j = j * 2\n        count = count + 1", lambda n: n * math.ceil(math.log2(n)), "O(n log n)"),
    ("for i = 1 to n:\n    for j = 1 to 3:\n        count = count + 1", lambda n: 3 * n, "O(n)"),
    ("for i = 1 to n:\n    for j = 1 to n:\n        for k = 1 to n:\n            count = count + 1", lambda n: n ** 3, "O(n³)"),
    ("for i = 1 to 10:\n    count = count + 1", lambda n: 10, "O(1)"),
]
BIGO = ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(n³)"]


@t(AL, CPX, 2)
def _(r):
    code, f, o = r.choice(LOOPS)
    n = r.choice([8, 10, 16, 20, 32, 50, 64, 100]) + r.choice([0, 0, 1, 3])
    why = "Count how often the innermost statement runs: nested loops multiply, loops one after another add, and a loop that doubles or halves its variable runs about log2 n times."
    if r.random() < 0.12:
        i = BIGO.index(o)
        return Q(f"count starts at 0.\n\n{code}\n\nHow does the running time grow with n?", o, [BIGO[j] for j in (i - 1, i + 1, i - 2, i + 2, i + 3) if 0 <= j < len(BIGO)], why)
    return nq(f"count starts at 0 and n = {n}.\n\n{code}\n\nWhat is the value of count at the end?", f(n), [n * n if f(n) != n * n else n * (n + 1) // 2, n, 2 * n if f(n) != 2 * n else n + 2, n * (n - 1) // 2], why)


@t(AL, CPX, 3)
def _(r):
    tms, n, k = r.choice([2, 3, 5, 8, 10, 40]), r.choice([100, 500, 1000, 2000]), r.choice([2, 3, 4, 10])
    name, mult = r.choice([("O(n)", k), ("O(n²)", k * k), ("O(n³)", k ** 3)])
    steps = r.randint(10, 30)
    return ask(r, [
        (f"An algorithm that runs in {name} time takes {tms} ms for n = {n}. About how long does it take for n = {k * n}?", tms * mult, [tms * k if mult != k else tms * k * k, tms + k, tms * k ** 3 if mult != k ** 3 else tms * k * k]),
        (f"A binary search needs at most {steps} comparisons on a list of n items. About how many does it need when the list is twice as long?", steps + 1, [2 * steps, steps * steps, steps]),
        (f"An O(2^n) algorithm takes {tms} seconds for n = {steps}. About how long does it take for n = {steps + k}?", tms * 2 ** k, [tms * k, tms + k, tms * k * k if tms * k * k != tms * 2 ** k else tms * 3]),
        (f"An O(n) algorithm takes {tms} ms for n = {n}. For which n does it take about {tms * k} ms?", n * k, [n + k, n * k * k, n ** 2]),
        (f"An O(n²) algorithm takes {tms} ms for n = {n}. For which n does it take about {tms * k * k} ms?", n * k, [n * k * k, n + k, n * 2 if k != 2 else n * 3]),
    ], "Scale the running time by how the growth function scales: multiplying n by k multiplies O(n) time by k, O(n²) by k² and O(n³) by k³. Doubling n adds one step to O(log n), and adding 1 to n doubles O(2^n).", unit="")


REC = "Recursion and tracing"


@t(AL, REC, 2)
def _(r):
    n, a, b = r.randint(3, 9), r.randint(12, 99), r.randint(4, 40)
    fib = lambda k: k if k < 2 else fib(k - 1) + fib(k - 2)
    calls = lambda k: 1 if k < 2 else 1 + calls(k - 1) + calls(k - 2)
    def gsteps(x, y, c=0):
        return c if y == 0 else gsteps(y, x % y, c + 1)
    x0, k = r.randint(1, 5), r.randint(2, 5)
    return ask(r, [
        (f"f(0) = 1 and f(n) = n × f(n − 1). What is f({n % 7 + 2})?", math.factorial(n % 7 + 2), [sum(range(n % 7 + 3)), (n % 7 + 2) ** 2, math.factorial(n % 7 + 1)]),
        (f"f(0) = 0, f(1) = 1 and f(n) = f(n − 1) + f(n − 2). What is f({n + 2})?", fib(n + 2), [fib(n + 1), fib(n + 3), 2 * (n + 2)]),
        (f"f(0) = 0, f(1) = 1 and f(n) = f(n − 1) + f(n − 2), written as a plain recursive function. How many times is f called in total to compute f({n % 6 + 2})?", calls(n % 6 + 2), [fib(n % 6 + 2), n % 6 + 3, 2 ** (n % 6 + 2)]),
        (f"gcd(a, 0) = a and gcd(a, b) = gcd(b, a mod b). What is gcd({a}, {b})?", math.gcd(a, b), [min(a, b) if min(a, b) != math.gcd(a, b) else 1, a % b or 2, a * b // math.gcd(a, b)]),
        (f"gcd(a, 0) = a and gcd(a, b) = gcd(b, a mod b). How many recursive calls does gcd({a}, {b}) make in total, not counting the first call?", gsteps(a, b), [gsteps(a, b) + 1, a // b, math.gcd(a, b) if math.gcd(a, b) != gsteps(a, b) else gsteps(a, b) + 3]),
        (f"f(0) = 0 and f(n) = n + f(n − 1). What is f({n * 3})?", n * 3 * (n * 3 + 1) // 2, [n * 3, (n * 3) ** 2, n * 3 * (n * 3 - 1) // 2]),
        (f"f(0) = 0 and f(n) = 2 × f(n − 1) + 1. What is f({n})?", 2 ** n - 1, [2 ** n, 2 * n + 1, 2 ** (n - 1)]),
        (f"x starts at {x0}. The statement  x = x × 2 + 1  is executed {k} times. What is x afterwards?", (x0 + 1) * 2 ** k - 1, [x0 * 2 ** k, x0 * 2 * k + 1, (x0 + 1) * 2 ** k]),
        (f"s(n) returns 0 when n = 0 and otherwise returns (n mod 10) + s(n div 10). What is s({a * 37 + b})?", sum(map(int, str(a * 37 + b))), [len(str(a * 37 + b)), (a * 37 + b) % 10, sum(map(int, str(a * 37 + b))) + 9]),
    ], "Trace a recursive definition from the base case upwards, or unfold the call until the base case is reached. Plain recursive Fibonacci recomputes the same values many times, so its call count grows much faster than its result.")


TG = "Trees and graphs"


def bst(keys):
    root, tree = keys[0], {keys[0]: [None, None]}
    for k in keys[1:]:
        cur = root
        while True:
            side = 0 if k < cur else 1
            if tree[cur][side] is None:
                tree[cur][side], tree[k] = k, [None, None]
                break
            cur = tree[cur][side]
    return root, tree


def walk(tree, n, order):
    if n is None:
        return []
    L, R = walk(tree, tree[n][0], order), walk(tree, tree[n][1], order)
    return {"in": L + [n] + R, "pre": [n] + L + R, "post": L + R + [n]}[order]


def height(tree, n):
    return -1 if n is None else 1 + max(height(tree, tree[n][0]), height(tree, tree[n][1]))


_root, _tree = bst([50, 30, 70, 20, 40])
assert walk(_tree, _root, "pre") == [50, 30, 20, 40, 70] and walk(_tree, _root, "post") == [20, 40, 30, 70, 50] and height(_tree, _root) == 2


@t(AL, TG, 2)
def _(r):
    keys = uniq(r, r.randint(5, 7), 1, 99)
    root, tree = bst(keys)
    order = {o: seq(walk(tree, root, o)) for o in ("in", "pre", "post")}
    level, queue = [], deque([root])
    while queue:
        n = queue.popleft()
        level.append(n)
        queue.extend(c for c in tree[n] if c is not None)
    leaves = sorted(n for n, c in tree.items() if c == [None, None])
    base = f"The keys {seq(keys)} are inserted, in that order, into an empty binary search tree."
    extra = [seq(level), seq(keys), seq(sorted(keys, reverse=True))]
    return ask(r, [
        (f"{base} What is the in-order traversal?", order["in"], [order["pre"], order["post"]] + extra),
        (f"{base} What is the pre-order traversal?", order["pre"], [order["in"], order["post"], seq(level)] + extra[2:]),
        (f"{base} What is the post-order traversal?", order["post"], [order["in"], order["pre"]] + extra),
        (f"{base} What is the level-order (breadth-first) traversal?", seq(level), [order["pre"], order["in"], order["post"]] + extra[2:]),
        (f"{base} What is the height of the tree, counted in edges on the longest path from the root to a leaf?", height(tree, root), [len(keys) - 1 if len(keys) - 1 != height(tree, root) else 1, height(tree, root) + 1, len(leaves) if len(leaves) != height(tree, root) else 0]),
        (f"{base} Which keys are leaves?", seq(leaves), [seq(sorted(n for n in tree if n not in leaves)), seq(sorted(keys)[:len(leaves)]), seq(sorted(keys)[-len(leaves):]), seq(sorted(leaves + [root]))]),
        (f"{base} How many keys are in the left subtree of the root?", sum(k < root for k in keys), [sum(k > root for k in keys), 1 if sum(k < root for k in keys) != 1 else 0, len(keys) - 1]),
    ], "In a binary search tree smaller keys go left and larger keys go right. In-order visits left, node, right (giving sorted order); pre-order visits the node first; post-order visits it last; level-order goes row by row.")


@t(AL, TG, 2)
def _(r):
    h, n, i = r.randint(2, 12), r.randint(4, 500), r.randint(1, 40)
    return ask(r, [
        (f"What is the largest number of nodes a binary tree of height {h} can have (a single node has height 0)?", 2 ** (h + 1) - 1, [2 ** h, 2 ** (h + 1), 2 * h + 1]),
        (f"How many nodes are on level {h} of a full binary tree, if the root is level 0?", 2 ** h, [2 * h, 2 ** h - 1, 2 ** (h + 1)]),
        (f"What is the smallest possible height of a binary tree with {n} nodes (a single node has height 0)?", math.floor(math.log2(n)), [n - 1, math.floor(math.log2(n)) + 2, n // 2]),
        (f"A tree has {n} nodes. How many edges does it have?", n - 1, [n, n + 1, 2 * n]),
        (f"How many edges does a complete undirected graph on {h + 2} vertices have?", (h + 2) * (h + 1) // 2, [(h + 2) * (h + 1), h + 1, (h + 2) ** 2]),
        (f"An undirected graph has {n} edges. What is the sum of the degrees of all its vertices?", 2 * n, [n, n + 1, n * n]),
        (f"A binary heap is stored in an array starting at index 0. At which index is the parent of the node at index {i}?", (i - 1) // 2, [i // 2 if i // 2 != (i - 1) // 2 else i - 1, 2 * i + 1, i - 2 if i > 2 else 5]),
        (f"A binary heap is stored in an array starting at index 0. At which index is the left child of the node at index {i}?", 2 * i + 1, [2 * i, 2 * i + 2, (i - 1) // 2]),
        (f"What is the largest possible height of a binary tree with {n} nodes (a single node has height 0)?", n - 1, [math.floor(math.log2(n)), n, n // 2]),
    ], "A binary tree of height h has at most 2^(h+1) - 1 nodes and level k holds at most 2^k. Any tree with n nodes has n - 1 edges. In a 0-based heap array the children of index i are 2i + 1 and 2i + 2, and its parent is (i - 1) // 2.")


@t(AL, TG, 3)
def _(r):
    n = r.randint(5, 6)
    names = "ABCDEF"[:n]
    edges = {tuple(sorted((names[i], names[r.randrange(i)]))) for i in range(1, n)}
    while len(edges) < n + r.randint(0, 1):
        edges.add(tuple(sorted(r.sample(names, 2))))
    adj = {v: sorted({b if a == v else a for a, b in edges if v in (a, b)}) for v in names}
    bfs, queue = ["A"], deque("A")
    while queue:
        for w in adj[queue.popleft()]:
            if w not in bfs:
                bfs.append(w)
                queue.append(w)
    dfs = []
    def go(v):
        dfs.append(v)
        for w in adj[v]:
            if w not in dfs:
                go(w)
    go("A")
    if bfs == dfs:
        return None
    listing = "\n".join(f"{v}: {seq(adj[v])}" for v in names)
    kind = r.choice(["breadth-first", "depth-first"])
    ans, other = (bfs, dfs) if kind == "breadth-first" else (dfs, bfs)
    return Q(f"An undirected graph has this adjacency list:\n\n{listing}\n\nA {kind} traversal starts at A and always takes neighbours in alphabetical order. In what order are the vertices visited?", seq(ans),
             [seq(other), seq(names), seq(ans[:1] + ans[1:][::-1]), seq(other[:1] + other[1:][::-1])],
             "Breadth-first search visits all neighbours of a vertex before going deeper (it uses a queue). Depth-first search follows one path as far as it can and then backtracks (it uses a stack or recursion).")


ARR = "Arrays and linked lists"


@t(AL, ARR, 2)
def _(r):
    base, size, rows, cols = r.choice([100, 1000, 2000, 5000]), r.choice([2, 4, 8]), r.randint(3, 9), r.randint(3, 9)
    i, j, n = r.randint(1, rows - 1), r.randint(1, cols - 1), r.randint(5, 200)
    vals = uniq(r, 5, 1, 40)
    lst = [vals[0]]
    steps = [f"start with the list {vals[0]}"]
    for v in vals[1:]:
        op = r.choice(["head", "tail", "pop"]) if len(lst) > 1 else r.choice(["head", "tail"])
        if op == "head":
            lst.insert(0, v)
            steps.append(f"insert {v} at the head")
        elif op == "tail":
            lst.append(v)
            steps.append(f"insert {v} at the tail")
        else:
            lst.pop(0)
            steps.append("delete the head")
    return ask(r, [
        (f"A 1-D array starts at address {base} and each element takes {size} bytes. Indexing starts at 0. What is the address of element [{n}]?", base + n * size, [base + n, base + (n + 1) * size, base + (n - 1) * size]),
        (f"A 2-D array with {rows} rows and {cols} columns is stored in row-major order from address {base}; each element takes {size} bytes and indexing starts at 0. What is the address of element [{i}][{j}]?", base + (i * cols + j) * size, [base + (j * rows + i) * size if (j * rows + i) != (i * cols + j) else base + (i * cols + j + 1) * size, base + (i + j) * size, base + (i * cols + j)]),
        (f"A 2-D array with {rows} rows and {cols} columns is stored in column-major order from address {base}; each element takes {size} bytes and indexing starts at 0. What is the address of element [{i}][{j}]?", base + (j * rows + i) * size, [base + (i * cols + j) * size if (j * rows + i) != (i * cols + j) else base + (j * rows + i + 1) * size, base + (i + j) * size, base + (j * rows + i)]),
        (f"An array has {rows} rows and {cols} columns of {size}-byte elements. How many bytes does it occupy?", rows * cols * size, [rows * cols, (rows + cols) * size, rows * cols * size * 8]),
        ("A singly linked list is changed as follows: " + "; ".join(steps) + ". What is the list afterwards, from head to tail?", seq(lst), [seq(lst[::-1]), seq(sorted(lst)), seq(vals[:len(lst)]), seq(lst[1:] + lst[:1])]),
        (f"An array of {n} elements is indexed from 0. What is the index of its last element?", n - 1, [n, n + 1, n // 2]),
    ], "The address of an array element is base + index × element size. In row-major order the index of [i][j] is i × columns + j; in column-major order it is j × rows + i.")


facts(bank, AL, "Data structures and algorithms", 1, [
    [("A stack", "A collection in which the last item added is the first one removed (LIFO)."),
     ("A queue", "A collection in which the first item added is the first one removed (FIFO)."),
     ("A linked list", "A sequence of nodes in which each node stores a value and a reference to the next node."),
     ("An array", "A block of same-type elements stored next to each other and reached directly by index."),
     ("A binary search tree", "A binary tree in which every left descendant is smaller than its node and every right descendant is larger."),
     ("A hash table", "A structure that applies a function to the key to compute where its value is stored."),
     ("A heap", "A complete binary tree in which every parent is ordered before its children, used for priority queues."),
     ("A graph", "A set of vertices connected by edges."),
     ("Recursion", "A function solving a problem by calling itself on a smaller version of the same problem.")],
    [("Binary search", "Repeatedly halving a sorted list to find an item in O(log n) comparisons."),
     ("Linear search", "Checking every item in turn, which takes O(n) comparisons in the worst case."),
     ("Bubble sort", "Repeatedly swapping adjacent items that are out of order; O(n²) comparisons."),
     ("Merge sort", "Splitting the list in half, sorting each half and merging them; O(n log n) in every case."),
     ("Quicksort", "Partitioning the list around a pivot and sorting each side; O(n log n) on average, O(n²) in the worst case."),
     ("Insertion sort", "Building a sorted section by inserting each new item into its correct place in it."),
     ("Selection sort", "Repeatedly picking the smallest remaining item and moving it to the front."),
     ("Breadth-first search", "Visiting a graph level by level from the start vertex, using a queue."),
     ("Depth-first search", "Following one path as far as possible before backtracking, using a stack or recursion.")],
])


# ───────────────────────── Operating systems and networks ─────────────────────────

def fcfs(b):
    return [sum(b[:i]) for i in range(len(b))]


def sjf(b):
    wait, tm = [0] * len(b), 0
    for i in sorted(range(len(b)), key=lambda i: (b[i], i)):
        wait[i], tm = tm, tm + b[i]
    return wait


def rr(b, q):
    rem, tm, done, queue = list(b), 0, [0] * len(b), deque(range(len(b)))
    while queue:
        i = queue.popleft()
        run = min(q, rem[i])
        tm, rem[i] = tm + run, rem[i] - run
        if rem[i]:
            queue.append(i)
        else:
            done[i] = tm
    return [done[i] - b[i] for i in range(len(b))]


def faults(refs, frames, algo):
    mem, count = [], 0
    for i, p in enumerate(refs):
        if p in mem:
            if algo == "LRU":
                mem.remove(p)
                mem.append(p)
            continue
        count += 1
        if len(mem) == frames:
            future = refs[i + 1:]
            mem.remove(max(mem, key=lambda x: future.index(x) if x in future else 10 ** 9) if algo == "OPT" else mem[0])
        mem.append(p)
    return count


# the simulators, checked against the standard textbook examples
assert sum(fcfs([24, 3, 3])) / 3 == 17 and sum(sjf([6, 8, 7, 3])) / 4 == 7 and rr([24, 3, 3], 4) == [6, 4, 7]
_refs = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1]
assert (faults(_refs, 3, "FIFO"), faults(_refs, 3, "LRU"), faults(_refs, 3, "OPT")) == (15, 12, 9)


@t(OS, "CPU scheduling", 3)
def _(r):
    b = ints(r, r.randint(3, 4), 1, 12)
    q, i = r.randint(2, 4), 0
    i = r.randrange(len(b))
    base = "Processes " + ", ".join(f"P{k + 1}" for k in range(len(b))) + f" arrive at time 0 in that order with CPU bursts of {seq(b)} ms."
    avg = lambda w: round(sum(w) / len(w), 2)
    wf, ws, wr = fcfs(b), sjf(b), rr(b, q)
    return ask(r, [
        (f"{base} What is the average waiting time under first-come, first-served?", avg(wf), [avg(ws), avg(wr), avg([w + x for w, x in zip(wf, b)])]),
        (f"{base} What is the average waiting time under non-preemptive shortest-job-first?", avg(ws), [avg(wf), avg(wr), avg([w + x for w, x in zip(ws, b)])]),
        (f"{base} What is the average waiting time under round robin with a time quantum of {q} ms?", avg(wr), [avg(wf), avg(ws), avg([w + x for w, x in zip(wr, b)])]),
        (f"{base} What is the average turnaround time under first-come, first-served?", avg([w + x for w, x in zip(wf, b)]), [avg(wf), avg([w + x for w, x in zip(ws, b)]), float(sum(b))]),
        (f"{base} How long does P{i + 1} wait under round robin with a time quantum of {q} ms?", wr[i], [wf[i], ws[i], wr[i] + b[i]]),
        (f"{base} At what time does P{i + 1} finish under non-preemptive shortest-job-first?", ws[i] + b[i], [wf[i] + b[i], ws[i], sum(b)]),
        (f"{base} How long does P{i + 1} wait under first-come, first-served?", wf[i], [ws[i], wf[i] + b[i], wr[i]]),
    ], "Waiting time is the time a process spends ready but not running; turnaround time is waiting time plus its burst. FCFS runs in arrival order, SJF runs the shortest burst first, and round robin gives each process one quantum in turn.", unit=" ms")


MEM = "Memory management"


@t(OS, MEM, 3)
def _(r):
    refs, frames = ints(r, r.randint(8, 11), 0, 5), r.randint(2, 4)
    algo = r.choice(["FIFO", "LRU", "OPT"])
    full = {"FIFO": "first-in, first-out", "LRU": "least recently used", "OPT": "optimal"}
    res = {a: faults(refs, frames, a) for a in full}
    return nq(f"A process references pages in this order: {seq(refs)}\n\nIt has {frames} frames, all empty at the start. How many page faults occur with {full[algo]} ({algo}) replacement?", res[algo],
              [v for a, v in res.items() if a != algo] + [len(set(refs)), len(refs)],
              "Every reference to a page that is not in a frame is a fault, including the first ones that fill the empty frames. FIFO evicts the page loaded earliest, LRU the page unused for longest, and optimal the page not needed for the longest time ahead.")


@t(OS, MEM, 2)
def _(r):
    k, v = r.choice([10, 11, 12, 13]), r.choice([16, 20, 24, 32])
    size = 2 ** k
    addr, frame, proc, page = r.randint(size, 20 * size), r.randint(2, 60), r.randint(50, 900), r.choice([4, 8, 16])
    holes = uniq(r, r.randint(4, 5), 50, 600)
    req = r.randint(40, max(holes) - 10)
    fits = [h for h in holes if h >= req]
    first, best, worst = fits[0], min(fits), max(fits)
    pages = -(-proc // page)
    return ask(r, [
        (f"The page size is {size} bytes. Which page number does the logical address {addr} fall in?", addr // size, [addr % size, addr // size + 1, addr // 1000]),
        (f"The page size is {size} bytes. What is the offset of the logical address {addr} within its page?", addr % size, [addr // size, addr % 1000, size - addr % size]),
        (f"The page size is {size} bytes. How many bits of an address are used for the offset?", k, [size, k - 1, k + 2]),
        (f"A system has {v}-bit virtual addresses and a page size of {size} bytes. How many pages are in the virtual address space?", 2 ** (v - k), [2 ** v, 2 ** k, v - k]),
        (f"The page size is {size} bytes. Logical address {addr} is in a page that is loaded in frame {frame}. What is the physical address?", frame * size + addr % size, [frame * size, frame + addr % size, frame * size + addr]),
        (f"A process needs {proc} KB and the page size is {page} KB. How many pages does it use?", pages, [proc // page if proc % page else pages + 1, proc * page, pages + 2]),
        (f"A process needs {proc} KB and the page size is {page} KB. How much internal fragmentation is there, in KB?", pages * page - proc, [proc % page if proc % page != pages * page - proc else page, page, proc // page]),
        (f"Free memory holes, in address order, are {seq(holes)} KB. A request for {req} KB arrives. Which hole does first fit choose?", first, [h for h in holes if h != first]),
        (f"Free memory holes, in address order, are {seq(holes)} KB. A request for {req} KB arrives. Which hole does best fit choose?", best, [h for h in holes if h != best]),
        (f"Free memory holes, in address order, are {seq(holes)} KB. A request for {req} KB arrives. Which hole does worst fit choose?", worst, [h for h in holes if h != worst]),
    ], "With a page size of 2^k bytes, the page number is address ÷ page size and the offset is the remainder (the low k bits). Physical address = frame × page size + offset. First fit takes the first hole big enough, best fit the smallest such hole, worst fit the largest.")


PRC = "Processes and deadlock"


@t(OS, PRC, 3)
def _(r):
    n = 3
    need_max = ints(r, n, 3, 9)
    alloc = [r.randint(0, m - 1) for m in need_max]
    avail = r.randint(1, 4)
    need = [m - a for m, a in zip(need_max, alloc)]
    def safe(order):
        free = avail
        for i in order:
            if need[i] > free:
                return False
            free += alloc[i]
        return True
    perms = list(itertools.permutations(range(n)))
    good, bad = [p for p in perms if safe(p)], [p for p in perms if not safe(p)]
    r.shuffle(bad)
    name = lambda p: " → ".join(f"P{i + 1}" for i in p)
    rows = "\n".join(f"P{i + 1}: holds {alloc[i]}, may need up to {need_max[i]}" for i in range(n))
    if good and len(bad) < 2:
        return None
    ans, wrong = (name(r.choice(good)), ["There is no safe sequence"] + [name(p) for p in bad[:2]]) if good else ("There is no safe sequence", [name(p) for p in bad[:3]])
    return Q(f"A system has one resource type. {avail} instance(s) are free.\n\n{rows}\n\nWhich of these is a safe sequence?", ans, wrong,
             "A sequence is safe if each process in turn can get everything it may still need (its maximum minus what it holds) from the free instances, then finish and release what it holds for the next one.")


@t(OS, PRC, 2)
def _(r):
    n, k, s, p, v = r.randint(2, 9), r.randint(2, 6), r.randint(1, 5), r.randint(1, 9), r.randint(0, 4)
    v = min(v, p)
    return ask(r, [
        (f"{n} processes each need at most {k} instances of the same resource. What is the smallest total number of instances that makes deadlock impossible?", n * (k - 1) + 1, [n * k, n * (k - 1), n + k]),
        (f"A counting semaphore starts at {s}. Processes then call wait (P) {p} times and signal (V) {v} times in total; a negative value counts blocked processes. What is its value?", s - p + v, [s + p - v, s - p, abs(s - p + v) + 1]),
        (f"A counting semaphore starts at {s}. {p + s} processes call wait (P) and none calls signal (V). How many of them are blocked?", p, [p + s, s, 0]),
        (f"A system has {n * k} identical resource instances shared by {n} processes. What is the largest maximum demand per process for which deadlock is still impossible?", k, [n * k, k - 1, k + 2]),
        (f"A binary semaphore (mutex) is 1. {n} processes call wait (P) at the same moment. How many enter the critical section?", 1, [n, 0, n - 1 if n > 2 else 3]),
    ], "With n processes each needing at most k instances, deadlock cannot occur once there are n × (k − 1) + 1 instances, because at least one process can then always finish. Each wait decrements a semaphore and each signal increments it; a process blocks when the count would go below zero.")


facts(bank, OS, PRC, 1, [
    [("A process", "A program in execution, with its own memory space."),
     ("A thread", "A unit of execution inside a process that shares the process's memory with its other threads."),
     ("A context switch", "Saving the state of the running process and loading the state of another."),
     ("The ready state", "The process could run but is waiting for the CPU."),
     ("The waiting (blocked) state", "The process cannot run until some event, such as an I/O operation finishing, occurs."),
     ("A process control block", "The record in which the operating system keeps everything it knows about one process."),
     ("A system call", "The way a program asks the operating system kernel for a service."),
     ("Paging", "Dividing memory into fixed-size blocks so that a process need not occupy contiguous memory."),
     ("A page fault", "A reference to a page that is not currently in main memory."),
     ("Thrashing", "A system spending most of its time swapping pages instead of doing useful work.")],
    [("A semaphore", "An integer changed only by atomic wait and signal operations, used to coordinate processes."),
     ("A critical section", "Code that accesses shared data and must not be run by two processes at once."),
     ("Mutual exclusion", "Only one process at a time may be inside the critical section."),
     ("A deadlock", "A set of processes each waiting for a resource held by another in the set, so none can continue."),
     ("Starvation", "A process waits indefinitely because others are always chosen ahead of it."),
     ("A race condition", "The result depends on the unpredictable order in which processes access shared data."),
     ("Round-robin scheduling", "Each process runs for a fixed time slice in turn."),
     ("First-come, first-served scheduling", "Processes run to completion in the order they arrived."),
     ("Shortest-job-first scheduling", "The process with the smallest CPU burst runs next."),
     ("Priority scheduling", "The process with the highest priority runs next.")],
])

FS = "Files, permissions and disks"


def rwx(mode):
    return "".join("".join(c if int(d) & v else "-" for c, v in zip("rwx", (4, 2, 1))) for d in mode)


assert rwx("754") == "rwxr-xr--"


@t(OS, FS, 2)
def _(r):
    mode = "".join(str(r.choice([0, 4, 5, 6, 7])) for _ in range(3))
    alt = lambda: "".join(str(r.choice([1, 2, 3, 4, 5, 6, 7])) for _ in range(3))
    um = r.choice(["022", "027", "002", "077", "007", "026"])
    newf = "".join(str(6 & ~int(d)) for d in um)
    cwd, rel = r.choice(["/home/asha/docs", "/var/www/site", "/home/ravi/code/app"]), r.choice(["../pics/a.png", "./notes/../todo.txt", "../../tmp/x", "data/./raw/../in.csv", "../.."])
    full = posixpath.normpath(posixpath.join(cwd, rel))
    size, blk, ptrs = r.randint(1, 900), r.choice([1, 2, 4]), r.choice([10, 12])
    return ask(r, [
        (f"What permissions does  chmod {mode} file  set, written as owner/group/other rwx triples?", rwx(mode), [rwx(mode[::-1]), rwx(alt()), rwx(alt()), rwx(alt())]),
        (f"Which numeric mode gives the permissions {rwx(mode)}?", mode, [mode[::-1], alt(), alt(), alt()]),
        (f"The umask is {um}. Which permissions does a newly created regular file get (files start from 666)?", newf, ["".join(str(7 & ~int(d)) for d in um), um, "666", "".join(str(int(d) & 6) for d in um)]),
        (f"The current directory is {cwd}. Which absolute path does the relative path  {rel}  refer to?", full, [posixpath.normpath(cwd + "/" + rel.replace("../", "", 1)), "/" + rel.lstrip("./"), posixpath.normpath(posixpath.join(cwd, "..", rel)), cwd + "/" + rel]),
        (f"A file of {size} KB is stored on a disk with {blk} KB blocks. How many blocks does it occupy?", -(-size // blk), [size * blk, size // blk if size % blk else size // blk + 1, -(-size // blk) + 2]),
        (f"An inode has {ptrs} direct block pointers and no indirect ones. With {blk} KB blocks, what is the largest file it can describe, in KB?", ptrs * blk, [ptrs, ptrs * blk * 1024, ptrs + blk]),
        (f"In the permissions {rwx(mode)}, which numeric value describes what the group may do?", int(mode[1]), [int(mode[0]) if mode[0] != mode[1] else 1, int(mode[2]) if mode[2] != mode[1] else 2, 3]),
    ], "Each permission digit is read (4) + write (2) + execute (1), given for owner, group and others in that order. A umask removes bits from the default (666 for files). In a path, . is the current directory and .. is its parent.")


def seek(head, order):
    """Total head movement when the requests are served in this order."""
    return sum(abs(b - a) for a, b in zip([head] + list(order), order))


def nearest_first(head, reqs):
    left, pos, out = list(reqs), head, []
    while left:
        pos = min(left, key=lambda x: (abs(x - pos), x))
        left.remove(pos)
        out.append(pos)
    return out


_q = [98, 183, 37, 122, 14, 124, 65, 67]
assert seek(53, _q) == 640 and seek(53, nearest_first(53, _q)) == 236


@t(OS, FS, 3)
def _(r):
    head, reqs = r.randint(20, 180), uniq(r, r.randint(4, 6), 0, 199)
    total, sstf = lambda order: seek(head, order), nearest_first(head, reqs)
    up, down = sorted(x for x in reqs if x >= head), sorted((x for x in reqs if x < head), reverse=True)
    algo = r.choice(["FCFS", "SSTF", "LOOK"])
    res = {"FCFS": total(reqs), "SSTF": total(sstf), "LOOK": total(up + down)}
    desc = {"FCFS": "first-come, first-served", "SSTF": "shortest seek time first", "LOOK": "LOOK, moving towards higher cylinders first and reversing at the last request"}
    return nq(f"The disk head is at cylinder {head}. Requests are queued for cylinders {seq(reqs)}, in that order. What is the total head movement, in cylinders, under {desc[algo]}?", res[algo],
              [v for a, v in res.items() if a != algo] + [max(reqs) - min(reqs), sum(reqs)],
              "FCFS serves requests in queue order. SSTF always moves to the nearest pending request. LOOK sweeps in one direction serving requests on the way, then reverses. Add up the distance of every move.")



IP = "IP addressing"
MASK = lambda p: str(ipaddress.ip_network(f"0.0.0.0/{p}").netmask)


def rand_ip(r):
    return f"{r.choice([10, 172, 192, 100, 150, 200])}.{r.randint(0, 255)}.{r.randint(0, 255)}.{r.randint(1, 254)}"


@t(OS, IP, 2)
def _(r):
    p, ip = r.randint(16, 28), rand_ip(r)
    q = min(p + r.randint(1, 4), 30)
    net = ipaddress.ip_network(f"{ip}/{p}", strict=False)
    return ask(r, [
        (f"How many usable host addresses does a /{p} IPv4 subnet have?", 2 ** (32 - p) - 2, [2 ** (32 - p), 2 ** p - 2 if p < 20 else 2 ** (31 - p), 2 ** (32 - p) - 1]),
        (f"What is the subnet mask of a /{p} network?", MASK(p), [MASK(p - 1), MASK(p + 1), MASK(p - 8 if p > 23 else p + 2), MASK(32 - p if 32 - p != p else 8)]),
        (f"Which prefix length corresponds to the subnet mask {MASK(p)}?", f"/{p}", [f"/{p - 1}", f"/{p + 1}", f"/{32 - p}" if 32 - p != p else "/8", f"/{p + 2}"]),
        (f"A host has the address {ip}/{p}. What is its network address?", str(net.network_address), [str(net.broadcast_address), str(net.network_address + 1), ip, str(ipaddress.ip_network(f"{ip}/{max(p - 4, 8)}", strict=False).network_address)]),
        (f"A host has the address {ip}/{p}. What is the broadcast address of its subnet?", str(net.broadcast_address), [str(net.network_address), str(net.broadcast_address - 1), ip, str(ipaddress.ip_network(f"{ip}/{max(p - 4, 8)}", strict=False).broadcast_address)]),
        (f"A /{p} network is divided into /{q} subnets. How many subnets are created?", 2 ** (q - p), [q - p, 2 ** (32 - q), 2 ** (q - p) - 2 if q - p > 1 else 4]),
        (f"A subnet must hold at least {2 ** (32 - p) - 2 - r.randint(0, 2 ** (31 - p) - 1 if p < 31 else 0)} hosts. What is the longest prefix (smallest subnet) that fits?", f"/{p}", [f"/{p + 1}", f"/{p - 1}", f"/{p + 2}", f"/{32 - p}" if 32 - p != p else "/9"]),
    ], "A /p network leaves 32 − p host bits, so it has 2^(32−p) addresses; the first is the network address and the last is the broadcast address, leaving 2^(32−p) − 2 for hosts. Moving the prefix from /p to /q creates 2^(q−p) subnets.")


@t(OS, IP, 3)
def _(r):
    p, ip = r.randint(20, 28), rand_ip(r)
    net = ipaddress.ip_network(f"{ip}/{p}", strict=False)
    inside = str(net.network_address + r.randint(1, net.num_addresses - 2))
    outside = [str(net.broadcast_address + r.randint(2, 200)), str(net.network_address - r.randint(2, 200)), str(net.broadcast_address + net.num_addresses + r.randint(1, 50)), str(net.network_address - net.num_addresses - 1)]
    priv = r.choice([f"10.{r.randint(0, 255)}.{r.randint(0, 255)}.{r.randint(1, 254)}", f"172.{r.randint(16, 31)}.{r.randint(0, 255)}.{r.randint(1, 254)}", f"192.168.{r.randint(0, 255)}.{r.randint(1, 254)}"])
    pub = [f"{a}.{r.randint(0, 255)}.{r.randint(0, 255)}.{r.randint(1, 254)}" for a in r.sample([8, 11, 52, 142, 172, 193, 9, 151], 4)]
    pub = [x for x in pub if ipaddress.ip_address(x).is_global and not ipaddress.ip_address(x).is_private][:3]
    first = int(ip.split(".")[0])
    octet = r.choice([r.randint(1, 126), r.randint(128, 191), r.randint(192, 223), r.randint(224, 239)])
    cls = "Class A" if octet < 128 else "Class B" if octet < 192 else "Class C" if octet < 224 else "Class D (multicast)"
    form = r.randint(0, 3)
    why = "Two addresses are in the same subnet when they share the same network address under the mask. The private ranges are 10.0.0.0/8, 172.16.0.0/12 and 192.168.0.0/16. Classful addressing goes by the first octet: A is 1-126, B is 128-191, C is 192-223 and D is 224-239."
    if form == 0 and inside != ip:
        return Q(f"A host has the address {ip}/{p}. Which of these addresses is in the same subnet?", inside, outside, why)
    if form == 1 and len(pub) == 3:
        return Q("Which of these is a private (RFC 1918) IPv4 address?", priv, pub, why)
    if form == 2:
        return Q(f"In classful addressing, which class does an address beginning {octet}.x.x.x belong to?", cls, [c for c in ["Class A", "Class B", "Class C", "Class D (multicast)"] if c != cls], why)
    return Q(f"A host has the address {ip}/{p}. What is the first usable host address in its subnet?", str(net.network_address + 1), [str(net.network_address), str(net.broadcast_address - 1), str(net.network_address + 2), str(net.broadcast_address)], why)


NET = "Network models and protocols"
PORTS = {"HTTP": 80, "HTTPS": 443, "FTP (control)": 21, "SSH": 22, "Telnet": 23, "SMTP": 25, "DNS": 53, "POP3": 110, "IMAP": 143, "RDP": 3389, "MySQL": 3306, "DHCP (server)": 67}
LAYERS = ["Physical", "Data Link", "Network", "Transport", "Session", "Presentation", "Application"]
AT = {"A router": 3, "A switch": 2, "A hub": 1, "TCP": 4, "UDP": 4, "IP": 3, "HTTP": 7, "An Ethernet frame": 2, "A MAC address": 2, "An IP address": 3,
      "A port number": 4, "A network cable": 1, "DNS": 7, "Data encryption and format translation": 6, "SMTP": 7, "A repeater": 1, "ICMP": 3}
PDU = {"Transport": "Segment", "Network": "Packet", "Data Link": "Frame", "Physical": "Bits"}


@t(OS, NET, 1)
def _(r):
    proto, thing, n = r.choice(list(PORTS)), r.choice(list(AT)), r.randint(1, 7)
    layer = r.choice(list(PDU))
    why = "The OSI layers from 1 to 7 are Physical, Data Link, Network, Transport, Session, Presentation and Application. Hubs and cables are layer 1, switches and MAC addresses layer 2, routers and IP layer 3, TCP, UDP and ports layer 4."
    form = r.randint(0, 5)
    if form == 0:
        return nq(f"Which port does {proto} use by default?", PORTS[proto], [v for k, v in PORTS.items() if k != proto], "Well-known ports: FTP 21, SSH 22, Telnet 23, SMTP 25, DNS 53, DHCP 67, HTTP 80, POP3 110, IMAP 143, HTTPS 443, MySQL 3306, RDP 3389.")
    if form == 1:
        return Q(f"Which protocol uses port {PORTS[proto]} by default?", proto, r.sample([k for k in PORTS if k != proto], 3), "Well-known ports: FTP 21, SSH 22, Telnet 23, SMTP 25, DNS 53, DHCP 67, HTTP 80, POP3 110, IMAP 143, HTTPS 443, MySQL 3306, RDP 3389.")
    if form == 2:
        ans = LAYERS[AT[thing] - 1]
        return Q(f"{thing} belongs to which layer of the OSI model?", ans, r.sample([x for x in LAYERS if x != ans], 3), why)
    if form == 3:
        return Q(f"Which is layer {n} of the OSI model?", LAYERS[n - 1], r.sample([x for x in LAYERS if x != LAYERS[n - 1]], 3), why)
    if form == 4:
        return nq(f"Which layer number of the OSI model is the {LAYERS[n - 1]} layer?", n, [8 - n if 8 - n != n else 1, n + 1 if n < 7 else 5, n - 1 if n > 1 else 3], why)
    return Q(f"What is a unit of data called at the {layer} layer?", PDU[layer], [v for k, v in PDU.items() if k != layer], "Data is called a segment at the Transport layer, a packet at the Network layer, a frame at the Data Link layer and bits at the Physical layer.")


facts(bank, OS, NET, 1, [
    [("TCP", "A connection-oriented transport protocol that delivers data reliably and in order."),
     ("UDP", "A connectionless transport protocol that sends data without guaranteeing delivery or order."),
     ("DNS", "The system that translates domain names into IP addresses."),
     ("DHCP", "The protocol that automatically assigns IP addresses to devices joining a network."),
     ("NAT", "Translating private addresses to a public address so that many devices can share it."),
     ("HTTPS", "HTTP carried over an encrypted TLS connection."),
     ("A subnet mask", "The value that separates the network part of an IP address from the host part."),
     ("A default gateway", "The router a device sends traffic to when the destination is outside its own network."),
     ("Bandwidth", "The maximum amount of data a link can carry per second."),
     ("Latency", "The delay between sending data and it arriving.")],
    [("A MAC address", "A hardware address that identifies a network interface on the local network."),
     ("An IP address", "A logical address that identifies a device across networks and is used for routing."),
     ("A router", "A device that forwards packets between different networks using IP addresses."),
     ("A switch", "A device that forwards frames within one network using MAC addresses."),
     ("A hub", "A device that repeats every incoming signal out of all its other ports."),
     ("A firewall", "A device or program that allows or blocks traffic according to rules."),
     ("A LAN", "A network covering a small area such as one building."),
     ("A WAN", "A network covering a large geographic area, linking other networks."),
     ("A modem", "A device that converts digital data to and from the signals carried by a telephone, cable or fibre line."),
     ("A wireless access point", "A device that lets Wi-Fi devices join a wired network.")],
])


if __name__ == "__main__":
    bank.write(OUT)
