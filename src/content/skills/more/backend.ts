import type { Question } from "../../taxonomy";

export const questions: Question[] = [
  // ---------- programming-fundamentals ----------
  {
    id: "programming-fundamentals-q9",
    skillId: "programming-fundamentals",
    topicId: "programming-fundamentals-control-flow",
    prompt: `What is the value of steps after this JavaScript runs?\n\nlet n = 13;\nlet steps = 0;\nwhile (n > 1) {\n  if (n % 2 === 0) n = n / 2;\n  else n = n - 1;\n  steps++;\n}`,
    options: ["3", "4", "5", "6"],
    answer: 2,
    explanation:
      "n goes 13 -> 12 -> 6 -> 3 -> 2 -> 1, which is five changes, so the loop body runs five times before n > 1 becomes false.",
  },
  {
    id: "programming-fundamentals-q10",
    skillId: "programming-fundamentals",
    topicId: "programming-fundamentals-control-flow",
    prompt: `What does show(3) print, in order?\n\nfunction show(n) {\n  if (n === 0) return;\n  show(n - 1);\n  console.log(n);\n}`,
    options: ["1, then 2, then 3", "3, then 2, then 1", "Only 3", "Only 1"],
    answer: 0,
    explanation:
      "Each call first recurses all the way down to show(0) and only logs after its inner call returns, so the logs happen as the call stack unwinds: 1, 2, 3.",
  },
  {
    id: "programming-fundamentals-q11",
    skillId: "programming-fundamentals",
    topicId: "programming-fundamentals-data-structures",
    prompt: `A stack starts empty and these operations run in order:\n\npush(1), push(2), push(3), pop(), push(4), pop(), pop()\n\nWhich value does the last pop() return?`,
    options: ["1", "2", "3", "4"],
    answer: 1,
    explanation:
      "A stack removes the most recently added item: the pops return 3, then 4, then 2, leaving only 1 on the stack. A queue would have returned 3 last.",
  },
  {
    id: "programming-fundamentals-q12",
    skillId: "programming-fundamentals",
    topicId: "programming-fundamentals-data-structures",
    prompt: `What does this JavaScript print?\n\nconst stock = new Map();\nstock.set("pen", 5);\nstock.set("ink", 2);\nstock.set("pen", 3);\nconsole.log(stock.size, stock.get("pen"));`,
    options: ["3 5", "2 5", "2 8", "2 3"],
    answer: 3,
    explanation:
      "Keys in a map are unique, so setting \"pen\" again replaces its value instead of adding a third entry or summing: two keys remain and \"pen\" maps to 3.",
  },
  {
    id: "programming-fundamentals-q13",
    skillId: "programming-fundamentals",
    topicId: "programming-fundamentals-complexity",
    prompt: `What is the time complexity of this Python code for a list a of length n?\n\ntotal = 0\nfor i in range(n):\n    for j in range(10):\n        total += a[i]`,
    options: ["O(1)", "O(n)", "O(n log n)", "O(n^2)"],
    answer: 1,
    explanation:
      "The inner loop always runs exactly 10 times regardless of n, so the total work is 10 * n steps, which grows linearly: O(n). Nested loops are only quadratic when both depend on n.",
  },
  {
    id: "programming-fundamentals-q14",
    skillId: "programming-fundamentals",
    topicId: "programming-fundamentals-complexity",
    prompt: `This function checks a list a of n items for duplicates. Assuming each set lookup and insert takes O(1) on average, what are its time and extra space when the list has no duplicates?\n\ndef has_duplicate(a):\n    seen = set()\n    for x in a:\n        if x in seen:\n            return True\n        seen.add(x)\n    return False`,
    options: [
      "O(n) time and O(1) extra space",
      "O(n^2) time and O(1) extra space",
      "O(n^2) time and O(n) extra space",
      "O(n) time and O(n) extra space",
    ],
    answer: 3,
    explanation:
      "The loop visits each item once doing constant work, giving O(n) time, but the set ends up holding all n items, so it also uses O(n) extra space. It trades memory for speed.",
  },
  {
    id: "programming-fundamentals-q15",
    skillId: "programming-fundamentals",
    topicId: "programming-fundamentals-debugging",
    prompt: `A teammate expects this JavaScript to print 3. What does it actually print, and why?\n\nconst a = [1, 2, 3];\nconst b = a;\nb.push(4);\nconsole.log(a.length);`,
    options: [
      "4, because a and b refer to the same array",
      "3, because b is a separate copy of the array a",
      "An error, because a const array cannot be changed",
      "3, because push returns a new array and leaves b as it was",
    ],
    answer: 0,
    explanation:
      "Assigning an array to another variable copies the reference, not the contents, so pushing through b changes the one array that a also points to. const only stops the variable being reassigned.",
  },
  {
    id: "programming-fundamentals-q16",
    skillId: "programming-fundamentals",
    topicId: "programming-fundamentals-debugging",
    prompt: `A teammate says this function always returns the largest number in the list. What does findMax([-5, -2, -9]) return?\n\nfunction findMax(nums) {\n  let max = 0;\n  for (const n of nums) {\n    if (n > max) max = n;\n  }\n  return max;\n}`,
    options: ["-2", "-9", "0", "undefined"],
    answer: 2,
    explanation:
      "max starts at 0 and no negative number is greater than 0, so it is never updated and 0 is returned even though it is not in the list. Starting from nums[0] fixes the bug.",
  },

  // ---------- api-design ----------
  {
    id: "api-design-q9",
    skillId: "api-design",
    topicId: "api-design-resources-methods",
    prompt: `A client needs to remove item 5 from cart 12, leaving the rest of the cart as it is. Which request best follows REST conventions?`,
    options: [
      "POST /carts/12/items/5/delete",
      "GET /carts/12/removeItem?id=5",
      "DELETE /carts/12",
      "DELETE /carts/12/items/5",
    ],
    answer: 3,
    explanation:
      "The URL should name the exact resource (item 5 inside cart 12) and the DELETE method supplies the action. DELETE /carts/12 would remove the whole cart, and the other two put verbs in the path.",
  },
  {
    id: "api-design-q10",
    skillId: "api-design",
    topicId: "api-design-resources-methods",
    prompt: `A notes API starts empty, gives new notes the ids 1, 2, 3 and so on, and does not de-duplicate requests. A client sends these five requests in order:\n\nPOST /notes with body { "text": "hi" }\nPOST /notes with body { "text": "hi" }\nPOST /notes with body { "text": "hi" }\nDELETE /notes/1\nDELETE /notes/1\n\nHow many notes exist afterwards?`,
    options: ["0", "1", "2", "3"],
    answer: 2,
    explanation:
      "POST is not idempotent, so three identical POSTs create three notes. DELETE is idempotent: the first call removes note 1 and the repeat removes nothing more, leaving notes 2 and 3.",
  },
  {
    id: "api-design-q11",
    skillId: "api-design",
    topicId: "api-design-status-codes",
    prompt: `DELETE /photos/8 succeeds: the photo is removed immediately, and the server has nothing to send back in the response body. Which status code fits best?`,
    options: ["204 No Content", "201 Created", "202 Accepted", "404 Not Found"],
    answer: 0,
    explanation:
      "204 means the request succeeded and there is deliberately no body. 201 is for a newly created resource and 202 is for work that has been queued but not yet done.",
  },
  {
    id: "api-design-q12",
    skillId: "api-design",
    topicId: "api-design-status-codes",
    prompt: `Emails must be unique in your system. A client sends a well-formed POST /users request, but an account with that email already exists. Which status code should the API return?`,
    options: ["201 Created", "404 Not Found", "500 Internal Server Error", "409 Conflict"],
    answer: 3,
    explanation:
      "The request is valid but clashes with the current state of the data, which is what 409 Conflict means. Letting the database's unique-constraint error surface as a 500 wrongly blames the server.",
  },
  {
    id: "api-design-q13",
    skillId: "api-design",
    topicId: "api-design-pagination-filtering",
    prompt: `An API paginates a sorted list with page numbers that start at 1. The items are numbered 1, 2, 3 and so on in sort order. Which items does GET /items?page=3&limit=20 return?`,
    options: ["Items 41 to 60", "Items 21 to 40", "Items 60 to 79", "Items 61 to 80"],
    answer: 0,
    explanation:
      "Pages 1 and 2 cover the first (3 - 1) x 20 = 40 items, so the server skips 40 and returns the next 20: items 41 to 60.",
  },
  {
    id: "api-design-q14",
    skillId: "api-design",
    topicId: "api-design-pagination-filtering",
    prompt: `A products API holds these five products:\n\nid 1: books, price 300\nid 2: toys, price 900\nid 3: books, price 750\nid 4: books, price 500\nid 5: toys, price 100\n\nIn this API, sort=-price means highest price first. Which product ids does GET /products?category=books&sort=-price&limit=2 return, in order?`,
    options: ["2, 3", "1, 3", "3, 4", "1, 4"],
    answer: 2,
    explanation:
      "The filter is applied first (books: ids 1, 3, 4), then the sort (750, 500, 300 gives ids 3, 4, 1), and only then the limit, which keeps the first two: 3, 4.",
  },
  {
    id: "api-design-q15",
    skillId: "api-design",
    topicId: "api-design-versioning-reliability",
    prompt: `Many client apps already call POST /orders on your public API. Which of these changes will break those existing clients unless it is released under a new version?`,
    options: [
      "Adding a new optional request field, note",
      "Adding a new required request field, currency",
      "Adding a new response field, createdAt",
      "Adding a new endpoint, GET /orders/{id}/invoice",
    ],
    answer: 1,
    explanation:
      "Existing clients do not send currency, so their requests would start being rejected. Optional request fields, extra response fields, and new endpoints leave current requests working as before.",
  },
  {
    id: "api-design-q16",
    skillId: "api-design",
    topicId: "api-design-versioning-reliability",
    prompt: `POST /payments correctly supports an Idempotency-Key header. A client sends these four requests, each for 500 rupees:\n\n1. Key k1: the server charges the card, but the response is lost in a timeout\n2. Key k1 again (a retry)\n3. Key k1 again (another retry)\n4. Key k2 (a new purchase)\n\nHow many times is the card charged in total?`,
    options: ["1", "2", "3", "4"],
    answer: 1,
    explanation:
      "The server recognises the two retries by their key k1 and returns the stored result without charging again, while k2 is a new operation. That gives one charge for k1 and one for k2.",
  },

  // ---------- auth-security ----------
  {
    id: "auth-security-q9",
    skillId: "auth-security",
    topicId: "auth-security-authn-authz",
    prompt: `Meera signs in with her correct email and password. She then opens /admin/reports, which is only for admins. Her role is 'member', so the server refuses the request. Which statement describes what happened?`,
    options: [
      "Authentication succeeded; authorization failed",
      "Authentication failed; authorization succeeded",
      "Both authentication and authorization succeeded",
      "Both authentication and authorization failed",
    ],
    answer: 0,
    explanation:
      "The server knows who Meera is, so authentication worked. It refused because her role does not permit that page, which is the authorization check doing its job.",
  },
  {
    id: "auth-security-q10",
    skillId: "auth-security",
    topicId: "auth-security-authn-authz",
    prompt: `The server uses this check before allowing an edit:\n\nfunction canEdit(user, doc) {\n  return user.role === "admin" || doc.ownerId === user.id;\n}\n\nAsha is { id: 1, role: "member" }, Bilal is { id: 2, role: "admin" } and Chitra is { id: 3, role: "member" }. The document has ownerId 1. Who is allowed to edit it?`,
    options: ["Only Asha", "Only Bilal", "Asha and Bilal", "All three users"],
    answer: 2,
    explanation:
      "Asha passes because she owns the document, and Bilal passes because he is an admin. Chitra is neither the owner nor an admin, so both sides of the || are false for her.",
  },
  {
    id: "auth-security-q11",
    skillId: "auth-security",
    topicId: "auth-security-password-storage",
    prompt: `Which statement correctly describes the difference between hashing and encryption?`,
    options: [
      "Hashing can be reversed with the right key; encryption is one-way",
      "Encryption can be reversed with the key; hashing is designed to be one-way",
      "Both can be reversed, but hashing needs a much longer key",
      "Neither can be reversed; they differ only in the length of the output",
    ],
    answer: 1,
    explanation:
      "Encryption is meant to be undone by whoever holds the key, while a hash has no key and cannot be turned back into its input. That is why passwords are hashed rather than encrypted.",
  },
  {
    id: "auth-security-q12",
    skillId: "auth-security",
    topicId: "auth-security-password-storage",
    prompt: `An attacker has stolen one user's password hash and has a list of 10 million common passwords. Their hardware can test 1,000,000 guesses per second against a fast hash such as SHA-256, but only 100 guesses per second against your bcrypt setting. Roughly how long does it take to try the whole list against the bcrypt hash?`,
    options: ["About 10 seconds", "About 17 minutes", "About 28 hours", "About 3 years"],
    answer: 2,
    explanation:
      "10,000,000 guesses at 100 per second is 100,000 seconds, about 28 hours, compared with 10 seconds for the fast hash. A deliberately slow hash makes every guess expensive for the attacker.",
  },
  {
    id: "auth-security-q13",
    skillId: "auth-security",
    topicId: "auth-security-sessions-tokens",
    prompt: `A JWT's payload has an exp (expiry) claim equal to 10:00 today, and its signature is valid. A request carrying this token reaches the API at 11:30. What should the API do?`,
    options: [
      "Accept it, because the signature is still valid",
      "Accept it, and move exp forward by an hour",
      "Reject it, because a signed token works only once",
      "Reject it, because the time in exp has passed",
    ],
    answer: 3,
    explanation:
      "A valid signature only proves the token was not altered; the server must also check exp and refuse tokens past it. The client then has to log in again or use a refresh flow.",
  },
  {
    id: "auth-security-q14",
    skillId: "auth-security",
    topicId: "auth-security-sessions-tokens",
    prompt: `A user decodes their own JWT, changes "role": "user" to "role": "admin" in the payload, re-encodes it, and sends it to the API. They do not know the signing secret, and the server verifies signatures correctly. What happens?`,
    options: [
      "The request is accepted as admin, because the payload is only encoded",
      "The request is rejected, because the signature no longer matches the payload",
      "The request is accepted as a normal user, because edited claims are ignored",
      "The server re-signs the token, so the new role becomes valid from then on",
    ],
    answer: 1,
    explanation:
      "The signature is computed over the header and payload using the secret, so any edit makes the old signature invalid and the attacker cannot produce a new one. Anyone can read a JWT, but only the key holder can change it.",
  },
  {
    id: "auth-security-q15",
    skillId: "auth-security",
    topicId: "auth-security-common-vulnerabilities",
    prompt: `A handler builds its query like this:\n\nconst sql = "SELECT * FROM users WHERE email = '" + email + "'";\n\nAn attacker submits this text as the email:\n\n' OR '1'='1\n\nWhat does the resulting query return?`,
    options: [
      "No rows, because no user has that text as an email",
      "Only the first row, because the query stops at one match",
      "A syntax error, because the quotes are left unbalanced",
      "Every row, because the WHERE condition is always true",
    ],
    answer: 3,
    explanation:
      "The query becomes WHERE email = '' OR '1'='1', which is valid SQL and true for every row, so the whole users table comes back. The input was executed as SQL instead of being treated as data.",
  },
  {
    id: "auth-security-q16",
    skillId: "auth-security",
    topicId: "auth-security-common-vulnerabilities",
    prompt: `A password-reset flow emails the user a 4-digit numeric code. The 'verify code' endpoint accepts any number of attempts for the same account. What is the weakness, and the standard fix?`,
    options: [
      "It can be guessed by trying all 10,000 codes; limit the attempts allowed",
      "It can be guessed by trying all 10,000 codes; hash the code in the database",
      "It can be guessed by trying all 10,000 codes; block retries in the browser",
      "It can be read by anyone watching the network; add HTTPS to the endpoint",
    ],
    answer: 0,
    explanation:
      "Four digits give only 10,000 possibilities, which a script can try in minutes if nothing stops it. Rate limiting or locking the code after a few wrong attempts makes brute force impractical.",
  },

  // ---------- testing-basics ----------
  {
    id: "testing-basics-q9",
    skillId: "testing-basics",
    topicId: "testing-basics-unit-tests",
    prompt: `Which of these tests fails?\n\nfunction clamp(n, min, max) {\n  if (n < min) return min;\n  if (n > max) return max;\n  return n;\n}\n\nTest A: expect(clamp(5, 0, 10)).toBe(5);\nTest B: expect(clamp(-3, 0, 10)).toBe(0);\nTest C: expect(clamp(15, 0, 10)).toBe(15);\nTest D: expect(clamp(10, 0, 10)).toBe(10);`,
    options: ["Test A", "Test B", "Test C", "Test D"],
    answer: 2,
    explanation:
      "15 is above the maximum, so clamp returns 10, not the 15 that Test C expects. In the other three the function returns exactly the expected value.",
  },
  {
    id: "testing-basics-q10",
    skillId: "testing-basics",
    topicId: "testing-basics-unit-tests",
    prompt: `addTax(100, 0.18) should return 118, but a bug makes it return 100. What happens when Jest runs this test with its default settings?\n\ntest("adds 18% tax", () => {\n  const total = addTax(100, 0.18);\n  console.log(total);\n});`,
    options: [
      "It fails, because 100 is not the expected 118",
      "It passes, because nothing asserts on the result",
      "It is skipped, because it contains no expect call",
      "It fails, because tests are not allowed to print output",
    ],
    answer: 1,
    explanation:
      "A test fails only when an assertion fails or an error is thrown. This one just prints the value, so it passes whatever addTax returns and can never catch the bug.",
  },
  {
    id: "testing-basics-q11",
    skillId: "testing-basics",
    topicId: "testing-basics-test-design",
    prompt: `Shipping should be free for orders of 500 rupees or more. The code is:\n\nfunction isFreeShipping(total) {\n  return total > 500;\n}\n\nWhich single test input exposes the bug?`,
    options: ["499", "500", "501", "1000"],
    answer: 1,
    explanation:
      "Only at exactly 500 does the code (false) disagree with the rule (true), because > was used where >= was needed. The other three inputs give the correct answer, which is why boundary values are worth testing.",
  },
  {
    id: "testing-basics-q12",
    skillId: "testing-basics",
    topicId: "testing-basics-test-design",
    prompt: `What is the smallest number of test cases needed so that every throw and return statement in this function runs at least once?\n\nfunction fee(amount, isMember) {\n  if (amount <= 0) {\n    throw new Error("invalid amount");\n  }\n  if (isMember) {\n    return 0;\n  }\n  if (amount > 1000) {\n    return 50;\n  }\n  return 20;\n}`,
    options: ["2", "3", "4", "8"],
    answer: 2,
    explanation:
      "Each call leaves the function through exactly one of its four exits (the throw, return 0, return 50, return 20), so one test can cover only one of them and four tests are needed.",
  },
  {
    id: "testing-basics-q13",
    skillId: "testing-basics",
    topicId: "testing-basics-mocking",
    prompt: `A teammate's test replaces calculateTotal itself with a mock that returns 118, calls it, and asserts that the result is 118. The test passes. What does this test prove about the real calculateTotal code?`,
    options: [
      "Nothing; it only checks the value the mock was told to return",
      "That the real function adds the tax correctly for this input",
      "That the real function is called exactly once for each order",
      "That the real function will keep working after a refactor",
    ],
    answer: 0,
    explanation:
      "The real code never runs, so the test would pass even if calculateTotal were completely broken. Test doubles should replace the dependencies of the code under test, never the code under test itself.",
  },
  {
    id: "testing-basics-q14",
    skillId: "testing-basics",
    topicId: "testing-basics-mocking",
    prompt: `getUserWithRetry(fetchUser) calls fetchUser and, if that call throws, calls it exactly one more time and returns that result. In a test, fetchUser is a stub whose first call throws a timeout error and whose second call returns { id: 1 }. What should a correct test expect?`,
    options: [
      "An error is thrown, and the stub was called once",
      "An error is thrown, and the stub was called twice",
      "The result is { id: 1 }, and the stub was called once",
      "The result is { id: 1 }, and the stub was called twice",
    ],
    answer: 3,
    explanation:
      "The first call throws, which triggers the single retry; the second call succeeds and its value is returned. So the stub is called twice and the result is { id: 1 }.",
  },
  {
    id: "testing-basics-q15",
    skillId: "testing-basics",
    topicId: "testing-basics-integration-ci",
    prompt: `Which of these is an integration test rather than a unit test?`,
    options: [
      "Calling isLeapYear(2024) and expecting the value true",
      "Calling formatName(\"asha\", \"rao\") and expecting \"Asha Rao\"",
      "Calling applyDiscount() with a stubbed coupon service",
      "Calling POST /orders and checking the row in a test database",
    ],
    answer: 3,
    explanation:
      "It exercises the HTTP layer, the application code, and a real database working together. The other three check one function in isolation, with any dependency replaced by a stub.",
  },
  {
    id: "testing-basics-q16",
    skillId: "testing-basics",
    topicId: "testing-basics-integration-ci",
    prompt: `An integration test inserts a user with the email asha@example.com into a test database where emails must be unique, then checks the response. It passes on the first run and fails on every later run against the same database. What is the most likely cause, and the fix?`,
    options: [
      "Leftover data from the earlier run; reset the data before each run",
      "A slow database connection; add a retry around the insert",
      "A wrong assertion; change the test to expect an error instead",
      "A missing test double; replace the database with a mock",
    ],
    answer: 0,
    explanation:
      "The row from the first run is still there, so the same insert now breaks the unique rule. Starting every run from a known clean state (resetting or rolling back the data) makes the test repeatable.",
  },

  // ---------- system-design ----------
  {
    id: "system-design-q9",
    skillId: "system-design",
    topicId: "system-design-databases",
    prompt: `A relational database stores each customer's phone number only in the customers table. The orders table refers to the customer by customer_id. A customer who has 250 orders changes their phone number. How many rows must be updated?`,
    options: ["1", "250", "251", "500"],
    answer: 0,
    explanation:
      "The phone number lives in one place, the customer's own row, and the orders reach it through customer_id. Storing each fact once is what keeps related data from drifting out of sync.",
  },
  {
    id: "system-design-q10",
    skillId: "system-design",
    topicId: "system-design-databases",
    prompt: `In a relational database with ACID transactions, account A has 1,000 rupees and account B has 200 rupees. A transfer of 500 rupees runs inside one transaction: it debits A, and then the server crashes before B is credited and before the transaction commits. After the database recovers, what are the balances?`,
    options: [
      "A = 500, B = 200",
      "A = 500, B = 700",
      "A = 1,000, B = 700",
      "A = 1,000, B = 200",
    ],
    answer: 3,
    explanation:
      "A transaction is atomic: it either commits completely or has no effect. Because it never committed, the debit is rolled back on recovery and both balances are unchanged.",
  },
  {
    id: "system-design-q11",
    skillId: "system-design",
    topicId: "system-design-caching",
    prompt: `An API uses cache-aside with a 60-second TTL. The TTL is counted from when an entry is stored and is not extended by reads. The cache starts empty, the data never changes, and requests for the same key arrive at 0, 30, 70, 100 and 170 seconds. How many of these five requests read from the database?`,
    options: ["1", "2", "3", "5"],
    answer: 2,
    explanation:
      "The request at 0 misses and caches until 60, so 30 is a hit. 70 misses and caches until 130, so 100 is a hit, and 170 misses again: three database reads.",
  },
  {
    id: "system-design-q12",
    skillId: "system-design",
    topicId: "system-design-caching",
    prompt: `An in-memory cache can hold 3 entries and uses LRU eviction: when it is full, it removes the entry that was used least recently. The app caches A, then B, then C, then reads A, then caches a new entry D. Which entry is evicted?`,
    options: ["A", "B", "C", "D"],
    answer: 1,
    explanation:
      "Reading A makes it recently used again, so B becomes the entry that has gone longest without use and is removed. A plain first-in, first-out cache would have evicted A instead.",
  },
  {
    id: "system-design-q13",
    skillId: "system-design",
    topicId: "system-design-scaling",
    prompt: `A system has one load balancer, three identical stateless app servers behind it, and one database server. Which parts are single points of failure?`,
    options: [
      "The three app servers and the database",
      "Only the database server",
      "Only the load balancer",
      "The load balancer and the database",
    ],
    answer: 3,
    explanation:
      "If one app server dies the other two carry on, but there is only one load balancer and one database, so losing either takes the whole system down.",
  },
  {
    id: "system-design-q14",
    skillId: "system-design",
    topicId: "system-design-scaling",
    prompt: `Each app server can handle 500 requests per second. Peak traffic is 1,800 requests per second, and the system must still cope with the peak if any one server fails. What is the smallest number of servers needed?`,
    options: ["3", "4", "5", "6"],
    answer: 2,
    explanation:
      "Four servers cover the peak (2,000 per second) only while all are healthy; lose one and capacity drops to 1,500. With five, the four survivors still handle 2,000 per second.",
  },
  {
    id: "system-design-q15",
    skillId: "system-design",
    topicId: "system-design-queues",
    prompt: `Jobs arrive on a queue at 100 per minute. Three workers each process 20 jobs per minute. The queue starts empty. About how many jobs are waiting in the queue after 10 minutes?`,
    options: ["40", "400", "600", "1,000"],
    answer: 1,
    explanation:
      "The workers clear 3 x 20 = 60 jobs per minute against 100 arriving, so the backlog grows by 40 per minute and reaches 400 after 10 minutes.",
  },
  {
    id: "system-design-q16",
    skillId: "system-design",
    topicId: "system-design-queues",
    prompt: `A worker takes an 'email receipt' message from a queue and acknowledges it immediately, before doing the work. It then crashes halfway through sending the email. What happens to that message?`,
    options: [
      "It is lost, because the queue already counts it as done",
      "It is redelivered, because the work was never finished",
      "It moves to the dead-letter queue to be inspected later",
      "It is delivered twice as soon as the worker restarts",
    ],
    answer: 0,
    explanation:
      "An acknowledgement tells the queue the message has been handled, so it is removed and never redelivered. Acknowledging only after the work succeeds is what lets the queue retry after a crash.",
  },
];
