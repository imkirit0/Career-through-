import type { Question } from "../../taxonomy";

export const questions: Question[] = [
  // ---------- SQL ----------
  {
    id: "sql-q9",
    skillId: "sql",
    topicId: "sql-filtering",
    prompt: `The employees table has 6 rows. Their city values are 'Pune', 'Pune', 'Delhi', 'Kochi', NULL and NULL. How many rows does this query return?\n\nSELECT * FROM employees WHERE city <> 'Pune';`,
    options: ["0", "2", "4", "6"],
    answer: 1,
    explanation:
      "Only Delhi and Kochi pass. NULL <> 'Pune' evaluates to UNKNOWN, not true, so the two NULL rows are left out; add OR city IS NULL if you want them.",
  },
  {
    id: "sql-q10",
    skillId: "sql",
    topicId: "sql-filtering",
    prompt: `The students table has four rows of (name, section, marks): (Asha, A, 70), (Ben, B, 90), (Chitra, A, 85) and (Dev, B, 60). Which name is in the first row of the result?\n\nSELECT name\nFROM students\nORDER BY section, marks DESC;`,
    options: ["Asha", "Ben", "Dev", "Chitra"],
    answer: 3,
    explanation:
      "DESC applies only to marks. Rows are sorted by section ascending first, so section A comes first, and within A the higher marks (Chitra, 85) come before Asha (70).",
  },
  {
    id: "sql-q11",
    skillId: "sql",
    topicId: "sql-aggregation",
    prompt: `The orders table has five rows of (customer, amount): (A, 100), (A, 300), (B, 50), (B, 60) and (C, 500). Which customers does this query return?\n\nSELECT customer, SUM(amount)\nFROM orders\nWHERE amount >= 100\nGROUP BY customer\nHAVING COUNT(*) >= 2;`,
    options: ["Only A", "A and B", "A and C", "A, B and C"],
    answer: 0,
    explanation:
      "WHERE runs first and removes both of B's orders, leaving A with 2 rows and C with 1. HAVING then keeps only groups with at least 2 remaining rows, which is A.",
  },
  {
    id: "sql-q12",
    skillId: "sql",
    topicId: "sql-aggregation",
    prompt: `The orders table has five rows of (status, amount): (paid, 100), (paid, 200), (cancelled, 50), (paid, 150) and (cancelled, 300). What does this query return?\n\nSELECT\n  SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS paid_total,\n  COUNT(*) AS orders\nFROM orders;`,
    options: ["450, 3", "800, 5", "450, 5", "800, 3"],
    answer: 2,
    explanation:
      "The CASE expression changes what is added (100 + 200 + 150 = 450) but does not filter any rows, so COUNT(*) still counts all 5 orders.",
  },
  {
    id: "sql-q13",
    skillId: "sql",
    topicId: "sql-joins",
    prompt: `employees has 4 rows whose dept_id values are 1, 1, 2 and NULL. departments has 3 rows with id 1, 2 and 3. How many rows does this query return?\n\nSELECT e.name, d.name\nFROM employees e\nJOIN departments d ON d.id = e.dept_id;`,
    options: ["4", "5", "3", "12"],
    answer: 2,
    explanation:
      "An inner join keeps only matching pairs: two employees match department 1 and one matches department 2. The employee with a NULL dept_id and department 3 have no match, so both are dropped.",
  },
  {
    id: "sql-q14",
    skillId: "sql",
    topicId: "sql-joins",
    prompt: `customers has two rows, A and B. Customer A has 2 orders and customer B has none. What is the value of n in customer B's row?\n\nSELECT c.name, COUNT(o.id) AS n\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nGROUP BY c.name;`,
    options: ["0", "1", "NULL", "There is no row for B"],
    answer: 0,
    explanation:
      "The LEFT JOIN keeps B as one row with NULL order columns, and COUNT(o.id) ignores NULLs, so B gets 0. COUNT(*) would wrongly report 1 because it counts that placeholder row.",
  },
  {
    id: "sql-q15",
    skillId: "sql",
    topicId: "sql-subqueries-windows",
    prompt: `The sales table has three rows of (day_no, amount): (1, 100), (2, 50) and (3, 200). What is the value of t in the row for day_no 2?\n\nSELECT day_no,\n  SUM(amount) OVER (ORDER BY day_no) AS t\nFROM sales;`,
    options: ["50", "150", "250", "350"],
    answer: 1,
    explanation:
      "With ORDER BY inside OVER, SUM becomes a running total: every row up to and including the current one, so day 2 shows 100 + 50 = 150. Without the ORDER BY every row would show the grand total, 350.",
  },
  {
    id: "sql-q16",
    skillId: "sql",
    topicId: "sql-subqueries-windows",
    prompt: `The employees table has five rows of (name, dept, salary): (Asha, Sales, 50), (Ben, Sales, 70), (Chen, Sales, 60), (Dia, IT, 90) and (Eli, IT, 80). Which names does this query return?\n\nSELECT name\nFROM (\n  SELECT name,\n    ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) AS rn\n  FROM employees\n) t\nWHERE rn = 2;`,
    options: ["Ben and Dia", "Eli only", "Chen and Dia", "Chen and Eli"],
    answer: 3,
    explanation:
      "PARTITION BY restarts the numbering in each department, ordered from highest salary. The second-highest earner is Chen in Sales (after Ben) and Eli in IT (after Dia).",
  },

  // ---------- Python ----------
  {
    id: "python-q9",
    skillId: "python",
    topicId: "python-basics",
    prompt: `What does this code print?\n\nnums = [10, 20, 30, 40, 50]\nprint(nums[1:-1])`,
    options: ["[10, 20, 30, 40]", "[20, 30, 40, 50]", "[20, 30, 40]", "[20, 30]"],
    answer: 2,
    explanation:
      "A slice starts at index 1 (the value 20) and stops just before the end index. -1 refers to the last element, 50, which is therefore left out.",
  },
  {
    id: "python-q10",
    skillId: "python",
    topicId: "python-basics",
    prompt: `What does this code print?\n\ndef first_big(values, limit):\n    for v in values:\n        if v > limit:\n            return v\n    return None\n\nprint(first_big([4, 9, 2, 12], 5))`,
    options: ["9", "12", "[9, 12]", "None"],
    answer: 0,
    explanation:
      "return ends the function immediately, so the loop stops at the first value above 5, which is 9. It never reaches 12, and it does not collect the matches into a list.",
  },
  {
    id: "python-q11",
    skillId: "python",
    topicId: "python-numpy",
    prompt: `What does this code print?\n\nimport numpy as np\na = np.array([5, -2, 7, -1])\nprint(np.where(a < 0, 0, a))`,
    options: ["[0 -2 0 -1]", "[1 3]", "[5 7]", "[5 0 7 0]"],
    answer: 3,
    explanation:
      "np.where(condition, x, y) picks x where the condition is true and y elsewhere, so negative values become 0 and the rest are kept. The array keeps its length; nothing is filtered out.",
  },
  {
    id: "python-q12",
    skillId: "python",
    topicId: "python-numpy",
    prompt: `What is the value of a + b?\n\nimport numpy as np\na = np.array([[1, 2],\n              [3, 4]])\nb = np.array([10, 20])`,
    options: [
      "A ValueError, because the shapes differ",
      "[[11, 22], [13, 24]]",
      "[[11, 12], [23, 24]]",
      "[[11, 22], [3, 4]]",
    ],
    answer: 1,
    explanation:
      "Broadcasting stretches the 1D array b across every row of a, so [10, 20] is added to each row: [1 + 10, 2 + 20] and [3 + 10, 4 + 20].",
  },
  {
    id: "python-q13",
    skillId: "python",
    topicId: "python-pandas-selection",
    prompt: `df has four rows of (name, marks), in this order: (Asha, 70), (Ben, 90), (Chitra, 85), (Dev, 60). What does this return?\n\ndf.sort_values("marks", ascending=False).head(2)["name"].tolist()`,
    options: [`["Asha", "Ben"]`, `["Ben", "Chitra"]`, `["Dev", "Asha"]`, `["Ben", "Asha"]`],
    answer: 1,
    explanation:
      "Sorting by marks from highest to lowest gives Ben (90), Chitra (85), Asha (70), Dev (60). head(2) then keeps the first two rows of the sorted frame, not of the original.",
  },
  {
    id: "python-q14",
    skillId: "python",
    topicId: "python-pandas-selection",
    prompt: `What do big["sales"].loc[1] and big["sales"].iloc[1] return, in that order?\n\nimport pandas as pd\ndf = pd.DataFrame({"sales": [50, 200, 30, 400, 120]})\nbig = df[df["sales"] > 100]`,
    options: ["200 and 200", "400 and 400", "400 and 200", "200 and 400"],
    answer: 3,
    explanation:
      "Filtering keeps the original index labels, so big has labels 1, 3 and 4. loc[1] finds the row labelled 1 (200), while iloc[1] takes the second row by position (400).",
  },
  {
    id: "python-q15",
    skillId: "python",
    topicId: "python-pandas-groupby-merge",
    prompt: `orders has 3 rows whose customer_id values are 1, 1 and 2. customers has 3 rows whose customer_id values are 1, 2 and 2, because customer 2 was entered twice. How many rows does this return?\n\npd.merge(orders, customers, on="customer_id")`,
    options: ["2", "3", "4", "6"],
    answer: 2,
    explanation:
      "Each order is paired with every matching customer row. The two orders for customer 1 match one row each (2 rows), and the single order for customer 2 matches both duplicate rows (2 rows), giving 4.",
  },
  {
    id: "python-q16",
    skillId: "python",
    topicId: "python-pandas-groupby-merge",
    prompt: `df has five rows of (city, product, sales): (Pune, Pen, 10), (Pune, Ink, 40), (Delhi, Pen, 30), (Delhi, Ink, 5) and (Kochi, Pen, 45). What does this return?\n\ndf.groupby("city")["sales"].sum().sort_values(ascending=False).head(1)`,
    options: ["Pune 50", "Kochi 45", "Pen 85", "Delhi 35"],
    answer: 0,
    explanation:
      "Grouping by city gives totals of Pune 50, Delhi 35 and Kochi 45. Sorting those totals from largest to smallest puts Pune first, even though Kochi has the largest single row.",
  },

  // ---------- Excel ----------
  {
    id: "excel-q9",
    skillId: "excel",
    topicId: "excel-references",
    prompt:
      "B2, B3 and B4 contain 20, 30 and 50, and B5 contains =SUM(B2:B4). B6 is empty. C2 contains =B2/B5 and correctly shows 0.2. You copy C2 down to C3. What does C3 show?",
    options: ["0.3", "0.2", "#DIV/0!", "#REF!"],
    answer: 2,
    explanation:
      "Both references are relative, so C3 becomes =B3/B6. B6 is empty and counts as zero, which gives #DIV/0!. Writing =B2/$B$5 keeps the total locked and C3 would show 0.3.",
  },
  {
    id: "excel-q10",
    skillId: "excel",
    topicId: "excel-references",
    prompt:
      "A1, A2 and A4 contain 10, 20 and 30. A3 is an empty cell. What does =AVERAGE(A1:A4) return?",
    options: ["15", "20", "60", "#DIV/0!"],
    answer: 1,
    explanation:
      "AVERAGE skips empty cells instead of treating them as zero, so it divides the total of 60 by 3 values, not by 4 cells.",
  },
  {
    id: "excel-q11",
    skillId: "excel",
    topicId: "excel-conditional",
    prompt: `A2:A6 hold the regions East, West, East, East, West. In the same row order, B2:B6 hold the sales 500, 1200, 1500, 900, 2000. What does this formula return?\n\n=COUNTIFS(A2:A6, "East", B2:B6, ">=900")`,
    options: ["1", "4", "3", "2"],
    answer: 3,
    explanation:
      "COUNTIFS counts rows that meet every condition. The East rows have sales of 500, 1500 and 900, and two of those (1500 and 900) are at least 900, because >= includes the boundary.",
  },
  {
    id: "excel-q12",
    skillId: "excel",
    topicId: "excel-conditional",
    prompt: `A2:A6 contain the product names Pen, Pencil, Open, Pen drive and Paper. What does this formula return?\n\n=COUNTIF(A2:A6, "Pen*")`,
    options: ["3", "1", "4", "2"],
    answer: 0,
    explanation:
      "The * wildcard stands for any characters after \"Pen\", so the formula counts cells that begin with Pen: Pen, Pencil and Pen drive. Open only contains those letters in the middle, so it is not counted.",
  },
  {
    id: "excel-q13",
    skillId: "excel",
    topicId: "excel-lookups",
    prompt: `A grade table in A2:B5 is sorted by minimum marks: 0 gives "D", 40 gives "C", 60 gives "B" and 80 gives "A". What does this formula return?\n\n=VLOOKUP(75, A2:B5, 2, TRUE)`,
    options: [`"A"`, `"B"`, `"C"`, "#N/A"],
    answer: 1,
    explanation:
      "With TRUE, VLOOKUP finds the largest value in the first column that is less than or equal to the lookup value. For 75 that is 60, so it returns B; it does not round up to the nearest row.",
  },
  {
    id: "excel-q14",
    skillId: "excel",
    topicId: "excel-lookups",
    prompt: `A2:A5 contain Pen, Ink, Book and Bag. In the same row order, B2:B5 contain the prices 10, 25, 150 and 400. What does this formula return?\n\n=INDEX(B2:B5, MATCH("Book", A2:A5, 0))`,
    options: ["3", "25", "150", "400"],
    answer: 2,
    explanation:
      "MATCH returns 3 because Book is the third item in A2:A5. INDEX then returns the third value in B2:B5, which is 150. The position is counted within the range, not from row 1 of the sheet.",
  },
  {
    id: "excel-q15",
    skillId: "excel",
    topicId: "excel-pivot-tables",
    prompt:
      "A source table has five rows of (Region, Revenue): (East, 100), (East, 200), (East, 600), (West, 500) and (West, 700). A PivotTable has Region in Rows and Revenue in Values, summarised by Average. What does the Grand Total row show?",
    options: ["420", "450", "900", "2100"],
    answer: 0,
    explanation:
      "The Grand Total applies Average to all five source rows: 2100 / 5 = 420. It is not the average of the two region averages (300 and 600), which would give 450.",
  },
  {
    id: "excel-q16",
    skillId: "excel",
    topicId: "excel-pivot-tables",
    prompt:
      "A PivotTable has the order Date field in Rows, grouped by Months only (not by Years), with Sum of Revenue in Values. The source data runs from January 2023 to December 2024. What does the Jan row show?",
    options: [
      "Revenue for January 2023 only, the first January in the data",
      "Revenue for January 2024 only, the most recent January",
      "The average of the January 2023 and January 2024 revenue",
      "Revenue for January 2023 and January 2024 added together",
    ],
    answer: 3,
    explanation:
      "Grouping by Months alone puts every date with the same month name into one row, whatever its year. Group by Years as well as Months to keep the two Januaries apart.",
  },

  // ---------- Statistics ----------
  {
    id: "statistics-q9",
    skillId: "statistics",
    topicId: "statistics-descriptive",
    prompt: "What is the median of the dataset 3, 7, 8, 10, 12, 20?",
    options: ["8", "9", "10", "11.5"],
    answer: 1,
    explanation:
      "With an even number of values, the median is the average of the two middle values of the sorted data: (8 + 10) / 2 = 9. The mean of this dataset is 10.",
  },
  {
    id: "statistics-q10",
    skillId: "statistics",
    topicId: "statistics-descriptive",
    prompt:
      "Every one of a company's 40 employees gets the same flat raise of 5,000 a month. What happens to the mean and the standard deviation of monthly salaries?",
    options: [
      "Both the mean and the standard deviation rise by 5,000",
      "The mean stays the same and the standard deviation rises",
      "Both the mean and the standard deviation stay the same",
      "The mean rises by 5,000 and the standard deviation stays the same",
    ],
    answer: 3,
    explanation:
      "Adding the same amount to every value shifts the whole distribution, so the mean moves by that amount. The gaps between salaries do not change, so the spread, and therefore the standard deviation, is unchanged.",
  },
  {
    id: "statistics-q11",
    skillId: "statistics",
    topicId: "statistics-probability",
    prompt:
      "A website runs on 3 servers. Each has a 10% chance of failing today, and the failures are independent. What is the probability that at least one server fails today?",
    options: ["27.1%", "30%", "0.1%", "72.9%"],
    answer: 0,
    explanation:
      "Use the complement: the chance that none fails is 0.9 x 0.9 x 0.9 = 0.729, so at least one fails with probability 1 - 0.729 = 0.271. Adding 10% three times overcounts the days when more than one fails.",
  },
  {
    id: "statistics-q12",
    skillId: "statistics",
    topicId: "statistics-probability",
    prompt:
      "A spam filter is tested on 1,000 emails, of which 100 are spam. It flags 90 of the 100 spam emails, and it also flags 90 of the 900 genuine emails. If an email is flagged, what is the probability that it really is spam?",
    options: ["90%", "18%", "50%", "10%"],
    answer: 2,
    explanation:
      "180 emails are flagged in total and 90 of them are spam, so the probability is 90 / 180 = 50%. The 90% figure is the share of spam that gets flagged, which is a different question.",
  },
  {
    id: "statistics-q13",
    skillId: "statistics",
    topicId: "statistics-inference",
    prompt:
      "A random sample of 400 orders has a mean value of $500 and a standard deviation of $100. What is the standard error of the mean?",
    options: ["$0.25", "$20", "$100", "$5"],
    answer: 3,
    explanation:
      "The standard error is the standard deviation divided by the square root of the sample size: 100 / 20 = 5. It measures how much the sample mean would vary from sample to sample, not how much individual orders vary.",
  },
  {
    id: "statistics-q14",
    skillId: "statistics",
    topicId: "statistics-inference",
    prompt:
      "An A/B test reports a 95% confidence interval for the difference in conversion rate (B minus A) of -0.5 to +2.5 percentage points. Which conclusion is correct?",
    options: [
      "B is significantly better at the 5% level, because most of the interval lies above zero",
      "The difference is not significant at the 5% level, because the interval includes zero",
      "There is a 95% chance that B is exactly 1 point better than A, the middle of the interval",
      "A is significantly better at the 5% level, because the interval starts below zero",
    ],
    answer: 1,
    explanation:
      "The interval contains zero, so the data are consistent with no difference and the result is not significant at the 5% level. The interval gives a range of plausible differences, not a verdict for either page.",
  },
  {
    id: "statistics-q15",
    skillId: "statistics",
    topicId: "statistics-correlation-regression",
    prompt:
      "A regression fitted on monthly data gives: sales = 50 + 4 x ad_spend (both in thousands of dollars). In one month, ad spend was 10 and actual sales were 100. What is the residual (actual minus predicted) for that month?",
    options: ["-10", "90", "10", "40"],
    answer: 2,
    explanation:
      "The prediction is 50 + 4 x 10 = 90, and the residual is actual minus predicted: 100 - 90 = 10. A positive residual means the month did better than the line predicts.",
  },
  {
    id: "statistics-q16",
    skillId: "statistics",
    topicId: "statistics-correlation-regression",
    prompt:
      "Over 30 days, the correlation between daily temperature and a city's electricity use is close to 0. A scatter plot shows a clear U-shape: use is high on both cold days and hot days, and low on mild days. What is the correct conclusion?",
    options: [
      "Use is strongly related to temperature, but not in a straight line",
      "Temperature has no real effect on how much electricity is used",
      "The correlation must have been calculated wrongly for this data",
      "Thirty days is too few to show any relationship in the data",
    ],
    answer: 0,
    explanation:
      "The correlation coefficient only measures straight-line association. In a U-shape the falling half and the rising half cancel out, giving a value near 0 despite a strong relationship, which is why you should always plot the data.",
  },

  // ---------- Data Visualization ----------
  {
    id: "data-viz-q9",
    skillId: "data-viz",
    topicId: "data-viz-chart-selection",
    prompt:
      "HR wants to compare how salaries are spread within each of 5 departments: the median, the middle range and any extreme values. Which chart is the best choice?",
    options: [
      "A pie chart of total salary by department",
      "A line chart joining the five department averages",
      "A bar chart of the average salary per department",
      "A box plot for each department, side by side",
    ],
    answer: 3,
    explanation:
      "A box plot shows the median, the quartiles and the outliers for each group on a shared scale. A bar of averages reduces each department to a single number and hides the spread HR asked about.",
  },
  {
    id: "data-viz-q10",
    skillId: "data-viz",
    topicId: "data-viz-chart-selection",
    prompt:
      "A retailer sells through three channels: store, website and app. You need to show how each channel's share of total sales has changed over the last 8 quarters. Which chart is the best choice?",
    options: [
      "Eight pie charts, one for each quarter",
      "A 100% stacked bar chart with one bar per quarter",
      "A scatter plot of website sales against store sales",
      "A histogram of the quarterly sales totals",
    ],
    answer: 1,
    explanation:
      "Each 100% stacked bar shows one quarter's split, and placing the bars side by side makes the change in share over time easy to follow. Comparing slices across eight separate pies is slow and unreliable.",
  },
  {
    id: "data-viz-q11",
    skillId: "data-viz",
    topicId: "data-viz-design-principles",
    prompt:
      "In a bubble chart, each store's revenue is drawn as a circle. Store B has twice the revenue of Store A, so the designer gives B's circle twice the radius of A's. How many times larger is the area of B's circle?",
    options: ["2 times", "3 times", "4 times", "8 times"],
    answer: 2,
    explanation:
      "Area grows with the square of the radius, so doubling the radius makes the circle 4 times as large. Readers judge bubbles by area, so the value should be mapped to area, not radius, or differences are exaggerated.",
  },
  {
    id: "data-viz-q12",
    skillId: "data-viz",
    topicId: "data-viz-design-principles",
    prompt:
      "A report shows four small line charts side by side, one per region, and each chart has its own automatic y-axis. North sells ten times more than South, but the lines reach the same height and readers assume the regions are similar. What is the best fix?",
    options: [
      "Give all four charts the same y-axis scale",
      "Give each region's chart a different colour",
      "Remove the y-axis labels to reduce clutter",
      "Sort the four charts in alphabetical order",
    ],
    answer: 0,
    explanation:
      "Readers compare small multiples by the height of the marks, so the charts must share one scale for that comparison to be true. With separate automatic axes, every chart fills its frame whatever the real size of its values.",
  },
  {
    id: "data-viz-q13",
    skillId: "data-viz",
    topicId: "data-viz-dashboards",
    prompt:
      "Revenue was $80,000 last month and $100,000 this month. Which month-over-month change should the KPI tile show?",
    options: ["+20%", "+25%", "+80%", "+125%"],
    answer: 1,
    explanation:
      "Percentage change is measured against the earlier value: (100,000 - 80,000) / 80,000 = 25%. Dividing by this month's figure gives 20%, which is the wrong base.",
  },
  {
    id: "data-viz-q14",
    skillId: "data-viz",
    topicId: "data-viz-dashboards",
    prompt:
      "On 10 March, a dashboard tile compares \"March revenue so far\" with \"February revenue\" and shows -65% in red. Daily sales have actually been steady. What is the best fix?",
    options: [
      "Hide the comparison until the month has ended",
      "Compare it with the whole of March last year instead",
      "Compare 1-10 March with 1-10 February",
      "Change the tile colour from red to grey",
    ],
    answer: 2,
    explanation:
      "Ten days of revenue will always look small next to a full month. Comparing the same number of days in each period keeps the context while making the comparison like for like.",
  },
  {
    id: "data-viz-q15",
    skillId: "data-viz",
    topicId: "data-viz-storytelling",
    prompt:
      "Your analysis shows that 60% of refund requests come from orders delivered by one courier partner. You are presenting to the head of operations. Which closing slide is most useful?",
    options: [
      "A recommended action on that courier, with the refund cost it could save",
      "A table of every refund figure by courier, city and month",
      "A list of the data sources and queries used in the analysis",
      "A thank-you slide that invites questions on the method",
    ],
    answer: 0,
    explanation:
      "A data story should end with what the audience should do and what it is worth. Tables of detail and notes on method belong in an appendix, for anyone who asks.",
  },
  {
    id: "data-viz-q16",
    skillId: "data-viz",
    topicId: "data-viz-storytelling",
    prompt:
      "Complaints went from 2 last month to 4 this month, out of about 50,000 orders in each month. Which sentence gives readers the most honest picture?",
    options: [
      "Complaints have doubled in just one month, a clear sign that something has gone wrong",
      "Complaints are up 100% month over month, so urgent action is needed on quality",
      "The rise from 2 to 4 complaints shows that quality is falling sharply",
      "Complaints rose from 2 to 4 out of about 50,000 orders, still under 0.01%",
    ],
    answer: 3,
    explanation:
      "\"Doubled\" is arithmetically true but hides the tiny base: 4 in 50,000 is 0.008%. Giving the actual counts alongside the total lets readers judge the size of the change for themselves.",
  },

  // ---------- Data Cleaning ----------
  {
    id: "data-cleaning-q9",
    skillId: "data-cleaning",
    topicId: "data-cleaning-types-formats",
    prompt:
      "A weight column was loaded as text with the values \"2.5 kg\", \"900 g\" and \"1.2 kg\". You need a numeric column in kilograms. What should the cleaned column contain?",
    options: ["2.5, 900, 1.2", "2.5, 0.9, 1.2", "2500, 900, 1200", "2.5, 9, 1.2"],
    answer: 1,
    explanation:
      "Stripping the text is not enough, because the values use two different units. 900 g must be converted to 0.9 kg so that every number in the column means the same thing.",
  },
  {
    id: "data-cleaning-q10",
    skillId: "data-cleaning",
    topicId: "data-cleaning-types-formats",
    prompt:
      "A sales file exported from a European system writes one thousand two hundred and fifty and a half as 1.250,50. Which cleaning steps turn this text into the correct number?",
    options: [
      "Remove the full stops, then replace the comma with a decimal point",
      "Replace the comma with a decimal point, then remove every full stop",
      "Remove the comma and keep the full stop as the decimal point",
      "Remove both the full stops and the comma from the text",
    ],
    answer: 0,
    explanation:
      "Here the full stop separates thousands and the comma marks the decimals, so the thousands separators go first and the comma then becomes the decimal point, giving 1250.50. The other orders produce 125050 or 1.2505.",
  },
  {
    id: "data-cleaning-q11",
    skillId: "data-cleaning",
    topicId: "data-cleaning-missing-values",
    prompt:
      "A rating column has five rows: 4, 5, missing, 3, missing. What is the mean rating if the missing values are ignored, and what is it if they are filled with 0, in that order?",
    options: ["4.0 and 4.0", "2.4 and 2.4", "4.0 and 2.4", "2.4 and 4.0"],
    answer: 2,
    explanation:
      "Ignoring the gaps gives 12 / 3 = 4.0. Filling them with 0 gives 12 / 5 = 2.4, because each 0 is treated as a real, very low rating, which is why zero-filling distorts averages.",
  },
  {
    id: "data-cleaning-q12",
    skillId: "data-cleaning",
    topicId: "data-cleaning-missing-values",
    prompt:
      "A city column has 1,000 rows. A null check reports 0 missing values, but a count of values shows 120 rows holding an empty string, 45 holding \"N/A\" and 15 holding \"unknown\". What share of the column is really missing?",
    options: ["0%", "12%", "16.5%", "18%"],
    answer: 3,
    explanation:
      "Empty strings and placeholder text are missing values in disguise: 120 + 45 + 15 = 180 of 1,000 rows, or 18%. A null check only finds true nulls, so convert these placeholders to nulls first.",
  },
  {
    id: "data-cleaning-q13",
    skillId: "data-cleaning",
    topicId: "data-cleaning-duplicates-consistency",
    prompt:
      "A table has five rows of (email, city): (a@x.com, Pune), (a@x.com, Pune), (a@x.com, Mumbai), (b@x.com, Delhi) and (b@x.com, Delhi). How many rows remain if you remove exact duplicate rows, and how many if you keep one row per email, in that order?",
    options: ["3 and 2", "2 and 2", "3 and 3", "4 and 2"],
    answer: 0,
    explanation:
      "Exact deduplication only removes rows identical in every column, leaving (a, Pune), (a, Mumbai) and (b, Delhi). Deduplicating on the email key leaves one row for each of the 2 emails.",
  },
  {
    id: "data-cleaning-q14",
    skillId: "data-cleaning",
    topicId: "data-cleaning-duplicates-consistency",
    prompt:
      "A city column holds six values: \"Mumbai\", \"mumbai \" (with a trailing space), \"MUMBAI\", \"Bombay\", \"Pune\" and \" pune\" (with a leading space). After you trim whitespace and convert to lowercase, how many distinct values are left?",
    options: ["2", "5", "3", "6"],
    answer: 2,
    explanation:
      "Trimming and lowercasing merge the spelling variants into mumbai and pune, but bombay is a different string and stays separate. Alternative names for the same thing need an explicit mapping to one standard value.",
  },
  {
    id: "data-cleaning-q15",
    skillId: "data-cleaning",
    topicId: "data-cleaning-outliers-validation",
    prompt:
      "Four order values of 120, 300, 450 and 2,000 are checked against an upper limit of 500. You decide to cap values above the limit at 500 instead of removing them. What is the mean order value after capping?",
    options: ["717.5", "290", "500", "342.5"],
    answer: 3,
    explanation:
      "Capping replaces 2,000 with 500 and keeps the row: (120 + 300 + 450 + 500) / 4 = 342.5. Removing the row instead would give 290, and leaving the value alone gives 717.5.",
  },
  {
    id: "data-cleaning-q16",
    skillId: "data-cleaning",
    topicId: "data-cleaning-outliers-validation",
    prompt:
      "A raw file has 10,000 rows. Your cleaning log says: removed 150 exact duplicates, removed 40 rows with invalid dates, and filled 300 missing city values. The output file has 9,790 rows. What does the reconciliation show?",
    options: [
      "The counts reconcile, so no rows were lost",
      "20 rows are unaccounted for and need investigating",
      "280 rows were added, so a step duplicated data",
      "300 rows are missing, because filled rows were dropped",
    ],
    answer: 1,
    explanation:
      "Only the two removal steps change the row count, so the output should have 10,000 - 150 - 40 = 9,810 rows. Filling values does not remove rows, so the 20-row gap is an unexplained loss.",
  },
];
