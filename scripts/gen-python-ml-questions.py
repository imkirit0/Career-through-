#!/usr/bin/env python3
"""Generate data/python-ml-questions.csv: 5,000 multiple-choice questions for a `python-ml` skill.

Same method as gen-python-questions.py: every question is a small program and the correct
option is what it really prints. Covers the Python that ML and AI roles need on top of the
shared `python` skill: array shapes, feature preparation, training and evaluation.

Needs numpy, pandas and scikit-learn:  pip install numpy pandas scikit-learn
Run:                                   python3 scripts/gen-python-ml-questions.py
"""
from pathlib import Path

from qbank import Bank, body, expr, ints, uniq

OUT = Path(__file__).resolve().parent.parent / "data" / "python-ml-questions.csv"

# proposed topicIds for a `python-ml` skill, in teaching order
AR, FE, TR, EV = "python-ml-arrays", "python-ml-features", "python-ml-training", "python-ml-evaluation"
bank = Bank("python-ml", "pyml", [AR, FE, TR, EV])
t = bank.t

NPRE = "import numpy as np\n"


def col(xs):
    """A list of numbers as a one-feature matrix literal: [[1], [2], [3]]."""
    return str([[x] for x in xs])


def labels(r, n):
    """n binary labels with both classes present."""
    ys = [0, 1] + [r.randint(0, 1) for _ in range(n - 2)]
    r.shuffle(ys)
    return ys


# ───────────────────────── Arrays for models ─────────────────────────

SHP = "Shapes for models"


@t(AR, SHP, 1)
def _(r):
    n, d, k = r.randint(5, 9), r.randint(2, 4), r.randint(2, 4)
    return expr(r, f"{NPRE}X = np.ones(({n}, {d}))\nw = np.ones({d})\nW = np.ones(({d}, {k}))\n", [
        ("(X @ w).shape", [f"({n}, {d})", f"({d},)", f"({n}, 1)"]),
        ("(X @ W).shape", [f"({n}, {d})", f"({d}, {k})", f"({k}, {n})"]),
        ("(W @ X).shape", [f"({d}, {d})", f"({n}, {k})", f"({k}, {n})"]),
        ("(X.T @ X).shape", [f"({n}, {n})", f"({n}, {d})", f"({d},)"]),
        ("(X @ X.T).shape", [f"({d}, {d})", f"({n}, {d})", f"({n},)"]),
        ("w.reshape(-1, 1).shape", [f"({d},)", f"(1, {d})"]),
        ("(X @ w.reshape(-1, 1)).shape", [f"({n},)", f"({n}, {d})"]),
        ("X[0].shape, X[:, 0].shape", [f"({n},), ({d},)", f"(1, {d}), ({n}, 1)"]),
        ("X.mean(axis=0).shape, X.mean(axis=1).shape", [f"({n},), ({d},)", f"(1, {d}), ({n}, 1)"]),
        (f"(X @ W + np.ones({k})).shape", [f"({n}, {d})", f"({k},)", f"({n}, {k + 1})"]),
        ("np.expand_dims(w, 0).shape", [f"({d},)", f"({d}, 1)"]),
        ("(X * w).shape, (X @ w).shape", [f"({n},), ({n},)", f"({n}, {d}), ({n}, {d})"]),
    ], "Matrix multiplication (n, d) @ (d, k) gives (n, k); the inner sizes must match. A 1-D vector of length d works as the right-hand side and gives one value per row.")


@t(AR, SHP, 2)
def _(r):
    n, h, w, c, b = r.randint(4, 12), r.choice([8, 16, 28, 32]), r.choice([8, 16, 28, 32]), r.choice([1, 3]), r.randint(2, 3)
    return expr(r, f"{NPRE}imgs = np.zeros(({n}, {h}, {w}, {c}))\n", [
        (f"imgs.reshape({n}, -1).shape", [f"({n}, {h * w})", f"({h * w * c},)", f"({n}, {h}, {w * c})"]),
        ("imgs[0].shape", [f"({n}, {h}, {w})", f"({h}, {w})", f"(1, {h}, {w}, {c})"]),
        ("imgs.mean(axis=(1, 2)).shape", [f"({n},)", f"({h}, {w})", f"({n}, {h}, {w})"]),
        ("imgs.transpose(0, 3, 1, 2).shape", [f"({n}, {h}, {w}, {c})", f"({c}, {n}, {h}, {w})", f"({n}, {w}, {h}, {c})"]),
        (f"imgs[:{b}].shape", [f"({b},)", f"({n}, {h}, {w}, {c})", f"({b}, {h}, {w})"]),
        (f"imgs.reshape(-1, {c}).shape", [f"({n}, {c})", f"({n * h * w * c},)", f"({h * w}, {c})"]),
        ("imgs.ndim, imgs.size", [f"4, {n}", f"3, {n * h * w * c}", f"{n}, {h * w * c}"]),
        ("imgs[..., 0].shape", [f"({h}, {w}, {c})", f"({n}, {h}, {w}, 1)", f"({n},)"]),
        ("np.concatenate([imgs, imgs]).shape", [f"(2, {n}, {h}, {w}, {c})", f"({n}, {h}, {w}, {2 * c})", f"({n}, {2 * h}, {w}, {c})"]),
        ("np.stack([imgs[0], imgs[1]]).shape", [f"({h}, {w}, {2 * c})", f"({2 * h}, {w}, {c})", f"({h}, {w}, {c})"]),
        (f"imgs.reshape({n}, {h * w}).shape", [f"({n}, {h * w * c})", f"({h * w}, {n})"]),
    ], "A batch of images is (batch, height, width, channels). reshape(n, -1) flattens each image into one row; -1 means 'work this size out'. The total number of elements must not change.")


PRD = "Predictions from scores"


@t(AR, PRD, 2)
def _(r):
    scores, y = [uniq(r, 3, 1, 9) for _ in range(4)], ints(r, 4, 0, 2)
    return expr(r, f"{NPRE}scores = np.array({scores})\ny = np.array({y})\n", [
        ("scores.argmax(axis=1).tolist()", ["scores.argmax(axis=0).tolist()", "scores.max(axis=1).tolist()", "scores.argmin(axis=1).tolist()"]),
        ("scores.max(axis=1).tolist()", ["scores.argmax(axis=1).tolist()", "scores.max(axis=0).tolist()"]),
        ("(scores.argmax(axis=1) == y).mean()", ["(scores.argmax(axis=1) == y).sum()", "(scores.argmax(axis=1) != y).mean()"]),
        ("(scores.argmax(axis=1) == y).sum()", ["(scores.argmax(axis=1) != y).sum()", "(scores.argmax(axis=1) == y).mean()"]),
        ("scores.argsort(axis=1)[:, -2].tolist()", ["scores.argmax(axis=1).tolist()", "scores.argsort(axis=1)[:, 1].tolist()" if False else "scores.argmin(axis=1).tolist()"]),
        ("int(scores.argmax()), scores.shape", ["int(scores.max()), scores.shape", "scores.argmax(axis=1).tolist(), scores.shape"]),
        ("int(np.argmax(scores[0])), int(np.argmin(scores[0]))", ["int(np.max(scores[0])), int(np.min(scores[0]))", "int(np.argmin(scores[0])), int(np.argmax(scores[0]))"]),
        ("(scores > 5).sum(axis=1).tolist()", ["(scores > 5).sum(axis=0).tolist()", "scores[scores > 5].tolist()"]),
        ("np.where(scores.argmax(axis=1) != y)[0].tolist()", ["np.where(scores.argmax(axis=1) == y)[0].tolist()", "scores.argmax(axis=1).tolist()"]),
    ], "Each row holds one sample's class scores. argmax(axis=1) returns the position of the largest score in every row, which is the predicted class; comparing with y and taking the mean gives accuracy.")


