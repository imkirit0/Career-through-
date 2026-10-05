import type { Question } from "../../taxonomy";

export const questions: Question[] = [
  // ───────── manual-testing ─────────
  {
    id: "manual-testing-q9",
    skillId: "manual-testing",
    topicId: "manual-testing-fundamentals",
    prompt: `A developer misreads a requirement and types the wrong comparison into the discount code. Weeks later, a customer is charged the wrong amount at checkout. In testing terms, what is the wrong line of code called?`,
    options: ["An error (mistake)", "A defect (bug or fault)", "A failure", "A risk"],
    answer: 1,
    explanation:
      "A person makes an error (the misreading), which leaves a defect in the code. When that code runs it causes a failure, which is the wrong charge the customer saw.",
  },
  {
    id: "manual-testing-q10",
    skillId: "manual-testing",
    topicId: "manual-testing-fundamentals",
    prompt: `In the last release, 85 of the 120 defects were found in the payments module, which is one of ten modules. Test time for the next release is limited. How should this information shape your testing?`,
    options: [
      "Split the time equally across all ten modules, exactly as in the last release",
      "Give payments the least time, because most of its defects have already been found and fixed",
      "Test only payments and skip the other nine modules, because they had so few defects",
      "Give payments the largest share of the time, and still cover the other modules",
    ],
    answer: 3,
    explanation:
      "Defects cluster: a few modules usually contain most of the defects, so past defect data shows where to focus effort. The other modules still need some coverage, because clustering is a guide and not a guarantee.",
  },
  {
    id: "manual-testing-q11",
    skillId: "manual-testing",
    topicId: "manual-testing-levels-types",
    prompt: `Which of these checks is a non-functional test?`,
    options: [
      "A valid coupon code reduces the order total by 10% at checkout",
      "A new user can register with a valid email address and a strong password",
      "The search page responds within 2 seconds with 500 users online",
      "An order confirmation email is sent to the customer after payment",
    ],
    answer: 2,
    explanation:
      "Functional tests check what the system does; non-functional tests check how well it does it, such as speed under load. Response time with 500 users is a performance check, while the other three verify features.",
  },
  {
    id: "manual-testing-q12",
    skillId: "manual-testing",
    topicId: "manual-testing-levels-types",
    prompt: `A developer designs tests by reading the code of a function and choosing inputs so that every branch of its if/else statement runs at least once. Which approach is this?`,
    options: ["White-box testing", "Black-box testing", "Exploratory testing", "Acceptance testing"],
    answer: 0,
    explanation:
      "White-box testing derives tests from the internal structure of the code, such as its branches. Black-box testing derives them from requirements and observable behaviour without looking at the code.",
  },
  {
    id: "manual-testing-q13",
    skillId: "manual-testing",
    topicId: "manual-testing-execution",
    prompt: `A test cycle has 50 planned test cases. So far 40 have been executed: 34 passed and 6 failed. The other 10 have not been run. What percentage of the executed test cases passed?`,
    options: ["68%", "80%", "12%", "85%"],
    answer: 3,
    explanation:
      "Pass rate of executed tests is passed divided by executed: 34 / 40 = 85%. 68% divides by the 50 planned cases instead, and 80% is the share of planned cases that have been executed.",
  },
  {
    id: "manual-testing-q14",
    skillId: "manual-testing",
    topicId: "manual-testing-execution",
    prompt: `The test case 'Pay 500 from wallet' has the precondition 'wallet balance is at least 500'. It passed on Monday. On Tuesday, on the same build, it fails with 'Insufficient balance' because Monday's run spent the money. What should you do?`,
    options: [
      "Restore the wallet balance to meet the precondition, then run the test again",
      "Mark the test as Failed and log a defect against wallet payments",
      "Change the expected result of the test case to 'Insufficient balance'",
      "Mark the test as Passed, because it passed on the same build on Monday",
    ],
    answer: 0,
    explanation:
      "A result only counts when the preconditions were met. Here the test data was used up, so the application behaved correctly; reset the data and re-run before judging pass or fail.",
  },
  {
    id: "manual-testing-q15",
    skillId: "manual-testing",
    topicId: "manual-testing-exploratory",
    prompt: `You are planning a 45-minute exploratory session on a checkout page. Which charter is written best?`,
    options: [
      "Test the whole checkout page thoroughly and find all the bugs in it before release",
      "Execute test cases TC-01 to TC-40 step by step and record pass or fail for each one",
      "Explore the coupon field with expired, repeated and invalid codes to find pricing errors",
      "Click around the checkout page freely for 45 minutes and see whether anything looks wrong",
    ],
    answer: 2,
    explanation:
      "A good charter names a target, the kind of inputs to try and the information being sought, and is small enough for one time box. 'Find all the bugs' has no focus, and running scripted cases is not exploratory testing.",
  },
  {
    id: "manual-testing-q16",
    skillId: "manual-testing",
    topicId: "manual-testing-exploratory",
    prompt: `A ticket-booking site is specified to handle 1,000 concurrent users. A test deliberately pushes it to 3,000 users to see how it fails and whether it recovers afterwards. What type of testing is this?`,
    options: ["Load testing", "Stress testing", "Usability testing", "Compatibility testing"],
    answer: 1,
    explanation:
      "Stress testing pushes a system beyond its specified limits to see how it breaks and recovers. Load testing checks behaviour at the expected load, which here would be up to 1,000 users.",
  },

  // ───────── test-case-design ─────────
  {
    id: "test-case-design-q9",
    skillId: "test-case-design",
    topicId: "test-case-design-equivalence-partitioning",
    prompt: `Ticket prices depend on age in whole years: under 5 is free, 5 to 17 is a child ticket, 18 to 59 is an adult ticket, and 60 or above is a senior ticket. How many different equivalence partitions do the test values 3, 17, 25, 40 and 64 cover?`,
    options: ["2", "3", "4", "5"],
    answer: 2,
    explanation:
      "3 is in the free partition, 17 in child, 25 and 40 are both in adult, and 64 in senior. Five values cover only four partitions, because 25 and 40 repeat the same one.",
  },
  {
    id: "test-case-design-q10",
    skillId: "test-case-design",
    topicId: "test-case-design-equivalence-partitioning",
    prompt: `A form has an age field (valid: 18 to 60) and a quantity field (valid: 1 to 10). One test enters age 15 and quantity 0 together, and the form shows only 'Invalid age'. What is the weakness of this test?`,
    options: [
      "The invalid quantity may never be checked, so each invalid value needs its own test",
      "It uses too few values; every age from 0 to 17 should be entered as well",
      "Nothing: covering two invalid partitions in one test is the efficient choice",
      "Invalid values do not need tests, because the form tells users the valid range",
    ],
    answer: 0,
    explanation:
      "One invalid input can mask another: the form may stop at the first error, so you never learn whether quantity 0 is rejected. Test each invalid partition on its own, with all other fields valid.",
  },
  {
    id: "test-case-design-q11",
    skillId: "test-case-design",
    topicId: "test-case-design-boundary-values",
    prompt: `For which of these inputs is boundary value analysis a suitable technique?`,
    options: [
      "A 'Country' dropdown with a fixed list of country names",
      "A 'Gender' radio button with three choices",
      "An 'I accept the terms' checkbox",
      "A 'Quantity' field that accepts whole numbers from 1 to 10",
    ],
    answer: 3,
    explanation:
      "Boundary value analysis needs an ordered range with edges, such as 1 to 10, where off-by-one mistakes can occur. Unordered choices like a country list have no boundaries, so equivalence partitioning is used for them instead.",
  },
  {
    id: "test-case-design-q12",
    skillId: "test-case-design",
    topicId: "test-case-design-boundary-values",
    prompt: `A quantity field accepts whole numbers from 1 to 99. Quantities 1 to 9 get no discount, 10 to 49 get 10% off, and 50 to 99 get 20% off. Using two-value boundary value analysis on every boundary, how many different test values do you need?`,
    options: ["6", "8", "4", "10"],
    answer: 1,
    explanation:
      "There are four boundaries: 0/1, 9/10, 49/50 and 99/100. Two-value analysis takes the value on each side of each boundary, giving 0, 1, 9, 10, 49, 50, 99 and 100.",
  },
  {
    id: "test-case-design-q13",
    skillId: "test-case-design",
    topicId: "test-case-design-decision-tables",
    prompt: `A decision table for a discount has four rules:\n\nR1: member, order over 2,000: 15% discount\nR2: member, order not over 2,000: 10% discount\nR3: not a member, order over 2,000: 5% discount\nR4: not a member, order not over 2,000: no discount\n\nA member places an order of exactly 2,000. Which discount applies?`,
    options: ["15%", "10%", "5%", "No discount"],
    answer: 1,
    explanation:
      "The customer is a member, and exactly 2,000 is not over 2,000, so rule R2 applies and the discount is 10%.",
  },
  {
    id: "test-case-design-q14",
    skillId: "test-case-design",
    topicId: "test-case-design-decision-tables",
    prompt: `A decision table has three yes/no conditions: account blocked, valid coupon, and member. When the account is blocked, the order is always rejected. When it is not blocked, each of the four coupon and member combinations gives a different discount. After merging rules with 'don't care' entries, how many rules remain?`,
    options: ["8", "4", "6", "5"],
    answer: 3,
    explanation:
      "The full table has 8 rules. The four 'blocked' rules share one outcome and merge into a single rule, while the four 'not blocked' rules all differ and stay, giving 1 + 4 = 5.",
  },
  {
    id: "test-case-design-q15",
    skillId: "test-case-design",
    topicId: "test-case-design-writing-cases",
    prompt: `A test step says 'Enter an invalid email address'. Three testers run it with three different values and report different results. What should be changed in the test case?`,
    options: [
      "State the exact value to enter, such as 'asha@@example'",
      "Add a severity and priority rating to the step",
      "Remove the step, since invalid data cannot be scripted",
      "Let each tester pick a new random value on every run",
    ],
    answer: 0,
    explanation:
      "Exact test data makes a case repeatable, so every tester runs the same check and reaches the same verdict. Different kinds of invalid email should be separate cases, each with its own stated value.",
  },
  {
    id: "test-case-design-q16",
    skillId: "test-case-design",
    topicId: "test-case-design-writing-cases",
    prompt: `A test case 'Transfer 500 from account A to account B' has one expected result: 'A success message is shown'. Which change improves the test case most?`,
    options: [
      "Add a step that takes a screenshot of the login page",
      "Split the single transfer step into one separate step for every key press",
      "Also expect A's balance to fall by 500 and B's balance to rise by 500",
      "Replace the expected result with 'The transfer works correctly'",
    ],
    answer: 2,
    explanation:
      "The expected result must check the real outcome of the action, not only the message. A transfer that shows 'success' but leaves either balance wrong would pass the original test case.",
  },

  // ───────── sdlc-stlc ─────────
  {
    id: "sdlc-stlc-q9",
    skillId: "sdlc-stlc",
    topicId: "sdlc-stlc-sdlc-models",
    prompt: `An app has been live for six months. The team is now fixing bugs reported by users and releasing small patches and updates. Which SDLC phase is this?`,
    options: ["Design", "Implementation (coding)", "Deployment", "Maintenance"],
    answer: 3,
    explanation:
      "Maintenance covers the work done after release: fixing reported defects and shipping patches and small enhancements. Deployment is the act of releasing the product, which happened six months ago.",
  },
  {
    id: "sdlc-stlc-q10",
    skillId: "sdlc-stlc",
    topicId: "sdlc-stlc-sdlc-models",
    prompt: `In a V-model project, when should the system test cases be designed?`,
    options: [
      "After coding is complete, when the first build reaches the test team",
      "During the system design phase, before the code is written",
      "During maintenance, once real users have reported problems",
      "After acceptance testing, using the defects that the client found",
    ],
    answer: 1,
    explanation:
      "In the V-model each development phase has a matching test level, and its tests are planned and designed alongside that phase. Only the execution waits until the code exists.",
  },
  {
    id: "sdlc-stlc-q11",
    skillId: "sdlc-stlc",
    topicId: "sdlc-stlc-stlc-phases",
    prompt: `Before any code exists, a tester reviews the requirements document and finds two statements that contradict each other. What kind of testing is this?`,
    options: ["Static testing", "Dynamic testing", "Regression testing", "Smoke testing"],
    answer: 0,
    explanation:
      "Static testing examines work products such as requirements, designs or code without running the software. Dynamic testing needs running code, which does not exist yet.",
  },
  {
    id: "sdlc-stlc-q12",
    skillId: "sdlc-stlc",
    topicId: "sdlc-stlc-stlc-phases",
    prompt: `Test cases have been written and reviewed. The team now installs the application on the QA server, loads the database with sample records and creates accounts for the testers. Which STLC phase is this?`,
    options: ["Test planning", "Requirement analysis", "Test environment setup", "Test closure"],
    answer: 2,
    explanation:
      "Test environment setup prepares the servers, data and accounts that test execution needs. It comes after test case development and before execution.",
  },
  {
    id: "sdlc-stlc-q13",
    skillId: "sdlc-stlc",
    topicId: "sdlc-stlc-agile-testing",
    prompt: `On Wednesday morning the QA server goes down and you cannot test your story. Which Scrum event exists so that a blocker like this becomes visible to the whole team within a day?`,
    options: ["Sprint review", "Daily Scrum (stand-up)", "Sprint retrospective", "Sprint planning"],
    answer: 1,
    explanation:
      "The Daily Scrum is where the team checks progress towards the sprint goal every day and raises anything blocking it. The review and retrospective happen only at the end of the sprint.",
  },
  {
    id: "sdlc-stlc-q14",
    skillId: "sdlc-stlc",
    topicId: "sdlc-stlc-agile-testing",
    prompt: `Every sprint adds features, and the manual regression run now takes 4 days of a 10-day sprint and keeps growing. Which response is the most sustainable?`,
    options: [
      "Automate the stable regression checks so that they run on every build",
      "Stop regression testing and test only the new stories in each sprint",
      "Move regression testing to after the release, when there is more time",
      "Make every sprint longer whenever the regression run grows further",
    ],
    answer: 0,
    explanation:
      "In short sprints the regression suite grows with every increment, so repeating it by hand soon crowds out testing of new work. Automating the stable checks keeps the safety net without using up the sprint.",
  },
  {
    id: "sdlc-stlc-q15",
    skillId: "sdlc-stlc",
    topicId: "sdlc-stlc-planning-traceability",
    prompt: `A test plan ranks features by risk score, calculated as likelihood of failure multiplied by impact, each rated from 1 to 5. Payments: likelihood 2, impact 5. Wishlist: likelihood 5, impact 2. Profile: likelihood 2, impact 3. Search: likelihood 4, impact 3. Which feature should be tested first?`,
    options: ["Payments", "Wishlist", "Profile", "Search"],
    answer: 3,
    explanation:
      "The scores are Payments 10, Wishlist 10, Profile 6 and Search 12. Risk-based testing starts with the highest score, which combines likelihood and impact rather than using either one alone.",
  },
  {
    id: "sdlc-stlc-q16",
    skillId: "sdlc-stlc",
    topicId: "sdlc-stlc-planning-traceability",
    prompt: `The exit criteria for system testing are: at least 95% of planned test cases executed, at least 90% of executed test cases passed, and no open critical defects. Current status: 200 planned, 192 executed, 170 passed, and no critical defects open. Are the exit criteria met?`,
    options: [
      "Yes, all three criteria are met",
      "No, too few test cases have been executed",
      "No, the pass rate is below the 90% target",
      "No, because any failed test case blocks the exit",
    ],
    answer: 2,
    explanation:
      "Execution is 192 / 200 = 96%, which meets the target, and there are no critical defects. The pass rate is 170 / 192, about 88.5%, which is below 90%, so testing cannot exit yet.",
  },

  // ───────── api-testing ─────────
  {
    id: "api-testing-q9",
    skillId: "api-testing",
    topicId: "api-testing-http-methods",
    prompt: `In the request 'GET /users/42/orders?status=shipped', what is the role of 42?`,
    options: [
      "A query parameter that filters the orders",
      "A path parameter that identifies one user",
      "A status code returned by the server",
      "A header value sent with the request",
    ],
    answer: 1,
    explanation:
      "Values inside the URL path, such as 42 here, are path parameters that identify a specific resource. The query parameter is the part after the question mark, status=shipped, which filters the result.",
  },
  {
    id: "api-testing-q10",
    skillId: "api-testing",
    topicId: "api-testing-http-methods",
    prompt: `You send 'DELETE /orders/42' and get 204 No Content. You send the same request again and get 404 Not Found. Is DELETE still behaving as an idempotent method here?`,
    options: [
      "Yes: after one call or two, the server ends in the same state, with order 42 gone",
      "No: an idempotent method must return the same status code every time",
      "No: a method that changes data on the server can never be idempotent",
      "Yes: any method that returns a 2xx code on the first call is idempotent",
    ],
    answer: 0,
    explanation:
      "Idempotency is about the state of the server, not the response. Whether the request is sent once or many times, order 42 ends up deleted, even though the second response is different.",
  },
  {
    id: "api-testing-q11",
    skillId: "api-testing",
    topicId: "api-testing-status-codes",
    prompt: `A test run logs these six response codes: 200, 201, 204, 400, 404 and 503. How many of the six requests were successful?`,
    options: ["2", "4", "5", "3"],
    answer: 3,
    explanation:
      "Every 2xx code means success, so 200, 201 and 204 count, including 204 which simply has no body. 400 and 404 are client errors and 503 is a server error.",
  },
  {
    id: "api-testing-q12",
    skillId: "api-testing",
    topicId: "api-testing-status-codes",
    prompt: `The documentation for '/reports' lists only GET and POST. You send 'PUT /reports' with a valid token and a valid body. Which status code should a well-built API return?`,
    options: [
      "404 Not Found",
      "401 Unauthorized",
      "405 Method Not Allowed",
      "500 Internal Server Error",
    ],
    answer: 2,
    explanation:
      "405 Method Not Allowed means the resource exists but does not support the method used. 404 would wrongly suggest that '/reports' does not exist, and the token is valid so 401 does not apply.",
  },
  {
    id: "api-testing-q13",
    skillId: "api-testing",
    topicId: "api-testing-auth",
    prompt: `With HTTP Basic authentication, the client sends 'username:password' encoded in Base64 in the Authorization header. Why must Basic authentication be used only over HTTPS?`,
    options: [
      "Base64 is an encoding, not encryption, so anyone who intercepts it can decode it",
      "Base64 text can only be sent on port 443, which is the port that HTTPS uses",
      "Plain HTTP requests are not allowed to carry an Authorization header at all",
      "Basic credentials expire after one request unless the connection is encrypted",
    ],
    answer: 0,
    explanation:
      "Base64 only changes how the text is represented and can be reversed by anyone without a key. HTTPS encrypts the whole request, which is what actually protects the credentials in transit.",
  },
  {
    id: "api-testing-q14",
    skillId: "api-testing",
    topicId: "api-testing-auth",
    prompt: `You log in as user 101 and receive a valid token. You then call 'GET /users/102/orders' with that token and receive 200 OK with user 102's orders. Users are meant to see only their own orders. What have you found?`,
    options: [
      "Correct behaviour, because the token is valid and the request is well formed",
      "An authentication defect: the API accepted the request without any token",
      "A caching defect: the API returned an old copy of user 101's own orders",
      "An authorisation defect: the API does not check that the token's user may read this data",
    ],
    answer: 3,
    explanation:
      "Authentication worked, because the API knows the caller is user 101. What is missing is authorisation: checking that user 101 is allowed to read user 102's data. The request should have been refused, typically with 403.",
  },
  {
    id: "api-testing-q15",
    skillId: "api-testing",
    topicId: "api-testing-validation",
    prompt: `The contract for 'GET /products/10' says that id is an integer, name is a string, price is a number and inStock is a boolean. The response body is:\n\n{ "id": 10, "name": "Pen", "price": "25.00", "inStock": true }\n\nWhich field breaks the contract?`,
    options: ["id", "name", "price", "inStock"],
    answer: 2,
    explanation:
      'The value "25.00" is in quotes, so price is a string and not a number. A client that does arithmetic on price could fail, which is why tests assert data types as well as values.',
  },
  {
    id: "api-testing-q16",
    skillId: "api-testing",
    topicId: "api-testing-validation",
    prompt: `A Postman request has these two tests:\n\npm.test("status is 200", () => pm.response.to.have.status(200));\npm.test("three items", () => pm.expect(pm.response.json().items.length).to.eql(3));\n\nThe response is 200 OK with the body { "items": [ { "id": 1 }, { "id": 2 } ] }. What does the test run report?`,
    options: [
      "Both tests pass",
      "'status is 200' passes and 'three items' fails",
      "'status is 200' fails and 'three items' passes",
      "Both tests fail",
    ],
    answer: 1,
    explanation:
      "The status is 200, so the first test passes. The items array holds 2 elements, not 3, so the second assertion fails; a correct status code does not make the body correct.",
  },

  // ───────── bug-reporting ─────────
  {
    id: "bug-reporting-q9",
    skillId: "bug-reporting",
    topicId: "bug-reporting-report-anatomy",
    prompt: `A bug report has a clear title, the environment, numbered steps, a screenshot and the actual result 'Order total shows 1,450'. The developer replies: 'What should the total be?' Which part of the report is missing?`,
    options: [
      "The expected result",
      "The severity rating",
      "The reporter's name",
      "The priority rating",
    ],
    answer: 0,
    explanation:
      "An actual result only shows a problem when it is set against the expected result. Without it, the developer cannot tell why 1,450 is wrong or what the correct value is.",
  },
  {
    id: "bug-reporting-q10",
    skillId: "bug-reporting",
    topicId: "bug-reporting-report-anatomy",
    prompt: `After you click Save, the page goes blank and no error message is shown on screen. Which evidence attached to the bug report helps the developer most?`,
    options: [
      "A screenshot of the blank page on its own",
      "A screenshot of the page before you clicked Save",
      "The browser console errors and the failed network request",
      "A list of the other pages in the app that still load correctly",
    ],
    answer: 2,
    explanation:
      "When the screen shows nothing useful, the cause is usually visible in the console errors and the failed request and response. A picture of a blank page tells the developer only that it is blank.",
  },
  {
    id: "bug-reporting-q11",
    skillId: "bug-reporting",
    topicId: "bug-reporting-severity-priority",
    prompt: `Which of these statements about a defect describes its priority rather than its severity?`,
    options: [
      "The app crashes and the user's unsaved data is lost",
      "Only the colour of one label on the page is wrong",
      "There is no workaround, so the feature cannot be used",
      "It must be fixed before Friday's release to the client",
    ],
    answer: 3,
    explanation:
      "Priority is about how soon the business needs the fix, such as before a release date. The other three statements describe how badly the product is affected, which is severity.",
  },
  {
    id: "bug-reporting-q12",
    skillId: "bug-reporting",
    topicId: "bug-reporting-severity-priority",
    prompt: `A team's severity scale is: Critical = crash or data loss with no workaround; Major = a main function is broken but a workaround exists; Minor = a small function misbehaves; Trivial = cosmetic only. On checkout, the 'Place order' button does nothing, but orders can still be placed by pressing Enter. Which severity fits?`,
    options: ["Critical", "Major", "Minor", "Trivial"],
    answer: 1,
    explanation:
      "Placing an order is a main function and its button is broken, but pressing Enter is a workaround, which matches the definition of Major. It is not Critical because there is no crash or data loss and a workaround exists.",
  },
  {
    id: "bug-reporting-q13",
    skillId: "bug-reporting",
    topicId: "bug-reporting-lifecycle",
    prompt: `Which sequence shows the normal path of a valid defect that is fixed successfully?`,
    options: [
      "New, Assigned, Fixed, Retest, Closed",
      "New, Fixed, Assigned, Closed, Retest",
      "Assigned, New, Retest, Fixed, Closed",
      "New, Assigned, Closed, Fixed, Retest",
    ],
    answer: 0,
    explanation:
      "A defect is logged as New, assigned to a developer, fixed, re-tested by the tester and only then closed. It cannot be fixed before it is assigned, or closed before the fix has been re-tested.",
  },
  {
    id: "bug-reporting-q14",
    skillId: "bug-reporting",
    topicId: "bug-reporting-lifecycle",
    prompt: `A defect is marked 'Fixed in build 5.3'. The QA environment is still running build 5.2. You re-run the steps there and the failure still occurs. What should you do?`,
    options: [
      "Reopen the defect, because the failure still occurs",
      "Close the defect, because the developer has marked it as fixed",
      "Log a new defect for the same failure on build 5.2",
      "Wait for build 5.3 to be deployed, then re-test the defect on it",
    ],
    answer: 3,
    explanation:
      "A fix can only be verified on a build that contains it. Build 5.2 does not include the fix, so the failure there proves nothing; reopening is right only if it still fails on 5.3 or later.",
  },
  {
    id: "bug-reporting-q15",
    skillId: "bug-reporting",
    topicId: "bug-reporting-triage",
    prompt: `An image upload fails only sometimes. You record five attempts:\n\n1. Chrome, account A, PNG file: fails\n2. Chrome, account A, JPG file: works\n3. Firefox, account A, PNG file: fails\n4. Chrome, account B, PNG file: fails\n5. Firefox, account B, JPG file: works\n\nWhich factor is most likely the trigger?`,
    options: ["The Chrome browser", "Account A", "The PNG file type", "The Firefox browser"],
    answer: 2,
    explanation:
      "Every PNG attempt fails and every JPG attempt works, whatever the browser or account. Chrome, Firefox and account A each appear in both a failing and a working attempt, so they are not the trigger.",
  },
  {
    id: "bug-reporting-q16",
    skillId: "bug-reporting",
    topicId: "bug-reporting-triage",
    prompt: `Export worked in build 10 and fails in build 18. All the builds in between are available to install. To find the first failing build in as few tries as possible, which build should you test next?`,
    options: ["Build 11", "Build 14", "Build 17", "Build 9"],
    answer: 1,
    explanation:
      "Testing the middle build halves the search each time: if build 14 fails, the cause lies in builds 11 to 14, otherwise in 15 to 18. Going one build at a time could take up to seven tries instead of three.",
  },

  // ───────── test-automation ─────────
  {
    id: "test-automation-q9",
    skillId: "test-automation",
    topicId: "test-automation-what-to-automate",
    prompt: `A regression suite takes 5 hours to run manually. Automating it would cost 40 hours to build, and each automated run would then need 1 hour of a tester's time for maintenance and checking results. After how many runs has the automation paid back its build cost?`,
    options: ["5", "8", "10", "40"],
    answer: 2,
    explanation:
      "Each automated run saves 5 - 1 = 4 hours, so the 40-hour build cost is recovered after 40 / 4 = 10 runs. Dividing 40 by 5 ignores the ongoing maintenance cost of each automated run.",
  },
  {
    id: "test-automation-q10",
    skillId: "test-automation",
    topicId: "test-automation-what-to-automate",
    prompt: `A checkout total depends on 30 combinations of coupon, tax and shipping rules. All 30 are currently checked by slow end-to-end browser tests. Following the test automation pyramid, what is the better design?`,
    options: [
      "Check the combinations in unit or API tests and keep one or two browser tests for the journey",
      "Keep all 30 browser tests and add 30 matching unit tests and 30 API tests on top",
      "Delete the 30 browser tests and check the combinations by hand before each release",
      "Keep the 30 browser tests, but run them only once a month to save time",
    ],
    answer: 0,
    explanation:
      "Calculation rules can be checked much faster and more reliably below the UI. The pyramid pushes many combinations down to unit or API level and keeps only a few UI tests to prove the journey works end to end.",
  },
  {
    id: "test-automation-q11",
    skillId: "test-automation",
    topicId: "test-automation-locators",
    prompt: `A page contains these two fields:\n\n<input id="email" name="user_email" class="form-control" type="text">\n<input id="phone" name="user_phone" class="form-control" type="text">\n\nWhich CSS selector matches only the email field?`,
    options: [".form-control", "#email", "input[type='text']", "#user_email"],
    answer: 1,
    explanation:
      "#email selects by id, and only the first field has that id. The class and the type are shared by both fields, and #user_email matches nothing because user_email is the name, not the id.",
  },
  {
    id: "test-automation-q12",
    skillId: "test-automation",
    topicId: "test-automation-locators",
    prompt: `A pricing page contains:\n\n<div class="card"><h3>Basic</h3><button>Buy</button></div>\n<div class="card"><h3>Pro</h3><button>Buy</button></div>\n\nWhich XPath selects only the Buy button of the Pro plan?`,
    options: [
      "//button[text()='Buy']",
      "//div[@class='card'][1]/button",
      "//h3[text()='Pro']/button",
      "//div[h3='Pro']/button",
    ],
    answer: 3,
    explanation:
      "//div[h3='Pro']/button finds the card whose heading is Pro and then the button inside it. The text-only XPath matches both buttons, [1] picks the Basic card, and the button is not a child of the h3.",
  },
  {
    id: "test-automation-q13",
    skillId: "test-automation",
    topicId: "test-automation-waits",
    prompt: `A suite has 200 tests. Each one contains a fixed 5-second sleep while a page loads, but the page is normally ready after 1 second. Compared with a condition-based wait, roughly how much time does each full run waste?`,
    options: ["200 seconds", "1,000 seconds", "800 seconds", "400 seconds"],
    answer: 2,
    explanation:
      "A condition-based wait would continue after about 1 second, so each fixed sleep wastes 4 seconds. Across 200 tests that is 200 x 4 = 800 seconds, more than 13 minutes on every run.",
  },
  {
    id: "test-automation-q14",
    skillId: "test-automation",
    topicId: "test-automation-waits",
    prompt: `Two tests run in parallel and both log in as the same user. One empties the cart; the other adds an item and asserts that the cart holds 1 item. The second test fails on some runs, but never when it is run alone. What is the most likely cause?`,
    options: [
      "The tests share one account, so one changes the data the other depends on",
      "The locator for the cart count matches more than one element on the page",
      "The explicit wait for the cart page has a timeout that is too short",
      "The browser driver is older than the version of the browser in use",
    ],
    answer: 0,
    explanation:
      "Because both tests use the same account, the first can empty the cart between the second test's add and its assertion. It never fails alone, which points to shared data rather than locators or timing; each test needs its own user.",
  },
  {
    id: "test-automation-q15",
    skillId: "test-automation",
    topicId: "test-automation-framework",
    prompt: `A test file contains 5 tests. It has a 'before each' hook that logs in and an 'after each' hook that logs out. When the whole file runs, how many times does the login step run?`,
    options: ["1", "5", "6", "10"],
    answer: 1,
    explanation:
      "A 'before each' hook runs once before every test, so 5 tests mean 5 logins. A 'before all' hook is the one that would run only once for the whole file.",
  },
  {
    id: "test-automation-q16",
    skillId: "test-automation",
    topicId: "test-automation-framework",
    prompt: `In CI, the test 'cart total' fails: it expected 2,360 but found 2,630. You repeat the steps by hand and the page really shows 2,630 for a cart whose correct total is 2,360. What should you do?`,
    options: [
      "Update the test's expected value to 2,630 so that the build goes green",
      "Re-run the CI job until the test passes, since UI tests are often flaky",
      "Add a longer wait before the assertion and run the test again",
      "Report a product defect: the test is correct and has caught a real bug",
    ],
    answer: 3,
    explanation:
      "The failure reproduces by hand and the expected value is the correct one, so the application is wrong and the test did its job. Changing the assertion or retrying would hide a real defect.",
  },
];
