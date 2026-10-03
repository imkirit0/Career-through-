import type { Challenge } from "../taxonomy";

export const challenges: Challenge[] = [
  // ---------- Python for Data ----------
  {
    id: "python-c1",
    skillId: "python",
    topicId: "python-basics",
    language: "python",
    title: "Most common word",
    brief:
      "Write top_word(text) that returns the word appearing most often in text, compared case-insensitively and returned in lower case. Words are separated by whitespace. If several words tie, return the one that comes first alphabetically; for an empty string return None.\n\nExample: top_word(\"The cat and the hat\") returns \"the\".",
    starter: `def top_word(text):\n    # your code\n    pass`,
    solution: `def top_word(text):\n    counts = {}\n    for word in text.lower().split():\n        counts[word] = counts.get(word, 0) + 1\n    if not counts:\n        return None\n    return min(counts, key=lambda w: (-counts[w], w))`,
    checks: [
      `top_word("The cat and the hat")`,
      `top_word("b a c")`,
      `top_word("Data data DATA science")`,
      `top_word("")`,
      `top_word("   solo   ")`,
    ],
    hints: [
      "Build a dict of word -> count first; dict.get(word, 0) saves an if.",
      "min() with a key that sorts by (-count, word) handles the tie-break in one go.",
    ],
  },
  {
    id: "python-c2",
    skillId: "python",
    topicId: "python-basics",
    language: "python",
    title: "Remove duplicates, keep order",
    brief:
      "Write dedupe(items) that returns a new list with duplicates removed, keeping only the first occurrence of each value and preserving the original order. The input list must not be modified.\n\nExample: dedupe([3, 1, 3, 2, 1]) returns [3, 1, 2].",
    starter: `def dedupe(items):\n    # your code\n    pass`,
    solution: `def dedupe(items):\n    seen = set()\n    result = []\n    for item in items:\n        if item not in seen:\n            seen.add(item)\n            result.append(item)\n    return result`,
    checks: [
      `dedupe([3, 1, 3, 2, 1])`,
      `dedupe(["a", "b", "a", "c", "b"])`,
      `dedupe([])`,
      `dedupe([7, 7, 7])`,
      `(lambda xs: (dedupe(xs), xs))([2, 2, 1])`,
    ],
    hints: [
      "list(set(items)) drops duplicates but loses the order, so track what you have seen separately.",
      "A set gives O(1) membership tests; a list gives the order. Use both.",
    ],
  },
  {
    id: "python-c3",
    skillId: "python",
    topicId: "python-numpy",
    language: "python",
    title: "Min-max scaling",
    brief:
      "NumPy would do this in one line; here do the same element-wise work over a plain list. Write scale(values) that rescales a list of numbers to the range 0 to 1 using (x - min) / (max - min), rounding each result to 3 decimals. If the list is empty return []; if all values are equal return a list of 0.0 of the same length.\n\nExample: scale([10, 20, 30]) returns [0.0, 0.5, 1.0].",
    starter: `def scale(values):\n    # your code\n    pass`,
    solution: `def scale(values):\n    if not values:\n        return []\n    lo, hi = min(values), max(values)\n    if hi == lo:\n        return [0.0] * len(values)\n    return [round((v - lo) / (hi - lo), 3) for v in values]`,
    checks: [
      `scale([10, 20, 30])`,
      `scale([2, 9, 4, 7])`,
      `scale([5])`,
      `scale([3, 3, 3])`,
      `scale([])`,
    ],
    hints: [
      "Compute min and max once, before the loop, then apply the formula to every element in a list comprehension.",
      "Guard the two edge cases before dividing: an empty list has no min, and equal values give a zero denominator.",
    ],
  },
  {
    id: "python-c4",
    skillId: "python",
    topicId: "python-pandas-selection",
    language: "python",
    title: "Filter rows and select columns",
    brief:
      "The data is a list of dicts, one dict per row, like df[df[\"sales\"] > n][fields] in pandas. Write select(rows, min_sales, fields) that keeps the rows whose \"sales\" value is strictly greater than min_sales and returns new dicts containing only the keys listed in fields, in the given order. Keep the original row order and do not modify the input.\n\nExample: with rows [{\"city\": \"Pune\", \"sales\": 120, \"rep\": \"A\"}, {\"city\": \"Agra\", \"sales\": 80, \"rep\": \"B\"}], select(rows, 100, [\"city\"]) returns [{\"city\": \"Pune\"}].",
    starter: `def select(rows, min_sales, fields):\n    # your code\n    pass`,
    solution: `def select(rows, min_sales, fields):\n    return [\n        {f: row[f] for f in fields}\n        for row in rows\n        if row["sales"] > min_sales\n    ]`,
    checks: [
      `select([{"city": "Pune", "sales": 120, "rep": "A"}, {"city": "Agra", "sales": 80, "rep": "B"}], 100, ["city"])`,
      `select([{"city": "Pune", "sales": 120, "rep": "A"}, {"city": "Agra", "sales": 80, "rep": "B"}, {"city": "Goa", "sales": 150, "rep": "C"}], 90, ["rep", "sales"])`,
      `select([{"city": "Pune", "sales": 120, "rep": "A"}], 120, ["city"])`,
      `select([], 0, ["city"])`,
      `select([{"city": "Pune", "sales": 120, "rep": "A"}], 0, ["city", "rep", "sales"])`,
    ],
    hints: [
      "A list comprehension with an if clause is the filter; a dict comprehension over fields is the column selection.",
      "Strictly greater means > not >=; the third example has a row exactly at the threshold.",
    ],
  },
  {
    id: "python-c5",
    skillId: "python",
    topicId: "python-pandas-groupby-merge",
    language: "python",
    title: "Group by and sum",
    brief:
      "The data is a list of dicts, one per row. Write total_by(rows, key, value) that works like df.groupby(key)[value].sum(): add up the value field for each distinct key. Skip rows whose value is None, the way pandas skips NaN. Return a list of [group, total] pairs sorted by group; return [] for no rows.\n\nExample: total_by([{\"region\": \"N\", \"sales\": 10}, {\"region\": \"S\", \"sales\": 20}, {\"region\": \"N\", \"sales\": 30}], \"region\", \"sales\") returns [[\"N\", 40], [\"S\", 20]].",
    starter: `def total_by(rows, key, value):\n    # your code\n    pass`,
    solution: `def total_by(rows, key, value):\n    totals = {}\n    for row in rows:\n        if row[value] is None:\n            continue\n        totals[row[key]] = totals.get(row[key], 0) + row[value]\n    return [[group, totals[group]] for group in sorted(totals)]`,
    checks: [
      `total_by([{"region": "N", "sales": 10}, {"region": "S", "sales": 20}, {"region": "N", "sales": 30}], "region", "sales")`,
      `total_by([{"region": "N", "sales": 10}, {"region": "S", "sales": 20}, {"region": "N", "sales": 30}, {"region": "S", "sales": None}], "region", "sales")`,
      `total_by([{"team": "b", "qty": 2.5}, {"team": "a", "qty": 1.5}, {"team": "b", "qty": 1}], "team", "qty")`,
      `total_by([{"region": "W", "sales": None}], "region", "sales")`,
      `total_by([], "region", "sales")`,
    ],
    hints: [
      "Accumulate into a dict keyed by the group value, then turn it into sorted pairs at the end.",
      "A row with a None value should neither add to the total nor create a group on its own.",
    ],
  },
  {
    id: "python-c6",
    skillId: "python",
    topicId: "python-pandas-groupby-merge",
    language: "python",
    title: "Left join two tables",
    brief:
      "Both tables are lists of dicts. Write left_join(left, right, key) that behaves like pd.merge(left, right, on=key, how=\"left\"): for every left row, in order, return a new dict with the left row's fields followed by the fields of the first right row with the same key value. Rows with no match are returned as a copy of the left row alone. Right rows with no partner are dropped. Do not modify the inputs.\n\nExample: left_join([{\"id\": 1, \"name\": \"Ann\"}, {\"id\": 2, \"name\": \"Bo\"}], [{\"id\": 2, \"city\": \"Pune\"}, {\"id\": 3, \"city\": \"Goa\"}], \"id\") returns [{\"id\": 1, \"name\": \"Ann\"}, {\"id\": 2, \"name\": \"Bo\", \"city\": \"Pune\"}].",
    starter: `def left_join(left, right, key):\n    # your code\n    pass`,
    solution: `def left_join(left, right, key):\n    lookup = {}\n    for row in right:\n        lookup.setdefault(row[key], row)\n    return [{**row, **lookup.get(row[key], {})} for row in left]`,
    checks: [
      `left_join([{"id": 1, "name": "Ann"}, {"id": 2, "name": "Bo"}], [{"id": 2, "city": "Pune"}, {"id": 3, "city": "Goa"}], "id")`,
      `left_join([{"id": 1, "name": "Ann"}, {"id": 2, "name": "Bo"}, {"id": 3, "name": "Cy"}], [{"id": 2, "city": "Pune"}, {"id": 3, "city": "Goa"}, {"id": 4, "city": "Agra"}], "id")`,
      `left_join([{"sku": "x", "qty": 2}], [], "sku")`,
      `left_join([], [{"id": 1, "city": "Goa"}], "id")`,
      `left_join([{"id": 5, "name": "Di"}], [{"id": 5, "city": "Pune"}, {"id": 5, "city": "Goa"}], "id")`,
    ],
    hints: [
      "Index the right table in a dict keyed by the join value first, so each left row needs one lookup instead of a scan.",
      "{**a, **b} builds a new merged dict without touching a or b; a missing match can merge with an empty dict.",
    ],
  },

  // ---------- Statistics ----------
  {
    id: "statistics-c1",
    skillId: "statistics",
    topicId: "statistics-descriptive",
    language: "python",
    title: "Mean, median and mode",
    brief:
      "Write summary(values) that returns [mean, median, mode] for a list of numbers, each rounded to 2 decimals. If several values tie for the mode, use the one that appears first in the list. Return None for an empty list.\n\nExample: summary([2, 4, 4, 6, 9]) returns [5, 4, 4]; summary([1, 2, 3, 4]) returns [2.5, 2.5, 1]. The statistics module is available.",
    starter: `def summary(values):\n    # your code\n    pass`,
    solution: `import statistics\n\ndef summary(values):\n    if not values:\n        return None\n    return [\n        round(statistics.mean(values), 2),\n        round(statistics.median(values), 2),\n        round(statistics.mode(values), 2),\n    ]`,
    checks: [
      `summary([2, 4, 4, 6, 9])`,
      `summary([1, 2, 3, 4])`,
      `summary([30, 32, 35, 38, 40, 400])`,
      `summary([7])`,
      `summary([])`,
    ],
    hints: [
      "statistics.mean, statistics.median and statistics.mode do the arithmetic; your job is the edge case and the rounding.",
      "The median of an even-length list is the average of the two middle values.",
    ],
  },
  {
    id: "statistics-c2",
    skillId: "statistics",
    topicId: "statistics-probability",
    language: "python",
    title: "Overall rate from segments",
    brief:
      "Each segment is a dict with \"visitors\" and \"buyers\" counts, e.g. mobile and desktop traffic. Write overall_rate(segments) that returns the probability that a randomly chosen visitor bought something: total buyers divided by total visitors, rounded to 4 decimals. Averaging the segment rates is wrong because the segments differ in size. Return 0.0 when there are no visitors at all.\n\nExample: overall_rate([{\"visitors\": 600, \"buyers\": 60}, {\"visitors\": 400, \"buyers\": 20}]) returns 0.08.",
    starter: `def overall_rate(segments):\n    # your code\n    pass`,
    solution: `def overall_rate(segments):\n    visitors = sum(s["visitors"] for s in segments)\n    if visitors == 0:\n        return 0.0\n    buyers = sum(s["buyers"] for s in segments)\n    return round(buyers / visitors, 4)`,
    checks: [
      `overall_rate([{"visitors": 600, "buyers": 60}, {"visitors": 400, "buyers": 20}])`,
      `overall_rate([{"visitors": 900, "buyers": 90}, {"visitors": 100, "buyers": 50}])`,
      `overall_rate([{"visitors": 3, "buyers": 1}])`,
      `overall_rate([{"visitors": 0, "buyers": 0}])`,
      `overall_rate([])`,
    ],
    hints: [
      "Sum the counts across all segments first, then divide once.",
      "Check the visitor total before dividing so an empty input cannot raise ZeroDivisionError.",
    ],
  },
  {
    id: "statistics-c3",
    skillId: "statistics",
    topicId: "statistics-inference",
    language: "python",
    title: "95% confidence interval for a mean",
    brief:
      "Write confidence_interval(values) that returns [low, high], the 95% confidence interval for the mean of a sample: mean +/- 1.96 * s / sqrt(n), where s is the sample standard deviation (the n - 1 version, statistics.stdev). Round both ends to 2 decimals. Return None when there are fewer than 2 values, since no spread can be estimated.\n\nExample: confidence_interval([10, 12, 14]) returns [9.74, 14.26].",
    starter: `def confidence_interval(values):\n    # your code\n    pass`,
    solution: `import math\nimport statistics\n\ndef confidence_interval(values):\n    n = len(values)\n    if n < 2:\n        return None\n    mean = statistics.mean(values)\n    margin = 1.96 * statistics.stdev(values) / math.sqrt(n)\n    return [round(mean - margin, 2), round(mean + margin, 2)]`,
    checks: [
      `confidence_interval([10, 12, 14])`,
      `confidence_interval([30, 28, 35, 31, 29, 33, 30, 32])`,
      `confidence_interval([5, 5, 5, 5])`,
      `confidence_interval([42])`,
      `confidence_interval([])`,
    ],
    hints: [
      "statistics.stdev already divides by n - 1; math.sqrt gives the root of the sample size.",
      "Work out the margin once, then subtract and add it to the mean.",
    ],
  },
  {
    id: "statistics-c4",
    skillId: "statistics",
    topicId: "statistics-correlation-regression",
    language: "python",
    title: "Pearson correlation",
    brief:
      "Write pearson(xs, ys) that returns the Pearson correlation coefficient between two equal-length lists of numbers, rounded to 3 decimals. It is the covariance divided by the product of the two standard deviations, and ranges from -1 to 1. Return None if there are fewer than 2 points or if either list has no variation (all values equal), since the coefficient is undefined then.\n\nExample: pearson([1, 2, 3], [2, 4, 6]) returns 1.0.",
    starter: `def pearson(xs, ys):\n    # your code\n    pass`,
    solution: `import math\n\ndef pearson(xs, ys):\n    n = len(xs)\n    if n < 2:\n        return None\n    mx = sum(xs) / n\n    my = sum(ys) / n\n    sxy = sum((x - mx) * (y - my) for x, y in zip(xs, ys))\n    sxx = sum((x - mx) ** 2 for x in xs)\n    syy = sum((y - my) ** 2 for y in ys)\n    if sxx == 0 or syy == 0:\n        return None\n    return round(sxy / math.sqrt(sxx * syy), 3)`,
    checks: [
      `pearson([1, 2, 3], [2, 4, 6])`,
      `pearson([1, 2, 3, 4, 5], [10, 8, 6, 4, 2])`,
      `pearson([1, 2, 3, 4, 5, 6], [2, 4, 5, 4, 5, 7])`,
      `pearson([3, 3, 3], [1, 2, 3])`,
      `pearson([1], [1])`,
    ],
    hints: [
      "Centre both lists by subtracting their means, then the coefficient is sum(dx * dy) / sqrt(sum(dx**2) * sum(dy**2)).",
      "Scaling does not change correlation: the first example is exactly 1.0, the second exactly -1.0.",
    ],
  },
];