@t(AR, PRD, 2)
def _(r):
    z = uniq(r, 4, -3, 4)
    return expr(r, f"{NPRE}z = np.array({z}, dtype=float)\n", [
        ("(1 / (1 + np.exp(-z)) > 0.5).astype(int).tolist()", ["(z >= 0).astype(int).tolist()", "(z > 0.5).astype(int).tolist()", "(z < 0).astype(int).tolist()"]),
        ("np.round(1 / (1 + np.exp(-z)), 2).tolist()", ["np.round(np.exp(z) / np.exp(z).sum(), 2).tolist()", "np.round(np.tanh(z), 2).tolist()"]),
        ("np.round(np.exp(z) / np.exp(z).sum(), 2).tolist()", ["np.round(1 / (1 + np.exp(-z)), 2).tolist()", "np.round(np.abs(z) / np.abs(z).sum(), 2).tolist()"]),
        ("round(float((np.exp(z) / np.exp(z).sum()).sum()), 2)", ["float(len(z))", "round(float(z.sum()), 2)", "0.0"]),
        ("int(np.argmax(np.exp(z) / np.exp(z).sum())), int(np.argmax(z))", ["int(np.argmin(z)), int(np.argmax(z))", "int(np.argmax(z)), int(np.argmin(z))"]),
        ("np.maximum(0, z).tolist()", ["np.abs(z).tolist()", "np.minimum(0, z).tolist()", "z.tolist()"]),
        ("np.round(np.where(z > 0, z, 0.1 * z), 2).tolist()", ["np.maximum(0, z).tolist()", "np.round(0.1 * z, 2).tolist()"]),
        ("int((np.maximum(0, z) == 0).sum())", ["int((z == 0).sum())", "int((z > 0).sum())"]),
    ], "Sigmoid squashes a score into 0..1 (above 0.5 exactly when the score is positive). Softmax turns a vector of scores into probabilities that sum to 1 and keeps their order. ReLU replaces negatives with 0.")


LOS = "Loss functions"


@t(AR, LOS, 2)
def _(r):
    y, p = uniq(r, 4, 1, 12), ints(r, 4, 1, 12)
    return expr(r, f"{NPRE}y = np.array({y}, dtype=float)\np = np.array({p}, dtype=float)\n", [
        ("np.mean((y - p) ** 2)", ["np.mean(np.abs(y - p))", "np.sum((y - p) ** 2)", "np.mean(y - p) ** 2"]),
        ("np.mean(np.abs(y - p))", ["np.mean((y - p) ** 2)", "np.sum(np.abs(y - p))", "abs(np.mean(y - p))"]),
        ("round(float(np.sqrt(np.mean((y - p) ** 2))), 3)", ["np.mean((y - p) ** 2)", "np.mean(np.abs(y - p))"]),
        ("np.max(np.abs(y - p))", ["np.max(y - p)", "np.mean(np.abs(y - p))"]),
        ("(y - p).tolist()", ["(p - y).tolist()", "np.abs(y - p).tolist()"]),
        ("np.sum((y - p) ** 2)", ["np.mean((y - p) ** 2)", "np.sum(np.abs(y - p))", "np.sum(y - p) ** 2"]),
        ("np.mean(y - p)", ["np.mean(np.abs(y - p))", "np.mean(p - y)"]),
    ], "MSE is the mean of the squared errors, MAE the mean of the absolute errors, and RMSE the square root of MSE. Squaring before averaging is not the same as averaging first.")


@t(AR, LOS, 3)
def _(r):
    y, p = labels(r, 4), [r.choice([0.1, 0.2, 0.3, 0.4, 0.6, 0.7, 0.8, 0.9]) for _ in range(4)]
    w, lam = [r.choice([-2, -1, 0.5, 1, 2, 3]) for _ in range(3)], r.choice([0.1, 0.01, 0.5])
    bce = "-np.mean(y * np.log(p) + (1 - y) * np.log(1 - p))"
    return expr(r, f"{NPRE}y = np.array({y})\np = np.array({p})\nw = np.array({w})\n", [
        (f"round(float({bce}), 3)", ["round(float(np.mean((y - p) ** 2)), 3)", f"round(float({bce.replace('mean', 'sum')}), 3)", "round(float(-np.mean(y * np.log(p))), 3)"]),
        ("((p > 0.5) == y).mean()", ["((p > 0.5) != y).mean()", "(p > 0.5).mean()"]),
        ("round(float(-np.log(p[0])), 3), round(float(-np.log(1 - p[0])), 3)", ["round(float(p[0]), 3), round(float(1 - p[0]), 3)", "round(float(-np.log(1 - p[0])), 3), round(float(-np.log(p[0])), 3)"]),
        (f"round(float({lam} * np.sum(w ** 2)), 3)", [f"round(float({lam} * np.sum(np.abs(w))), 3)", "round(float(np.sum(w ** 2)), 3)", f"round(float({lam} * np.sum(w) ** 2), 3)"]),
        (f"round(float({lam} * np.sum(np.abs(w))), 3)", [f"round(float({lam} * np.sum(w ** 2)), 3)", f"round(float({lam} * abs(np.sum(w))), 3)", "round(float(np.sum(np.abs(w))), 3)"]),
        ("round(float(np.mean((y - p) ** 2)), 3)", [f"round(float({bce}), 3)", "round(float(np.mean(np.abs(y - p))), 3)"]),
        ("(p > 0.5).astype(int).tolist()", ["np.round(p + 0.1).astype(int).tolist()", "y.tolist()", "(p < 0.5).astype(int).tolist()"]),
    ], "Binary cross-entropy averages -log(p) for positive samples and -log(1 - p) for negative ones, so confident wrong predictions cost the most. L2 regularisation adds lambda * sum(w ** 2); L1 adds lambda * sum(|w|).")


OHB = "One-hot labels and batches"


@t(AR, OHB, 2)
def _(r):
    k = r.randint(3, 4)
    y = list(range(k)) + ints(r, r.randint(1, 3), 0, k - 1)
    r.shuffle(y)
    i, n, b, parts = r.randint(0, len(y) - 1), r.randint(10, 60), r.choice([4, 8, 16, 32]), r.randint(3, 4)
    return expr(r, f"{NPRE}y = np.array({y})\n", [
        (f"np.eye({k})[y].shape", [f"({k}, {len(y)})", f"({len(y)},)", f"({k}, {k})"]),
        (f"np.eye({k}, dtype=int)[y][{i}].tolist()", [f"np.eye({k}, dtype=int)[{i % k}].tolist()", f"[{y[i]}]"]),
        (f"np.eye({k})[y].sum(axis=0).astype(int).tolist()", [f"np.eye({k})[y].sum(axis=1).astype(int).tolist()", "sorted(y.tolist())"]),
        (f"np.eye({k})[y].argmax(axis=1).tolist()", ["sorted(y.tolist())", f"np.eye({k})[y].argmax(axis=0).tolist()"]),
        (f"np.bincount(y, minlength={k}).tolist()", ["sorted(set(y.tolist()))", f"[len(y)] * {k}"]),
        (f"[len(b) for b in np.array_split(np.arange({n}), {parts})]", [f"[{n // parts}] * {parts}", f"[{n // parts}] * {parts - 1} + [{n // parts + n % parts}]"]),
        (f"len(range(0, {n}, {b}))", [f"{n // b}", f"{n // b + 2}", f"{n}"]),
        (f"[len(np.arange({n})[i:i + {b}]) for i in range(0, {n}, {b})][-1]", [f"{b}", "0", f"{n // b}"]),
        (f"np.round(len(y) / ({k} * np.bincount(y, minlength={k})), 2).tolist()", [f"np.bincount(y, minlength={k}).tolist()", f"np.round(np.bincount(y, minlength={k}) / len(y), 2).tolist()"]),
        (f"int(np.eye({k})[y].sum())", [f"{k * len(y)}", f"{k}"]),
    ], "np.eye(k)[y] turns class numbers into one-hot rows: one row per sample, one column per class, a single 1 in each row. The last mini-batch is smaller when the data size is not a multiple of the batch size.")


NRM = "Normalising and layer maths"


@t(AR, NRM, 3)
def _(r):
    a, b = uniq(r, 3, 1, 20), uniq(r, 3, 10, 90)
    X, i = [[x, y] for x, y in zip(a, b)], r.randint(0, 2)
    z = "((X - X.mean(axis=0)) / X.std(axis=0))"
    mm = "((X - X.min(axis=0)) / (X.max(axis=0) - X.min(axis=0)))"
    return expr(r, f"{NPRE}X = np.array({X}, dtype=float)\n", [
        (f"{z}.round(2)[{i}].tolist()", [f"{mm}.round(2)[{i}].tolist()", f"(X - X.mean(axis=0)).round(2)[{i}].tolist()", f"((X - X.mean()) / X.std()).round(2)[{i}].tolist()"]),
        (f"{mm}.round(2)[{i}].tolist()", [f"{z}.round(2)[{i}].tolist()", f"(X / X.max(axis=0)).round(2)[{i}].tolist()"]),
        ("X.mean(axis=0).round(2).tolist()", ["X.mean(axis=1).round(2).tolist()", "np.median(X, axis=0).round(2).tolist()"]),
        ("X.std(axis=0).round(2).tolist()", ["X.std(axis=1).round(2).tolist()", "X.var(axis=0).round(2).tolist()"]),
        (f"{z}.std(axis=0).round(2).tolist()", ["X.std(axis=0).round(2).tolist()", "[0.0, 0.0]"]),
        (f"{mm}.max(axis=0).tolist(), {mm}.min(axis=0).tolist()", ["X.max(axis=0).tolist(), X.min(axis=0).tolist()", "[1.0, 1.0], [-1.0, -1.0]"]),
        ("(X - X.mean(axis=0)).round(2)[0].tolist()", ["(X - X.mean()).round(2)[0].tolist()", "(X - X.mean(axis=1, keepdims=True)).round(2)[0].tolist()"]),
    ], "Standardising subtracts each column's mean and divides by its standard deviation, so every column ends with mean 0 and std 1. Min-max scaling maps each column to the range 0..1. Both work column by column (axis=0).")


