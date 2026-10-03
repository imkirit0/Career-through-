import type { Question } from "../taxonomy";

export const questions: Question[] = [
  // ───────── programming-fundamentals ─────────
  {
    id: "programming-fundamentals-p1",
    skillId: "programming-fundamentals",
    topicId: "programming-fundamentals-control-flow",
    prompt:
      "A teammate's grading function gives top students the wrong label. What does grade(95) return?\n\nfunction grade(score) {\n  if (score >= 50) return \"pass\";\n  else if (score >= 90) return \"distinction\";\n  return \"fail\";\n}",
    options: ["\"distinction\"", "\"fail\"", "\"pass\"", "undefined"],
    answer: 2,
    explanation:
      "Branches are checked from top to bottom and the first true condition wins, so 95 >= 50 returns \"pass\" before the 90 check is ever reached. It looks as if it should return \"distinction\", but that branch can never run; the stricter condition has to be tested first.",
  },
  {
    id: "programming-fundamentals-p2",
    skillId: "programming-fundamentals",
    topicId: "programming-fundamentals-control-flow",
    prompt:
      "A junior writes this countdown and calls countdown(3). What happens?\n\nfunction countdown(n) {\n  console.log(n);\n  countdown(n - 1);\n}",
    options: [
      "It keeps calling itself until the stack overflows",
      "It prints 3, 2, 1 and then stops without an error",
      "It prints only 3 and then stops without an error",
      "It prints 3, 2, 1, 0 and then stops without an error",
    ],
    answer: 0,
    explanation:
      "There is no base case, so nothing ever tells the function to stop: each call makes another call until the call stack runs out of space. It will not stop at 1 or 0 by itself; it needs a check such as if (n < 0) return; before the recursive call.",
  },
  {
    id: "programming-fundamentals-p3",
    skillId: "programming-fundamentals",
    topicId: "programming-fundamentals-data-structures",
    prompt:
      "A help desk app must hand support tickets to agents in the order they arrived: the oldest waiting ticket is always served next. Which data structure models this most naturally?",
    options: ["A stack (LIFO)", "A hash set", "A binary search tree", "A queue (FIFO)"],
    answer: 3,
    explanation:
      "A queue is first-in, first-out: items join at the back and leave from the front, so the oldest ticket is served first. A stack does the opposite and keeps serving the newest ticket, leaving the earliest customers waiting the longest.",
  },
  {
    id: "programming-fundamentals-p4",
    skillId: "programming-fundamentals",
    topicId: "programming-fundamentals-data-structures",
    prompt:
      "You need to count how many times each word appears in a large text file, then look up the count for any given word quickly. Which structure fits best?",
    options: [
      "A stack of words",
      "A hash map from word to count",
      "A queue of words",
      "A linked list of words in the order they appear",
    ],
    answer: 1,
    explanation:
      "A hash map stores a value against each key, so you can find and update a word's count in average O(1) time. A list of words would force you to scan the whole list for every lookup, which becomes very slow on a large file.",
  },
  {
    id: "programming-fundamentals-p5",
    skillId: "programming-fundamentals",
    topicId: "programming-fundamentals-complexity",
    prompt:
      "A function reverses a list of n items by building a brand-new list of the same length and returning it. How much extra memory does it use as n grows?",
    options: ["O(n)", "O(1)", "O(log n)", "O(n^2)"],
    answer: 0,
    explanation:
      "The new list needs one slot for every input item, so the extra memory grows in direct proportion to n, which is O(n). It would be O(1) only if the list were reversed in place by swapping items, using just a couple of temporary variables.",
  },
  {
    id: "programming-fundamentals-p6",
    skillId: "programming-fundamentals",
    topicId: "programming-fundamentals-complexity",
    prompt:
      "A report uses an O(n^2) algorithm and takes about 1 second for 1,000 records. Roughly how long should you expect it to take for 10,000 records?",
    options: ["About 2 seconds", "About 10 seconds", "About 20 seconds", "About 100 seconds"],
    answer: 3,
    explanation:
      "With O(n^2), making the input 10 times larger makes the work about 10 x 10 = 100 times larger, so 1 second becomes roughly 100 seconds. Ten seconds would be right for a linear O(n) algorithm, which is why quadratic code that feels fine on small test data can become unusable in production.",
  },
  {
    id: "programming-fundamentals-p7",
    skillId: "programming-fundamentals",
    topicId: "programming-fundamentals-debugging",
    prompt:
      "A function returns the wrong total for one customer's order, with no error message. You do not yet know why. What is the best first step?",
    options: [
      "Rewrite the whole function from scratch in a cleaner style",
      "Reproduce it with that order and inspect intermediate values",
      "Change one line at a time at random until the total looks right",
      "Wrap the function in try/catch so the wrong total is not shown",
    ],
    answer: 1,
    explanation:
      "Reproducing the bug reliably and watching the values change, with logs or a debugger, shows you exactly where the result first goes wrong. Rewriting or changing lines at random might hide the symptom, but you would not know the cause, so the bug can easily come back.",
  },
  {
    id: "programming-fundamentals-p8",
    skillId: "programming-fundamentals",
    topicId: "programming-fundamentals-debugging",
    prompt:
      "After this change, every user is shown the admin panel, including guests. What is the bug?\n\nfunction canSeeAdminPanel(user) {\n  if (user.role = \"admin\") {\n    return true;\n  }\n  return false;\n}",
    options: [
      "The function should return the strings \"true\" and \"false\"",
      "user.role is always undefined inside a function",
      "= assigns instead of comparing; the condition needs ===",
      "The return false line runs before the if statement",
    ],
    answer: 2,
    explanation:
      "A single = is assignment, so the condition sets user.role to \"admin\" and then evaluates to that non-empty string, which counts as true for every user. Comparison needs ===. The order of the lines is fine; the wrong operator is the whole problem.",
  },

  // ───────── api-design ─────────
  {
    id: "api-design-p1",
    skillId: "api-design",
    topicId: "api-design-resources-methods",
    prompt:
      "A teammate implements an 'Unsubscribe' link as GET /users/7/unsubscribe. Soon users are being unsubscribed without clicking, because email scanners and browser prefetching follow links automatically. What is the design mistake?",
    options: [
      "The id should be sent as a query string, as in GET /unsubscribe?user=7",
      "GET should only read; state changes need POST, PATCH, or DELETE",
      "The endpoint should respond with 201 Created instead of 200 OK",
      "The user id in the URL should be Base64-encoded so scanners skip it",
    ],
    answer: 1,
    explanation:
      "GET is defined as a safe method: crawlers, link scanners, and prefetchers are allowed to assume that following a GET link changes nothing. Moving the id into a query string would still be a GET, so the same accidental unsubscribes would happen.",
  },
  {
    id: "api-design-p2",
    skillId: "api-design",
    topicId: "api-design-resources-methods",
    prompt:
      "Clients need to create a new task in a to-do API. The server generates the task's id. Which request is the conventional REST design?",
    options: [
      "GET /tasks/create?title=Buy+milk",
      "POST /createTask with body { \"title\": \"Buy milk\" }",
      "PUT /tasks with body { \"title\": \"Buy milk\" }",
      "POST /tasks with body { \"title\": \"Buy milk\" }",
    ],
    answer: 3,
    explanation:
      "POST to the collection URL asks the server to create a new item in that collection and choose its id. POST /createTask also uses POST, but it puts a verb in the path; in REST the path names the resource (tasks) and the HTTP method supplies the action.",
  },
  {
    id: "api-design-p3",
    skillId: "api-design",
    topicId: "api-design-status-codes",
    prompt:
      "A client calls GET /orders/999, but no order with id 999 exists. Which response is most appropriate?",
    options: [
      "404 Not Found with a short error body",
      "200 OK with an empty JSON object as the body",
      "500 Internal Server Error",
      "204 No Content",
    ],
    answer: 0,
    explanation:
      "404 tells the client clearly that nothing exists at that URL. Returning 200 with an empty object is tempting, but it reports success, so every client has to inspect the body to discover that the request actually failed. 500 is wrong because the server itself did not malfunction.",
  },
  {
    id: "api-design-p4",
    skillId: "api-design",
    topicId: "api-design-status-codes",
    prompt:
      "POST /users requires an email field. A client sends a body with no email. Which response helps the client most?",
    options: [
      "200 OK with a body of { \"success\": false }",
      "500 Internal Server Error with the server's stack trace",
      "400 Bad Request with a body saying email is required",
      "404 Not Found with an empty response body",
    ],
    answer: 2,
    explanation:
      "The request itself is invalid, which is a client error, so a 4xx code is right, and a body that names the missing field tells the developer exactly what to fix (some APIs use 422 for this; it is also a client-error code). 500 would wrongly blame the server, and a stack trace leaks internal details.",
  },
  {
    id: "api-design-p5",
    skillId: "api-design",
    topicId: "api-design-pagination-filtering",
    prompt:
      "GET /transactions returns every transaction in one response. The table now has 300,000 rows, responses take 20 seconds, and the mobile app sometimes runs out of memory. What is the best fix?",
    options: [
      "Ask clients to call the endpoint only at night",
      "Raise the server's request timeout to 60 seconds",
      "Remove some fields so each transaction is slightly smaller",
      "Add pagination with a default and maximum page size",
    ],
    answer: 3,
    explanation:
      "Pagination returns the data in small chunks, and a maximum page size stops any client from asking for everything at once. Trimming fields or raising the timeout only delays the problem, because the response still grows with every new transaction.",
  },
  {
    id: "api-design-p6",
    skillId: "api-design",
    topicId: "api-design-pagination-filtering",
    prompt:
      "Your paginated GET /comments endpoint returns 20 items per page. To find the end of the list, clients currently keep requesting pages until one comes back empty. What should each response include to avoid this guesswork?",
    options: [
      "A 404 Not Found status as soon as a page comes back empty",
      "Next-page information, such as a cursor or a hasMore flag",
      "Every comment id in a custom header on each response",
      "A larger page size, so that fewer requests are needed overall",
    ],
    answer: 1,
    explanation:
      "Next-page information (a next cursor, a next link, or a hasMore flag) tells the client immediately whether there is anything left to fetch. A bigger page size reduces the number of requests, but the client still cannot tell which page is the last one.",
  },
  {
    id: "api-design-p7",
    skillId: "api-design",
    topicId: "api-design-versioning-reliability",
    prompt:
      "Third-party apps consume your GET /users/{id} response. Which of these changes can you normally ship without releasing a new API version?",
    options: [
      "Renaming the field email to emailAddress",
      "Changing id from a number to a string",
      "Adding a new optional field, avatarUrl",
      "Removing the phone field",
    ],
    answer: 2,
    explanation:
      "Adding an optional field is backwards-compatible, because well-behaved clients simply ignore fields they do not know. Renaming, removing, or changing the type of a field breaks any client that reads the old one, so those changes need a new version.",
  },
  {
    id: "api-design-p8",
    skillId: "api-design",
    topicId: "api-design-versioning-reliability",
    prompt:
      "A client sends DELETE /sessions/abc, the network times out, and the client cannot tell whether it worked. Is it safe for the client to send the same request again?",
    options: [
      "Yes; DELETE is idempotent, so the end state is the same",
      "No; each retry would delete a different session",
      "No; HTTP forbids sending the same DELETE request more than once",
      "Only if the request is changed to POST first",
    ],
    answer: 0,
    explanation:
      "An idempotent method leaves the server in the same state whether it is sent once or several times: after any number of these calls, session abc is gone. The repeat may return 404 because the session was already deleted, but nothing extra is removed. Switching to POST would make things worse, since POST is not idempotent by default.",
  },

  // ───────── auth-security ─────────
  {
    id: "auth-security-p1",
    skillId: "auth-security",
    topicId: "auth-security-authn-authz",
    prompt:
      "Staff sign in to an internal tool with their company email and a one-time code. After sign-in, the tool checks whether the person has the finance role before showing the payroll page. Which part is authorization?",
    options: [
      "Typing the company email address",
      "Entering the one-time code",
      "Loading the page over HTTPS",
      "Checking for the finance role",
    ],
    answer: 3,
    explanation:
      "Authorization decides what an already-identified user is allowed to do, which here is the role check before the payroll page. The email and one-time code are authentication: they prove who the person is, but say nothing about what they may access.",
  },
  {
    id: "auth-security-p2",
    skillId: "auth-security",
    topicId: "auth-security-authn-authz",
    prompt:
      "A nightly script only needs to read the orders table to build a report. A teammate suggests giving it the database admin account 'so it never hits a permission error'. What should you do instead?",
    options: [
      "Give it its own account with read-only access to the orders table",
      "Use the admin account, but only allow the script to run at night",
      "Share one developer's personal database login with the script",
      "Use the admin account and keep its password inside the script file",
    ],
    answer: 0,
    explanation:
      "Least privilege means each user or program gets only the access it needs, so if the script has a bug or its credentials leak, the damage is limited to reading one table. Running with the admin account at night does not reduce the risk; it can still change or delete everything.",
  },
  {
    id: "auth-security-p3",
    skillId: "auth-security",
    topicId: "auth-security-password-storage",
    prompt:
      "Your users table stores only a salted bcrypt hash of each password. A user submits their password on the login form. How does the server check it?",
    options: [
      "Decrypt the stored hash and compare the result with the submitted password",
      "Compare the submitted password directly with the stored hash as text",
      "Hash the submitted password with the stored salt and compare the hashes",
      "Email the stored hash to the user and ask them to confirm it",
    ],
    answer: 2,
    explanation:
      "Hashing is one-way, so the server repeats the same hashing on the submitted password, using the salt saved alongside the hash, and checks that the results match. There is nothing to decrypt: a hash cannot be turned back into the original password, which is exactly why it is safe to store.",
  },
  {
    id: "auth-security-p4",
    skillId: "auth-security",
    topicId: "auth-security-password-storage",
    prompt:
      "A user has forgotten their password. The support team asks you to add a feature that emails users their current password. What is the right response?",
    options: [
      "Build it, but make sure the email is sent over an encrypted connection",
      "Send a short-lived, single-use link to set a new password",
      "Keep a second, plain-text copy of each password just for support",
      "Email the stored hash so the user can work out the password",
    ],
    answer: 1,
    explanation:
      "With properly hashed passwords the system cannot know the current password, and it should not be able to. A reset link that expires quickly and works only once lets the real owner choose a new one; keeping a plain-text copy would hand every password to anyone who breaches the database.",
  },
  {
    id: "auth-security-p5",
    skillId: "auth-security",
    topicId: "auth-security-sessions-tokens",
    prompt:
      "Your app uses server-side sessions identified by a cookie. When a user clicks 'Log out', what must happen for the logout to be effective?",
    options: [
      "The server invalidates the session, so that session id stops working",
      "The browser deletes the cookie, and the server keeps the session as it is",
      "The page hides the user's name and redirects to the home page",
      "The session id is moved from the cookie into localStorage",
    ],
    answer: 0,
    explanation:
      "Logout has to end the session on the server, because any other copy of the session id (for example one stolen earlier) would otherwise keep working. Deleting only the browser's cookie removes one copy of the id but leaves the session itself alive.",
  },
  {
    id: "auth-security-p6",
    skillId: "auth-security",
    topicId: "auth-security-sessions-tokens",
    prompt:
      "Your API issues JWT access tokens that never expire. A token is copied from a user's old laptop, and the thief can use the API indefinitely. Which change best limits this kind of damage?",
    options: [
      "Make the token longer by adding more claims to the payload",
      "Send the token in the URL query string instead of a header",
      "Give access tokens a short expiry, with a refresh flow",
      "Base64-encode the token a second time before sending it",
    ],
    answer: 2,
    explanation:
      "A short expiry means a stolen access token stops working within minutes, and the refresh step gives the server a point where it can refuse to issue a new one. Encoding the token again adds no protection, because anyone can decode Base64.",
  },
  {
    id: "auth-security-p7",
    skillId: "auth-security",
    topicId: "auth-security-common-vulnerabilities",
    prompt:
      "A banking site identifies users by a session cookie. While logged in, a user visits a malicious page that silently submits a hidden form to the bank's /transfer endpoint, and the browser attaches the cookie automatically. What is this attack, and a standard defence?",
    options: [
      "SQL injection; use parameterized queries for the transfer",
      "CSRF; require an anti-CSRF token on the form",
      "Stored XSS; escape user content when rendering it",
      "Brute force; lock the account after failed logins",
    ],
    answer: 1,
    explanation:
      "In cross-site request forgery, another site makes the user's browser send a request that carries the user's cookie, so the bank sees it as genuine. An anti-CSRF token (often combined with SameSite cookies) defeats this because the attacker's page cannot supply the secret token. It is not XSS: no attacker script runs on the bank's own pages.",
  },
  {
    id: "auth-security-p8",
    skillId: "auth-security",
    topicId: "auth-security-common-vulnerabilities",
    prompt:
      "You notice that a teammate committed a live payment-provider API key to a public Git repository an hour ago. What is the most important action?",
    options: [
      "Remove the key from the file in a new commit and carry on",
      "Rename the variable so the key is harder to search for",
      "Make the repository private and keep using the same key",
      "Revoke the key and issue a new one kept out of the code",
    ],
    answer: 3,
    explanation:
      "Once a secret has been public it must be treated as stolen, so the real fix is to revoke it and issue a new one, loaded from an environment variable or secret manager instead of the code. Deleting it in a new commit is not enough, because the old key is still visible in the Git history.",
  },

  // ───────── testing-basics ─────────
  {
    id: "testing-basics-p1",
    skillId: "testing-basics",
    topicId: "testing-basics-unit-tests",
    prompt:
      "You are writing a unit test for cartTotal(). When a test fails in CI, the report shows only the test's name. Which name tells a teammate the most about what broke?",
    options: ["returns 0 for an empty cart", "test1", "cart test", "cartTotal works correctly in all cases"],
    answer: 0,
    explanation:
      "A good test name states the situation and the expected behaviour, so a failure report reads like a sentence: cartTotal returns 0 for an empty cart. Names like 'cart test' or 'cartTotal works correctly in all cases' point at an area but not at what was expected, so someone has to open the code to find out.",
  },
  {
    id: "testing-basics-p2",
    skillId: "testing-basics",
    topicId: "testing-basics-unit-tests",
    prompt:
      "Test B passes when the whole file runs, but fails when run on its own. You find that test A adds an item to a shared cart object that test B relies on. What is the best fix?",
    options: [
      "Always run the tests in the same order",
      "Merge tests A and B into one long test",
      "Give each test its own fresh state",
      "Add a short delay before test B starts",
    ],
    answer: 2,
    explanation:
      "Unit tests should be isolated: each one sets up its own data, for example in a beforeEach step, so it passes alone and in any order. Fixing the run order only hides the dependency, and it breaks again as soon as tests are filtered, reordered, or run in parallel.",
  },
  {
    id: "testing-basics-p3",
    skillId: "testing-basics",
    topicId: "testing-basics-test-design",
    prompt:
      "A discount rule has three bands: order totals under 100 get no discount, 100 to 499 get 5%, and 500 or more get 10%. You start with three tests. Which set of order totals exercises all three bands?",
    options: ["10, 20, 30", "50, 250, 800", "150, 250, 350", "600, 700, 900"],
    answer: 1,
    explanation:
      "Inputs in the same band should behave the same way, so one value from each band (an equivalence partition) covers all three behaviours with few tests. Three values from a single band, such as 150, 250, and 350, repeat the same check three times and leave the other two bands untested.",
  },
  {
    id: "testing-basics-p4",
    skillId: "testing-basics",
    topicId: "testing-basics-test-design",
    prompt:
      "withdraw(amount) must throw an InsufficientFunds error when the amount is greater than the balance. The existing tests only cover successful withdrawals. Which test is the most valuable to add?",
    options: [
      "Another successful withdrawal with a different amount",
      "A test that runs the same successful withdrawal 100 times",
      "A test that checks the balance is a number",
      "A test that overdraws and expects InsufficientFunds",
    ],
    answer: 3,
    explanation:
      "Error paths are behaviour too: without this test, someone could remove the balance check and every existing test would still pass. More successful withdrawals with different amounts only exercise the branch that is already covered.",
  },
  {
    id: "testing-basics-p5",
    skillId: "testing-basics",
    topicId: "testing-basics-mocking",
    prompt:
      "getWeather() should return a friendly fallback message when the weather API is down. How can you test that path reliably?",
    options: [
      "Wait until the real weather API has an outage, then run the test",
      "Stub the API client to throw an error, then assert the fallback",
      "Switch off the network on the machine that runs the tests",
      "Leave that path untested, since outages cannot be simulated",
    ],
    answer: 1,
    explanation:
      "A test double lets you force the failure on demand, so the error-handling path runs the same way every time and on every machine. Depending on a real outage or a disconnected network makes the test slow, unrepeatable, and impractical to run in CI.",
  },
  {
    id: "testing-basics-p6",
    skillId: "testing-basics",
    topicId: "testing-basics-mocking",
    prompt:
      "A test for placeOrder() mocks every helper and asserts the exact order in which the internal functions are called. After a refactor that does not change behaviour, the test fails. What is the underlying problem?",
    options: [
      "The refactor should be reverted so the test passes again",
      "The test needs even more mocks to become stable",
      "Mocks only work properly in end-to-end tests",
      "The test checks implementation details, not results",
    ],
    answer: 3,
    explanation:
      "A test that pins down how the code works internally breaks whenever the internals change, even when the outcome is still correct. Asserting on observable results, such as the saved order and the returned total, keeps the test useful through refactoring; mocks are best kept for true external boundaries like payment or email services.",
  },
  {
    id: "testing-basics-p7",
    skillId: "testing-basics",
    topicId: "testing-basics-integration-ci",
    prompt:
      "Your team's tests pass on each developer's laptop, but the main branch keeps breaking because people forget to run the full suite before merging. What should the team set up?",
    options: [
      "A weekly meeting that reminds everyone to run the tests first",
      "A rule that only senior developers are allowed to merge",
      "CI that runs the tests on every pull request before merge",
      "A shared spreadsheet where developers log their test results",
    ],
    answer: 2,
    explanation:
      "Continuous integration runs the tests automatically on a clean machine for every change, so a broken change is caught and blocked before it reaches main and nobody has to remember anything. Reminders and manual records still rely on people doing the step every time, which is what failed in the first place.",
  },
  {
    id: "testing-basics-p8",
    skillId: "testing-basics",
    topicId: "testing-basics-integration-ci",
    prompt:
      "You are adding integration tests for an API that reads and writes a PostgreSQL database. Which database should the tests run against in CI?",
    options: [
      "A separate test database that is reset for each run",
      "The production database, using a read-only account",
      "The production database, with the test rows deleted afterwards",
      "No database at all; replace every query with a mock",
    ],
    answer: 0,
    explanation:
      "A dedicated, disposable test database lets the tests run real queries against the real schema with no risk to live data, and resetting it gives every run a known starting point. Mocking every query also avoids that risk, but then nothing checks that the code and the database actually work together, which is the point of an integration test.",
  },

  // ───────── system-design ─────────
  {
    id: "system-design-p1",
    skillId: "system-design",
    topicId: "system-design-databases",
    prompt:
      "After an index fixed one slow query, a teammate proposes adding an index to every column of the orders table 'so everything is fast'. The table receives thousands of inserts per minute. What is the main downside?",
    options: [
      "Indexes make SELECT queries on that table return wrong rows",
      "A table can only ever have one index",
      "Every insert must also update each index, slowing writes",
      "Indexes are lost whenever the database restarts, so queries break",
    ],
    answer: 2,
    explanation:
      "An index is an extra structure the database has to keep up to date, so each one adds work to every insert, update, and delete, and takes storage. Indexes are worth it on columns that queries actually filter or sort by, not on every column.",
  },
  {
    id: "system-design-p2",
    skillId: "system-design",
    topicId: "system-design-databases",
    prompt:
      "You are storing product listings for a marketplace. Each category has different attributes (a phone has storage and screen size, a book has an author and page count), new attributes appear often, and a listing is always read and written as one whole item by its id. Which option is the most natural fit?",
    options: [
      "A message queue that holds each listing as a message",
      "A document database storing each listing as one JSON-like document",
      "A load balancer configured with sticky sessions",
      "One relational table with a fixed set of columns shared by all categories",
    ],
    answer: 1,
    explanation:
      "A document database lets each listing carry its own set of fields and returns the whole item in one read by id, which matches how this data is shaped and used. A single fixed-column table would need a schema change for every new attribute and would be mostly empty columns for any given category.",
  },
  {
    id: "system-design-p3",
    skillId: "system-design",
    topicId: "system-design-caching",
    prompt:
      "Your API uses the cache-aside pattern for product details. A request arrives for product 9 and the cache has no entry for it. What should the application do?",
    options: [
      "Return 404 Not Found, because the product is not in the cache",
      "Wait until the entry appears in the cache, then return it",
      "Clear the entire cache and ask the client to retry",
      "Read it from the database, cache it, and return it",
    ],
    answer: 3,
    explanation:
      "In cache-aside, the application checks the cache first and on a miss falls back to the database, then saves the result so the next request is a hit. A miss only means the data has not been cached yet, not that the product does not exist, so 404 would be wrong.",
  },
  {
    id: "system-design-p4",
    skillId: "system-design",
    topicId: "system-design-caching",
    prompt:
      "Your web app is hosted in one region. Users on other continents report slow page loads, and most of the time is spent downloading images, CSS, and JavaScript files that rarely change. What is the most suitable improvement?",
    options: [
      "Serve the static files through a CDN close to the users",
      "Add more database indexes so the files are found faster",
      "Store the static files in the main database instead of on disk",
      "Send each file request through a message queue to a worker",
    ],
    answer: 0,
    explanation:
      "A CDN keeps copies of static files on servers around the world, so each user downloads them from a nearby location instead of the distant origin. Files that rarely change are ideal to cache this way; database indexes and queues do nothing about the distance the bytes have to travel.",
  },
  {
    id: "system-design-p5",
    skillId: "system-design",
    topicId: "system-design-scaling",
    prompt:
      "Three API servers sit behind a load balancer. One server crashes overnight, and roughly one in three requests starts failing. Which load balancer feature prevents this?",
    options: [
      "Sticky sessions, so each user always reaches the same server",
      "Health checks that take failed servers out of rotation",
      "A larger limit on the size of request bodies",
      "Round-robin ordering of the servers by name",
    ],
    answer: 1,
    explanation:
      "A load balancer that regularly checks each server can stop sending traffic to one that fails, so the remaining two absorb the load and users see no errors. Sticky sessions would make it worse: everyone pinned to the crashed server would fail on every request.",
  },
  {
    id: "system-design-p6",
    skillId: "system-design",
    topicId: "system-design-scaling",
    prompt:
      "Your app's single database server is overloaded. Monitoring shows 95% of its work is read queries from reporting pages, while writes are light, and the application servers have plenty of spare capacity. Which change targets the bottleneck?",
    options: [
      "Add more application servers behind the load balancer",
      "Move the write queries onto a message queue",
      "Add read replicas and send reporting queries there",
      "Increase the session timeout for reporting users",
    ],
    answer: 2,
    explanation:
      "Read replicas are copies of the database that can answer read queries, which spreads the heavy reporting load and leaves the primary free for writes. More application servers would not help, because the database, not the app tier, is the part that is overloaded. Replicas can lag slightly behind the primary, which is usually fine for reports.",
  },
  {
    id: "system-design-p7",
    skillId: "system-design",
    topicId: "system-design-queues",
    prompt:
      "Orders are placed on a queue and processed by two workers. During a sale, orders arrive five times faster than the workers can handle. What happens, and what is the usual response?",
    options: [
      "Messages wait in the queue; add workers to clear them",
      "The extra messages are dropped; ask customers to order again",
      "The queue speeds the workers up automatically; do nothing",
      "The web servers crash; remove the queue to fix it",
    ],
    answer: 0,
    explanation:
      "A queue acts as a buffer: when producers are faster than consumers, messages pile up and wait rather than being lost, and the site keeps accepting orders. Because workers pull from the same queue independently, running more of them drains the backlog faster; the queue itself does not make any worker quicker.",
  },
  {
    id: "system-design-p8",
    skillId: "system-design",
    topicId: "system-design-queues",
    prompt:
      "One malformed message makes your worker throw an error every time. The queue keeps redelivering it, and the worker spends its time failing on that one message again and again. What is the standard way to handle this?",
    options: [
      "Keep retrying the message forever until it eventually succeeds",
      "Delete the whole queue and start again",
      "Stop the worker whenever a message fails",
      "Move it to a dead-letter queue after a few failed tries",
    ],
    answer: 3,
    explanation:
      "A retry limit with a dead-letter queue sets the bad message aside after a few attempts, so the worker can get on with healthy messages and an engineer can inspect the failed one later. Retrying forever never helps here, because the message itself is broken and will fail the same way each time.",
  },
];
