import type { Challenge } from "../taxonomy";

// Two small datasets shared across the challenges: a web shop (customers, orders)
// and a company (departments, employees). Each challenge repeats the setup it
// needs so it stays self-contained.

const shop = `
CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL
);
INSERT INTO customers VALUES
  (1, 'Asha Patel', 'Leeds'),
  (2, 'Ben Okoro', 'Manchester'),
  (3, 'Chen Wei', 'Leeds'),
  (4, 'Dana Novak', 'Bristol'),
  (5, 'Eli Mensah', 'Leeds'),
  (6, 'Farah Khan', 'Bristol'),
  (7, 'Gus Lindqvist', 'Manchester');

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  status TEXT NOT NULL,
  total REAL NOT NULL,
  ordered_on TEXT NOT NULL
);
INSERT INTO orders VALUES
  (101, 1, 'delivered', 120.00, '2024-03-02'),
  (102, 2, 'shipped', 45.50, '2024-03-05'),
  (103, 1, 'cancelled', 300.00, '2024-03-09'),
  (104, 3, 'delivered', 89.75, '2024-03-11'),
  (105, 2, 'pending', 150.00, '2024-03-14'),
  (106, 4, 'delivered', 210.00, '2024-03-18'),
  (107, 1, 'shipped', 60.00, '2024-03-21'),
  (108, 3, 'pending', 32.25, '2024-03-25'),
  (109, 4, 'delivered', 75.25, '2024-03-28'),
  (110, 2, 'cancelled', 18.00, '2024-03-30'),
  (111, 5, 'refunded', 99.00, '2024-03-31');
`.trim();

const company = `
CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO departments VALUES
  (1, 'Engineering'),
  (2, 'Sales'),
  (3, 'Support'),
  (4, 'Finance');

CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department_id INTEGER NOT NULL,
  salary INTEGER NOT NULL,
  hired_on TEXT NOT NULL
);
INSERT INTO employees VALUES
  (1, 'Asha Patel', 1, 72000, '2021-04-12'),
  (2, 'Ben Okoro', 1, 65000, '2022-09-01'),
  (3, 'Chen Wei', 1, 81000, '2019-11-20'),
  (4, 'Dana Novak', 2, 48000, '2023-01-16'),
  (5, 'Eli Mensah', 2, 56000, '2020-06-08'),
  (6, 'Farah Khan', 2, 52000, '2022-03-03'),
  (7, 'Gus Lindqvist', 3, 39000, '2023-07-24'),
  (8, 'Hana Sato', 3, 43000, '2021-10-05'),
  (9, 'Ivan Petrov', 3, 41000, '2024-02-19');
`.trim();