@t(AR, NRM, 3)
def _(r):
    d, h, o = r.randint(2, 20), r.randint(2, 16), r.randint(1, 5)
    n, f, p, s = r.choice([28, 32, 64, 224]), r.choice([3, 5, 7]), r.randint(0, 2), r.randint(1, 2)
    xs, ws, b = ints(r, 3, -3, 4), ints(r, 3, -2, 3), r.randint(-3, 3)
    return body(r, NPRE, [
        (f"layers = [{d}, {h}, {o}]\nprint(sum(a * b + b for a, b in zip(layers, layers[1:])))", [f"print({d * h + h * o})", f"print({d + h + o})", f"print({d * h * o})"]),
        (f"d, h = {d}, {h}\nprint(d * h + h)", [f"print({d * h})", f"print({d + h})", f"print({(d + 1) * (h + 1)})"]),
        (f"n, f, p, s = {n}, {f}, {p}, {s}\nprint((n + 2 * p - f) // s + 1)", [f"print({(n - f) // s + 1})", f"print({(n + 2 * p - f) // s})", f"print({n // s})"]),
        (f"x = np.array({xs})\nw = np.array({ws})\nprint(int(np.maximum(0, x @ w + {b})))", [f"print({sum(a * c for a, c in zip(xs, ws)) + b})", f"print({sum(a * c for a, c in zip(xs, ws))})", f"print({abs(sum(a * c for a, c in zip(xs, ws)) + b)})"]),
        (f"X = np.ones(({d}, {h}))\nW = np.ones(({h}, {o}))\nb = np.zeros({o})\nprint((X @ W + b).shape, float((X @ W + b)[0, 0]))", [f"print(({d}, {h}), {float(h)})", f"print(({d}, {o}), 1.0)", f"print(({h}, {o}), {float(d)})"]),
        (f"x = np.array({xs})\nw = np.array({ws})\nprint(int(x @ w), (x * w).tolist())", [f"print({sum(xs) * sum(ws)}, {[a * c for a, c in zip(xs, ws)]})", f"print({sum(a + c for a, c in zip(xs, ws))}, {[a + c for a, c in zip(xs, ws)]})"]),
        (f"params = {d} * {h} + {h}\nprint(params * 4 // 1024, 'KB')", [f"print({d * h * 4 // 1024}, 'KB')", f"print({(d * h + h) // 1024}, 'KB')", f"print({(d * h + h) * 8 // 1024}, 'KB')"]),
    ], "A dense layer from d inputs to h units has d * h weights plus h biases. A convolution's output size is (n + 2p - f) // s + 1. A neuron computes x @ w + b and then applies its activation.")


# ───────────────────────── Preparing features ─────────────────────────

SPL = "Train/test split"
SPRE = f"{NPRE}from sklearn.model_selection import train_test_split\n"


@t(FE, SPL, 1)
def _(r):
    n, ts = r.randint(8, 40), r.choice([0.2, 0.25, 0.3, 0.1, 0.5, 0.4])
    lo = int(n * ts)
    pre = f"{SPRE}X = np.arange({n * 2}).reshape({n}, 2)\ny = np.arange({n})\nX_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size={ts}, random_state=0)\n"
    return expr(r, pre, [
        ("X_tr.shape, X_te.shape", ["X_te.shape, X_tr.shape", f"({n}, 2), ({n}, 2)", f"({n - lo}, 2), ({lo}, 2)", f"({n - lo - 1}, 2), ({lo + 1}, 2)"]),
        ("len(y_te)", [f"{lo}", "len(y_tr)", f"{n}", f"{lo + 2}"]),
        ("len(X_tr) + len(X_te)", [f"{n * 2}", "len(X_tr)", f"{n - 1}"]),
        ("y_tr.shape, X_tr.shape", ["X_tr.shape, y_tr.shape", "y_te.shape, X_te.shape", f"({n},), ({n}, 2)"]),
        ("len(set(y_tr.tolist()) & set(y_te.tolist()))", ["len(y_te)", "1", f"{n}"]),
        ("sorted(np.concatenate([y_tr, y_te]).tolist()) == y.tolist(), len(y_tr) > len(y_te)", ["True, True", "False, True", "True, False", "False, False"]),
    ], "train_test_split shuffles the rows and cuts them into a training part and a test part. A float test_size is a fraction of the rows, rounded up; the two parts never share a row and together contain every row.")


