import type { Question } from "../taxonomy";

export const questions: Question[] = [
  // ───────── sql ─────────
  {
    id: "sql-p1",
    skillId: "sql",
    topicId: "sql-filtering",
    prompt:
      "The customers table has a name column. You need every customer whose name starts with \"Sa\", such as Sara and Samir. Which WHERE clause is correct?",
    options: ["WHERE name = 'Sa%'", "WHERE name LIKE 'Sa%'", "WHERE name LIKE '%Sa'", "WHERE name LIKE 'Sa_'"],
    answer: 1,
    explanation:
      "With LIKE, % matches any run of characters, so 'Sa%' means \"Sa followed by anything\". Using = treats % as an ordinary character and only matches a name spelled exactly Sa%, and 'Sa_' only matches three-letter names because _ stands for exactly one character.",
  },
  {
    id: "sql-p2",
    skillId: "sql",
    topicId: "sql-filtering",
    prompt: `The products table has four rows with price values 10, 15, 20 and 25. How many rows does this query return?\n\nSELECT * FROM products WHERE price BETWEEN 10 AND 20;`,
    options: ["1", "2", "3", "4"],
    answer: 2,
    explanation:
      "BETWEEN includes both endpoints, so 10, 15 and 20 all match. It is easy to assume the boundaries are left out, which would leave only 15.",
  },
  {
    id: "sql-p3",
    skillId: "sql",
    topicId: "sql-aggregation",
    prompt: `The orders table has 6 rows whose customer_id values are 1, 1, 2, 3, 3 and 3. What does this query return?\n\nSELECT COUNT(DISTINCT customer_id) FROM orders;`,
    options: ["3", "6", "1", "2"],
    answer: 0,
    explanation:
      "DISTINCT removes repeated values before counting, so the query counts the unique customers 1, 2 and 3. Without DISTINCT the count would be 6, which answers \"how many orders\" rather than \"how many customers\".",
  },
  {
    id: "sql-p4",
    skillId: "sql",
    topicId: "sql-aggregation",
    prompt: `The sales table has four rows of (region, product): (East, Pen), (East, Pen), (East, Book) and (West, Pen). How many rows does this query return?\n\nSELECT region, product, COUNT(*)\nFROM sales\nGROUP BY region, product;`,
    options: ["1", "2", "4", "3"],
    answer: 3,
    explanation:
      "Grouping by two columns makes one group for each distinct combination: East/Pen, East/Book and West/Pen. Answering 2 counts only the regions, which is what GROUP BY region on its own would give.",
  },
  {
    id: "sql-p5",
    skillId: "sql",
    topicId: "sql-joins",
    prompt: `Both customers and orders have a column called id; only customers has a name column. What happens when you run this query?\n\nSELECT id, name\nFROM customers c\nJOIN orders o ON o.customer_id = c.id;`,
    options: [
      "It returns the customer id, because customers is listed first",
      "It returns both id columns side by side",
      "It fails with an ambiguous column error; write c.id or o.id",
      "It returns the order id, because orders is joined last",
    ],
    answer: 2,
    explanation:
      "When a column name exists in more than one joined table, the database cannot tell which one you mean and refuses to guess. The order of the tables does not decide it, so qualify the column with its table alias, such as c.id.",
  },
  {
    id: "sql-p6",
    skillId: "sql",
    topicId: "sql-joins",
    prompt: `You want every customer listed, along with their 2024 orders where they have any. This query leaves out customers who have no 2024 orders. What is the fix?\n\nSELECT c.name, o.id\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nWHERE o.order_year = 2024;`,
    options: [
      "Move o.order_year = 2024 from WHERE into the ON clause",
      "Change the LEFT JOIN to an INNER JOIN",
      "Replace the WHERE keyword with HAVING",
      "Add DISTINCT after SELECT to restore the missing rows",
    ],
    answer: 0,
    explanation:
      "Customers without a 2024 order get NULL in o.order_year, and the WHERE filter then removes those rows, which undoes the LEFT JOIN. Putting the condition in ON limits which orders are matched while still keeping every customer. An INNER JOIN would drop the same customers.",
  },
  {
    id: "sql-p7",
    skillId: "sql",
    topicId: "sql-subqueries-windows",
    prompt: "Which query returns the customers who placed at least one order in 2024?",
    options: [
      "SELECT name FROM customers WHERE id = (SELECT customer_id FROM orders WHERE order_year = 2024);",
      "SELECT name FROM customers WHERE id IN orders.customer_id AND order_year = 2024;",
      "SELECT name FROM customers WHERE (SELECT COUNT(*) FROM orders WHERE order_year = 2024) > 0;",
      "SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE order_year = 2024);",
    ],
    answer: 3,
    explanation:
      "IN with a subquery checks each customer's id against the list of customer_ids that have a 2024 order. Using = with the same subquery only works when the subquery returns a single row; with many 2024 orders, most databases raise an error.",
  },
  {
    id: "sql-p8",
    skillId: "sql",
    topicId: "sql-subqueries-windows",
    prompt: `The employees table has 10 rows spread across 3 departments. How many rows does this query return?\n\nSELECT name, salary,\n  AVG(salary) OVER (PARTITION BY department) AS dept_avg\nFROM employees;`,
    options: ["3", "10", "1", "30"],
    answer: 1,
    explanation:
      "A window function calculates across a group of rows but keeps every original row, so all 10 employees come back, each with their department's average beside them. Collapsing to 3 rows is what GROUP BY department would do.",
  },

  // ───────── python ─────────
  {
    id: "python-p1",
    skillId: "python",
    topicId: "python-basics",
    prompt: `What does this code print?\n\nstock = {"pen": 5, "ink": 2}\nprint(stock.get("book", 0))`,
    options: ["None", "It raises a KeyError", "0", "book"],
    answer: 2,
    explanation:
      "dict.get returns its second argument when the key is missing, so this prints 0. A KeyError is what stock[\"book\"] would raise, and None is what get returns only when no default is given.",
  },
  {
    id: "python-p2",
    skillId: "python",
    topicId: "python-basics",
    prompt: `You read two quantities from a text file, so they arrive as strings. What does this code print?\n\na = "10"\nb = "5"\nprint(a + b)`,
    options: ["15", "105", "It raises a TypeError", "10 5"],
    answer: 1,
    explanation:
      "With two strings, + joins them end to end, giving 105. Python never converts strings to numbers on its own, so you need int(a) + int(b) to get 15.",
  },
  {
    id: "python-p3",
    skillId: "python",
    topicId: "python-numpy",
    prompt: `What does this code print?\n\nimport numpy as np\na = np.array([[1, 2, 3],\n              [4, 5, 6]])\nprint(a.sum(axis=0))`,
    options: ["21", "[ 6 15]", "[1 2 3 4 5 6]", "[5 7 9]"],
    answer: 3,
    explanation:
      "axis=0 collapses the rows, adding down each column: 1 + 4, 2 + 5 and 3 + 6. The row totals, 6 and 15, come from axis=1, and 21 is what sum() gives when no axis is passed.",
  },
  {
    id: "python-p4",
    skillId: "python",
    topicId: "python-numpy",
    prompt: `A sensor file has one missing reading, which was loaded as NaN. What does this code print?\n\nimport numpy as np\nreadings = np.array([1.0, np.nan, 3.0])\nprint(readings.mean())`,
    options: ["nan", "2.0", "About 1.33", "It raises a ValueError"],
    answer: 0,
    explanation:
      "Any arithmetic that involves NaN produces NaN, so a single missing value makes the whole mean NaN. NumPy does not skip missing values the way pandas does; use np.nanmean(readings) to get 2.0.",
  },
  {
    id: "python-p5",
    skillId: "python",
    topicId: "python-pandas-selection",
    prompt:
      "df has columns city, sales and returns. Which expression returns a DataFrame containing only the city and sales columns?",
    options: [`df["city", "sales"]`, `df[["city", "sales"]]`, `df.loc["city", "sales"]`, `df("city", "sales")`],
    answer: 1,
    explanation:
      "To select several columns you pass a list of names inside the indexing brackets, which is why there are two pairs of brackets. With a single pair, pandas looks for one column named by the pair (\"city\", \"sales\") and raises a KeyError.",
  },
  {
    id: "python-p6",
    skillId: "python",
    topicId: "python-pandas-selection",
    prompt:
      "tickets has a status column. Which expression returns the rows where status is either \"open\" or \"pending\"?",
    options: [
      `tickets[tickets["status"] == "open" or "pending"]`,
      `tickets[tickets["status"] in ["open", "pending"]]`,
      `tickets[tickets["status"] == ["open", "pending"]]`,
      `tickets[tickets["status"].isin(["open", "pending"])]`,
    ],
    answer: 3,
    explanation:
      "isin tests each value in the column against the list and returns a True/False mask you can filter with. The Python keywords in and or try to reduce the whole column to a single True or False, which pandas refuses with a ValueError.",
  },
  {
    id: "python-p7",
    skillId: "python",
    topicId: "python-pandas-groupby-merge",
    prompt:
      "orders has columns category and amount. You want one table showing both the total and the average amount for each category. Which expression does this?",
    options: [
      `orders.groupby("category")["amount"].agg(["sum", "mean"])`,
      `orders.groupby("category")["amount"].sum().mean()`,
      `orders["amount"].agg(["sum", "mean"])`,
      `orders.groupby(["sum", "mean"])["amount"]`,
    ],
    answer: 0,
    explanation:
      "agg with a list of function names applies each one to every group, giving one row per category and one column per function. Chaining .sum().mean() instead returns a single number, the average of the category totals.",
  },
  {
    id: "python-p8",
    skillId: "python",
    topicId: "python-pandas-groupby-merge",
    prompt:
      "jan and feb are DataFrames with identical columns, holding 100 and 120 rows of sales. Which expression stacks them into one 220-row DataFrame?",
    options: [`pd.merge(jan, feb)`, `jan + feb`, `pd.concat([jan, feb])`, `jan.join(feb)`],
    answer: 2,
    explanation:
      "concat stacks DataFrames on top of each other, which is what you want for files that share the same columns. merge matches rows on key columns to combine tables side by side, so here it would keep only rows that appear in both months.",
  },

  // ───────── excel ─────────
  {
    id: "excel-p1",
    skillId: "excel",
    topicId: "excel-references",
    prompt:
      "A1 contains 10 and B1 contains 20. To average them, a colleague types =A1+B1/2. What does the formula return, and why?",
    options: [
      "15, because Excel works from left to right",
      "30, because the division is ignored",
      "#VALUE!, because a formula cannot mix + and /",
      "20, because division is done before addition",
    ],
    answer: 3,
    explanation:
      "Excel follows standard operator precedence, so B1/2 is calculated first (10) and then added to A1, giving 20. To get the average of 15, add first using parentheses, =(A1+B1)/2, or use =AVERAGE(A1:B1).",
  },
  {
    id: "excel-p2",
    skillId: "excel",
    topicId: "excel-references",
    prompt: "A cell contains =B2+C2. A colleague deletes the whole of column C. What does the formula show now?",
    options: [
      "#REF!, because it points to a cell that no longer exists",
      "The value of B2 alone, because deleted cells count as zero",
      "#NAME?, because the column letter is no longer recognised",
      "The same result as before, because Excel keeps deleted values",
    ],
    answer: 0,
    explanation:
      "Deleting a column removes the cells the formula referred to, so Excel replaces that reference with #REF!. It does not treat the missing cell as zero; that is what happens with a cell that still exists but is empty.",
  },
  {
    id: "excel-p3",
    skillId: "excel",
    topicId: "excel-conditional",
    prompt: "Test scores are in B2:B100. Which formula counts how many scores are above 50?",
    options: [
      `=COUNT(B2:B100, ">50")`,
      `=COUNTIF(B2:B100, ">50")`,
      `=COUNTIF(">50", B2:B100)`,
      `=COUNTIF(B2:B100 > 50)`,
    ],
    answer: 1,
    explanation:
      "COUNTIF takes the range first and then the condition, which is written in quotes when it uses an operator such as >. COUNT has no condition at all; it simply counts every cell that holds a number.",
  },
  {
    id: "excel-p4",
    skillId: "excel",
    topicId: "excel-conditional",
    prompt:
      "Sales are in B2 and the customer rating is in C2. A rep earns a bonus only when sales are at least 1000 and the rating is at least 4. Which formula is correct?",
    options: [
      `=IF(B2>=1000 AND C2>=4, "Bonus", "No bonus")`,
      `=IF(OR(B2>=1000, C2>=4), "Bonus", "No bonus")`,
      `=IF(AND(B2>=1000, C2>=4), "Bonus", "No bonus")`,
      `=IF(B2>=1000, C2>=4, "Bonus")`,
    ],
    answer: 2,
    explanation:
      "In Excel, AND is a function that wraps the conditions and is true only when every one of them is true. Writing AND between the conditions is not valid formula syntax, and OR would pay the bonus when just one condition is met.",
  },
  {
    id: "excel-p5",
    skillId: "excel",
    topicId: "excel-lookups",
    prompt:
      "=VLOOKUP(E2, A2:C100, 3, FALSE) returns #N/A for ID 1042, even though you can see 1042 in column A. The IDs in column A are left-aligned with a small green triangle in the corner, while E2 is right-aligned. What is the most likely cause?",
    options: [
      "Column A holds the IDs as text and E2 is a number",
      "The column index 3 falls outside the range A2:C100",
      "An exact match needs column A sorted in ascending order",
      "VLOOKUP cannot be used to look up numeric IDs at all",
    ],
    answer: 0,
    explanation:
      "Excel treats the text \"1042\" and the number 1042 as different values, so an exact match finds nothing and returns #N/A; convert one side so both are the same type. Sorting is not the issue, because only approximate matches need sorted data.",
  },
  {
    id: "excel-p6",
    skillId: "excel",
    topicId: "excel-lookups",
    prompt:
      "A price list in A2:B50 accidentally contains product P-10 twice: in row 5 with price 50 and in row 40 with price 55. What does =VLOOKUP(\"P-10\", A2:B50, 2, FALSE) return?",
    options: [
      "55, the last match in the list",
      "105, the sum of both matches",
      "50, the first match from the top",
      "#N/A, because the ID is not unique",
    ],
    answer: 2,
    explanation:
      "With an exact match, VLOOKUP searches from the top and stops at the first row it finds, so it returns 50 and never reaches row 40. It gives no warning about duplicates, which is why lookup keys should be checked for uniqueness.",
  },
  {
    id: "excel-p7",
    skillId: "excel",
    topicId: "excel-pivot-tables",
    prompt:
      "You drag Revenue into the Values area of a PivotTable and it shows \"Count of Revenue\" instead of a total. What is the most likely cause and fix?",
    options: [
      "The PivotTable is out of date; click Refresh to turn the count into a real sum",
      "Revenue belongs in the Rows area; move it there to see the totals",
      "The source has too many rows to add up; filter the data first",
      "The Revenue column has blank or text cells; fix them and set the field to Sum",
    ],
    answer: 3,
    explanation:
      "Excel defaults to Count when a value field contains blank or text cells, because it cannot treat the column as purely numeric. Clean the source column, then change how the field is summarised to Sum. Refreshing alone does not change the summary function.",
  },
  {
    id: "excel-p8",
    skillId: "excel",
    topicId: "excel-pivot-tables",
    prompt:
      "A PivotTable shows Sum of Revenue for each region. Your manager wants to see each region's share of total revenue instead. What is the quickest correct way?",
    options: [
      "Change the field from Sum to Count",
      "Set Show Values As to % of Grand Total",
      "Sort the regions from largest to smallest",
      "Move Revenue from Values to Filters",
    ],
    answer: 1,
    explanation:
      "Show Values As keeps the underlying sum but displays each region as a percentage of the grand total, and it stays correct when the data is refreshed. Sorting only reorders the regions; it does not turn amounts into shares.",
  },

  // ───────── statistics ─────────
  {
    id: "statistics-p1",
    skillId: "statistics",
    topicId: "statistics-descriptive",
    prompt:
      "Two courier teams both average 30 minutes per delivery. Team A's delivery times have a standard deviation of 2 minutes and Team B's have a standard deviation of 12 minutes. What does this tell you?",
    options: [
      "Team B is faster overall than Team A",
      "Team A's delivery times are more consistent",
      "Team A made fewer deliveries than Team B",
      "Team B's average was calculated incorrectly",
    ],
    answer: 1,
    explanation:
      "Standard deviation measures how spread out values are around the mean, so Team A's times cluster tightly near 30 minutes while Team B's vary widely. It says nothing about which team is faster, since both have the same average.",
  },
  {
    id: "statistics-p2",
    skillId: "statistics",
    topicId: "statistics-descriptive",
    prompt: "A candidate's aptitude test report says they scored at the 90th percentile. What does that mean?",
    options: [
      "They answered 90% of the questions correctly",
      "They scored 90 marks out of 100",
      "They were ranked 90th among all test takers",
      "They outscored about 90% of test takers",
    ],
    answer: 3,
    explanation:
      "A percentile describes position relative to other people, not the share of questions answered correctly. Someone could get only 60% of the questions right and still be at the 90th percentile if the test was hard for everyone.",
  },
  {
    id: "statistics-p3",
    skillId: "statistics",
    topicId: "statistics-probability",
    prompt:
      "A company keeps two backup drives in different cities. Each has a 10% chance of failing in a given year, and the failures are independent. What is the probability that both fail in the same year?",
    options: ["1%", "20%", "10%", "5%"],
    answer: 0,
    explanation:
      "For independent events, the probability that both happen is the product of the two: 0.10 x 0.10 = 0.01. Adding them to get 20% is a common mistake; adding answers a different question, about either one of two events that cannot happen together.",
  },
  {
    id: "statistics-p4",
    skillId: "statistics",
    topicId: "statistics-probability",
    prompt:
      "A promotional wheel gives a $50 voucher on 10% of spins, a $10 voucher on 30% of spins and nothing on the remaining 60%. What is the expected cost to the company per spin?",
    options: ["$20", "$30", "$8", "$60"],
    answer: 2,
    explanation:
      "Expected value weights each outcome by its probability: 0.10 x 50 + 0.30 x 10 + 0.60 x 0 = 5 + 3 + 0 = 8. Simply averaging the three prizes gives $20, which wrongly treats every outcome as equally likely.",
  },
  {
    id: "statistics-p5",
    skillId: "statistics",
    topicId: "statistics-inference",
    prompt:
      "To measure satisfaction among all 50,000 customers, a team emails a survey. Only 2,000 reply, and most of them had contacted support recently. The average rating is low. What is the main problem with reporting this as the satisfaction of all customers?",
    options: [
      "2,000 replies are too few to say anything about 50,000 customers",
      "Ratings collected by email cannot be averaged",
      "The survey needed more questions to be reliable",
      "The people who replied are not representative of all customers",
    ],
    answer: 3,
    explanation:
      "Customers chose whether to reply, and those with recent support issues were more likely to, so the sample over-represents unhappy customers. A sample of 2,000 is large enough in itself; size cannot fix a sample that differs systematically from the population.",
  },
  {
    id: "statistics-p6",
    skillId: "statistics",
    topicId: "statistics-inference",
    prompt:
      "An A/B test with only 40 users per group gives a p-value of 0.30. A manager says, \"This proves the new design makes no difference.\" What is the best response?",
    options: [
      "Agreed: a p-value above 0.05 proves that the two designs perform the same",
      "Not quite: no difference was detected, but so small a test could miss a real one",
      "Not quite: a p-value of 0.30 means the new design is 30% better",
      "Agreed: there is a 70% chance that the two designs are identical",
    ],
    answer: 1,
    explanation:
      "A non-significant result means the data were not strong enough to rule out chance, not that the effect is zero. With 40 users per group the test has little power, so a real improvement could easily go undetected.",
  },
  {
    id: "statistics-p7",
    skillId: "statistics",
    topicId: "statistics-correlation-regression",
    prompt: "Across 60 products, the correlation between price and units sold is -0.85. What does this tell you?",
    options: [
      "The relationship is weak, because the value is negative",
      "Raising the price by 1% cuts units sold by 85%",
      "Higher-priced products strongly tend to sell fewer units",
      "85% of the products sell fewer units than average",
    ],
    answer: 2,
    explanation:
      "The sign of a correlation gives the direction and its distance from zero gives the strength, so -0.85 is a strong negative relationship. A negative value does not mean weak; -0.85 is just as strong as +0.85.",
  },
  {
    id: "statistics-p8",
    skillId: "statistics",
    topicId: "statistics-correlation-regression",
    prompt:
      "A regression of delivery time on distance was fitted using deliveries between 1 km and 10 km, and it fits well. A colleague uses it to predict the delivery time for an 80 km trip. What is the main concern?",
    options: [
      "80 km is far outside the fitted range, where the pattern may not hold",
      "Regression can only predict values that already appear in the original data",
      "The model must be refitted with distance in metres first",
      "A model that fits well on short trips is too precise for long ones",
    ],
    answer: 0,
    explanation:
      "A fitted line is only supported by evidence inside the range of the data it was built on. At 80 km, different conditions such as highways or rest stops may change the relationship, so extrapolating that far is unreliable. Predicting new distances between 1 and 10 km is fine.",
  },

  // ───────── data-viz ─────────
  {
    id: "data-viz-p1",
    skillId: "data-viz",
    topicId: "data-viz-chart-selection",
    prompt:
      "You need to compare last year's revenue across 12 product categories so the reader can quickly see which are biggest and smallest. Which chart is the best choice?",
    options: [
      "A pie chart with 12 slices",
      "A line chart connecting the 12 categories",
      "A bar chart sorted from largest to smallest",
      "A scatter plot with categories on the x-axis",
    ],
    answer: 2,
    explanation:
      "Bars on a common baseline make it easy to compare sizes and read a ranking, especially when sorted. A pie chart with 12 slices forces readers to compare angles, which is hard once slices are similar in size.",
  },
  {
    id: "data-viz-p2",
    skillId: "data-viz",
    topicId: "data-viz-chart-selection",
    prompt:
      "You have 5,000 individual delivery times and want to see how they are spread: where most fall, and whether there is a long tail of slow deliveries. Which chart should you use?",
    options: [
      "A histogram of delivery times",
      "A pie chart of fast versus slow deliveries",
      "A single bar showing the average delivery time",
      "A line chart of the 5,000 deliveries in file order",
    ],
    answer: 0,
    explanation:
      "A histogram groups values into ranges and shows how many fall in each, revealing the shape, centre and tails of a distribution. A single bar for the average hides exactly the spread you want to see.",
  },
  {
    id: "data-viz-p3",
    skillId: "data-viz",
    topicId: "data-viz-design-principles",
    prompt:
      "A status chart marks on-track projects in green and at-risk projects in red, with no other difference between them. A colleague with color blindness cannot tell them apart. What is the best fix?",
    options: [
      "Make both the red and the green more saturated",
      "Ask readers to view the chart on a better screen",
      "Enlarge the chart and use a bigger title font",
      "Pick a colorblind-safe palette and add text labels",
    ],
    answer: 3,
    explanation:
      "Red-green is the most common form of color blindness, so color alone should never carry the meaning. A safer palette plus a second cue such as labels works for everyone. Stronger saturation does not help, because the two hues can still look alike.",
  },
  {
    id: "data-viz-p4",
    skillId: "data-viz",
    topicId: "data-viz-design-principles",
    prompt:
      "A bar chart in a report has a gradient background, heavy gridlines, a thick border, drop shadows on the bars and a legend for its single data series. Readers say it is hard to read. What should you do?",
    options: [
      "Add data labels in a second font so the values stand out",
      "Strip out the decoration that carries no information",
      "Switch to 3D bars so they stand out from the background",
      "Make the chart larger so every element has more room",
    ],
    answer: 1,
    explanation:
      "Every element that does not encode data competes with the bars for attention, so removing shadows, borders, backgrounds and a redundant legend makes the data easier to see. Making the chart bigger just enlarges the clutter.",
  },
  {
    id: "data-viz-p5",
    skillId: "data-viz",
    topicId: "data-viz-dashboards",
    prompt:
      "A dashboard tile shows \"Revenue this month: $1.2M\" and nothing else. Managers keep asking whether that is good or bad. What is the best improvement?",
    options: [
      "Show the figure to more decimal places",
      "Show it against a target or last year's figure",
      "Make the number larger and color it green",
      "Replace the tile with a table of every transaction",
    ],
    answer: 1,
    explanation:
      "A number on its own cannot be judged; a KPI becomes meaningful when it is compared with a target, a previous period or a trend. Coloring it green implies it is good without giving any evidence.",
  },
  {
    id: "data-viz-p6",
    skillId: "data-viz",
    topicId: "data-viz-dashboards",
    prompt:
      "Managers use a sales dashboard every morning. Occasionally the overnight data load fails, and the dashboard shows figures that are several days old without any sign. One manager made a decision on stale numbers. What is the most useful change?",
    options: [
      "Add more charts so stale figures are easier to spot",
      "Ask managers to check the source system each morning",
      "Hide the dashboard on days after a load might have failed",
      "Show a clear \"data last updated\" time on the dashboard",
    ],
    answer: 3,
    explanation:
      "Users cannot tell fresh data from stale data by looking at it, so the dashboard must say how current it is. Asking managers to verify the numbers by hand every day defeats the purpose of having a dashboard.",
  },
  {
    id: "data-viz-p7",
    skillId: "data-viz",
    topicId: "data-viz-storytelling",
    prompt:
      "You spent three weeks on a churn analysis and have five minutes to present it to a vice president. How should you open?",
    options: [
      "With the main finding and what you recommend doing about it",
      "With the data sources and cleaning steps, in the order you did them",
      "With every chart you produced, so that nothing is left out",
      "With the limitations of the analysis, to manage expectations",
    ],
    answer: 0,
    explanation:
      "Decision makers need the conclusion first; supporting detail can follow if they ask for it. Walking through your process in chronological order spends the time on how you worked rather than on what they should do.",
  },
  {
    id: "data-viz-p8",
    skillId: "data-viz",
    topicId: "data-viz-storytelling",
    prompt:
      "You are presenting to a sales team with no statistics background. Which sentence communicates your finding best?",
    options: [
      "The regression coefficient for follow-up calls is 0.69 (p < 0.01)",
      "Follow-up call timing is a statistically significant predictor of renewal",
      "Customers called within 24 hours renewed about twice as often as the rest",
      "The analysis rejects the null hypothesis for the follow-up variable",
    ],
    answer: 2,
    explanation:
      "A non-technical audience needs the finding in terms of what happens in their own work and how big the effect is. \"Statistically significant\" sounds impressive but tells the sales team neither the size of the effect nor what to do about it.",
  },

  // ───────── data-cleaning ─────────
  {
    id: "data-cleaning-p1",
    skillId: "data-cleaning",
    topicId: "data-cleaning-types-formats",
    prompt:
      "You are combining order files from a US office and a UK office. Both contain dates written like 03/04/2024. What should you do before merging them?",
    options: [
      "Confirm each file's format and parse it explicitly",
      "Let the tool guess the format for each value",
      "Treat every date as month first, the more common style",
      "Delete rows where the day and month could be swapped",
    ],
    answer: 0,
    explanation:
      "03/04/2024 is 4 March in the US and 3 April in the UK, and nothing in the value itself tells you which. Automatic guessing can silently mix both readings in one column, so find out each source's convention and convert to an unambiguous format such as 2024-04-03.",
  },
  {
    id: "data-cleaning-p2",
    skillId: "data-cleaning",
    topicId: "data-cleaning-types-formats",
    prompt: "You sort a quantity column in ascending order and get: 1, 10, 100, 2, 25, 3. What is wrong?",
    options: [
      "The sort was applied in descending order by mistake",
      "The column contains duplicate values that confuse the sort order",
      "The values are stored as text and sort character by character",
      "The column has hidden decimal places that change the order",
    ],
    answer: 2,
    explanation:
      "Text is sorted like words in a dictionary, so \"10\" and \"100\" come before \"2\" because they start with the character 1. Converting the column to a numeric type gives the expected order 1, 2, 3, 10, 25, 100.",
  },
  {
    id: "data-cleaning-p3",
    skillId: "data-cleaning",
    topicId: "data-cleaning-missing-values",
    prompt:
      "In a customer table, 30% of income values are missing, and almost all of the gaps belong to customers under 25. A teammate suggests deleting every row with a missing income. What is the main risk?",
    options: [
      "The file would become too small to analyse at all",
      "Young customers would be mostly removed, biasing results",
      "Deleting rows changes the data type of the income column",
      "The remaining incomes would have to be re-entered by hand",
    ],
    answer: 1,
    explanation:
      "When missing values are concentrated in one group, dropping those rows removes that group and skews every result toward the customers who remain. Always check who the missing values belong to before deciding how to handle them.",
  },
  {
    id: "data-cleaning-p4",
    skillId: "data-cleaning",
    topicId: "data-cleaning-missing-values",
    prompt:
      "A 10,000-row customer table has 25 columns. Dropping every row that has any missing value leaves only 3,100 rows. You find that an optional fax_number column, which your analysis does not use, is 65% empty. What should you do?",
    options: [
      "Keep the 3,100 complete rows, since complete data is more trustworthy",
      "Fill the empty fax numbers with 0 so the rows count as complete",
      "Fill the empty fax numbers with the most common fax number",
      "Only require values in the columns your analysis actually needs",
    ],
    answer: 3,
    explanation:
      "Dropping rows because of a gap in a column you never use throws away good data for no benefit. Limit the missing-value check to the fields that matter, or drop the unused column first. Filling in made-up fax numbers only hides the gaps.",
  },
  {
    id: "data-cleaning-p5",
    skillId: "data-cleaning",
    topicId: "data-cleaning-duplicates-consistency",
    prompt:
      "A report of sales by country shows separate rows for \"USA\", \"U.S.\", \"United States\" and \"usa\". What should you do?",
    options: [
      "Keep the row with the largest total and delete the others",
      "Leave them, because each spelling came from a different system",
      "Map all four spellings to one standard value, then regroup",
      "Sort the country column so the four rows sit together",
    ],
    answer: 2,
    explanation:
      "The four labels are the same country, so they must be standardised to one value for the totals to be right. Deleting the smaller rows would throw away real sales rather than combine them.",
  },
  {
    id: "data-cleaning-p6",
    skillId: "data-cleaning",
    topicId: "data-cleaning-duplicates-consistency",
    prompt:
      "An orders export has two rows for order_id 7781: one with status \"pending\" updated on 2 May, and one with status \"shipped\" updated on 4 May. Each order should appear once. What is the best way to deduplicate?",
    options: [
      "Keep the most recently updated row for each order_id",
      "Keep whichever row happens to appear first in the file",
      "Keep both rows, because they are not exactly identical",
      "Delete both rows, because the order cannot be trusted",
    ],
    answer: 0,
    explanation:
      "The rows are two snapshots of the same order, so the key is order_id and the latest update holds its current state. Keeping whichever row comes first depends on file order and may leave you with the outdated \"pending\" status.",
  },
  {
    id: "data-cleaning-p7",
    skillId: "data-cleaning",
    topicId: "data-cleaning-outliers-validation",
    prompt:
      "Most orders are around $200, but one is $48,000 and gets flagged as an outlier. You check the sales system and confirm it is a genuine bulk order from a large client. What should you do?",
    options: [
      "Delete it, because flagged outliers should always be removed",
      "Replace it with the average order value",
      "Change it to $480, assuming extra zeros were typed",
      "Keep it, and note its effect on averages when reporting",
    ],
    answer: 3,
    explanation:
      "An outlier rule only flags values worth investigating; it does not prove they are wrong. This order is real revenue, so removing or altering it would make the data less accurate. If it distorts the average, report the median or show results with and without it.",
  },
  {
    id: "data-cleaning-p8",
    skillId: "data-cleaning",
    topicId: "data-cleaning-outliers-validation",
    prompt:
      "After cleaning an orders table, you want a check that catches records where ship_date is earlier than order_date. Which validation does this?",
    options: [
      "A null check on both date columns",
      "A rule comparing the two columns in each row",
      "A type check that both columns are dates",
      "A uniqueness check on order_id",
    ],
    answer: 1,
    explanation:
      "Each date can be present, correctly typed and plausible on its own while the pair is still impossible. Only a cross-field rule such as ship_date >= order_date tests the relationship between the two columns.",
  },
];