export const challenges: Challenge[] = [
  {
    id: "sql-c1",
    skillId: "sql",
    topicId: "sql-filtering",
    language: "sql",
    title: "Big orders on their way",
    brief:
      "The warehouse wants a list of the larger orders that have actually gone out.\n\nFrom the orders table, return the id, total and ordered_on of every order with a total over 50 whose status is 'shipped' or 'delivered'. Highest total first.",
    setup: shop,
    starter: `SELECT id, total, ordered_on
FROM orders;`,
    solution: `SELECT id, total, ordered_on
FROM orders
WHERE total > 50
  AND status IN ('shipped', 'delivered')
ORDER BY total DESC;`,
    checks: [],
    hints: [
      "Two conditions have to hold at once, so combine them with AND.",
      "IN (...) is a tidy way to accept more than one status.",
    ],
  },
  {
    id: "sql-c2",
    skillId: "sql",
    topicId: "sql-aggregation",
    language: "sql",
    title: "Revenue by status",
    brief:
      "Finance wants to see how order value is spread across statuses, but a status with only a single order is noise.\n\nFrom the orders table, return one row per status with the status, the number of orders (order_count) and the sum of their totals (revenue). Only include statuses with at least 2 orders. Highest revenue first.",
    setup: shop,
    starter: `SELECT status, COUNT(*) AS order_count
FROM orders
GROUP BY status;`,
    solution: `SELECT status, COUNT(*) AS order_count, SUM(total) AS revenue
FROM orders
GROUP BY status
HAVING COUNT(*) >= 2
ORDER BY revenue DESC;`,
    checks: [],
    hints: [
      "A condition on an aggregate like COUNT(*) belongs in HAVING, not WHERE.",
      "You can ORDER BY a column alias you defined in the SELECT.",
    ],
  },
  {
    id: "sql-c3",
    skillId: "sql",
    topicId: "sql-joins",
    language: "sql",
    title: "Who received what",
    brief:
      "Customer support needs to know who received each delivered order.\n\nJoin orders to customers (orders.customer_id matches customers.id). For every order with status 'delivered', return the order id, the customer's name, their city and the order total. Highest total first.",
    setup: shop,
    starter: `-- Join orders to customers and keep only delivered orders
SELECT o.id, o.total
FROM orders o;`,
    solution: `SELECT o.id, c.name, c.city, o.total
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.status = 'delivered'
ORDER BY o.total DESC;`,
    checks: [],
    hints: [
      "JOIN customers c ON c.id = o.customer_id lines each order up with its customer.",
      "Use table aliases (o., c.) so it is clear which table each column comes from.",
    ],
  },
  {
    id: "sql-c4",
    skillId: "sql",
    topicId: "sql-joins",
    language: "sql",
    title: "Every customer's spend",
    brief:
      "Marketing wants a spend summary for the whole customer base, including people who have never bought anything.\n\nReturn every customer's name, their number of orders (order_count) and the sum of their order totals (spent), counting all orders whatever their status. Customers with no orders must appear with 0 and 0. Highest spent first, then by name.",
    setup: shop,
    starter: `SELECT c.name, COUNT(*) AS order_count, SUM(o.total) AS spent
FROM customers c
JOIN orders o ON o.customer_id = c.id
GROUP BY c.id
ORDER BY spent DESC, c.name;`,
    solution: `SELECT c.name, COUNT(o.id) AS order_count, COALESCE(SUM(o.total), 0) AS spent
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id
ORDER BY spent DESC, c.name;`,
    checks: [],
    hints: [
      "An inner JOIN drops customers with no orders; a LEFT JOIN keeps them with NULL order columns.",
      "COUNT(*) counts the row a customer gets even with no orders. COUNT(o.id) does not, and COALESCE turns a NULL sum into 0.",
    ],
  },
  {
    id: "sql-c5",
    skillId: "sql",
    topicId: "sql-subqueries-windows",
    language: "sql",
    title: "Above the team average",
    brief:
      "HR is reviewing pay and wants to know who earns more than the average of their own department, not the company as a whole.\n\nUsing employees and departments (employees.department_id matches departments.id), return the employee's name, their department's name (department) and their salary for every employee paid more than the average salary of their department. Highest salary first.",
    setup: company,
    starter: `SELECT e.name, d.name AS department, e.salary
FROM employees e
JOIN departments d ON d.id = e.department_id
WHERE e.salary > (SELECT AVG(salary) FROM employees)
ORDER BY e.salary DESC;`,
    solution: `SELECT e.name, d.name AS department, e.salary
FROM employees e
JOIN departments d ON d.id = e.department_id
WHERE e.salary > (
  SELECT AVG(salary) FROM employees
  WHERE department_id = e.department_id
)
ORDER BY e.salary DESC;`,
    checks: [],
    hints: [
      "The subquery needs to average only the rows in the same department as the outer row: refer to the outer table's department_id inside it.",
      "Alternatively, compute the average per department in a subquery with GROUP BY and join to it.",
    ],
  },
  {
    id: "sql-c6",
    skillId: "sql",
    topicId: "sql-subqueries-windows",
    language: "sql",
    title: "Pay rank within each department",
    brief:
      "For the same pay review, HR wants each employee ranked against their own department, with 1 being the best paid.\n\nReturn every employee's name, their department's name (department), their salary and their rank within the department by salary (pay_rank). Sort by department name, then by pay_rank.",
    setup: company,
    starter: `SELECT e.name, d.name AS department, e.salary
FROM employees e
JOIN departments d ON d.id = e.department_id
ORDER BY department, e.salary DESC;`,
    solution: `SELECT e.name, d.name AS department, e.salary,
  RANK() OVER (PARTITION BY e.department_id ORDER BY e.salary DESC) AS pay_rank
FROM employees e
JOIN departments d ON d.id = e.department_id
ORDER BY department, pay_rank;`,
    checks: [],
    hints: [
      "A window function like RANK() OVER (...) adds a column without collapsing rows the way GROUP BY does.",
      "PARTITION BY restarts the ranking for each department; ORDER BY inside the OVER decides who is rank 1.",
    ],
  },
];
