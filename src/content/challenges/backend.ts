import type { Challenge } from "../taxonomy";

export const challenges: Challenge[] = [
  // ---------- programming-fundamentals ----------
  {
    id: "programming-fundamentals-c1",
    skillId: "programming-fundamentals",
    topicId: "programming-fundamentals-control-flow",
    language: "python",
    title: "FizzBuzz list",
    brief:
      "Write fizzbuzz(n) that returns a list of strings for the numbers 1 to n. Use \"Fizz\" for multiples of 3, \"Buzz\" for multiples of 5, \"FizzBuzz\" for multiples of both, and the number itself as a string otherwise.\n\nExample: fizzbuzz(5) returns [\"1\", \"2\", \"Fizz\", \"4\", \"Buzz\"]. fizzbuzz(0) returns [].",
    starter: `def fizzbuzz(n):
    # your code
    pass`,
    solution: `def fizzbuzz(n):
    out = []
    for i in range(1, n + 1):
        if i % 15 == 0:
            out.append("FizzBuzz")
        elif i % 3 == 0:
            out.append("Fizz")
        elif i % 5 == 0:
            out.append("Buzz")
        else:
            out.append(str(i))
    return out`,
    checks: ["fizzbuzz(15)", "fizzbuzz(5)", "fizzbuzz(1)", "fizzbuzz(0)", "fizzbuzz(30)[-1]"],
    java: {
      brief:
        "Write fizzbuzz(n) that returns a List<String> for the numbers 1 to n. Use \"Fizz\" for multiples of 3, \"Buzz\" for multiples of 5, \"FizzBuzz\" for multiples of both, and the number itself as a string otherwise.\n\nExample: fizzbuzz(5) returns [\"1\", \"2\", \"Fizz\", \"4\", \"Buzz\"]. fizzbuzz(0) returns an empty list.",
      starter: `import java.util.*;

class Solution {
    static List<String> fizzbuzz(int n) {
        // your code
        return null;
    }
}`,
      solution: `import java.util.*;

class Solution {
    static List<String> fizzbuzz(int n) {
        List<String> out = new ArrayList<>();
        for (int i = 1; i <= n; i++) {
            if (i % 15 == 0) out.add("FizzBuzz");
            else if (i % 3 == 0) out.add("Fizz");
            else if (i % 5 == 0) out.add("Buzz");
            else out.add(String.valueOf(i));
        }
        return out;
    }
}`,
      checks: ["Solution.fizzbuzz(15)", "Solution.fizzbuzz(5)", "Solution.fizzbuzz(1)", "Solution.fizzbuzz(0)", "Solution.fizzbuzz(30).get(29)"],
      hints: [
        "Test the \"both\" case (i % 15 == 0) before the single cases, or the single case will win every time.",
        "Count with for (int i = 1; i <= n; i++) and add String.valueOf(i) for plain numbers.",
      ],
    },
    hints: [
      "Test the \"both\" case before the single cases, or the single case will win every time.",
      "range(1, n + 1) counts from 1 up to and including n.",
    ],
  },
  {
    id: "programming-fundamentals-c2",
    skillId: "programming-fundamentals",
    topicId: "programming-fundamentals-control-flow",
    language: "python",
    title: "Collatz steps",
    brief:
      "Write collatz_steps(n) for a positive integer n. Repeatedly replace n with n // 2 when it is even and 3 * n + 1 when it is odd, until n becomes 1. Return how many replacements that took.\n\nExample: collatz_steps(6) returns 8, because 6 -> 3 -> 10 -> 5 -> 16 -> 8 -> 4 -> 2 -> 1. collatz_steps(1) returns 0.",
    starter: `def collatz_steps(n):
    # your code
    pass`,
    solution: `def collatz_steps(n):
    steps = 0
    while n != 1:
        if n % 2 == 0:
            n //= 2
        else:
            n = 3 * n + 1
        steps += 1
    return steps`,
    checks: ["collatz_steps(1)", "collatz_steps(6)", "collatz_steps(7)", "collatz_steps(27)", "collatz_steps(97)"],
    java: {
      brief:
        "Write collatzSteps(n) for a positive integer n. Repeatedly replace n with n / 2 when it is even and 3 * n + 1 when it is odd, until n becomes 1. Return how many replacements that took.\n\nExample: collatzSteps(6) returns 8, because 6 -> 3 -> 10 -> 5 -> 16 -> 8 -> 4 -> 2 -> 1. collatzSteps(1) returns 0.",
      starter: `class Solution {
    static int collatzSteps(long n) {
        // your code
        return -1;
    }
}`,
      solution: `class Solution {
    static int collatzSteps(long n) {
        int steps = 0;
        while (n != 1) {
            n = n % 2 == 0 ? n / 2 : 3 * n + 1;
            steps++;
        }
        return steps;
    }
}`,
      checks: ["Solution.collatzSteps(1)", "Solution.collatzSteps(6)", "Solution.collatzSteps(7)", "Solution.collatzSteps(27)", "Solution.collatzSteps(97)"],
      hints: [
        "A while (n != 1) loop fits better than a for loop, because you do not know the step count in advance.",
        "n is a long so 3 * n + 1 cannot overflow on the bigger inputs.",
      ],
    },
    hints: [
      "A while loop that runs until n == 1 fits better than a for loop, because you do not know the step count in advance.",
      "Use // for integer division so n stays an int.",
    ],
  },
  {
    id: "programming-fundamentals-c3",
    skillId: "programming-fundamentals",
    topicId: "programming-fundamentals-data-structures",
    language: "python",
    title: "Group words by initial",
    brief:
      "Write group_by_initial(words) that returns a dict mapping each lowercase first letter to the list of words that start with it, in the order they appeared. Keep the words themselves unchanged.\n\nExample: group_by_initial([\"apple\", \"Banana\", \"avocado\"]) returns {\"a\": [\"apple\", \"avocado\"], \"b\": [\"Banana\"]}. The order of the keys does not matter.",
    starter: `def group_by_initial(words):
    # your code
    pass`,
    solution: `def group_by_initial(words):
    groups = {}
    for word in words:
        key = word[0].lower()
        groups.setdefault(key, []).append(word)
    return groups`,
    checks: [
      "sorted(group_by_initial(['apple', 'Banana', 'avocado', 'cherry', 'blueberry']).items())",
      "sorted(group_by_initial(['Zed', 'zoo', 'Zap']).items())",
      "sorted(group_by_initial(['one']).items())",
      "sorted(group_by_initial([]).items())",
    ],
    java: {
      brief:
        "Write groupByInitial(words) that returns a Map<String, List<String>> mapping each lowercase first letter to the list of words that start with it, in the order they appeared. Keep the words themselves unchanged.\n\nExample: groupByInitial(List.of(\"apple\", \"Banana\", \"avocado\")) returns {a=[apple, avocado], b=[Banana]}. The order of the keys does not matter.",
      starter: `import java.util.*;

class Solution {
    static Map<String, List<String>> groupByInitial(List<String> words) {
        // your code
        return null;
    }
}`,
      solution: `import java.util.*;

class Solution {
    static Map<String, List<String>> groupByInitial(List<String> words) {
        Map<String, List<String>> groups = new HashMap<>();
        for (String word : words) {
            String key = word.substring(0, 1).toLowerCase();
            groups.computeIfAbsent(key, k -> new ArrayList<>()).add(word);
        }
        return groups;
    }
}`,
      checks: [
        `Solution.groupByInitial(List.of("apple", "Banana", "avocado", "cherry", "blueberry"))`,
        `Solution.groupByInitial(List.of("Zed", "zoo", "Zap"))`,
        `Solution.groupByInitial(List.of("one"))`,
        `Solution.groupByInitial(List.of())`,
      ],
      hints: [
        "map.computeIfAbsent(key, k -> new ArrayList<>()) returns the list for a key, creating it the first time.",
        "word.substring(0, 1).toLowerCase() gives the lowercase first letter as a String.",
      ],
    },
    hints: [
      "Look up the key first; if it is not there yet, start a new empty list before appending. dict.setdefault does both in one call.",
      "word[0].lower() gives the lowercase first letter.",
    ],
  },
  {
    id: "programming-fundamentals-c4",
    skillId: "programming-fundamentals",
    topicId: "programming-fundamentals-data-structures",
    language: "python",
    title: "Balanced brackets",
    brief:
      "Write balanced(s) that returns True if every opening bracket in s is closed by the matching bracket in the right order, and False otherwise. Only (), [] and {} count; any other character is ignored.\n\nExample: balanced(\"([]{})\") is True, balanced(\"([)]\") is False, balanced(\"((\") is False, and balanced(\"\") is True.",
    starter: `def balanced(s):
    # your code
    pass`,
    solution: `def balanced(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in "([{":
            stack.append(ch)
        elif ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
    return not stack`,
    checks: [
      "balanced('([]{})')",
      "balanced('([)]')",
      "balanced('((')",
      "balanced('')",
      "balanced('def f(a, b): return [a, {b: 1}]')",
      "balanced('())')",
    ],
    java: {
      brief:
        "Write balanced(s) that returns true if every opening bracket in s is closed by the matching bracket in the right order, and false otherwise. Only (), [] and {} count; any other character is ignored.\n\nExample: balanced(\"([]{})\") is true, balanced(\"([)]\") is false, balanced(\"((\") is false, and balanced(\"\") is true.",
      starter: `class Solution {
    static boolean balanced(String s) {
        // your code
        return false;
    }
}`,
      solution: `import java.util.*;

class Solution {
    static boolean balanced(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        for (char ch : s.toCharArray()) {
            if ("([{".indexOf(ch) >= 0) {
                stack.push(ch);
            } else if (")]}".indexOf(ch) >= 0) {
                char open = "([{".charAt(")]}".indexOf(ch));
                if (stack.isEmpty() || stack.pop() != open) return false;
            }
        }
        return stack.isEmpty();
    }
}`,
      checks: [
        `Solution.balanced("([]{})")`,
        `Solution.balanced("([)]")`,
        `Solution.balanced("((")`,
        `Solution.balanced("")`,
        `Solution.balanced("int f(int a) { return a[0]; }")`,
        `Solution.balanced("())")`,
      ],
      hints: [
        "Push every opening bracket onto an ArrayDeque; when you meet a closing one, the most recent opening bracket must match it.",
        "Two separate failure modes: a closing bracket with nothing to match, and leftovers on the stack at the end.",
      ],
    },
    hints: [
      "Push every opening bracket onto a list; when you meet a closing one, the most recent opening bracket must match it.",
      "Two separate failure modes: a closing bracket with nothing to match, and leftovers on the stack at the end.",
    ],
  },
  {
    id: "programming-fundamentals-c5",
    skillId: "programming-fundamentals",
    topicId: "programming-fundamentals-complexity",
    language: "python",
    title: "Count duplicates fast",
    brief:
      "Write count_dupes(items) that returns how many distinct values appear more than once in the list. It must stay fast for 100,000 items: one of the checks passes a list of 40,000 values, and a solution that scans the whole list once per item will take many seconds.\n\nExample: count_dupes([1, 2, 2, 3, 3, 3]) returns 2 (the values 2 and 3). count_dupes([]) returns 0.",
    starter: `def count_dupes(items):
    # your code
    pass`,
    solution: `def count_dupes(items):
    seen = set()
    dupes = set()
    for x in items:
        if x in seen:
            dupes.add(x)
        else:
            seen.add(x)
    return len(dupes)`,
    checks: [
      "count_dupes([1, 2, 2, 3, 3, 3])",
      "count_dupes([])",
      "count_dupes(['a', 'b', 'c'])",
      "count_dupes(list(range(20000)) * 2)",
      "count_dupes(list(range(30000)) + [5, 5, 7, 7, 7, 8])",
    ],
    java: {
      brief:
        "Write countDupes(items) that returns how many distinct values appear more than once in the array. It must stay fast for 100,000 items: one of the checks passes 40,000 values, and a solution that scans the whole array once per item will be far too slow.\n\nExample: countDupes(new int[]{1, 2, 2, 3, 3, 3}) returns 2 (the values 2 and 3). countDupes(new int[]{}) returns 0.",
      starter: `class Solution {
    static int countDupes(int[] items) {
        // your code
        return -1;
    }
}`,
      solution: `import java.util.*;

class Solution {
    static int countDupes(int[] items) {
        Set<Integer> seen = new HashSet<>();
        Set<Integer> dupes = new HashSet<>();
        for (int x : items) {
            if (!seen.add(x)) dupes.add(x);
        }
        return dupes.size();
    }
}`,
      checks: [
        "Solution.countDupes(new int[]{1, 2, 2, 3, 3, 3})",
        "Solution.countDupes(new int[]{})",
        "Solution.countDupes(new int[]{4, 5, 6})",
        "Solution.countDupes(IntStream.concat(IntStream.range(0, 20000), IntStream.range(0, 20000)).toArray())",
        "Solution.countDupes(IntStream.concat(IntStream.range(0, 30000), IntStream.of(5, 5, 7, 7, 7, 8)).toArray())",
      ],
      hints: [
        "A nested loop over the array is O(n squared). Checking membership in a HashSet is O(1).",
        "Set.add returns false when the value was already there, which tells you it is a duplicate.",
      ],
    },
    hints: [
      "items.count(x) inside a loop is O(n) per item, so the whole thing is O(n squared). Checking membership in a set is O(1).",
      "Keep one set of values you have seen and another of values you have seen twice; the answer is the size of the second.",
    ],
  },
  {
    id: "programming-fundamentals-c6",
    skillId: "programming-fundamentals",
    topicId: "programming-fundamentals-debugging",
    language: "python",
    title: "Fix second_largest",
    brief:
      "second_largest(nums) should return the second-largest distinct value in the list, or None if there are fewer than two distinct values. The implementation below returns wrong answers for several inputs. Fix it so every check passes.\n\nExample: second_largest([3, 1, 4, 4, 2]) returns 3, second_largest([5, 5, 5]) returns None, and second_largest([-2, -7, -1]) returns -2.",
    starter: `def second_largest(nums):
    largest = 0
    second = 0
    for n in nums:
        if n > largest:
            largest = n
        elif n > second:
            second = n
    return second`,
    solution: `def second_largest(nums):
    distinct = set(nums)
    if len(distinct) < 2:
        return None
    distinct.remove(max(distinct))
    return max(distinct)`,
    checks: [
      "second_largest([3, 1, 4, 4, 2])",
      "second_largest([5, 5, 5])",
      "second_largest([-2, -7, -1])",
      "second_largest([10])",
      "second_largest([1, 2])",
      "second_largest([])",
    ],
    java: {
      brief:
        "secondLargest(nums) should return the second-largest distinct value in the array, or null if there are fewer than two distinct values. The implementation below returns wrong answers for several inputs. Fix it so every check passes.\n\nExample: secondLargest(new int[]{3, 1, 4, 4, 2}) returns 3, secondLargest(new int[]{5, 5, 5}) returns null, and secondLargest(new int[]{-2, -7, -1}) returns -2.",
      starter: `class Solution {
    static Integer secondLargest(int[] nums) {
        int largest = 0;
        int second = 0;
        for (int n : nums) {
            if (n > largest) {
                largest = n;
            } else if (n > second) {
                second = n;
            }
        }
        return second;
    }
}`,
      solution: `import java.util.*;

class Solution {
    static Integer secondLargest(int[] nums) {
        TreeSet<Integer> distinct = new TreeSet<>();
        for (int n : nums) distinct.add(n);
        if (distinct.size() < 2) return null;
        distinct.pollLast();
        return distinct.last();
    }
}`,
      checks: [
        "Solution.secondLargest(new int[]{3, 1, 4, 4, 2})",
        "Solution.secondLargest(new int[]{5, 5, 5})",
        "Solution.secondLargest(new int[]{-2, -7, -1})",
        "Solution.secondLargest(new int[]{10})",
        "Solution.secondLargest(new int[]{1, 2})",
        "Solution.secondLargest(new int[]{})",
      ],
      hints: [
        "Trace the code by hand with {3, 1, 4, 4, 2} and with {-2, -7, -1}. Where does each wrong answer come from?",
        "Starting at 0 assumes positive numbers. A TreeSet keeps distinct values sorted, so the last two are the answer.",
      ],
    },
    hints: [
      "Trace the code by hand with [3, 1, 4, 4, 2] and with [-2, -7, -1]. Where does each wrong answer come from?",
      "Starting at 0 assumes the numbers are positive, and when a new largest appears the old largest has to go somewhere. You may also replace the loop with a different approach entirely.",
    ],
  },

  // ---------- data-cleaning ----------
  {
    id: "data-cleaning-c1",
    skillId: "data-cleaning",
    topicId: "data-cleaning-types-formats",
    language: "python",
    title: "Parse messy amounts",
    brief:
      "Write parse_amounts(values) that turns a list of amount strings into a list of floats. Strip currency symbols, letters, spaces and thousands separators, keeping only digits, a decimal point and a leading minus sign. If no valid number remains, use None for that entry.\n\nExample: parse_amounts([\"Rs 1,200\", \" 12.50 \", \"N/A\"]) returns [1200.0, 12.5, None].",
    starter: `def parse_amounts(values):
    # your code
    pass`,
    solution: `import re

def parse_amounts(values):
    out = []
    for v in values:
        cleaned = re.sub(r"[^0-9.\\-]", "", v)
        try:
            out.append(float(cleaned))
        except ValueError:
            out.append(None)
    return out`,
    checks: [
      "parse_amounts(['Rs 1,200', ' 12.50 ', '$300', '-45', '', 'N/A'])",
      "parse_amounts(['INR 2,50,000.75', '0', '-', '3.'])",
      "parse_amounts([])",
    ],
    hints: [
      "Build a cleaned string that keeps only the characters that belong in a number, then try float() on it.",
      "float() raises ValueError on an empty string or on '-', so wrap the conversion in try/except and append None in the except branch.",
    ],
  },
  {
    id: "data-cleaning-c2",
    skillId: "data-cleaning",
    topicId: "data-cleaning-missing-values",
    language: "python",
    title: "Fill gaps with the mean",
    brief:
      "Write fill_mean(values) for a list of numbers where None marks a missing value. Return a new list in which every None is replaced by the mean of the non-missing values, rounded to 2 decimal places; present values are kept as they are. If every value is missing, or the list is empty, return it unchanged.\n\nExample: fill_mean([10, None, 20]) returns [10, 15.0, 20].",
    starter: `def fill_mean(values):
    # your code
    pass`,
    solution: `def fill_mean(values):
    present = [v for v in values if v is not None]
    if not present:
        return list(values)
    mean = round(sum(present) / len(present), 2)
    return [mean if v is None else v for v in values]`,
    checks: [
      "fill_mean([10, None, 20])",
      "fill_mean([1, 2, None, 4, None])",
      "fill_mean([None, None])",
      "fill_mean([])",
      "fill_mean([3.5, 0, None])",
    ],
    hints: [
      "Compute the mean once from the present values before you build the output; do not count the None entries in the denominator.",
      "Test `v is None` rather than `not v`, otherwise a real 0 looks missing.",
    ],
  },
  {
    id: "data-cleaning-c3",
    skillId: "data-cleaning",
    topicId: "data-cleaning-duplicates-consistency",
    language: "python",
    title: "De-duplicate city names",
    brief:
      "Write unique_cities(names) that normalises each name by trimming surrounding whitespace, collapsing runs of inner whitespace to one space and converting to Title Case, then returns the distinct results sorted alphabetically. Entries that are blank after trimming are dropped.\n\nExample: unique_cities([\"Delhi\", \" delhi \", \"DELHI\", \"new  york\"]) returns [\"Delhi\", \"New York\"].",
    starter: `def unique_cities(names):
    # your code
    pass`,
    solution: `def unique_cities(names):
    cleaned = {" ".join(n.split()).title() for n in names}
    cleaned.discard("")
    return sorted(cleaned)`,
    checks: [
      "unique_cities(['Delhi', ' delhi ', 'DELHI', 'new  york', 'Mumbai', 'New York'])",
      "unique_cities(['  ', '', 'pune'])",
      "unique_cities(['san francisco', 'SAN FRANCISCO ', 'San  Francisco'])",
      "unique_cities([])",
    ],
    hints: [
      "' '.join(s.split()) trims the ends and collapses inner whitespace in one go.",
      "A set removes duplicates for you once every name is in the same form; sort it on the way out.",
    ],
  },
  {
    id: "data-cleaning-c4",
    skillId: "data-cleaning",
    topicId: "data-cleaning-outliers-validation",
    language: "python",
    title: "Flag outliers by z-score",
    brief:
      "Write outliers(values) that returns, sorted ascending, every value whose z-score is more than 2 in absolute value. Use the population standard deviation: the square root of the mean of the squared differences from the mean. If the list has fewer than two values, or the standard deviation is 0, return [].\n\nExample: outliers([10, 12, 11, 13, 12, 11, 10, 95]) returns [95].",
    starter: `def outliers(values):
    # your code
    pass`,
    solution: `import math

def outliers(values):
    if len(values) < 2:
        return []
    mean = sum(values) / len(values)
    std = math.sqrt(sum((v - mean) ** 2 for v in values) / len(values))
    if std == 0:
        return []
    return sorted(v for v in values if abs((v - mean) / std) > 2)`,
    checks: [
      "outliers([10, 12, 11, 13, 12, 11, 10, 95])",
      "outliers([-200, 5, 6, 7, 5, 6, 7, 6, 5, 6, 7, 300])",
      "outliers([5, 5, 5, 5])",
      "outliers([1, 2, 3, 4, 5])",
      "outliers([])",
    ],
    hints: [
      "Compute the mean and the standard deviation first, then test each value's (value - mean) / std against the cut-off.",
      "statistics.pstdev gives the population standard deviation; statistics.stdev is the sample one and will give different results.",
    ],
  },
];
