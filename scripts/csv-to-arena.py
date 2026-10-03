"""Turn the question-bank CSVs in data/ into the JSON the Arena loads.

    python3 scripts/csv-to-arena.py

Standard library only. Re-run after regenerating a bank; commit the JSON it writes.
"""
import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "content" / "arena"
# CSV file -> subject id used in the app.
BANKS = {
    "python-questions.csv": "python",
    "python-ml-questions.csv": "python-ml",
    "dbms-questions.csv": "dbms",
    "computing-fundamentals-questions.csv": "computing-fundamentals",
    "cloud-fundamentals-questions.csv": "cloud-fundamentals",
}

OUT.mkdir(parents=True, exist_ok=True)
for name, subject in BANKS.items():
    with open(ROOT / "data" / name, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    questions = []
    for r in rows:
        options = [r["option_a"], r["option_b"], r["option_c"], r["option_d"]]
        answer = "ABCD".index(r["answer"])
        difficulty = int(r["difficulty"])
        assert difficulty in (1, 2, 3), r["id"]
        assert len(set(options)) == 4, f"{r['id']}: options are not distinct"
        questions.append({
            "id": r["id"],
            "topic": r["subtopic"],
            "difficulty": difficulty,
            "prompt": r["prompt"],
            "options": options,
            "answer": answer,
            "explanation": r["explanation"],
        })
    assert len({q["id"] for q in questions}) == len(questions), f"{name}: duplicate ids"
    (OUT / f"{subject}.json").write_text(json.dumps(questions, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    by = {d: sum(q["difficulty"] == d for q in questions) for d in (1, 2, 3)}
    print(f"{subject}: {len(questions)} questions, difficulty {by}")