@t(FE, SPL, 2)
def _(r):
    n = r.randint(8, 30)
    k = r.randint(2, n // 2)
    pre = f"{SPRE}X = np.arange({n * 2}).reshape({n}, 2)\ny = np.arange({n})\nX_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size={k}, shuffle=False)\n"
    return expr(r, pre, [
        ("y_te.tolist()", [f"y_tr.tolist()[:{k}]", f"y_tr.tolist()[-{k}:]", f"list(range({k}))"]),
        ("X_te[0].tolist()", ["X_tr[0].tolist()", "X_tr[-1].tolist()", "X_te[-1].tolist()"]),
        ("int(y_tr[-1]), int(y_te[0])", ["int(y_te[0]), int(y_tr[-1])", f"{n - 1}, 0", f"{n - k}, {n - k}"]),
        ("len(y_tr), len(y_te)", [f"{k}, {n - k}", f"{n}, {k}"]),
        ("X_tr.shape", [f"({k}, 2)", f"({n}, 2)", f"({n - k},)"]),
    ], "An integer test_size is an exact number of rows. With shuffle=False nothing is shuffled: the test set is simply the last rows, which is what you want for time-ordered data.")


@t(FE, SPL, 2)
def _(r):
    n = r.choice([12, 16, 20, 24, 40])
    a = r.choice([n // 4, n // 2, 3 * n // 4])
    ts = r.choice([0.25, 0.5])
    pre = f"{SPRE}y = np.array([0] * {a} + [1] * {n - a})\nX = np.arange({n}).reshape(-1, 1)\nX_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size={ts}, stratify=y, random_state={r.randint(0, 9)})\n"
    return expr(r, pre, [
        ("np.bincount(y_te).tolist()", ["np.bincount(y_tr).tolist()", "np.bincount(y).tolist()", f"[{int(n * ts) // 2}, {int(n * ts) - int(n * ts) // 2}]"]),
        ("np.bincount(y_tr).tolist()", ["np.bincount(y_te).tolist()", "np.bincount(y).tolist()"]),
        ("round(float(y_te.mean()), 2), round(float(y.mean()), 2)", ["0.5, round(float(y.mean()), 2)", "round(float(y.mean()), 2), 0.5", "1.0, round(float(y.mean()), 2)"]),
        ("int(y_te.sum()), len(y_te)", ["int(y_tr.sum()), len(y_tr)", "int(y.sum()), len(y)"]),
    ], "stratify=y keeps the class proportions the same in the training and test parts as in the full data, which matters when one class is rare.")


SCL = "Scaling features"
SCPRE = f"{NPRE}from sklearn.preprocessing import MinMaxScaler, StandardScaler\n"


@t(FE, SCL, 2)
def _(r):
    vals, v = uniq(r, 4, 1, 40), r.randint(0, 60)
    mm, sd = "MinMaxScaler().fit_transform(X)", "StandardScaler().fit_transform(X)"
    return expr(r, f"{SCPRE}X = np.array({col(vals)}, dtype=float)\n", [
        (f"{mm}.ravel().round(2).tolist()", [f"{sd}.ravel().round(2).tolist()", "(X / X.max()).ravel().round(2).tolist()", "(X - X.min()).ravel().round(2).tolist()"]),
        (f"{sd}.ravel().round(2).tolist()", [f"{mm}.ravel().round(2).tolist()", "(X - X.mean()).ravel().round(2).tolist()", "(X / X.std()).ravel().round(2).tolist()"]),
        ("StandardScaler().fit(X).mean_.round(2).tolist()", ["[float(np.median(X))]", "StandardScaler().fit(X).scale_.round(2).tolist()", "[0.0]"]),
        (f"float({mm}.min()), float({mm}.max())", ["float(X.min()), float(X.max())", "-1.0, 1.0", "0.0, float(X.max())"]),
        (f"round(float({sd}.std()), 2), round(float(abs({sd}.mean())), 2)", ["round(float(X.std()), 2), round(float(X.mean()), 2)", "0.0, 1.0", "1.0, 1.0"]),
        (f"MinMaxScaler().fit(X).transform([[{v}]]).round(2).tolist()", [f"[[{float(v)}]]", f"MinMaxScaler(clip=True).fit(X).transform([[{v}]]).round(2).tolist()", f"StandardScaler().fit(X).transform([[{v}]]).round(2).tolist()"]),
        ("StandardScaler().fit(X[:3]).transform(X[3:]).round(2).tolist()", ["StandardScaler().fit(X).transform(X[3:]).round(2).tolist()", "StandardScaler().fit_transform(X[:3])[-1:].round(2).tolist()", "X[3:].tolist()"]),
        ("StandardScaler().transform(X).shape", ["X.shape", "(4,)"]),
        ("StandardScaler().fit(X).scale_.round(2).tolist()", ["StandardScaler().fit(X).mean_.round(2).tolist()", "StandardScaler().fit(X).var_.round(2).tolist()", "[1.0]"]),
    ], "MinMaxScaler maps the fitted minimum to 0 and maximum to 1; StandardScaler subtracts the fitted mean and divides by the fitted standard deviation. A scaler must be fitted first, and it should be fitted on training data only and then reused on test data.")


ENC = "Encoding categories"


@t(FE, ENC, 2)
def _(r):
    cols = [r.choice(["red", "green", "blue", "black"]) for _ in range(5)]
    sizes = [r.choice("SML") for _ in range(5)]
    pre = ("import pandas as pd\nfrom sklearn.preprocessing import LabelEncoder, OneHotEncoder\n"
           f'df = pd.DataFrame({{"colour": {cols}, "size": {sizes}}})\n')
    new = 'pd.DataFrame({"colour": ["pink"]})'
    return expr(r, pre, [
        ('pd.get_dummies(df["colour"]).shape', ["df.shape", "(len(df), 1)", '(df["colour"].nunique(), df["colour"].nunique())']),
        ("pd.get_dummies(df).shape", ["df.shape", '(len(df), df["colour"].nunique())', "(len(df), 7)"]),
        ('list(pd.get_dummies(df["colour"]).columns)', ['df["colour"].unique().tolist()', 'df["colour"].tolist()']),
        ('pd.get_dummies(df["colour"], drop_first=True).shape[1]', ['df["colour"].nunique()', "1", "len(df)"]),
        ('LabelEncoder().fit_transform(df["colour"]).tolist()', ['pd.factorize(df["colour"])[0].tolist()', 'df["colour"].str.len().tolist()']),
        ('LabelEncoder().fit(df["colour"]).classes_.tolist()', ['df["colour"].unique().tolist()', 'df["colour"].tolist()']),
        ('OneHotEncoder().fit_transform(df[["colour"]]).shape', ["df.shape", "(len(df), 1)", '(df["colour"].nunique(), len(df))']),
        (f'float(OneHotEncoder(handle_unknown="ignore").fit(df[["colour"]]).transform({new}).toarray().sum())', ["1.0", 'float(df["colour"].nunique())']),
        (f'OneHotEncoder().fit(df[["colour"]]).transform({new}).shape', ['(1, df["colour"].nunique())', "(1, 1)"]),
        ('pd.get_dummies(df["colour"]).sum(axis=1).tolist()', ['pd.get_dummies(df["colour"]).sum(axis=0).tolist()', "[0, 0, 0, 0, 0]"]),
        ('df["size"].map({"S": 0, "M": 1, "L": 2}).tolist()', ['LabelEncoder().fit_transform(df["size"]).tolist()', 'pd.factorize(df["size"])[0].tolist()']),
        ('pd.get_dummies(df["colour"]).sum(axis=0).tolist()', ['df["colour"].value_counts().tolist()', 'pd.get_dummies(df["colour"]).sum(axis=1).tolist()']),
    ], "One-hot encoding makes one 0/1 column per category, in sorted order, with exactly one 1 per row. LabelEncoder numbers the categories in sorted order, not in order of appearance. A category unseen at fit time raises an error unless handle_unknown='ignore' is set.")


MIS = "Missing values"


@t(FE, MIS, 2)
def _(r):
    vals, holes = uniq(r, 5, 1, 30), r.sample(range(5), r.randint(1, 2))
    lit = "[" + ", ".join("[np.nan]" if i in holes else f"[{float(v)}]" for i, v in enumerate(vals)) + "]"
    imp = 'SimpleImputer(strategy="{}").fit_transform(X).ravel().round(2).tolist()'
    return body(r, f"{NPRE}from sklearn.impute import SimpleImputer\nfrom sklearn.linear_model import LinearRegression\nX = np.array({lit})\n", [
        (f"print({imp.format('mean')})", [f"print({imp.format('median')})", "print(np.nan_to_num(X).ravel().round(2).tolist())"]),
        (f"print({imp.format('median')})", [f"print({imp.format('mean')})", "print(np.nan_to_num(X).ravel().round(2).tolist())"]),
        ('print(SimpleImputer(strategy="constant", fill_value=0).fit_transform(X).ravel().tolist())', [f"print({imp.format('mean')})", "print(X[~np.isnan(X)].tolist())"]),
        ("print(SimpleImputer().fit(X).statistics_.round(2).tolist())", ['print(SimpleImputer(strategy="median").fit(X).statistics_.round(2).tolist())', "print([round(float(np.nansum(X)) / len(X), 2)])"]),
        ("print(int(np.isnan(X).sum()), X[~np.isnan(X)].size)", ["print(X[~np.isnan(X)].size, int(np.isnan(X).sum()))", f"print({len(holes)}, {len(vals)})"]),
        ("print(round(float(np.nanmean(X)), 2), float(np.mean(X)))", ["print(round(float(np.nanmean(X)), 2), round(float(np.nanmean(X)), 2))", "print(round(float(np.nansum(X)) / len(X), 2), float(np.mean(X)))"]),
        ("LinearRegression().fit(X, np.arange(len(X)))\nprint('fitted')", ["print('fitted')", "print(None)"]),
        ("print(SimpleImputer().fit_transform(X).shape, int(np.isnan(SimpleImputer().fit_transform(X)).sum()))", [f"print(({5 - len(holes)}, 1), 0)", f"print((5, 1), {len(holes)})"]),
    ], "SimpleImputer replaces NaN with a statistic learned from the non-missing values (the mean by default). np.mean returns nan if any value is missing, np.nanmean skips them, and most estimators refuse to fit on NaN.")


FMX = "Feature matrices"


@t(FE, FMX, 1)
def _(r):
    n = r.randint(4, 8)
    pre = ("import numpy as np\nimport pandas as pd\nfrom sklearn.linear_model import LinearRegression\nfrom sklearn.preprocessing import PolynomialFeatures\n"
           f'df = pd.DataFrame({{"a": {uniq(r, n, 1, 30)}, "b": {uniq(r, n, 1, 30)}, "city": {[r.choice(["Pune", "Delhi"]) for _ in range(n)]}, "target": {uniq(r, n, 1, 90)}}})\n')
    return body(r, pre, [
        ('print(df[["a", "b"]].values.shape)', [f"print(({n},))", f"print(({n}, 4))", f"print((2, {n}))"]),
        ('print(df["target"].values.shape)', [f"print(({n}, 1))", f"print((1, {n}))", f"print(({n}, 4))"]),
        ('print(df.drop(columns="target").shape)', [f"print(({n}, 4))", f"print(({n - 1}, 4))", f"print(({n}, 2))"]),
        ('print(df["a"].values.reshape(-1, 1).shape)', [f"print(({n},))", f"print((1, {n}))"]),
        ('LinearRegression().fit(df["a"], df["target"])\nprint("fitted")', ['print("fitted")', "print(None)"]),
        ('LinearRegression().fit(df[["a"]], df["target"])\nprint("fitted")', ['print("Raises ValueError")', "print(None)"]),
        ('print(PolynomialFeatures(degree=2).fit_transform(df[["a", "b"]]).shape)', [f"print(({n}, 4))", f"print(({n}, 2))", f"print(({n}, 5))"]),
        ('print(PolynomialFeatures(degree=2, include_bias=False).fit_transform(df[["a", "b"]]).shape)', [f"print(({n}, 4))", f"print(({n}, 6))", f"print(({n}, 3))"]),
        ('print(df.select_dtypes(include="number").shape[1])', ["print(4)", "print(2)", "print(1)"]),
        ('print(np.column_stack([df["a"], df["b"]]).shape)', [f"print((2, {n}))", f"print(({2 * n},))"]),
        ('print(df[["a"]].shape, df["a"].shape)', [f"print(({n},), ({n},))", f"print(({n}, 1), ({n}, 1))", f"print((1, {n}), ({n},))"]),
        ('LinearRegression().fit(df[["a", "city"]], df["target"])\nprint("fitted")', ['print("fitted")', "print(None)"]),
    ], "scikit-learn wants X as a 2-D table (rows, features) and y as 1-D. A single column must be df[[\"a\"]] or reshape(-1, 1). Text columns must be encoded before fitting. Degree-2 polynomial features of two inputs are 1, a, b, a^2, ab, b^2.")


# ───────────────────────── Training models ─────────────────────────

FIT = "fit and predict"
LPRE = f"{NPRE}from sklearn.linear_model import LinearRegression\n"


@t(TR, FIT, 1)
def _(r):
    a, b, xs, v = r.choice([-3, -2, 2, 3, 4, 5]), r.randint(1, 9), uniq(r, 4, 0, 9), r.randint(10, 20)
    pre = f"{LPRE}X = np.array({col(xs)})\ny = np.array({[a * x + b for x in xs]})\nmodel = LinearRegression().fit(X, y)\n"
    return expr(r, pre, [
        ("model.coef_.round(2).tolist()", [f"[{float(b)}]", f"[{float(a)}, {float(b)}]", f"[{float(-a)}]"]),
        ("round(float(model.intercept_), 2)", [f"{float(a)}", "0.0", f"{float(a + b)}"]),
        (f"model.predict([[{v}]]).round(2).tolist()", [f"[{float(a * v)}]", f"[{float(v + b)}]", f"[{float(a * (v + b))}]"]),
        ("model.predict(X).shape", ["X.shape", "(1,)", "(4, 4)"]),
        ("round(model.score(X, y), 2)", ["0.0", "0.5", f"{float(a)}"]),
        (f"model.predict([{v}]).shape", ["(1,)", "(1, 1)"]),
        ("model.coef_.shape, X.shape", ["(4,), (4, 1)", "(1, 1), (4, 1)", "(1,), (4,)"]),
        (f"model.predict([[0], [1]]).round(2).tolist()", [f"[{float(a)}, {float(b)}]", f"[0.0, {float(a)}]", f"[{float(b)}, {float(b + 1)}]"]),
    ], "For data that lies exactly on y = a*x + b, LinearRegression recovers coef_ = [a] and intercept_ = b. predict needs a 2-D input, one row per sample, and returns one value per row.")


@t(TR, FIT, 2)
def _(r):
    a, b, c, p, q = r.randint(1, 5), r.randint(1, 5), r.randint(0, 9), r.randint(1, 4), r.randint(1, 4)
    X2 = [[0, 0], [1, 0], [0, 1], [p, q]]
    xs = uniq(r, 4, 0, 9)
    pre = (f"{LPRE}X = np.array({col(xs)})\ny = np.array({[2 * x + 1 for x in xs]})\n"
           f"X2 = np.array({X2})\ny2 = np.array({[a * u + b * w + c for u, w in X2]})\n")
    return body(r, pre, [
        ("model = LinearRegression()\nprint(model.predict(X).shape)", ["print(X.shape)", "print((len(X),))"]),
        ("model = LinearRegression()\nprint(model.fit(X, y) is model)", ["print(False)", "print(None)"]),
        ("model = LinearRegression().fit(X, y)\nprint(hasattr(model, 'coef_'), hasattr(LinearRegression(), 'coef_'))", ["print(True, True)", "print(False, False)", "print(False, True)"]),
        ("print(LinearRegression().fit(X2, y2).coef_.round(2).tolist())", [f"print([{float(b)}, {float(a)}])", f"print([{float(a)}, {float(b)}, {float(c)}])", f"print([{float(c)}])"]),
        ("print(round(float(LinearRegression().fit(X2, y2).intercept_), 2))", [f"print({float(a)})", f"print({float(a + b)})", "print(0.0)"]),
        (f"print(LinearRegression().fit(X2, y2).predict([[{p}, {q + 1}]]).round(2).tolist())", [f"print([{float(a * p + b * q + c)}])", f"print([{float(a * p + b * (q + 1))}])"]),
        ("print(LinearRegression().fit(X2, y2).coef_.shape)", ["print((4,))", "print((2, 2))", "print((1,))"]),
        ("print(LinearRegression().fit(X, y).predict(X2).shape)", ["print((4,))", "print((4, 2))"]),
    ], "An estimator learns its parameters in fit(); attributes ending in an underscore (coef_, intercept_) exist only afterwards, and predict before fit raises NotFittedError. A model fitted on k features needs k features at predict time.")


KNN = "Nearest neighbours"


@t(TR, KNN, 2)
def _(r):
    pts, ys = sorted(uniq(r, 6, 0, 20)), labels(r, 6)
    v, k = f"{r.randint(0, 20)}.3", r.choice([1, 3, 5])
    others = [x for x in (1, 3, 5) if x != k]
    clf, reg = "KNeighborsClassifier(n_neighbors={}).fit(X, y)", "KNeighborsRegressor(n_neighbors={}).fit(X, y * 10)"
    pre = f"{NPRE}from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor\nX = np.array({col(pts)})\ny = np.array({ys})\n"
    return expr(r, pre, [
        (f"{clf.format(k)}.predict([[{v}]]).tolist()", [f"{clf.format(o)}.predict([[{v}]]).tolist()" for o in others] + ["[int(y.mean() >= 0.5)]"]),
        (f"{clf.format(3)}.predict_proba([[{v}]]).round(2).tolist()", [f"{clf.format(1)}.predict_proba([[{v}]]).round(2).tolist()", f"{clf.format(5)}.predict_proba([[{v}]]).round(2).tolist()"]),
        (f"{reg.format(k)}.predict([[{v}]]).round(2).tolist()", [f"{reg.format(o)}.predict([[{v}]]).round(2).tolist()" for o in others]),
        (f"{clf.format(1)}.score(X, y)", [f"round({clf.format(3)}.score(X, y), 2)", "0.5", "0.0"]),
        (f"{clf.format(7)}.predict([[{v}]]).tolist()", [f"{clf.format(5)}.predict([[{v}]]).tolist()", f"{clf.format(1)}.predict([[{v}]]).tolist()"]),
        (f"np.abs(X.ravel() - {v}).argsort()[:{k}].tolist()", [f"np.abs(X.ravel() - {v}).argsort()[-{k}:].tolist()", f"list(range({k}))"]),
        (f"sorted(X.ravel()[np.abs(X.ravel() - {v}).argsort()[:3]].tolist())", ["X.ravel()[:3].tolist()", "X.ravel()[-3:].tolist()"]),
        (f"round({clf.format(3)}.score(X, y), 2)", [f"{clf.format(1)}.score(X, y)", f"round({clf.format(5)}.score(X, y), 2)"]),
    ], "k-nearest neighbours predicts from the k training points closest to the query: a majority vote for classification, the mean for regression. With k = 1 every training point is its own nearest neighbour, so the training score is perfect. k cannot exceed the number of training samples.")


DTR = "Decision trees"


@t(TR, DTR, 2)
def _(r):
    a, b, a1 = r.randint(1, 9), r.randint(1, 9), 0
    a1, b1 = r.randint(0, a), r.randint(0, b)
    if a1 + b1 == 0 or a1 + b1 == a + b:
        a1, b1 = a, 0
    gini, ent = "1 - np.sum(p ** 2)", "-np.sum(p * np.log2(p))"
    split = (f"def gini(c):\n    p = np.array(c) / sum(c)\n    return 1 - np.sum(p ** 2)\n\n"
             f"left, right = [{a1}, {b1}], [{a - a1}, {b - b1}]\nn = sum(left) + sum(right)\n")
    return body(r, NPRE, [
        (f"p = np.array([{a}, {b}]) / {a + b}\nprint(round(float({gini}), 3))", [f"p = np.array([{a}, {b}]) / {a + b}\nprint(round(float({ent}), 3))", f"print(round({max(a, b)} / {a + b}, 3))", f"print(round({min(a, b)} / {a + b}, 3))"]),
        (f"p = np.array([{a}, {b}]) / {a + b}\nprint(round(float({ent}), 3))", [f"p = np.array([{a}, {b}]) / {a + b}\nprint(round(float({gini}), 3))", f"print(round({max(a, b)} / {a + b}, 3))", "print(1.0)"]),
        (split + "print(round(float(sum(left) / n * gini(left) + sum(right) / n * gini(right)), 3))", [split + "print(round(float((gini(left) + gini(right)) / 2), 3))", split + f"print(round(float(gini([{a}, {b}])), 3))", split + "print(round(float(gini(left) + gini(right)), 3))"]),
        (split + f"print(round(float(gini([{a}, {b}]) - (sum(left) / n * gini(left) + sum(right) / n * gini(right))), 3))", [split + "print(round(float(sum(left) / n * gini(left) + sum(right) / n * gini(right)), 3))", split + f"print(round(float(gini([{a}, {b}])), 3))"]),
    ], "Gini impurity is 1 - sum(p^2) and entropy is -sum(p * log2 p); both are 0 for a pure node and largest for a 50/50 mix. A split is scored by the size-weighted average impurity of its children.")


@t(TR, DTR, 3)
def _(r):
    pts = sorted(uniq(r, r.randint(6, 8), 0, 30))
    ys, v = labels(r, len(pts)), f"{r.randint(0, 30)}.5"
    full, stump = "DecisionTreeClassifier(random_state=0).fit(X, y)", "DecisionTreeClassifier(max_depth=1, random_state=0).fit(X, y)"
    pre = f"{NPRE}from sklearn.tree import DecisionTreeClassifier\nX = np.array({col(pts)})\ny = np.array({ys})\n"
    return expr(r, pre, [
        (f"{full}.get_n_leaves()", ["len(X)", "len(set(y.tolist()))", f"{full}.get_depth()"]),
        (f"{full}.get_depth()", [f"{full}.get_n_leaves()", "len(X)", "1"]),
        (f"{stump}.get_n_leaves(), {stump}.get_depth()", ["1, 1", f"{full}.get_n_leaves(), 1", "2, 2"]),
        (f"{full}.score(X, y)", [f"round({stump}.score(X, y), 2)", "0.5", "0.0"]),
        (f"round({stump}.score(X, y), 2)", [f"{full}.score(X, y)", "0.5"]),
        (f"{full}.predict([[{v}]]).tolist()", [f"[{1 - 0}]" if False else "[int(y.mean() >= 0.5)]", "[int(y.mean() < 0.5)]"]),
        (f"{full}.score(X, y) >= {stump}.score(X, y), {full}.get_depth() >= {stump}.get_depth()", ["True, False", "False, True", "False, False"]),
    ], "An unrestricted tree keeps splitting until every leaf is pure, so it scores 1.0 on its own training data: that is memorising, not proof it generalises. max_depth=1 allows a single split (two leaves).")


GDS = "Gradient descent"


@t(TR, GDS, 3)
def _(r):
    a, lr, k, w0 = r.randint(1, 9), r.choice([0.1, 0.25, 0.5, 1.0, 1.5]), r.randint(1, 3), r.randint(0, 5)
    xs, n, bsz, ep = uniq(r, 3, 1, 5), r.randint(50, 999), r.choice([16, 32, 64]), r.randint(2, 9)
    ys = [2 * x for x in xs]
    step = "w, lr = {w0}.0, {lr}\nfor _ in range({k}):\n    grad = {g}\n    w {op} lr * grad\nprint(round(w, 3))"
    mk = lambda k_=k, g=f"2 * (w - {a})", op="-=": step.format(w0=w0, lr=lr, k=k_, g=g, op=op)
    return body(r, "import math\nimport numpy as np\n", [
        (mk(), [mk(op="+="), mk(k_=k + 1), mk(g=f"(w - {a})")]),
        (f"x = np.array({xs})\ny = np.array({ys})\nw = 0.0\ngrad = -2 * np.mean(x * (y - w * x))\nw -= {lr / 10} * grad\nprint(round(float(w), 3))",
         [f"x = np.array({xs})\ny = np.array({ys})\nprint(round(float(-2 * np.mean(x * y)), 3))", f"x = np.array({xs})\ny = np.array({ys})\nprint(round(float({lr / 10} * np.mean(x * y)), 3))", "print(2.0)"]),
        (f"n, batch, epochs = {n}, {bsz}, {ep}\nprint(math.ceil(n / batch) * epochs)", [f"print({n // bsz * ep})", f"print({n * ep})", f"print({math_ceil(n, bsz)})"]),
        (f"w = {w0}.0\nlosses = []\nfor _ in range(3):\n    losses.append(round((w - {a}) ** 2, 3))\n    w -= {lr} * 2 * (w - {a})\nprint(losses)",
         [f"print([{float((w0 - a) ** 2)}] * 3)", f"w = {w0}.0\nlosses = []\nfor _ in range(3):\n    w -= {lr} * 2 * (w - {a})\n    losses.append(round((w - {a}) ** 2, 3))\nprint(losses)"]),
        (f"lr = {lr}\nfor epoch in range({k}):\n    lr *= 0.5\nprint(lr)", [f"print({lr * 0.5})", f"print({lr - 0.5 * k})", f"print({lr / (2 * k)})"]),
        (f"w = {w0}.0\nfor _ in range(50):\n    w -= {lr} * 2 * (w - {a})\nprint(abs(w - {a}) < 0.01)", ["print(None)"]),
    ], "Gradient descent repeats w = w - lr * gradient. A small learning rate creeps towards the minimum, a rate that is too large overshoots and can diverge. One epoch is one pass over the data: ceil(n / batch_size) updates.")


def math_ceil(n, b):
    return -(-n // b)


CLU = "Clustering and distances"


@t(TR, CLU, 2)
def _(r):
    pts = uniq(r, 6, 0, 30)
    cs, p, q = sorted(r.sample(pts, 2)), ints(r, 2, 0, 9), ints(r, 2, 0, 9)
    assign = f"pts = np.array({pts})\ncenters = np.array({cs})\nlabels = np.abs(pts[:, None] - centers).argmin(axis=1)\n"
    return body(r, NPRE, [
        (assign + "print(labels.tolist())", [assign + "print((1 - labels).tolist())", f"print((np.array({pts}) > {sum(pts) / 6}).astype(int).tolist())"]),
        (assign + "print([round(float(pts[labels == k].mean()), 2) for k in range(2)])", [f"print({[float(c) for c in cs]})", assign + "print([round(float(np.median(pts[labels == k])), 2) for k in range(2)])", f"print([{round(sum(pts) / 6, 2)}, {round(sum(pts) / 6, 2)}])"]),
        (assign + "print(np.bincount(labels).tolist())", ["print([3, 3])", assign + "print(np.bincount(1 - labels).tolist())"]),
        (f"a, b = np.array({p}), np.array({q})\nprint(round(float(np.sqrt(np.sum((a - b) ** 2))), 2))", [f"a, b = np.array({p}), np.array({q})\nprint(float(np.sum(np.abs(a - b))))", f"a, b = np.array({p}), np.array({q})\nprint(float(np.sum((a - b) ** 2)))"]),
        (f"a, b = np.array({p}), np.array({q})\nprint(int(np.sum(np.abs(a - b))))", [f"a, b = np.array({p}), np.array({q})\nprint(round(float(np.sqrt(np.sum((a - b) ** 2))), 2))", f"a, b = np.array({p}), np.array({q})\nprint(int(np.max(np.abs(a - b))))"]),
        (assign + "print(int(np.sum((pts - centers[labels]) ** 2)))", [assign + "print(int(np.sum(np.abs(pts - centers[labels]))))", assign + "print(int(np.sum((pts - pts.mean()) ** 2)))"]),
    ], "k-means alternates two steps: assign every point to its nearest centre, then move each centre to the mean of its points. Euclidean distance is the square root of the summed squared differences; Manhattan distance sums the absolute differences.")


@t(TR, CLU, 3)
def _(r):
    lo, hi = uniq(r, r.randint(2, 4), 0, 6), uniq(r, r.randint(2, 4), 40, 50)
    pts = lo + hi
    r.shuffle(pts)
    X2 = [[x, 2 * x + r.randint(0, 2)] for x in uniq(r, 5, 0, 9)]
    km = "KMeans(n_clusters=2, n_init=10, random_state=0).fit(X)"
    pre = f"{NPRE}from sklearn.cluster import KMeans\nfrom sklearn.decomposition import PCA\nX = np.array({col(pts)}, dtype=float)\nX2 = np.array({X2}, dtype=float)\n"
    return expr(r, pre, [
        (f"sorted(np.bincount({km}.labels_).tolist())", [f"[{len(pts) // 2}, {len(pts) - len(pts) // 2}]", f"[1, {len(pts) - 1}]", f"[{len(pts)}]"]),
        (f"{km}.cluster_centers_.shape", ["(2,)", f"({len(pts)}, 1)", "(1, 2)"]),
        (f"sorted({km}.cluster_centers_.ravel().round(2).tolist())", ["[float(X.min()), float(X.max())]", "[round(float(X.mean()), 2)] * 2", "sorted(np.percentile(X, [25, 75]).round(2).tolist())"]),
        (f"len(set({km}.labels_.tolist())), len({km}.labels_)", [f"{len(pts)}, 2", f"2, 2", f"{len(pts)}, {len(pts)}"]),
        ("PCA(n_components=1).fit_transform(X2).shape", ["X2.shape", "(1, 2)", "(5,)"]),
        ("round(float(PCA(n_components=2).fit(X2).explained_variance_ratio_.sum()), 2)", ["2.0", "0.5", "0.0"]),
        (f"{km}.predict([[1.0], [45.0]])[0] != {km}.predict([[1.0], [45.0]])[1]", ["None"]),
    ], "KMeans(n_clusters=2) returns one label per sample and one centre per cluster; with two well-separated groups each group becomes a cluster and its centre is the group mean. PCA(n_components=k) keeps k columns, and all components together explain 100% of the variance.")


PIP = "Pipelines and reproducibility"


@t(TR, PIP, 3)
def _(r):
    n, cv, s = r.choice([8, 10, 12, 14, 16, 20]), r.randint(2, 4), r.randint(0, 99)
    v = r.randint(0, n - 1)
    mk = "make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=1))"
    pre = (f"{NPRE}from sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.neighbors import KNeighborsClassifier\n"
           f"from sklearn.model_selection import cross_val_score, train_test_split\nX = np.arange({n}).reshape(-1, 1)\ny = (X.ravel() >= {n // 2}).astype(int)\n")
    return body(r, pre, [
        (f"pipe = {mk}\nprint(len(pipe.steps), pipe.steps[0][0])", ["print(2, 'scaler')", "print(1, 'standardscaler')", "print(2, 'kneighborsclassifier')"]),
        (f"pipe = {mk}.fit(X, y)\nprint(pipe.predict([[{v}]]).tolist())", [f"print([{1 - int(v >= n // 2)}])", f"print([{v}])"]),
        (f"print(cross_val_score(KNeighborsClassifier(n_neighbors=1), X, y, cv={cv}).shape)", [f"print(({n},))", "print(())", f"print(({cv}, {n}))"]),
        (f"a = np.random.default_rng({s}).integers(0, 100, 5)\nb = np.random.default_rng({s}).integers(0, 100, 5)\nprint(bool((a == b).all()))", ["print(False)", "print(None)"]),
        (f"pipe = {mk}\nprint(list(pipe.named_steps))", ["print(['scaler', 'knn'])", "print(['StandardScaler', 'KNeighborsClassifier'])", "print([0, 1])"]),
        (f"pipe = {mk}\nprint(pipe.predict(X).shape)", [f"print(({n},))", f"print(({n}, 1))"]),
        (f"rng = np.random.default_rng({s})\nidx = rng.permutation({n})\nprint(sorted(idx.tolist()) == list(range({n})), len(idx))", [f"print(False, {n})", f"print(True, {n - 1})"]),
        (f"a = train_test_split(X, random_state={s})[1].ravel().tolist()\nb = train_test_split(X, random_state={s})[1].ravel().tolist()\nprint(a == b, len(a))", [f"print(False, {-(-n // 4)})", f"print(True, {n // 4 + 1})", f"print(True, {n})"]),
        (f"pipe = {mk}.fit(X, y)\nprint(round(float(pipe.named_steps['standardscaler'].mean_[0]), 2))", ["print(0.0)", f"print({float(n // 2)})", f"print({float(n)})"]),
        (f"pipe = {mk}.fit(X[:{n // 2 + 2}], y[:{n // 2 + 2}])\nprint(round(float(pipe.named_steps['standardscaler'].mean_[0]), 2))", [f"print({(n - 1) / 2})", "print(0.0)"]),
    ], "A pipeline chains preprocessing and a model so that fit() fits every step on the same training data and predict() reuses them, which prevents leakage. A fixed seed or random_state makes shuffles and splits repeatable.")


# ───────────────────────── Evaluating models ─────────────────────────

MPRE = f"{NPRE}from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_score, recall_score\n"


def preds(r, n=None):
    """True and predicted labels where every metric is defined (each has both classes)."""
    n = n or r.randint(8, 10)
    return f"{MPRE}y_true = np.array({labels(r, n)})\ny_pred = np.array({labels(r, n)})\n"


@t(EV, "Classification metrics", 1)
def _(r):
    acc, pre_, rec, f1 = ("round({}_score(y_true, y_pred), 2)".format(m) for m in ("accuracy", "precision", "recall", "f1"))
    return expr(r, preds(r), [
        (acc, [pre_, rec, f1]), (pre_, [rec, acc, f1]), (rec, [pre_, acc, f1]), (f1, [pre_, rec, acc]),
        ("round(float((y_true == y_pred).mean()), 2)", [pre_, rec, "round(float((y_true != y_pred).mean()), 2)"]),
        ("int((y_true != y_pred).sum())", ["int((y_true == y_pred).sum())", "int(y_pred.sum())"]),
        ("round(precision_score(y_pred, y_true), 2)", [pre_, acc]),
        ("round(1 - accuracy_score(y_true, y_pred), 2)", [acc, "round(1 - recall_score(y_true, y_pred), 2)"]),
    ], "Accuracy is the share of predictions that are right. Precision = TP / (TP + FP): of the predicted positives, how many are real. Recall = TP / (TP + FN): of the real positives, how many were found. F1 is their harmonic mean.")


@t(EV, "Confusion matrix", 2)
def _(r):
    cm = "confusion_matrix(y_true, y_pred)"
    unpack = f"tn, fp, fn, tp = {cm}.ravel()\n"
    return body(r, preds(r), [
        (f"print({cm}.tolist())", [f"print({cm}.T.tolist())", f"print({cm}[::-1, ::-1].tolist())"]),
        (f"print({cm}.ravel().tolist())", [f"print({cm}.T.ravel().tolist())", f"print({cm}.ravel()[::-1].tolist())"]),
        (f"print({cm}[0, 1])", [f"print({cm}[1, 0])", f"print({cm}[1, 1])", f"print({cm}[0, 0])"]),
        (f"print({cm}[1, 0])", [f"print({cm}[0, 1])", f"print({cm}[1, 1])", f"print({cm}[0, 0])"]),
        (f"print(int(np.trace({cm})))", [f"print({cm}.sum())", f"print({cm}[0, 1] + {cm}[1, 0])"]),
        ("print(int(((y_true == 1) & (y_pred == 1)).sum()))", ["print(int(((y_true == 0) & (y_pred == 1)).sum()))", "print(int(((y_true == 1) & (y_pred == 0)).sum()))", "print(int(y_pred.sum()))"]),
        ("print(int(((y_true == 0) & (y_pred == 1)).sum()))", ["print(int(((y_true == 1) & (y_pred == 0)).sum()))", "print(int(((y_true == 1) & (y_pred == 1)).sum()))", "print(int(y_pred.sum()))"]),
        (unpack + "print(round(float(tp / (tp + fn)), 2))", [unpack + "print(round(float(tp / (tp + fp)), 2))", unpack + "print(round(float(tn / (tn + fp)), 2))", unpack + "print(round(float((tp + tn) / len(y_true)), 2))"]),
        (unpack + "print(round(float(tn / (tn + fp)), 2))", [unpack + "print(round(float(tp / (tp + fn)), 2))", unpack + "print(round(float(tp / (tp + fp)), 2))", unpack + "print(round(float(fp / (tn + fp)), 2))"]),
        (unpack + "print(int(fp), int(fn))", [unpack + "print(int(fn), int(fp))", unpack + "print(int(tp), int(tn))"]),
    ], "scikit-learn's confusion matrix has true classes as rows and predicted classes as columns: [[TN, FP], [FN, TP]]. The diagonal counts the correct predictions.")


@t(EV, "Regression metrics", 2)
def _(r):
    y, p = uniq(r, 4, 1, 15), ints(r, 4, 1, 15)
    pre = f"{NPRE}from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score\ny = np.array({y}, dtype=float)\np = np.array({p}, dtype=float)\n"
    return expr(r, pre, [
        ("mean_squared_error(y, p)", ["mean_absolute_error(y, p)", "float(np.sum((y - p) ** 2))", "round(float(np.sqrt(mean_squared_error(y, p))), 3)"]),
        ("mean_absolute_error(y, p)", ["mean_squared_error(y, p)", "float(np.sum(np.abs(y - p)))", "float(abs(np.mean(y - p)))"]),
        ("round(float(np.sqrt(mean_squared_error(y, p))), 3)", ["mean_squared_error(y, p)", "mean_absolute_error(y, p)"]),
        ("round(r2_score(y, p), 3)", ["round(r2_score(p, y), 3)", "round(1 - mean_squared_error(y, p), 3)", "round(float(np.corrcoef(y, p)[0, 1]), 3)"]),
        ("r2_score(y, y), mean_squared_error(y, y)", ["0.0, 1.0", "1.0, 1.0", "0.0, 0.0"]),
        ("round(r2_score(y, np.full(len(y), y.mean())), 3)", ["1.0", "0.5", "-1.0"]),
        ("float(np.abs(y - p).max()), float(np.abs(y - p).min())", ["float((y - p).max()), float((y - p).min())", "float(np.abs(y - p).min()), float(np.abs(y - p).max())"]),
    ], "MSE averages squared errors, MAE averages absolute errors, RMSE is the square root of MSE. R^2 is 1.0 for perfect predictions and 0.0 for a model that always predicts the mean; it can be negative for a model worse than that.")


CVL = "Cross-validation and leakage"


@t(EV, CVL, 3)
def _(r):
    n, k = r.randint(7, 23), r.randint(2, 5)
    a = r.choice([4, 6, 8])
    b, m = r.choice([a, 2 * a]), r.randint(3, n - 2)
    pre = (f"{NPRE}from sklearn.model_selection import KFold, LeaveOneOut, StratifiedKFold\nfrom sklearn.preprocessing import StandardScaler\n"
           f"X = np.arange({n}, dtype=float).reshape(-1, 1)\ny = np.array([0] * {a} + [1] * {b})\n")
    return expr(r, pre, [
        (f"[len(te) for _, te in KFold({k}).split(X)]", [f"[len(tr) for tr, _ in KFold({k}).split(X)]", f"[{n // k}] * {k}", f"[{-(-n // k)}] * {k}"]),
        (f"[len(tr) for tr, _ in KFold({k}).split(X)]", [f"[len(te) for _, te in KFold({k}).split(X)]", f"[{n - n // k}] * {k}", f"[{n}] * {k}"]),
        (f"len(list(KFold({k}).split(X))), len(list(LeaveOneOut().split(X)))", [f"{k}, {k}", f"{n}, {n}", f"{k}, {n - 1}"]),
        (f"list(KFold({k}).split(X))[0][1].tolist()", [f"list(KFold({k}).split(X))[-1][1].tolist()", f"list(range({n // k}))", f"list(range({k}))"]),
        (f"sum(len(te) for _, te in KFold({k}).split(X))", [f"{n * k}", f"{n * (k - 1)}", f"{k}"]),
        (f"len(list(KFold({n + 1}).split(X)))", [f"{n}", f"{n + 1}"]),
        (f"round(float(StandardScaler().fit(X[:{m}]).mean_[0]), 2), round(float(StandardScaler().fit(X).mean_[0]), 2)", [f"{(n - 1) / 2}, {(n - 1) / 2}", f"{(m - 1) / 2}, {(m - 1) / 2}", f"{(n - 1) / 2}, {(m - 1) / 2}"]),
        (f"[int(y[te].sum()) for _, te in StratifiedKFold(2).split(np.zeros(len(y)), y)]", [f"[int(y[te].sum()) for _, te in KFold(2).split(np.zeros(len(y)))]", f"[{b}, 0]", f"[{a // 2}, {a // 2}]"]),
        (f"sum(len(tr) for tr, _ in KFold({k}).split(X)) // {n}", [f"{k}", f"{n}", f"{k + 1}"]),
    ], "k-fold cross-validation splits the data into k folds; each fold is the test set once while the other k - 1 are the training set, so every sample is tested exactly once. Statistics such as a scaler's mean must come from the training folds only, or test information leaks in.")


BAS = "Baselines and thresholds"


@t(EV, BAS, 2)
def _(r):
    n = r.randint(8, 12)
    ones = r.randint(1, n // 2 - 1)
    y = [1] * ones + [0] * (n - ones)
    r.shuffle(y)
    yt, proba = labels(r, 5), [r.choice([0.05, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95]) for _ in range(5)]
    tt = r.choice([0.3, 0.5, 0.7])
    others = [x for x in (0.3, 0.5, 0.7) if x != tt]
    pre = (f"{NPRE}from sklearn.dummy import DummyClassifier\nfrom sklearn.metrics import precision_score, recall_score\n"
           f"y = np.array({y})\nyt = np.array({yt})\nproba = np.array({proba})\n")
    rec = "round(recall_score(yt, (proba >= {}).astype(int), zero_division=0), 2)"
    prc = "round(precision_score(yt, (proba >= {}).astype(int), zero_division=0), 2)"
    return expr(r, pre, [
        ("round(float(max(np.bincount(y)) / len(y)), 2)", ["round(float(min(np.bincount(y)) / len(y)), 2)", "0.5", "round(float(y.mean()), 2)"]),
        ("round(DummyClassifier(strategy='most_frequent').fit(np.zeros((len(y), 1)), y).score(np.zeros((len(y), 1)), y), 2)", ["round(float(y.mean()), 2)", "0.5", "0.0"]),
        (f"(proba >= {tt}).astype(int).tolist()", [f"(proba >= {o}).astype(int).tolist()" for o in others] + [f"(proba < {tt}).astype(int).tolist()"]),
        (f"int((proba >= {tt}).sum())", [f"int((proba >= {o}).sum())" for o in others] + [f"int((proba < {tt}).sum())"]),
        (rec.format(tt), [rec.format(o) for o in others] + [prc.format(tt)]),
        (prc.format(tt), [prc.format(o) for o in others] + [rec.format(tt)]),
        ("int(np.argmax(np.bincount(y))), int(np.bincount(y).max())", ["int(np.argmin(np.bincount(y))), int(np.bincount(y).min())", f"1, {ones}"]),
        (f"{rec.format(0.3)} >= {rec.format(0.7)}", ["None"]),
    ], "A model must beat the majority-class baseline: always predicting the most common class already scores its share of the data. Lowering the decision threshold predicts more positives, so recall can only rise or stay the same, usually at the cost of precision.")


@t(EV, "Overfitting signals", 2)
def _(r):
    tr = sorted(round(r.uniform(0.6, 1.0), 2) for _ in range(5))
    peak = r.randint(0, 4)
    va = [round(0.85 - 0.05 * abs(i - peak) - r.choice([0, 0.01, 0.02]), 2) for i in range(5)]
    vl = [round(0.3 + 0.1 * abs(i - peak) + r.choice([0, 0.01, 0.02]), 2) for i in range(6)]
    p = r.randint(1, 2)
    stop = (f"val_loss = {vl}\nbest, wait = float('inf'), 0\nfor epoch, loss in enumerate(val_loss, start=1):\n"
            f"    if loss < best:\n        best, wait = loss, 0\n    else:\n        wait += 1\n    if wait == {p}:\n        break\nprint(epoch)")
    return body(r, f"{NPRE}depths = [1, 2, 3, 4, 5]\ntrain = {tr}\nval = {va}\n", [
        ("print(depths[int(np.argmax(val))])", ["print(depths[int(np.argmax(train))])", "print(int(np.argmax(val)))", "print(depths[int(np.argmin(val))])"]),
        ("print(round(train[-1] - val[-1], 2))", ["print(round(train[0] - val[0], 2))", "print(round(val[-1] - train[-1], 2))", "print(round(max(train) - max(val), 2))"]),
        (f"val_loss = {vl}\nprint(int(np.argmin(val_loss)) + 1)", [f"print({len(vl)})", f"val_loss = {vl}\nprint(int(np.argmin(val_loss)))", f"val_loss = {vl}\nprint(int(np.argmax(val_loss)) + 1)"]),
        (stop, [f"print({len(vl)})", f"val_loss = {vl}\nprint(int(np.argmin(val_loss)) + 1)", f"val_loss = {vl}\nprint(int(np.argmin(val_loss)))"]),
        ("print(sum(t - v > 0.1 for t, v in zip(train, val)))", ["print(sum(t > v for t, v in zip(train, val)))", "print(sum(v - t > 0.1 for t, v in zip(train, val)))", "print(len(train))"]),
        ("print(max(val), depths[int(np.argmax(train))])", ["print(max(train), depths[int(np.argmax(val))])", "print(max(val), depths[int(np.argmax(val))])"]),
        ("print(round(float(np.mean(val)), 2) < round(float(np.mean(train)), 2))", ["print(None)"]),
    ], "Choose a model by its validation score, never its training score: training accuracy keeps rising with complexity while validation accuracy peaks and then falls. A large gap between the two is the sign of overfitting. Early stopping halts when validation loss stops improving for `patience` epochs.")


if __name__ == "__main__":
    bank.write(OUT)
