import type { Question } from "../../taxonomy";

export const questions: Question[] = [
  // ---------- HTML & CSS ----------
  {
    id: "html-css-q9",
    skillId: "html-css",
    topicId: "html-css-semantic-html",
    prompt: `A page is titled with <h1>Courses</h1>. Its two main sections are headed <h2>Frontend</h2> and <h2>Backend</h2>. Inside the Frontend section there is a sub-section about React. Which element should hold the 'React' heading so that the page outline is correct for screen-reader users?`,
    options: ["<h1>", "<h2>", "<h3>", "<h4>"],
    answer: 2,
    explanation:
      "Heading levels describe nesting: a sub-section of an <h2> section gets an <h3>. Reusing <h2> would make React a sibling of Frontend, and jumping to <h4> skips a level.",
  },
  {
    id: "html-css-q10",
    skillId: "html-css",
    topicId: "html-css-semantic-html",
    prompt: `Clicking 'Clear' runs clearFilters(), but the browser then also submits the form. Why?\n\n<form action='/search'>\n  <input name='q'>\n  <button onclick='clearFilters()'>Clear</button>\n</form>`,
    options: [
      "A <button> inside a form defaults to type='submit'; add type='button'",
      "An onclick handler always submits the form that surrounds it",
      "The button has no name attribute, so it becomes the submit control",
      "A form with an action attribute submits on any click inside it",
    ],
    answer: 0,
    explanation:
      "A <button> with no type attribute is a submit button when it sits inside a form. type='button' makes it a plain button that only runs its click handler.",
  },
  {
    id: "html-css-q11",
    skillId: "html-css",
    topicId: "html-css-box-model-cascade",
    prompt: `How wide is the content area (the space left for the text) of this element?\n\n.box {\n  box-sizing: border-box;\n  width: 200px;\n  padding: 20px;\n  border: 5px solid black;\n}`,
    options: ["200px", "250px", "160px", "150px"],
    answer: 3,
    explanation:
      "With border-box, width includes padding and border, so the content gets what is left: 200 - 40 (padding) - 10 (border) = 150px.",
  },
  {
    id: "html-css-q12",
    skillId: "html-css",
    topicId: "html-css-box-model-cascade",
    prompt: `What colour is the paragraph text?\n\n<div id='main'><p>Hi</p></div>\n\n#main { color: red; }\np { color: green; }`,
    options: [
      "Red, because an ID selector on the parent always beats an element selector",
      "Green, because a rule that matches the p itself beats an inherited value",
      "Red, because the #main rule comes first in the stylesheet",
      "Black, because the two rules conflict and the default is used",
    ],
    answer: 1,
    explanation:
      "#main matches the div, not the p; the p would only inherit red if no rule set its colour. Any rule that targets the element directly wins over inheritance, whatever the specificity of the parent's rule.",
  },
  {
    id: "html-css-q13",
    skillId: "html-css",
    topicId: "html-css-layout",
    prompt: `How wide is .b?\n\n<div class='row'>\n  <div class='a'>A</div>\n  <div class='b'>B</div>\n</div>\n\n.row { display: flex; width: 600px; }\n.a { flex: 1; }\n.b { flex: 2; }`,
    options: ["400px", "300px", "200px", "600px"],
    answer: 0,
    explanation:
      "flex: 1 and flex: 2 share the container's width in the ratio 1:2, so the 600px is split into three parts of 200px: .a gets 200px and .b gets 400px.",
  },
  {
    id: "html-css-q14",
    skillId: "html-css",
    topicId: "html-css-layout",
    prompt: `How wide is each column of this grid?\n\n.grid {\n  display: grid;\n  width: 660px;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 30px;\n}`,
    options: ["220px", "210px", "190px", "200px"],
    answer: 3,
    explanation:
      "Three columns have two gaps between them, so 2 x 30 = 60px is taken off first. The remaining 600px is shared equally by the three 1fr tracks: 200px each.",
  },
  {
    id: "html-css-q15",
    skillId: "html-css",
    topicId: "html-css-responsive",
    prompt: `What is the font size of .title on a 1000px-wide viewport?\n\n.title { font-size: 16px; }\n@media (min-width: 900px) {\n  .title { font-size: 24px; }\n}\n@media (min-width: 600px) {\n  .title { font-size: 20px; }\n}`,
    options: ["16px", "24px", "20px", "22px"],
    answer: 2,
    explanation:
      "At 1000px both media queries match. A media query adds no specificity, so the rule written last wins and the size is 20px; min-width breakpoints must be listed from smallest to largest.",
  },
  {
    id: "html-css-q16",
    skillId: "html-css",
    topicId: "html-css-responsive",
    prompt: `This container is 700px wide and holds 6 cards. How many cards sit in the first row?\n\n.cards {\n  display: grid;\n  gap: 0;\n  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n}`,
    options: ["2", "3", "4", "6"],
    answer: 1,
    explanation:
      "auto-fit creates as many columns of at least 200px as fit: three need 600px, four would need 800px. The three columns then stretch with 1fr to fill the 700px.",
  },

  // ---------- JavaScript ----------
  {
    id: "javascript-q9",
    skillId: "javascript",
    topicId: "javascript-types-scope",
    prompt: `What does this log?\n\nvar a = 1;\nlet b = 1;\nif (true) {\n  var a = 2;\n  let b = 2;\n}\nconsole.log(a, b);`,
    options: ["1 1", "2 1", "2 2", "1 2"],
    answer: 1,
    explanation:
      "var ignores block scope, so var a inside the if is the same variable as the outer a and sets it to 2. let b inside the block is a separate variable that exists only in the block, so the outer b is still 1.",
  },
  {
    id: "javascript-q10",
    skillId: "javascript",
    topicId: "javascript-types-scope",
    prompt: `What does this log?\n\nlet count = 0;\nif ('0') count++;\nif ([]) count++;\nif ('') count++;\nif (null) count++;\nconsole.log(count);`,
    options: ["1", "3", "0", "2"],
    answer: 3,
    explanation:
      "Only '' and null are falsy here. Any non-empty string is truthy, including '0', and every object is truthy, including an empty array, so count is increased twice.",
  },
  {
    id: "javascript-q11",
    skillId: "javascript",
    topicId: "javascript-functions-closures",
    prompt: `What does this log?\n\nfunction multiplier(factor) {\n  return (n) => n * factor;\n}\nconst double = multiplier(2);\nconst triple = multiplier(3);\nconsole.log(double(5) + triple(5));`,
    options: ["25", "30", "20", "NaN"],
    answer: 0,
    explanation:
      "Each call to multiplier creates its own factor, and the returned function remembers the one it was created with. double(5) is 10 and triple(5) is 15, giving 25.",
  },
  {
    id: "javascript-q12",
    skillId: "javascript",
    topicId: "javascript-functions-closures",
    prompt: `What does this log?\n\nfunction makeAccount() {\n  let balance = 100;\n  return {\n    deposit: (n) => { balance += n; },\n    get: () => balance,\n  };\n}\nconst acc = makeAccount();\nacc.deposit(50);\nacc.balance = 0;\nconsole.log(acc.get());`,
    options: ["0", "100", "150", "undefined"],
    answer: 2,
    explanation:
      "balance is a variable inside makeAccount that only the two returned functions can reach. acc.balance = 0 just adds an unrelated property to the object, so get() still returns the closed-over 150.",
  },
  {
    id: "javascript-q13",
    skillId: "javascript",
    topicId: "javascript-arrays-objects",
    prompt: `What does this log?\n\nconst users = [\n  { id: 1, active: false },\n  { id: 2, active: true },\n  { id: 3, active: true },\n];\nconst { id } = users.find((u) => u.active);\nconst rest = users.filter((u) => u.id !== id);\nconsole.log(id, rest.length);`,
    options: ["1 2", "2 1", "3 2", "2 2"],
    answer: 3,
    explanation:
      "find returns only the first matching element, the user with id 2, and destructuring pulls out its id. filter keeps every element that passes the test, here the two users whose id is not 2.",
  },
  {
    id: "javascript-q14",
    skillId: "javascript",
    topicId: "javascript-arrays-objects",
    prompt: `What does this log?\n\nconst words = ['a', 'b', 'a', 'c', 'a'];\nconst counts = words.reduce((acc, w) => {\n  acc[w] = (acc[w] || 0) + 1;\n  return acc;\n}, {});\nconsole.log(counts.a, Object.keys(counts).length);`,
    options: ["3 3", "3 5", "1 3", "NaN 3"],
    answer: 0,
    explanation:
      "The object collects one key per distinct word and adds 1 each time the word appears; (acc[w] || 0) starts a missing key at 0. The result is { a: 3, b: 1, c: 1 }, which has 3 keys.",
  },
  {
    id: "javascript-q15",
    skillId: "javascript",
    topicId: "javascript-async",
    prompt: `What does this log?\n\nPromise.resolve(1)\n  .then((x) => x + 1)\n  .then((x) => {\n    x * 10;\n  })\n  .then((x) => console.log(x));`,
    options: ["20", "2", "undefined", "1"],
    answer: 2,
    explanation:
      "Each then passes on whatever its callback returns. The second callback has curly braces but no return statement, so it returns undefined and that is what the last then receives.",
  },
  {
    id: "javascript-q16",
    skillId: "javascript",
    topicId: "javascript-async",
    prompt: `In what order are things logged?\n\nconst delay = (ms) => new Promise((r) => setTimeout(r, ms));\n\nasync function main() {\n  [1, 2].forEach(async (n) => {\n    await delay(10);\n    console.log(n);\n  });\n  console.log('done');\n}\nmain();`,
    options: ["1, 2, done", "done, 1, 2", "1, done, 2", "done only"],
    answer: 1,
    explanation:
      "forEach does not wait for the promises its async callbacks return: it starts both, each pauses at its await, and main carries straight on to log 'done'. The two timers then finish in the order they were started.",
  },

  // ---------- React ----------
  {
    id: "react-q9",
    skillId: "react",
    topicId: "react-components-props",
    prompt: `What text does this component render?\n\nfunction Welcome() {\n  const user = 'Ria';\n  return <h1>Hi {user}, you have {2 + 3} tasks</h1>;\n}`,
    options: [
      "Hi {user}, you have {2 + 3} tasks",
      "Hi Ria, you have 2 + 3 tasks",
      "Hi Ria, you have 5 tasks",
      "Hi user, you have 5 tasks",
    ],
    answer: 2,
    explanation:
      "Curly braces in JSX hold a JavaScript expression that is evaluated and its result rendered, so {user} becomes Ria and {2 + 3} becomes 5.",
  },
  {
    id: "react-q10",
    skillId: "react",
    topicId: "react-components-props",
    prompt: `In a plain JavaScript (not TypeScript) React project, what does the span contain?\n\nfunction Badge({ label }) {\n  return <span>{label}</span>;\n}\n\nfunction App() {\n  const label = 'New';\n  return <Badge text={label} />;\n}`,
    options: [
      "Nothing; the prop was passed as text, so label is undefined",
      "'New', because the variable in App is also called label",
      "The word 'label', because no matching prop was found",
      "The word 'undefined', printed as text",
    ],
    answer: 0,
    explanation:
      "A component only receives props under the names used where it is rendered. Badge gets { text: 'New' }, so label is undefined, and React renders nothing for undefined.",
  },
  {
    id: "react-q11",
    skillId: "react",
    topicId: "react-state",
    prompt: `count is 0. What does the first click log?\n\nconst [count, setCount] = useState(0);\nfunction handleClick() {\n  setCount(count + 1);\n  console.log(count);\n}`,
    options: [
      "1, because setCount updates count straight away, before the next line runs",
      "0, because count keeps this render's value until the next render",
      "undefined, because count is in the middle of an update",
      "Nothing; the re-render stops the handler before the log",
    ],
    answer: 1,
    explanation:
      "setCount asks React for a new render; it does not change the count variable the running handler already has. The new value, 1, is only visible in the next render.",
  },
  {
    id: "react-q12",
    skillId: "react",
    topicId: "react-state",
    prompt: `What does the paragraph show after rename() runs?\n\nconst [form, setForm] = useState({ name: 'Ria', city: 'Kochi' });\nfunction rename() {\n  setForm({ name: 'Asha' });\n}\nreturn <p>{form.name} from {form.city}</p>;`,
    options: [
      "'Asha from Kochi', because the setter merges new fields into the old object",
      "'Ria from Kochi', because an object held in state cannot be replaced",
      "Nothing; reading form.city throws an error and the component crashes",
      "'Asha from' with no city, because the setter replaces the whole object",
    ],
    answer: 3,
    explanation:
      "A useState setter replaces the state value; it does not merge. The new object has no city, so form.city is undefined and renders nothing. Keep the other fields with setForm({ ...form, name: 'Asha' }).",
  },
  {
    id: "react-q13",
    skillId: "react",
    topicId: "react-effects",
    prompt: `roomId is a prop. When it changes from 1 to 2, what does this effect log?\n\nuseEffect(() => {\n  console.log('connect', roomId);\n  return () => console.log('disconnect', roomId);\n}, [roomId]);`,
    options: [
      "'disconnect 1', then 'connect 2'",
      "'connect 2', then 'disconnect 1'",
      "'disconnect 2', then 'connect 2'",
      "'connect 2' only",
    ],
    answer: 0,
    explanation:
      "When a dependency changes, React first runs the previous effect's cleanup, which still sees the old roomId, and then runs the effect again with the new value. Cleanup is not only for unmounting.",
  },
  {
    id: "react-q14",
    skillId: "react",
    topicId: "react-effects",
    prompt: `count is shown on the page and starts at 0. What does the page show after 5 seconds?\n\nconst [count, setCount] = useState(0);\nuseEffect(() => {\n  const id = setInterval(() => {\n    setCount(count + 1);\n  }, 1000);\n  return () => clearInterval(id);\n}, []);`,
    options: ["5", "0", "1", "An error: too many re-renders"],
    answer: 2,
    explanation:
      "With an empty dependency array the effect runs once, so its callback keeps the count from the first render, which is 0. Every tick calls setCount(0 + 1), so the page stays at 1; setCount(c => c + 1) fixes it.",
  },
  {
    id: "react-q15",
    skillId: "react",
    topicId: "react-lists-forms",
    prompt: `The user replaces the 1 in the field with 5. What does the paragraph show?\n\nconst [qty, setQty] = useState(1);\nreturn (\n  <>\n    <input\n      type='number'\n      value={qty}\n      onChange={(e) => setQty(e.target.value)}\n    />\n    <p>{qty + 1}</p>\n  </>\n);`,
    options: ["6", "5", "NaN", "51"],
    answer: 3,
    explanation:
      "e.target.value is always a string, even for type='number', so qty becomes '5' and '5' + 1 joins the two as text. Convert it first: setQty(Number(e.target.value)).",
  },
  {
    id: "react-q16",
    skillId: "react",
    topicId: "react-lists-forms",
    prompt: `NoteEditor keeps the text being typed in its own state: const [draft, setDraft] = useState(''). The parent renders it as shown. The user types a draft for note 1 and then opens note 2, so noteId changes from 1 to 2. What happens to draft?\n\n<NoteEditor key={noteId} noteId={noteId} />`,
    options: [
      "It is kept, because the same component is still rendered in the same place",
      "It is reset to '', because a new key makes React mount a fresh instance",
      "It is kept, because React only looks at key on elements created by map()",
      "React logs a warning and ignores the key, because this is not a list",
    ],
    answer: 1,
    explanation:
      "A key identifies a component instance anywhere, not just in lists. When the key changes, React unmounts the old NoteEditor and mounts a new one, so its state starts again from the initial value.",
  },

  // ---------- TypeScript ----------
  {
    id: "typescript-q9",
    skillId: "typescript",
    topicId: "typescript-basic-types",
    prompt: `What is the inferred type of labels?\n\nconst prices = [10, 20, 30];\nconst labels = prices.map((p) => 'Rs ' + p);`,
    options: ["number[]", "string[]", "any[]", "(string | number)[]"],
    answer: 1,
    explanation:
      "prices is inferred as number[], so p is a number, and a string plus a number is a string. map returns an array of whatever the callback returns, so labels is string[].",
  },
  {
    id: "typescript-q10",
    skillId: "typescript",
    topicId: "typescript-basic-types",
    prompt: `With strict mode on, what is the inferred type of n?\n\nfunction parse(input: string) {\n  if (input === '') return null;\n  return Number(input);\n}\nconst n = parse('42');`,
    options: ["number", "any", "number | undefined", "number | null"],
    answer: 3,
    explanation:
      "With no return annotation, the return type is the union of every return statement: null from the first and number from the second. The compiler does not look at the argument's value, so n is number | null even for '42'.",
  },
  {
    id: "typescript-q11",
    skillId: "typescript",
    topicId: "typescript-object-types",
    prompt: `With strict mode on, what is the inferred return type of city?\n\ninterface User {\n  name: string;\n  address?: { city: string };\n}\nfunction city(u: User) {\n  return u.address?.city;\n}`,
    options: ["string | undefined", "string", "string | null", "any"],
    answer: 0,
    explanation:
      "address is optional, so it may be undefined. Optional chaining gives undefined in that case and the city string otherwise, so the result is string | undefined.",
  },
  {
    id: "typescript-q12",
    skillId: "typescript",
    topicId: "typescript-object-types",
    prompt: `What happens when this is compiled?\n\ninterface Student {\n  name: string;\n}\ninterface Teacher {\n  name: string;\n}\nfunction welcome(t: Teacher) {\n  return 'Welcome, ' + t.name;\n}\nconst s: Student = { name: 'Ria' };\nwelcome(s);`,
    options: [
      "Compile error: Student and Teacher are different interfaces",
      "Compile error: Student must first be declared as extends Teacher",
      "It compiles, because the two types have the same shape",
      "It compiles only if the call is written welcome(s as Teacher)",
    ],
    answer: 2,
    explanation:
      "TypeScript is structurally typed: a value is accepted when it has the required properties with the right types. The names of the interfaces are not compared, so a Student is a valid Teacher here.",
  },
  {
    id: "typescript-q13",
    skillId: "typescript",
    topicId: "typescript-unions-narrowing",
    prompt: `What is the type of v in the final 'return v;' statement?\n\nfunction describe(v: string | number | null) {\n  if (v === null) return 'none';\n  if (typeof v === 'number') return v.toFixed(1);\n  return v;\n}`,
    options: ["string", "string | number", "string | null", "never"],
    answer: 0,
    explanation:
      "Each check that returns removes one member from the union for the code after it. null is ruled out first, then number, so only string is left at the final return.",
  },
  {
    id: "typescript-q14",
    skillId: "typescript",
    topicId: "typescript-unions-narrowing",
    prompt: `'done' was added to Status later, but the switch was not updated. What does the compiler report?\n\ntype Status = 'idle' | 'loading' | 'done';\n\nfunction label(s: Status): string {\n  switch (s) {\n    case 'idle':\n      return 'Waiting';\n    case 'loading':\n      return 'Loading';\n    default: {\n      const unreachable: never = s;\n      return unreachable;\n    }\n  }\n}`,
    options: [
      "Nothing; the default branch handles every remaining value",
      "Error on the never line: type 'done' is not assignable to type 'never'",
      "Error: a variable cannot be declared with the type never",
      "Nothing at compile time, but it throws at runtime when s is 'done'",
    ],
    answer: 1,
    explanation:
      "In the default branch s is narrowed to whatever the cases did not handle, here 'done'. Nothing can be assigned to never, so the line fails to compile until a case for 'done' is added; this is an exhaustiveness check.",
  },
  {
    id: "typescript-q15",
    skillId: "typescript",
    topicId: "typescript-generics",
    prompt: `What is the inferred type of v?\n\nfunction get<T, K extends keyof T>(obj: T, key: K): T[K] {\n  return obj[key];\n}\nconst user = { name: 'Ria', age: 21 };\nconst v = get(user, 'age');`,
    options: ["any", "'age'", "string | number", "number"],
    answer: 3,
    explanation:
      "T is inferred as { name: string; age: number } and K as the literal type 'age'. The return type T[K] looks up that one property, so v is number rather than a union of every property type.",
  },
  {
    id: "typescript-q16",
    skillId: "typescript",
    topicId: "typescript-generics",
    prompt: `What happens when this is compiled?\n\ntype Scores = Record<'html' | 'css', number>;\nconst s: Scores = { html: 80 };`,
    options: [
      "It compiles, because Record makes every key optional",
      "It compiles, and s.css is given the value 0",
      "Compile error: property 'css' is missing",
      "Compile error: Record only accepts string as its key type",
    ],
    answer: 2,
    explanation:
      "Record<K, V> builds an object type with a required property of type V for every key in K, so both html and css must be present. Partial<Record<...>> would make them optional.",
  },

  // ---------- Web APIs ----------
  {
    id: "web-apis-q9",
    skillId: "web-apis",
    topicId: "web-apis-http-rest",
    prompt: `Your app sends DELETE /api/tasks/5 and the server replies with status 204 No Content. What does this tell the app?`,
    options: [
      "The task was not found, so nothing was deleted",
      "The delete succeeded, and the response has no body to parse",
      "The request was accepted, but the delete has not happened yet",
      "The task has moved, so the request must be repeated at a new URL",
    ],
    answer: 1,
    explanation:
      "Every 2xx status means success, and 204 adds that there is deliberately no response body. A missing task would be 404, which is a different status family.",
  },
  {
    id: "web-apis-q10",
    skillId: "web-apis",
    topicId: "web-apis-http-rest",
    prompt: `A weak mobile connection makes your app send the same request twice. Following REST conventions, for which request does the second copy risk creating a duplicate record?`,
    options: [
      "GET /api/orders/7",
      "PUT /api/orders/7 with the full order in the body",
      "DELETE /api/orders/7",
      "POST /api/orders with the order in the body",
    ],
    answer: 3,
    explanation:
      "POST to a collection creates a new resource each time it is handled, so two copies give two orders. GET only reads, and repeating the same PUT or DELETE leaves the server in the same state as sending it once.",
  },
  {
    id: "web-apis-q11",
    skillId: "web-apis",
    topicId: "web-apis-fetch",
    prompt: `The server responds to this request with status 201 and a JSON body. What does this log?\n\nconst res = await fetch('/api/tasks', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ title: 'Revise' }),\n});\nconsole.log(res.ok, res.status);`,
    options: ["true 201", "false 201", "true 200", "undefined 201"],
    answer: 0,
    explanation:
      "res.status is the exact code the server sent, and res.ok is true for any status from 200 to 299, not only for 200.",
  },
  {
    id: "web-apis-q12",
    skillId: "web-apis",
    topicId: "web-apis-fetch",
    prompt: `The server responds with status 200 and a valid JSON body. What happens on the third line?\n\nconst res = await fetch('/api/user');\nconst a = await res.json();\nconst b = await res.json();`,
    options: [
      "b is a second copy of the same data as a, parsed again from the cached body",
      "b is undefined, because the body is now empty and there is nothing to parse",
      "It throws a TypeError, because a response body can be read only once",
      "fetch sends the request again to get a fresh body",
    ],
    answer: 2,
    explanation:
      "A response body is a stream that is used up by the first json() or text() call, and reading it again rejects with a TypeError. Keep the parsed value in a variable and reuse that.",
  },
  {
    id: "web-apis-q13",
    skillId: "web-apis",
    topicId: "web-apis-errors-states",
    prompt: `The server responds to /api/courses with status 500. What is logged?\n\nasync function load() {\n  const res = await fetch('/api/courses');\n  if (!res.ok) throw new Error('HTTP ' + res.status);\n  return res.json();\n}\n\ntry {\n  const data = await load();\n  console.log('loaded');\n} catch (e) {\n  console.log(e.message);\n}`,
    options: ["'loaded'", "'HTTP 500'", "'Failed to fetch'", "Nothing is logged"],
    answer: 1,
    explanation:
      "fetch itself resolves, but res.ok is false for a 500, so load throws the error it built. await turns that rejection into an exception, the rest of the try block is skipped and catch logs the message.",
  },
  {
    id: "web-apis-q14",
    skillId: "web-apis",
    topicId: "web-apis-errors-states",
    prompt: `A search box sends a request on every keystroke. A user types 're' and then 'react'. The response for 're' happens to arrive last, so the list shows results for 're' while the box says 'react'. Which fix guarantees the list matches the latest text?`,
    options: [
      "Cancel the previous request with an AbortController before sending the next",
      "Add a debounce so that fewer requests are sent while the user types",
      "Wrap the fetch call in try/catch and show an error message on failure",
      "Save each response in localStorage before it is rendered",
    ],
    answer: 0,
    explanation:
      "Responses can arrive in a different order from the requests. Aborting the earlier request means its late response can never overwrite newer results; a debounce only makes the race less likely.",
  },
  {
    id: "web-apis-q15",
    skillId: "web-apis",
    topicId: "web-apis-browser-apis",
    prompt: `The user clicks the Delete button. What is logged?\n\n<ul id='list'>\n  <li><button id='del'>Delete</button></li>\n</ul>\n\nconst list = document.querySelector('#list');\nconst del = document.querySelector('#del');\nlist.addEventListener('click', () => console.log('list'));\ndel.addEventListener('click', (e) => {\n  e.stopPropagation();\n  console.log('button');\n});`,
    options: ["'button', then 'list'", "'list', then 'button'", "'button' only", "'list' only"],
    answer: 2,
    explanation:
      "A click starts at the button and then bubbles up through its ancestors. stopPropagation() halts that journey at the button, so the listener on the <ul> never runs.",
  },
  {
    id: "web-apis-q16",
    skillId: "web-apis",
    topicId: "web-apis-browser-apis",
    prompt: `What does this log in total?\n\nfunction debounce(fn, ms) {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), ms);\n  };\n}\nconst search = debounce((q) => console.log(q), 300);\n\nsearch('r');   // at 0 ms\nsearch('re');  // at 100 ms\nsearch('rea'); // at 200 ms, then no more calls`,
    options: [
      "'r', then 're', then 'rea'",
      "'r' only",
      "Nothing, because every timer is cleared",
      "'rea' only",
    ],
    answer: 3,
    explanation:
      "Each call cancels the timer set by the one before it and starts a new 300 ms wait. Only the last call's timer survives, so fn runs once, with 'rea', 300 ms after the typing stops.",
  },

  // ---------- Git ----------
  {
    id: "git-q9",
    skillId: "git",
    topicId: "git-commits",
    prompt: `You change line 1 of app.js and run git add app.js. You then change line 2 of the same file and, without running git add again, run git commit -m 'Fix'. What does the commit contain?`,
    options: [
      "Both changes, because app.js was already staged",
      "Only the line 1 change; the line 2 change stays unstaged",
      "Only the line 2 change, because it is the most recent",
      "Nothing; Git refuses to commit a file edited after staging",
    ],
    answer: 1,
    explanation:
      "git add stages a snapshot of the file as it is at that moment, not the file name. Edits made afterwards are not in the staging area until you run git add again.",
  },
  {
    id: "git-q10",
    skillId: "git",
    topicId: "git-commits",
    prompt: `index.html is already tracked and you have edited it. You have also created new.css, which has never been added. You run:\n\ngit commit -a -m 'Update page'\n\nWhat does the commit contain?`,
    options: [
      "Both files, because -a stages everything in the folder",
      "Neither file, because nothing was staged with git add",
      "Only new.css, because -a stages new files",
      "Only index.html, because -a stages tracked files only",
    ],
    answer: 3,
    explanation:
      "The -a flag automatically stages files Git already tracks that were modified or deleted. Untracked files such as new.css must be added with git add before they can be committed.",
  },
  {
    id: "git-q11",
    skillId: "git",
    topicId: "git-branches",
    prompt: `On the branch feature you create notes.md and commit it. The branch has not been merged anywhere. You then run git switch main. What happens to notes.md in your project folder?`,
    options: [
      "It stays in the folder and shows up as an untracked file when you run git status",
      "Git refuses to switch branches until feature has been merged into main",
      "It disappears from the folder, and returns when you switch back to feature",
      "It is deleted for good, because main has no commit containing it",
    ],
    answer: 2,
    explanation:
      "Switching branches updates the working folder to match the commit the branch points to, and main's commit has no notes.md. The file is safe in feature's commit and is restored when you switch back.",
  },
  {
    id: "git-q12",
    skillId: "git",
    topicId: "git-branches",
    prompt: `main has two commits, A and B. You create feature from B and add commits C and D. Meanwhile a teammate's commit E lands on main. On main you run git merge feature with Git's default settings, and it completes with no conflicts. How many commits does git log --oneline now list on main?`,
    options: ["6", "5", "4", "3"],
    answer: 0,
    explanation:
      "Both branches gained commits after B, so Git cannot fast-forward and creates a merge commit with two parents. main now reaches A, B, C, D, E and the merge commit: six in total.",
  },
  {
    id: "git-q13",
    skillId: "git",
    topicId: "git-remotes",
    prompt: `git status prints: Your branch is ahead of 'origin/main' by 2 commits. What does this mean?`,
    options: [
      "You have 2 local commits that have not been pushed to origin yet",
      "origin has 2 commits that you have not pulled yet",
      "You have 2 edited files that have not been committed yet",
      "Your branch and origin/main have 2 commits that conflict",
    ],
    answer: 0,
    explanation:
      "'Ahead' means your local branch has commits that the remote-tracking branch origin/main does not have; git push would send them. If the remote had commits you lacked, Git would say 'behind'.",
  },
  {
    id: "git-q14",
    skillId: "git",
    topicId: "git-remotes",
    prompt: `Your local main has one commit, L, that is not pushed. A teammate has pushed one new commit, R, to main on origin. You run git pull --rebase and there are no conflicts. What does your local history look like afterwards?`,
    options: [
      "R is thrown away and your branch still ends with L",
      "L and R are joined together by a new merge commit",
      "R comes first, then L replayed on top of it, with no merge commit",
      "L is thrown away and your branch matches origin exactly",
    ],
    answer: 2,
    explanation:
      "pull --rebase fetches the remote commits and then re-applies your unpushed commits on top of them, giving one straight line of history. A plain merge pull is what would create a merge commit.",
  },
  {
    id: "git-q15",
    skillId: "git",
    topicId: "git-undoing",
    prompt: `Your latest commit changed app.js and has not been pushed. You run git reset HEAD~1 with no other flags. What is the result?`,
    options: [
      "The commit is removed and the edits to app.js are deleted from the file as well",
      "The commit is removed and the edits to app.js stay staged, ready to commit",
      "A new commit is added that reverses the edits to app.js",
      "The commit is removed and the edits to app.js stay in the file, unstaged",
    ],
    answer: 3,
    explanation:
      "Without a flag, reset uses --mixed: the branch moves back one commit and the staging area is reset, but your files are left alone. --soft would keep the edits staged and --hard would delete them.",
  },
  {
    id: "git-q16",
    skillId: "git",
    topicId: "git-undoing",
    prompt: `You run git reset --hard HEAD~2 and then realise you still need the two commits it removed. They were never pushed. How can you get them back?`,
    options: [
      "Run git stash pop, because a hard reset moves removed commits into the stash",
      "Find the old commit's hash with git reflog, then git reset --hard <hash>",
      "Run git pull to download the two commits again from origin",
      "You cannot; a hard reset deletes unpushed commits at once and for good",
    ],
    answer: 1,
    explanation:
      "A reset only moves the branch pointer; the commits still exist in the repository for a while. git reflog lists where HEAD has been, so you can find the old hash and move the branch back to it.",
  },
];
