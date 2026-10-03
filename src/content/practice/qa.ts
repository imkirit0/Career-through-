import type { Question } from "../taxonomy";

export const questions: Question[] = [
  // ───────── manual-testing ─────────
  {
    id: "manual-testing-p1",
    skillId: "manual-testing",
    topicId: "manual-testing-fundamentals",
    prompt:
      "A sign-up form has 12 fields, and each field accepts thousands of possible values. Your manager asks you to test every possible combination before release. What is the most accurate response?",
    options: [
      "Agree, because testing every combination is the only way to be thorough",
      "Agree, but test the combinations in alphabetical order to save time",
      "Explain that testing everything is not feasible, and prioritise tests by risk instead",
      "Refuse to test the form until the number of fields is reduced",
    ],
    answer: 2,
    explanation:
      "Exhaustive testing is impossible for anything beyond trivial software, because the number of combinations grows far faster than the time available. Testers use risk and test design techniques to choose a small set of tests that matter most. Agreeing to test everything sounds thorough, but it can never actually be finished.",
  },
  {
    id: "manual-testing-p2",
    skillId: "manual-testing",
    topicId: "manual-testing-fundamentals",
    prompt:
      "Your team has run the same 150 regression test cases, unchanged, for a year. They pass every time, yet customers keep finding new defects. What is the most likely explanation?",
    options: [
      "The suite has gone stale and needs new and updated tests",
      "The customers are using the product incorrectly, so their defects do not count",
      "The tests pass, so the defects must be caused by the production servers",
      "Regression tests are meant to be run only once and should now be deleted",
    ],
    answer: 0,
    explanation:
      "Tests that never change keep checking the same paths, so over time they stop revealing anything new. The fix is to review the suite regularly and add or change tests for new features and risks. Blaming the customers is tempting, but the problems that real usage exposes are exactly what the tests should be extended to cover.",
  },
  {
    id: "manual-testing-p3",
    skillId: "manual-testing",
    topicId: "manual-testing-levels-types",
    prompt:
      "A developer writes a test that calls a single function, calculateTax(), with fixed inputs and checks the value it returns. The database is replaced with a fake. Which test level is this?",
    options: ["System testing", "Acceptance testing", "Integration testing", "Unit testing"],
    answer: 3,
    explanation:
      "Unit testing checks one small piece of code in isolation, which is why the database is replaced with a fake. Integration testing is the tempting choice, but it would keep the real connection between components in place to check that they work together.",
  },
  {
    id: "manual-testing-p4",
    skillId: "manual-testing",
    topicId: "manual-testing-levels-types",
    prompt:
      "System testing of a payroll application is complete. Before go-live, staff from the client's HR department run their real month-end process on it to decide whether the system is fit for their work. What is this called?",
    options: ["Smoke testing", "User acceptance testing", "Unit testing", "Regression testing"],
    answer: 1,
    explanation:
      "User acceptance testing is carried out by the actual users or the client, against their real business needs, to decide whether the system can be accepted. Regression testing looks for side effects of a change, which is not the purpose here.",
  },
  {
    id: "manual-testing-p5",
    skillId: "manual-testing",
    topicId: "manual-testing-execution",
    prompt:
      "You are executing a test case for order refunds. At step 2 you cannot continue because the Orders page will not load, due to a separate defect that has already been logged. How should you record the refund test case?",
    options: [
      "Passed, because no refund defect was observed",
      "Blocked, with a link to the blocking defect",
      "Failed, because the test did not reach its last step",
      "Leave it without a status and do not mention it in the report",
    ],
    answer: 1,
    explanation:
      "Blocked means the test could not be run because of something outside it, and linking the blocking defect shows what must be fixed first. Marking it Failed is tempting, but that would claim the refund feature itself is broken, which you have not been able to check.",
  },
  {
    id: "manual-testing-p6",
    skillId: "manual-testing",
    topicId: "manual-testing-execution",
    prompt:
      "While executing a test case, the actual result differs from the expected result. You then find that the requirement was changed last sprint and the test case was never updated; the application matches the new requirement. What should you do?",
    options: [
      "Log a defect against the application, because the test case failed",
      "Mark the test as passed and leave the test case as it is",
      "Ask the developer to change the application to match the old test case",
      "Update the test case to the current requirement and re-run it",
    ],
    answer: 3,
    explanation:
      "A test case is only as good as the requirement it was written from, so when the requirement changes the test case must be updated too. Logging a defect is tempting because the test 'failed', but the application is correct here and the report would waste the developer's time.",
  },
  {
    id: "manual-testing-p7",
    skillId: "manual-testing",
    topicId: "manual-testing-exploratory",
    prompt:
      "You are 20 minutes into a 60-minute exploratory session with the charter 'Explore search filters for incorrect results'. You notice something odd on the unrelated Profile page. What is the best way to handle it?",
    options: [
      "Note it briefly, return to the charter, and propose a separate session for it",
      "Abandon the search charter and spend the rest of the session on the Profile page",
      "Ignore it completely, because it is outside the charter",
      "Stop the session and write detailed scripted test cases for the Profile page",
    ],
    answer: 0,
    explanation:
      "A charter keeps a session focused, but observations outside it are still valuable, so you note them and follow up later. Dropping the charter is tempting when something interesting appears, but it leaves the search filters untested and the goal of the session unmet.",
  },
  {
    id: "manual-testing-p8",
    skillId: "manual-testing",
    topicId: "manual-testing-exploratory",
    prompt:
      "You try to complete a registration form using only the keyboard. The Tab key never reaches the Submit button, so the form cannot be submitted without a mouse. Which type of testing found this problem?",
    options: ["Load testing", "Compatibility testing", "Accessibility testing", "Security testing"],
    answer: 2,
    explanation:
      "Accessibility testing checks that people with disabilities can use the product, including those who rely on a keyboard or a screen reader instead of a mouse. Compatibility testing is tempting, but it compares behaviour across browsers and devices, while this problem is about how the user operates the form.",
  },

  // ───────── test-case-design ─────────
  {
    id: "test-case-design-p1",
    skillId: "test-case-design",
    topicId: "test-case-design-equivalence-partitioning",
    prompt:
      "A quantity field accepts whole numbers from 1 to 10. You have already tested the value 5 and it was accepted. A colleague suggests also testing 4, 6 and 7. According to equivalence partitioning, how useful are those extra tests?",
    options: [
      "Essential, because every valid value must be tested individually",
      "Of little value, because they sit in the same partition as 5",
      "Useless, because valid values never need to be tested at all",
      "Essential, because 4, 6 and 7 are the boundary values of the field",
    ],
    answer: 1,
    explanation:
      "Equivalence partitioning assumes every value in a partition is handled the same way, so one representative is enough. More values from the valid range add little; the time is better spent on the invalid partitions, such as 0 and 11. Testing every value sounds safer, but it does not scale beyond tiny ranges.",
  },
  {
    id: "test-case-design-p2",
    skillId: "test-case-design",
    topicId: "test-case-design-equivalence-partitioning",
    prompt:
      "An exam system gives grades by score: 0 to 39 is Fail, 40 to 59 is Pass and 60 to 100 is Distinction. Which pair of scores belongs to the same equivalence partition?",
    options: ["39 and 40", "59 and 60", "100 and 101", "45 and 58"],
    answer: 3,
    explanation:
      "45 and 58 both fall in the 40 to 59 range and both give Pass, so the system should treat them the same way. A pair like 39 and 40 looks close together, but the two values sit on opposite sides of a boundary and give different grades, so they belong to different partitions.",
  },
  {
    id: "test-case-design-p3",
    skillId: "test-case-design",
    topicId: "test-case-design-boundary-values",
    prompt:
      "A field accepts whole numbers from 1 to 100. Using three-value boundary value analysis, which values test the upper boundary?",
    options: ["99, 100 and 101", "100 and 101", "50, 100 and 150", "98, 99 and 100"],
    answer: 0,
    explanation:
      "Three-value boundary analysis tests the boundary itself and the value on each side of it, so for an upper limit of 100 that is 99, 100 and 101. Testing only 100 and 101 is the two-value version, which is also a valid technique but is not what was asked.",
  },
  {
    id: "test-case-design-p4",
    skillId: "test-case-design",
    topicId: "test-case-design-boundary-values",
    prompt:
      "A temperature alarm must sound when the reading is above 30.0 degrees. The sensor reports values to one decimal place. Which two values test this boundary most precisely?",
    options: ["29.0 and 31.0", "30.0 and 31.0", "30.0 and 30.1", "25.0 and 35.0"],
    answer: 2,
    explanation:
      "Boundary values are the closest values on each side of the rule: 30.0 is the highest reading that must not trigger the alarm and 30.1 is the lowest that must. Whole-degree steps like 29.0 and 31.0 are tempting, but they leave a gap, so a mistake at 30.0 or 30.1 would go unnoticed.",
  },
  {
    id: "test-case-design-p5",
    skillId: "test-case-design",
    topicId: "test-case-design-decision-tables",
    prompt:
      "A delivery fee depends on three things together: whether the customer is a member, whether the order is over 1,000, and whether the address is in the city. Different combinations give different fees. Which technique is best suited to making sure every combination is covered?",
    options: ["Boundary value analysis", "Exploratory testing", "Decision table testing", "Smoke testing"],
    answer: 2,
    explanation:
      "A decision table lists every combination of conditions with its expected outcome, which is exactly what a rule that depends on several conditions together needs. Boundary value analysis is tempting because of the 1,000 limit, and it is useful for that one value, but it does not show how the three conditions combine.",
  },
  {
    id: "test-case-design-p6",
    skillId: "test-case-design",
    topicId: "test-case-design-decision-tables",
    prompt:
      "You build a decision table with two conditions: 'Premium member' and 'Coupon applied'. The specification gives the discount for three of the four combinations, but says nothing about a premium member who also applies a coupon. What should you do?",
    options: [
      "Raise the gap with the product owner or analyst and get the expected outcome defined",
      "Assume the two discounts add together and write the test that way",
      "Leave that combination out of the table, since it is not in the specification",
      "Test it and accept whatever the application does as the expected result",
    ],
    answer: 0,
    explanation:
      "One of the main benefits of a decision table is that it exposes combinations the specification forgot. The expected outcome is a business decision, so the gap should be raised and answered rather than guessed. Assuming the discounts add together is tempting, but a guess can turn wrong behaviour into a passing test.",
  },
  {
    id: "test-case-design-p7",
    skillId: "test-case-design",
    topicId: "test-case-design-writing-cases",
    prompt:
      "A test case titled 'Verify user account features' has 38 steps covering login, profile update, password change and logout. It fails at step 21, so the last 17 steps are never run. What is the main problem with how it was written?",
    options: [
      "It has too few steps to be reliable",
      "It should not include any expected results",
      "It should have been written after the feature was released",
      "It mixes several objectives in one test case",
    ],
    answer: 3,
    explanation:
      "A good test case checks one objective, so this one should be split into focused cases. Then a failure points clearly at one thing and does not stop unrelated checks from running. One long case feels efficient to write, but a single failure hides the status of everything after it.",
  },
  {
    id: "test-case-design-p8",
    skillId: "test-case-design",
    topicId: "test-case-design-writing-cases",
    prompt:
      "You review a colleague's test cases for a registration form. All 12 cases use valid data and check that registration succeeds. What important gap should you point out?",
    options: [
      "The cases should be merged into one long test case",
      "There are no negative cases, such as an invalid email",
      "Each step needs its own severity rating",
      "The valid data should be replaced with random data in every case",
    ],
    answer: 1,
    explanation:
      "Negative test cases check that the system rejects bad input with a clear message instead of accepting it or crashing. A suite with only valid data confirms the happy path but says nothing about how the form handles mistakes. Random data is not the answer either, because it is hard to repeat and does not target specific invalid inputs.",
  },

  // ───────── sdlc-stlc ─────────
  {
    id: "sdlc-stlc-p1",
    skillId: "sdlc-stlc",
    topicId: "sdlc-stlc-sdlc-models",
    prompt:
      "Requirements for a booking app have been signed off. The team is now deciding the database tables, the screens and how the modules will talk to each other. No code has been written yet. Which SDLC phase is this?",
    options: ["Requirements analysis", "Deployment", "Maintenance", "Design"],
    answer: 3,
    explanation:
      "The design phase turns agreed requirements into a plan for how the system will be built: its architecture, data and interfaces. Requirements analysis is the tempting choice, but that phase decides what the system must do, and here it has already been signed off.",
  },
  {
    id: "sdlc-stlc-p2",
    skillId: "sdlc-stlc",
    topicId: "sdlc-stlc-sdlc-models",
    prompt:
      "A startup's customer is unsure exactly what they need and expects to change their mind as they see the product. They want working software to try every two weeks. Which development approach fits best?",
    options: [
      "Waterfall, with all requirements fixed before design starts",
      "An iterative, agile approach with short cycles and regular feedback",
      "A single big release once every feature is finished",
      "Skipping requirements and testing so that coding can begin sooner",
    ],
    answer: 1,
    explanation:
      "Agile approaches deliver small working increments and use feedback to adjust the plan, which suits requirements that are unclear or changing. Waterfall works best when requirements are stable and well understood up front, because changes late in a sequential process are expensive.",
  },
  {
    id: "sdlc-stlc-p3",
    skillId: "sdlc-stlc",
    topicId: "sdlc-stlc-stlc-phases",
    prompt:
      "During the requirement analysis phase of STLC you read: 'The report page should load quickly.' What should you do with this requirement?",
    options: [
      "Ask for a measurable target, such as a load time in seconds",
      "Start test execution and decide what 'quickly' means while testing",
      "Ignore it, because performance wording is not a tester's concern",
      "Write the test summary report for it straight away",
    ],
    answer: 0,
    explanation:
      "In requirement analysis the tester checks that each requirement is clear and testable, and raises questions when it is not. 'Quickly' cannot be judged pass or fail, so it needs a measurable target. Deciding the meaning yourself during execution is tempting, but different people would reach different verdicts.",
  },
  {
    id: "sdlc-stlc-p4",
    skillId: "sdlc-stlc",
    topicId: "sdlc-stlc-stlc-phases",
    prompt:
      "Your lead asks for the document that states what will and will not be tested, the test approach, the schedule, who is responsible and the main risks. Which deliverable is this, and in which STLC phase is it produced?",
    options: [
      "Test cases, produced during test execution",
      "Defect report, produced during test closure",
      "Test plan, produced during test planning",
      "Test summary report, produced during requirement analysis",
    ],
    answer: 2,
    explanation:
      "The test plan is the main output of the test planning phase and sets out scope, approach, schedule, responsibilities and risks. A test summary report is easy to confuse with it, but that is written at the end of the cycle and describes what actually happened rather than what is intended.",
  },
  {
    id: "sdlc-stlc-p5",
    skillId: "sdlc-stlc",
    topicId: "sdlc-stlc-agile-testing",
    prompt:
      "On day 4 of a sprint you test a story that is still in progress and find a defect. What is the most effective way to handle it in an agile team?",
    options: [
      "Keep it to yourself until the sprint review so that the demo exposes it",
      "Wait until all stories are coded, then send one list of every defect",
      "Tell the developer straight away so it is fixed within the story",
      "Move the story to Done and log the defect for a later sprint",
    ],
    answer: 2,
    explanation:
      "Agile teams rely on fast feedback: the sooner a developer hears about a defect, the cheaper it is to fix while the code is fresh. How it is recorded follows the team's agreement, but the conversation should not wait. Saving defects up for one list at the end is a habit from phase-based projects, and it leaves no time to fix them within the sprint.",
  },
  {
    id: "sdlc-stlc-p6",
    skillId: "sdlc-stlc",
    topicId: "sdlc-stlc-agile-testing",
    prompt:
      "For three sprints in a row, stories have reached testing only on the last day, leaving no time to test them properly. In which Scrum event should the team examine this and agree a change to how it works?",
    options: ["Sprint review", "Sprint retrospective", "Backlog refinement", "Release planning"],
    answer: 1,
    explanation:
      "The sprint retrospective is where the team inspects how it worked and agrees improvements to its process. The sprint review is the tempting choice, but it focuses on the product increment and feedback from stakeholders, not on how the team works.",
  },
  {
    id: "sdlc-stlc-p7",
    skillId: "sdlc-stlc",
    topicId: "sdlc-stlc-planning-traceability",
    prompt:
      "The test plan says system testing may start only when the build passes the smoke test. A new build arrives and half of the main pages fail to load. Your manager is worried about the schedule. What should you do?",
    options: [
      "Start the full test cycle anyway and log every broken page as a separate defect",
      "Mark all planned test cases as failed without running them",
      "Wait quietly until a better build arrives",
      "Report that the entry criteria are not met and send the build back to be fixed",
    ],
    answer: 3,
    explanation:
      "Entry criteria exist to stop the team wasting time on a build that is not ready, and reporting clearly that the build failed them gets it fixed fastest. Starting the full cycle anyway feels like progress, but most tests would be blocked and would have to be run again later.",
  },
  {
    id: "sdlc-stlc-p8",
    skillId: "sdlc-stlc",
    topicId: "sdlc-stlc-planning-traceability",
    prompt:
      "While reviewing the requirements traceability matrix before test execution, you see that requirement REQ-07 has no test cases linked to it. What does this tell you?",
    options: [
      "REQ-07 has a coverage gap and needs test cases",
      "REQ-07 has already been tested and has passed",
      "REQ-07 has been removed from the release",
      "The developers have not yet finished coding REQ-07",
    ],
    answer: 0,
    explanation:
      "The matrix links each requirement to the tests that cover it, so a requirement with no linked tests is not being tested at all. It says nothing about whether the code is finished or working, only about test coverage, so reading the empty row as 'already passed' would let an untested requirement slip through.",
  },

  // ───────── api-testing ─────────
  {
    id: "api-testing-p1",
    skillId: "api-testing",
    topicId: "api-testing-http-methods",
    prompt:
      "You want to fetch products filtered by category 'shoes' with a maximum price of 100, using a GET request. Where are these filters normally sent?",
    options: [
      "In the query string of the URL",
      "In a JSON request body",
      "In the Authorization header",
      "In the response status line",
    ],
    answer: 0,
    explanation:
      "Filters for a GET request go in the query string after the question mark, for example /products?category=shoes&maxPrice=100. A request body is the tempting choice because POST uses one, but a body on a GET request has no defined meaning and many servers and tools ignore it.",
  },
  {
    id: "api-testing-p2",
    skillId: "api-testing",
    topicId: "api-testing-http-methods",
    prompt:
      "While testing, you find that sending 'GET /cart/clear' empties the user's shopping cart. Why is this a design problem worth reporting?",
    options: [
      "GET requests cannot be sent to a URL that contains a verb",
      "GET requests are always slower than DELETE requests",
      "GET should only read data, never change it",
      "GET requests are not allowed to return a response body",
    ],
    answer: 2,
    explanation:
      "GET is defined as a safe method: it should only retrieve data. Browsers, caches and link previews may send GET requests automatically, so a GET that changes data can be triggered by accident. An action like clearing a cart belongs on a method such as DELETE or POST.",
  },
  {
    id: "api-testing-p3",
    skillId: "api-testing",
    topicId: "api-testing-status-codes",
    prompt:
      "You send 'GET /products/999999' for a product id that does not exist. The request is well formed and you are logged in. Which status code should a well-designed API return?",
    options: ["200 OK with an empty body", "404 Not Found", "500 Internal Server Error", "401 Unauthorized"],
    answer: 1,
    explanation:
      "404 Not Found tells the client that the requested resource does not exist. Returning 200 with an empty body is tempting to implement, but it tells the client the request succeeded, which hides the fact that the product is missing.",
  },
  {
    id: "api-testing-p4",
    skillId: "api-testing",
    topicId: "api-testing-status-codes",
    prompt:
      "An API's documentation says each client may send at most 100 requests per minute. To test the limit you send 150 requests in one minute. Which status code should the extra requests receive?",
    options: ["201 Created", "404 Not Found", "500 Internal Server Error", "429 Too Many Requests"],
    answer: 3,
    explanation:
      "429 Too Many Requests is the standard code for a client that has gone over a rate limit, and it often comes with a Retry-After header saying when to try again. A 500 would be wrong here, because the server is working as intended and it is the client that needs to slow down.",
  },
  {
    id: "api-testing-p5",
    skillId: "api-testing",
    topicId: "api-testing-auth",
    prompt:
      "Your API tests passed this morning. This afternoon every request returns 401 Unauthorized with the message 'token expired', and nothing else has changed. What should you do first?",
    options: [
      "Log a critical defect saying the whole API is down",
      "Change every request from GET to POST",
      "Remove the Authorization header from the requests",
      "Log in again to get a fresh token, then re-run",
    ],
    answer: 3,
    explanation:
      "Access tokens are usually valid for a limited time only, and a 401 with 'token expired' is the API correctly refusing an old one. Getting a new token is the fix. Logging a defect is tempting when everything fails at once, but this is expected security behaviour, not a failure.",
  },
  {
    id: "api-testing-p6",
    skillId: "api-testing",
    topicId: "api-testing-auth",
    prompt:
      "You send a JSON body to 'POST /users', but the server replies 415 Unsupported Media Type. Which request header should you check first?",
    options: ["Accept", "Content-Type", "User-Agent", "Authorization"],
    answer: 1,
    explanation:
      "Content-Type tells the server what format the request body is in, and for JSON it should be application/json. Accept is easy to confuse with it, but Accept describes the format you want in the response, not the format of what you are sending.",
  },
  {
    id: "api-testing-p7",
    skillId: "api-testing",
    topicId: "api-testing-validation",
    prompt:
      "'POST /users' returns 201 Created and echoes back the user you sent. Which follow-up check best confirms that the user was really saved?",
    options: [
      "Send the same POST again and expect another 201 Created",
      "Check that the response arrived in under one second",
      "Send GET /users/{id} with the returned id and compare the fields",
      "Confirm that the response includes a Content-Type header",
    ],
    answer: 2,
    explanation:
      "A create response only shows what the server says it did. Reading the resource back with a separate GET proves the data was stored and can be retrieved correctly. Sending the same POST again confirms nothing about the first user and may simply create a duplicate.",
  },
  {
    id: "api-testing-p8",
    skillId: "api-testing",
    topicId: "api-testing-validation",
    prompt:
      "Your collection starts by creating a user with the email 'test@example.com'. The first run passes. The second run fails at that step with 'email already exists'. What is the best way to make the collection repeatable?",
    options: [
      "Generate a unique email on each run",
      "Run the collection only once per environment",
      "Remove the assertion on the create-user step so that it cannot fail",
      "Ask a developer to switch off the unique-email rule",
    ],
    answer: 0,
    explanation:
      "Automated API workflows must be able to run again and again, so each run should create its own unique data or clean up what it created. Removing the assertion makes the step go green, but the user is still not created and every later step that depends on it will fail or test nothing.",
  },

  // ───────── bug-reporting ─────────
  {
    id: "bug-reporting-p1",
    skillId: "bug-reporting",
    topicId: "bug-reporting-report-anatomy",
    prompt:
      "While testing the Profile page you find three unrelated problems: the photo upload fails, the phone field accepts letters, and the Save button is misaligned. How should you log them?",
    options: [
      "As one report titled 'Profile page issues' that lists all three",
      "Log only the most serious one and mention the others in a comment",
      "As three separate reports, one per problem",
      "Log nothing until you have found more problems on the page",
    ],
    answer: 2,
    explanation:
      "Each defect needs its own report so that it can be assigned, prioritised, fixed and verified on its own. One combined report is quicker to write, but it cannot be closed until all three problems are fixed, and the individual problems become hard to track or search for.",
  },
  {
    id: "bug-reporting-p2",
    skillId: "bug-reporting",
    topicId: "bug-reporting-report-anatomy",
    prompt:
      "Your draft bug report has 16 steps to reproduce. You then confirm that the failure happens with just steps 1, 9 and 16; the rest were things you happened to do along the way. What should you do before submitting?",
    options: [
      "Cut it down to the minimal steps that reproduce the failure",
      "Keep all 16 steps, because more detail is always better",
      "Remove the steps entirely and describe the bug in one sentence",
      "Add more steps so that the report looks more thorough",
    ],
    answer: 0,
    explanation:
      "The shortest set of steps that reliably triggers the bug makes it faster to reproduce and points the developer towards the cause. Keeping every step seems safer, but the extra actions hide which ones actually matter.",
  },
  {
    id: "bug-reporting-p3",
    skillId: "bug-reporting",
    topicId: "bug-reporting-severity-priority",
    prompt:
      "On the live site, every customer who tries to pay by card gets an error and no order is placed. Card payments make up 80% of sales and there is no workaround. How would this defect typically be classified?",
    options: [
      "High severity, low priority",
      "High severity, high priority",
      "Low severity, high priority",
      "Low severity, low priority",
    ],
    answer: 1,
    explanation:
      "Severity is high because a core function fails completely with no workaround. Priority is also high because the business loses most of its sales for as long as it stays broken. The two ratings are judged separately; here the technical impact and the business urgency both happen to be at their highest.",
  },
  {
    id: "bug-reporting-p4",
    skillId: "bug-reporting",
    topicId: "bug-reporting-severity-priority",
    prompt:
      "You log a defect where a report shows wrong totals and rate its severity as Major. In triage, the product owner sets its priority to Low because the report is hidden from users until next quarter. What should you do with the severity?",
    options: [
      "Raise it to Critical to force an earlier fix",
      "Lower it to Minor so that it matches the priority",
      "Clear the severity field because the two ratings disagree",
      "Leave it as Major, because severity reflects impact",
    ],
    answer: 3,
    explanation:
      "Severity records how badly the defect affects the product, while priority records how soon the business wants it fixed, so the two can differ. Lowering severity to match priority is tempting for tidiness, but it would hide how serious the defect is when the report is eventually released.",
  },
  {
    id: "bug-reporting-p5",
    skillId: "bug-reporting",
    topicId: "bug-reporting-lifecycle",
    prompt:
      "A defect is marked Fixed. You re-test it on the new build using the original steps and it now works correctly. What should happen to the defect next?",
    options: [
      "It stays as Fixed for good, since the developer has already resolved it",
      "It is verified and closed, noting the build you tested",
      "It is set to Deferred",
      "It is reopened so that the developer can double-check it",
    ],
    answer: 1,
    explanation:
      "Fixed only means the developer believes the problem is solved; the tester confirms it and then the defect is closed. Leaving it at Fixed is tempting because the work feels finished, but then nobody can tell which fixes have actually been checked.",
  },
  {
    id: "bug-reporting-p6",
    skillId: "bug-reporting",
    topicId: "bug-reporting-lifecycle",
    prompt:
      "A developer sets your defect to Rejected with the comment 'works as designed'. You believe the behaviour contradicts requirement REQ-31. What is the right next step?",
    options: [
      "Accept the rejection, because the developer knows the code best",
      "Log the same defect again under a different title",
      "Raise its priority to the highest level and reassign it",
      "Add the requirement reference and ask for a review",
    ],
    answer: 3,
    explanation:
      "A rejection is not final if you have evidence that the behaviour breaks a requirement. Quoting the requirement and sending the defect back for review lets the team settle it on facts. Logging it again under a new title only creates a duplicate and loses the history of the discussion.",
  },
  {
    id: "bug-reporting-p7",
    skillId: "bug-reporting",
    topicId: "bug-reporting-triage",
    prompt:
      "CSV export worked in build 4.1 and fails in build 4.2. Which extra information in your report most helps the team triage and isolate the defect?",
    options: [
      "That you personally consider the export feature important",
      "The total number of test cases you ran today",
      "That it is a regression, with the last build where it worked and the first where it fails",
      "A guess at which developer caused the problem",
    ],
    answer: 2,
    explanation:
      "Knowing the last good build and the first bad build narrows the cause to the changes made between them, which is often a short list. It also shows that something which used to work is now broken, which usually raises its urgency. Guessing who is to blame adds nothing the team can act on.",
  },
  {
    id: "bug-reporting-p8",
    skillId: "bug-reporting",
    topicId: "bug-reporting-triage",
    prompt:
      "An order page shows a total of 1,180 when it should be 1,080. Before reporting, you open the browser's network tab and see that the API response already contains 1,180. What does this tell the team?",
    options: [
      "The backend is producing the wrong value",
      "The frontend is calculating the total incorrectly",
      "The defect cannot be reproduced",
      "The browser cache is the cause, so no report is needed",
    ],
    answer: 0,
    explanation:
      "Checking the API response shows which layer produces the wrong value. Since the server already returns 1,180, the page is displaying it faithfully and the defect should go to the backend team. Blaming the frontend is the natural first guess because that is where the problem is seen, but the evidence points elsewhere.",
  },

  // ───────── test-automation ─────────
  {
    id: "test-automation-p1",
    skillId: "test-automation",
    topicId: "test-automation-what-to-automate",
    prompt:
      "A manager says: 'Once the regression suite is automated, we will no longer need any manual testing.' What is the most accurate reply?",
    options: [
      "Correct, because automated tests find every defect a human would",
      "Not quite: automation repeats known checks, but exploration still needs people",
      "Correct, as long as the tests run on a fast machine",
      "Wrong, because automated tests are less reliable than manual ones and should be avoided",
    ],
    answer: 1,
    explanation:
      "Automated tests only check what they were written to check, which makes them ideal for repeated regression runs. Finding unexpected problems, exploring new features and judging how a product feels still need a human. Automation frees testers for that work rather than replacing them.",
  },
  {
    id: "test-automation-p2",
    skillId: "test-automation",
    topicId: "test-automation-what-to-automate",
    prompt:
      "Your team has 500 manual test cases and is starting automation for the first time. Which first step is most sensible?",
    options: [
      "Automate all 500 cases before running any of them",
      "Start with the rarely used screens, since mistakes there matter less",
      "Automate the features that are still changing every week",
      "Automate a small set of stable, critical flows and get them running reliably",
    ],
    answer: 3,
    explanation:
      "Starting with a few stable, high-value flows such as login and checkout gives quick feedback and lets the team learn before the suite grows. Trying to automate everything first is tempting, but it delays any benefit for months and produces a large suite that nobody has yet proved reliable.",
  },
  {
    id: "test-automation-p3",
    skillId: "test-automation",
    topicId: "test-automation-locators",
    prompt:
      "Your test should click the 'Add to cart' button for the second product on a page, but it always clicks the first product's button. The locator is the CSS class '.btn-primary', which matches eight buttons. What is the right fix?",
    options: [
      "Add a pause before the click",
      "Run the test in a different browser",
      "Use a locator that matches only that button",
      "Click eight times so that every button is pressed",
    ],
    answer: 2,
    explanation:
      "A locator that matches eight elements cannot tell the tool which one you mean, and here it takes the first match. The locator must identify exactly one element, for example by scoping it to the second product's card or using a unique attribute. A pause does not help, because this is not a timing problem.",
  },
  {
    id: "test-automation-p4",
    skillId: "test-automation",
    topicId: "test-automation-locators",
    prompt:
      "You locate a field by its id, 'input_8f3a21'. The test passes once, then fails on the next run because the id is now 'input_c77b09'. The id is generated afresh on every page load. What should you do?",
    options: [
      "Locate the field by a stable attribute instead",
      "Update the test with the new id before every run",
      "Add a longer wait so that the old id has time to come back",
      "Use the field's position on the screen in pixels",
    ],
    answer: 0,
    explanation:
      "An id is only a good locator when it stays the same. When it is generated on each load, choose an attribute that does not change, such as its name or label, or ask the developers to add a dedicated test id. Updating the id by hand before every run means the test can never run unattended.",
  },
  {
    id: "test-automation-p5",
    skillId: "test-automation",
    topicId: "test-automation-waits",
    prompt:
      "A test uses an explicit wait with a 10-second timeout for a success message to become visible. The message appears after 2 seconds. What happens?",
    options: [
      "The test continues after about 2 seconds, as soon as the condition is met",
      "The test waits the full 10 seconds before continuing",
      "The test fails, because the message appeared before the timeout",
      "The test skips the wait, because the message was not there at the start",
    ],
    answer: 0,
    explanation:
      "An explicit wait keeps checking the condition and moves on the moment it becomes true; the timeout is only the longest it will wait before failing. Waiting the full 10 seconds is how a fixed sleep behaves, which is why sleeps make suites slow.",
  },
  {
    id: "test-automation-p6",
    skillId: "test-automation",
    topicId: "test-automation-waits",
    prompt:
      "A test that edits a product passes when the whole suite runs in order, but fails when it is run on its own. It relies on a product created by the test before it. What is the best fix?",
    options: [
      "Always run the full suite in the same order",
      "Add a 30-second sleep at the start of the test",
      "Have the test create its own data in setup",
      "Mark the test as skipped whenever it is run alone",
    ],
    answer: 2,
    explanation:
      "Each automated test should set up its own data so that it can run alone, in any order or in parallel. Fixing the run order seems to work, but the tests stay chained together: one failure causes several, and the suite cannot be split up.",
  },
  {
    id: "test-automation-p7",
    skillId: "test-automation",
    topicId: "test-automation-framework",
    prompt:
      "Your automated tests are run only when someone remembers to start them on their laptop, and broken features are often found days after the change that caused them. Which change helps most?",
    options: [
      "Run the tests once a month, just before each release",
      "Run the suite automatically in the CI pipeline on every code change",
      "Ask each developer to run the tests whenever they have spare time",
      "Reduce the suite to a single test so that it is quick to run by hand",
    ],
    answer: 1,
    explanation:
      "Running tests automatically on every change gives feedback within minutes, while the change is small and the developer still remembers it. Relying on people to run the tests by hand is the low-effort option, but it is exactly what is failing now.",
  },
  {
    id: "test-automation-p8",
    skillId: "test-automation",
    topicId: "test-automation-framework",
    prompt:
      "The QA site's URL is typed directly into 60 test scripts. The team now wants to run the same tests against the staging site as well. What is the best approach?",
    options: [
      "Copy all 60 scripts and change the URL in each copy",
      "Edit the URL in every script before each run, then change it back afterwards",
      "Keep testing on the QA site only",
      "Move the URL into a configuration setting that is chosen at run time",
    ],
    answer: 3,
    explanation:
      "Environment details such as URLs and credentials belong in configuration, outside the test code, so the same tests can run anywhere by changing one setting. Copying the scripts works on day one, but every future change to a test must then be made twice.",
  },
];
