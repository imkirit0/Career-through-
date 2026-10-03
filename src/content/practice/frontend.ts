import type { Question } from "../taxonomy";

export const questions: Question[] = [
  // ───────── html-css ─────────
  {
    id: "html-css-p1",
    skillId: "html-css",
    topicId: "html-css-semantic-html",
    prompt:
      "A 'Delete' control is built as <div class='btn' onclick='remove()'>Delete</div>. It works with a mouse, but keyboard users cannot Tab to it or activate it with Enter. What is the best fix?",
    options: [
      "Add cursor: pointer and a hover style so the div looks clickable",
      "Add title='Delete' to the div",
      "Use a <button type='button'> element instead of the div",
      "Wrap the div in an <a> element that has no href",
    ],
    answer: 2,
    explanation:
      "A native <button> can be focused with Tab, responds to Enter and Space, and is announced as a button with no extra work. Making the div look clickable changes nothing for keyboard or screen-reader users.",
  },
  {
    id: "html-css-p2",
    skillId: "html-css",
    topicId: "html-css-semantic-html",
    prompt:
      "A purely decorative swirl image sits between two sections: <img src='swirl-final-v2.png'>. A screen-reader user says it is announced as 'swirl-final-v2.png'. Which change is correct?",
    options: [
      "Add an empty alt attribute: alt=''",
      "Add alt='Decorative swirl image separating two sections'",
      "Add title='swirl-final-v2.png'",
      "Rename the file to something shorter",
    ],
    answer: 0,
    explanation:
      "An empty alt tells assistive technology the image is decorative, so it is skipped. With no alt attribute at all, many screen readers fall back to the file name, and describing a decoration in detail only adds noise.",
  },
  {
    id: "html-css-p3",
    skillId: "html-css",
    topicId: "html-css-box-model-cascade",
    prompt:
      "Two paragraphs are stacked inside an ordinary block container (no flexbox or grid). The first has margin-bottom: 20px and the second has margin-top: 30px. How much vertical space is there between them?",
    options: ["50px", "20px", "10px", "30px"],
    answer: 3,
    explanation:
      "Vertical margins of adjacent block elements collapse into a single margin equal to the larger of the two, so the gap is 30px. They are not added together, which is why 50px is the common wrong guess.",
  },
  {
    id: "html-css-p4",
    skillId: "html-css",
    topicId: "html-css-box-model-cascade",
    prompt:
      "What background colour does the button get?\n\n<button class='btn-danger btn'>Delete</button>\n\n.btn-danger { background: red; }\n.btn { background: grey; }",
    options: [
      "Red, because btn-danger comes first in the class attribute",
      "Grey, because specificity ties and .btn comes later",
      "Red, because a longer class name is more specific",
      "Neither; the browser drops both conflicting declarations",
    ],
    answer: 1,
    explanation:
      "Both selectors are a single class, so specificity ties and the rule that appears later in the stylesheet wins. The order of names inside the class attribute has no effect on the cascade.",
  },
  {
    id: "html-css-p5",
    skillId: "html-css",
    topicId: "html-css-layout",
    prompt:
      "A row of skill tags sits in a container with display: flex. On narrow screens the tags run off the right edge instead of continuing on a new line. Which declaration on the container fixes this?",
    options: ["overflow: hidden;", "flex-wrap: wrap;", "flex-direction: row-reverse;", "white-space: normal;"],
    answer: 1,
    explanation:
      "Flex containers default to flex-wrap: nowrap, which keeps every item on one line even when they do not fit. flex-wrap: wrap lets items move onto new lines; overflow: hidden would only hide the tags that overflow.",
  },
  {
    id: "html-css-p6",
    skillId: "html-css",
    topicId: "html-css-layout",
    prompt:
      "A grid container holds an <aside> sidebar followed by a <main> content area. The sidebar should always be 250px wide and the content should take all the remaining width. Which declaration on the container does this?",
    options: [
      "grid-template-columns: 250px 1fr;",
      "grid-template-columns: 250px 100%;",
      "grid-template-columns: 1fr 250px;",
      "grid-template-rows: 250px 1fr;",
    ],
    answer: 0,
    explanation:
      "Items fill columns in source order, so the first track (250px) holds the sidebar and 1fr gives the content whatever space is left. 100% would make the second column as wide as the whole container, so the layout would overflow by 250px.",
  },
  {
    id: "html-css-p7",
    skillId: "html-css",
    topicId: "html-css-responsive",
    prompt:
      "A 1200px-wide photo overflows its column on phones. You want it to shrink to fit narrow containers, keep its proportions, and never be stretched beyond its natural size. Which CSS on the img does this?",
    options: ["width: 100vw;", "width: 100%; height: 100%;", "overflow: hidden;", "max-width: 100%; height: auto;"],
    answer: 3,
    explanation:
      "max-width: 100% caps the image at its container's width but leaves it at its natural size when there is room, and height: auto keeps the aspect ratio. width: 100% would also fill very wide containers, stretching the image past its natural size.",
  },
  {
    id: "html-css-p8",
    skillId: "html-css",
    topicId: "html-css-responsive",
    prompt:
      "A user who has raised their browser's default font size reports that the text on your site stays the same size. Your CSS sets every font-size in px. Which change respects their setting?",
    options: [
      "Set font sizes in vw so they follow the viewport width",
      "Add !important to each font-size declaration",
      "Set font sizes in rem and leave the root size alone",
      "Set font sizes in pt, since points are made for text",
    ],
    answer: 2,
    explanation:
      "rem is relative to the root font size, which follows the user's browser setting unless you override it with a px value. px sizes ignore that setting, and vw tracks the viewport width rather than the user's preference.",
  },

  // ───────── javascript ─────────
  {
    id: "javascript-p1",
    skillId: "javascript",
    topicId: "javascript-types-scope",
    prompt:
      "A quantity field contains 0, yet the warning below never shows. Why?\n\nconst qty = document.querySelector('#qty').value;\nif (qty === 0) {\n  showWarning('Add at least one item');\n}",
    options: [
      "=== cannot be used to compare numbers",
      "An input's value is a string, and '0' === 0 is false",
      "querySelector returns null when the element is an input field",
      "0 is falsy, so the if block is skipped",
    ],
    answer: 1,
    explanation:
      "An input's value is always a string, and === never converts types, so '0' === 0 is false; convert first with Number(qty). Falsiness is not the cause, because the if tests the result of the comparison, not qty itself.",
  },
  {
    id: "javascript-p2",
    skillId: "javascript",
    topicId: "javascript-types-scope",
    prompt:
      "A scoreboard should show a player's score, or 'No score yet' if none has been recorded. A player whose score is 0 sees 'No score yet'. Why?\n\nconst label = player.score || 'No score yet';",
    options: [
      "|| always returns its right-hand side",
      "0 is converted to the string '0', which || rejects",
      "player.score is undefined whenever it holds a number",
      "0 is falsy, so || falls through to the default",
    ],
    answer: 3,
    explanation:
      "|| returns its right-hand value whenever the left side is falsy, and 0 is falsy along with '', null, undefined and NaN. The ?? operator fixes this, because it only falls back for null and undefined.",
  },
  {
    id: "javascript-p3",
    skillId: "javascript",
    topicId: "javascript-functions-closures",
    prompt:
      "This is meant to show a reminder after 3 seconds, but the reminder appears immediately. Why?\n\nfunction showReminder() {\n  alert('Time for a break');\n}\nsetTimeout(showReminder(), 3000);",
    options: [
      "showReminder() calls it right away; pass showReminder without parentheses",
      "setTimeout measures its delay in seconds, so 3000 is rejected as too large",
      "Function declarations cannot be used as timer callbacks",
      "alert ignores timers and always runs before other code",
    ],
    answer: 0,
    explanation:
      "Writing showReminder() calls the function immediately and hands its return value (undefined) to setTimeout. Passing the name alone gives setTimeout the function itself to call later. The delay is in milliseconds, so 3000 is a valid 3 seconds.",
  },
  {
    id: "javascript-p4",
    skillId: "javascript",
    topicId: "javascript-functions-closures",
    prompt:
      "What does this log?\n\nlet rate = 0.1;\nconst addTax = (price) => price + price * rate;\nrate = 0.2;\nconsole.log(addTax(100));",
    options: ["110", "100", "120", "NaN"],
    answer: 2,
    explanation:
      "A closure keeps a live link to the variable, not a copy of the value it had when the function was created. By the time addTax runs, rate is 0.2, so the result is 100 + 20 = 120 rather than 110.",
  },
  {
    id: "javascript-p5",
    skillId: "javascript",
    topicId: "javascript-arrays-objects",
    prompt: "What does this log?\n\nconst scores = [5, 100, 25];\nscores.sort();\nconsole.log(scores);",
    options: ["[5, 25, 100]", "[25, 5, 100]", "[5, 100, 25]", "[100, 25, 5]"],
    answer: 3,
    explanation:
      "With no compare function, sort converts items to strings and orders them character by character, so '100' comes before '25' and '25' before '5'. That is why you do not get [5, 25, 100]; for numeric order pass a comparator: scores.sort((a, b) => a - b).",
  },
  {
    id: "javascript-p6",
    skillId: "javascript",
    topicId: "javascript-arrays-objects",
    prompt:
      "What does this log?\n\nconst cart = [\n  { price: 10, qty: 2 },\n  { price: 5, qty: 1 },\n];\nconst total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);\nconsole.log(total);",
    options: ["25", "15", "18", "NaN"],
    answer: 0,
    explanation:
      "reduce starts sum at 0 and adds price * qty for each item: 0 + 20 = 20, then 20 + 5 = 25. 15 is the sum of the prices alone, which ignores the quantities.",
  },
  {
    id: "javascript-p7",
    skillId: "javascript",
    topicId: "javascript-async",
    prompt:
      "A profile page needs two independent requests that each take about 2 seconds. This version takes about 4 seconds. Which change brings it close to 2 seconds?\n\nconst user = await getUser();\nconst posts = await getPosts();",
    options: [
      "Call getPosts inside a .then() attached to getUser()",
      "Wrap each line in its own setTimeout",
      "const [user, posts] = await Promise.all([getUser(), getPosts()]);",
      "Swap the two lines so getPosts runs first",
    ],
    answer: 2,
    explanation:
      "Each await pauses until that request finishes, so the second request does not even start until the first is done. Promise.all starts both at once and waits for both. Swapping the lines, or chaining one after the other with .then(), still runs them one at a time.",
  },
  {
    id: "javascript-p8",
    skillId: "javascript",
    topicId: "javascript-async",
    prompt:
      "getData() returns a Promise that rejects. What does calling load() log?\n\nasync function load() {\n  try {\n    const data = await getData();\n    console.log('loaded');\n  } catch (e) {\n    console.log('failed');\n  }\n  console.log('done');\n}",
    options: [
      "'loaded', then 'done'",
      "'failed', then 'done'",
      "'failed' only",
      "Nothing; the rejection goes unhandled",
    ],
    answer: 1,
    explanation:
      "await turns a rejected Promise into a thrown error, so the rest of the try block is skipped and catch runs. Because the error was handled, the function carries on and logs 'done' as well; it does not stop after the catch block.",
  },

  // ───────── react ─────────
  {
    id: "react-p1",
    skillId: "react",
    topicId: "react-components-props",
    prompt:
      "A Card component is used as shown, but the heading and paragraph never appear on screen. What is the fix?\n\nfunction Card() {\n  return <div className='card'></div>;\n}\n\n<Card>\n  <h2>Plan</h2>\n  <p>Five days left</p>\n</Card>",
    options: [
      "Give the h2 and p elements key props",
      "Call Card() as a plain function instead of using JSX tags",
      "Import the h2 and p elements into the file that defines the Card component",
      "Accept the children prop in Card and render {children} inside the div",
    ],
    answer: 3,
    explanation:
      "JSX placed between a component's opening and closing tags is passed to it as the children prop, and nothing appears unless the component renders it. Keys are only for items in a list and would not make the content show up.",
  },
  {
    id: "react-p2",
    skillId: "react",
    topicId: "react-components-props",
    prompt:
      "When the cart is empty, a stray 0 appears on the page. Why?\n\n<div>\n  {items.length && <CartSummary items={items} />}\n</div>",
    options: [
      "CartSummary returns 0 whenever it receives an empty items array",
      "items.length is 0, so && returns 0 and React renders it",
      "React renders every falsy value as text",
      "The curly braces convert the expression to a string",
    ],
    answer: 1,
    explanation:
      "&& returns its left side when that side is falsy, so the whole expression evaluates to 0. React skips false, null and undefined but does render numbers, including 0. Use a real boolean such as items.length > 0 instead.",
  },
  {
    id: "react-p3",
    skillId: "react",
    topicId: "react-state",
    prompt:
      "Clicking the button logs increasing numbers to the console, but the page always shows 'Likes: 0'. Why?\n\nfunction LikeButton() {\n  let likes = 0;\n  function handleClick() {\n    likes = likes + 1;\n    console.log(likes);\n  }\n  return <button onClick={handleClick}>Likes: {likes}</button>;\n}",
    options: [
      "Reassigning a local variable does not re-render; use useState",
      "onClick handlers cannot change variables declared outside them",
      "The button needs a key prop before its text can update",
      "likes should be declared with const so React can track it",
    ],
    answer: 0,
    explanation:
      "React re-renders when state or props change, and it has no way to notice an ordinary variable being reassigned. Even if a render did happen, let likes = 0 would run again and reset the value, which is why the value must live in useState.",
  },
  {
    id: "react-p4",
    skillId: "react",
    topicId: "react-state",
    prompt:
      "A page renders the same component twice: <Counter /> <Counter />. Each one holds const [count, setCount] = useState(0) and a button that increases it by one. You click the first counter's button three times. What do the two counters show?",
    options: [
      "3 and 3, because both run the same useState call",
      "0 and 0, until the page is refreshed",
      "3 and 0, because each rendered instance keeps its own state",
      "0 and 3, because the last instance rendered owns the shared state",
    ],
    answer: 2,
    explanation:
      "State belongs to a component instance at a particular place in the tree, not to the component's code. The two counters run the same function but each has its own count; to make them move together you would lift the state into their parent.",
  },
  {
    id: "react-p5",
    skillId: "react",
    topicId: "react-effects",
    prompt:
      "A profile page shows the right user at first, but when its userId prop changes it keeps showing the old user. What is the fix?\n\nuseEffect(() => {\n  fetch('/api/users/' + userId)\n    .then(r => r.json())\n    .then(setUser);\n}, []);",
    options: [
      "Mark the effect callback as async",
      "List userId in the dependency array: [userId]",
      "Copy userId into a ref so the effect can read the latest value",
      "Wrap the component in React.memo",
    ],
    answer: 1,
    explanation:
      "An empty dependency array tells React the effect never needs to run again, so it only fetches for the first userId. Listing userId makes the effect re-run whenever that value changes. A ref would hold the new id but would not cause the effect to run again.",
  },
  {
    id: "react-p6",
    skillId: "react",
    topicId: "react-effects",
    prompt:
      "first and last are props. A reviewer says this component does more work than it needs to. Which version is the simplest correct one?\n\nconst [fullName, setFullName] = useState('');\nuseEffect(() => {\n  setFullName(first + ' ' + last);\n}, [first, last]);",
    options: [
      "Keep the state but set it inside useLayoutEffect instead",
      "Keep the effect but pass an empty dependency array",
      "Store fullName in a ref and update the ref in the effect",
      "Drop the state and effect; compute first + ' ' + last during render",
    ],
    answer: 3,
    explanation:
      "A value that can be calculated from props or state does not need its own state or an effect; computing it during render is always in sync and avoids an extra render. Effects are for synchronising with things outside React, such as network requests, timers or the DOM.",
  },
  {
    id: "react-p7",
    skillId: "react",
    topicId: "react-lists-forms",
    prompt:
      "React still warns 'Each child in a list should have a unique key prop' for this list. What is the fix?\n\n<ul>\n  {courses.map(c => (\n    <li>\n      <span key={c.id}>{c.title}</span>\n    </li>\n  ))}\n</ul>",
    options: [
      "Add an id attribute to each li",
      "Give the ul a key as well",
      "Move the key to the li: <li key={c.id}>",
      "Call courses.forEach instead of courses.map",
    ],
    answer: 2,
    explanation:
      "The key must be on the outermost element returned from the map callback, because that is the item React tracks in the list. A key on a nested element does not count, and an id attribute is plain HTML that React does not use to identify list items.",
  },
  {
    id: "react-p8",
    skillId: "react",
    topicId: "react-lists-forms",
    prompt:
      "After this checkbox is ticked and then unticked, agreed is still truthy. What is the fix?\n\nconst [agreed, setAgreed] = useState(false);\nreturn (\n  <input\n    type='checkbox'\n    value={agreed}\n    onChange={e => setAgreed(e.target.value)}\n  />\n);",
    options: [
      "Use checked={agreed} and read e.target.checked in the handler",
      "Change the input type to 'radio'",
      "Initialise the state with the string 'false'",
      "Replace onChange with onClick and keep e.target.value",
    ],
    answer: 0,
    explanation:
      "A checkbox reports whether it is ticked through its checked property, not value. e.target.value is the text the box would submit with a form, a non-empty string whether or not it is ticked, so it is always truthy; e.target.checked is the boolean you want.",
  },

  // ───────── typescript ─────────
  {
    id: "typescript-p1",
    skillId: "typescript",
    topicId: "typescript-basic-types",
    prompt:
      "What does the compiler do with the call inside onSubmit?\n\nfunction applyDiscount(price: number) {\n  return price * 0.9;\n}\nfunction onSubmit(priceText: string) {\n  return applyDiscount(priceText);\n}",
    options: [
      "Compiles, and converts the string to a number automatically",
      "Reports an error: a string is not assignable to a number parameter",
      "Compiles, but the result is NaN at runtime",
      "Reports an error only when strict mode is switched off",
    ],
    answer: 1,
    explanation:
      "Parameter annotations are checked at every call, so passing a string where a number is required is a compile error. TypeScript never converts values for you; you fix it by converting explicitly, for example applyDiscount(Number(priceText)).",
  },
  {
    id: "typescript-p2",
    skillId: "typescript",
    topicId: "typescript-basic-types",
    prompt:
      "An API actually returns { name: 'Ria', age: '25' }, with age as a string. What does this code do when it runs?\n\ninterface User {\n  name: string;\n  age: number;\n}\nconst res = await fetch('/api/user');\nconst user = (await res.json()) as User;\nconsole.log(user.age + 1);",
    options: [
      "Logs 26, because the User type converts age to a number",
      "Throws a TypeError as soon as the data fails to match User",
      "Logs '251', because types are erased and nothing is checked at runtime",
      "Fails to compile, because the compiler detects the API's real response",
    ],
    answer: 2,
    explanation:
      "Interfaces and type assertions exist only at compile time; they are removed from the JavaScript that runs, so nothing validates or converts the real data. age is still the string '25', and '25' + 1 is '251'. Data from outside your program needs a runtime check if you cannot trust it.",
  },
  {
    id: "typescript-p3",
    skillId: "typescript",
    topicId: "typescript-object-types",
    prompt:
      "What happens when this is compiled?\n\ninterface Order {\n  readonly id: number;\n  status: string;\n}\nconst order: Order = { id: 7, status: 'new' };\norder.status = 'paid';\norder.id = 8;",
    options: [
      "It compiles; readonly only has an effect at runtime",
      "Both assignments are errors, because order is declared with const",
      "The object literal is an error, because a readonly property cannot be given a value",
      "Only order.id = 8 is an error, because id is a read-only property",
    ],
    answer: 3,
    explanation:
      "readonly stops a property from being reassigned after the object is created, so order.id = 8 is rejected while status can still change. const only prevents reassigning the variable order itself; it does not lock the object's properties.",
  },
  {
    id: "typescript-p4",
    skillId: "typescript",
    topicId: "typescript-object-types",
    prompt:
      "Given these types, which object is a valid Student?\n\ninterface Person {\n  name: string;\n}\ninterface Student extends Person {\n  course: string;\n}",
    options: [
      "{ name: 'Ria', course: 'React' }",
      "{ course: 'React' }",
      "{ person: { name: 'Ria' }, course: 'React' }",
      "{ name: 'Ria' }",
    ],
    answer: 0,
    explanation:
      "extends gives Student every member of Person, so a Student needs both name and course at the top level. It does not nest the parent under a person property, and leaving out either required field is a compile error.",
  },
  {
    id: "typescript-p5",
    skillId: "typescript",
    topicId: "typescript-unions-narrowing",
    prompt:
      "What does the compiler do with the last line?\n\ntype Status = 'idle' | 'loading' | 'error';\nlet status: Status = 'idle';\nstatus = 'loadng';",
    options: [
      "Accepts it, because any string fits a union of strings",
      "Accepts it, and adds 'loadng' to the Status type",
      "Reports an error, because 'loadng' is not one of the allowed values",
      "Reports an error, because a let variable cannot be given a union type",
    ],
    answer: 2,
    explanation:
      "A union of string literals allows only those exact values, so the misspelt 'loadng' is not assignable to Status. This is the main reason to prefer a literal union over plain string: typos are caught at compile time instead of becoming silent bugs.",
  },
  {
    id: "typescript-p6",
    skillId: "typescript",
    topicId: "typescript-unions-narrowing",
    prompt:
      "A function accepts either one tag or a list of tags, and should join the list into one string. Which condition correctly narrows tags to string[]?\n\nfunction label(tags: string | string[]) {\n  if (/* condition */) {\n    return tags.join(', ');\n  }\n  return tags;\n}",
    options: ["Array.isArray(tags)", "typeof tags === 'array'", "tags.length > 1", "tags !== undefined"],
    answer: 0,
    explanation:
      "Array.isArray is a built-in type guard that narrows the union to string[] inside the block. typeof never returns 'array' (arrays report 'object'), and checking length does not help because strings have a length too.",
  },
  {
    id: "typescript-p7",
    skillId: "typescript",
    topicId: "typescript-generics",
    prompt:
      "Your team wraps every API result in this type. What is the type of res.data inside show?\n\ntype ApiResponse<T> = {\n  data: T;\n  error: string | null;\n};\nfunction show(res: ApiResponse<Course[]>) {\n  return res.data;\n}",
    options: ["T", "ApiResponse<Course[]>", "Course", "Course[]"],
    answer: 3,
    explanation:
      "A generic type is a template: writing ApiResponse<Course[]> substitutes Course[] wherever T appears, so data is Course[]. T is only a placeholder inside the definition, never the type you get where the generic is used.",
  },
  {
    id: "typescript-p8",
    skillId: "typescript",
    topicId: "typescript-generics",
    prompt:
      "A User interface has id, name, email and password. You need a PublicUser type with every field except password, and it should stay in sync when fields are added to User. Which type fits best?",
    options: ["Pick<User, 'password'>", "Omit<User, 'password'>", "Exclude<User, 'password'>", "User['password']"],
    answer: 1,
    explanation:
      "Omit<T, K> builds a new type from T with the listed keys removed, so new User fields flow through automatically. Pick does the opposite and would keep only password, and Exclude removes members from a union type rather than properties from an object type.",
  },

  // ───────── web-apis ─────────
  {
    id: "web-apis-p1",
    skillId: "web-apis",
    topicId: "web-apis-http-rest",
    prompt:
      "A settings page lets a user change only their display name. Following REST conventions, which request should the app send for user 42?",
    options: [
      "PATCH /api/users/42 with the new name in the body",
      "GET /api/users/42?name=NewName",
      "POST /api/users with the id and new name in the body",
      "DELETE /api/users/42, followed by POST /api/users",
    ],
    answer: 0,
    explanation:
      "PATCH applies a partial update to an existing resource identified by its URL. GET must never change data, since it can be cached, prefetched or repeated, and POST to the collection would create a second user instead of updating this one.",
  },
  {
    id: "web-apis-p2",
    skillId: "web-apis",
    topicId: "web-apis-http-rest",
    prompt:
      "A signup request gets the response 400 Bad Request with the body { error: 'email is invalid' }. How should the app interpret this?",
    options: [
      "The server is temporarily down, so the app should send the same request again shortly",
      "The signup URL does not exist on the server",
      "The data sent was rejected, so show the message and let the user correct it",
      "The account was created, but the server attached a warning",
    ],
    answer: 2,
    explanation:
      "Status codes in the 4xx range mean the problem is with the request, and 400 says the server could not accept what was sent. Retrying the identical request will fail the same way; failures on the server's side are reported with 5xx codes instead.",
  },
  {
    id: "web-apis-p3",
    skillId: "web-apis",
    topicId: "web-apis-fetch",
    prompt: "A 'Remove' button on a task list should ask the API to delete task 5. Which call does that?",
    options: [
      "fetch('/api/tasks/5')",
      "fetch('/api/tasks/5', { method: 'DELETE' })",
      "fetch.delete('/api/tasks/5')",
      "fetch('/api/tasks/5', { type: 'DELETE' })",
    ],
    answer: 1,
    explanation:
      "fetch sends a GET unless you set the method option, so the bare call would only read the task. fetch has no .delete helper and no type option; those come from other libraries.",
  },
  {
    id: "web-apis-p4",
    skillId: "web-apis",
    topicId: "web-apis-fetch",
    prompt:
      "GET /api/health responds with status 200 and the plain-text body OK. What happens here?\n\nconst res = await fetch('/api/health');\nconst data = await res.json();\nconsole.log(data);",
    options: [
      "Logs the string 'OK', because json() falls back to plain text",
      "Logs { body: 'OK' }, because json() wraps plain text in an object",
      "Logs undefined, because a non-JSON body is skipped",
      "Throws a SyntaxError, because OK is not valid JSON",
    ],
    answer: 3,
    explanation:
      "res.json() parses the body as JSON and fails with a SyntaxError when the text is not valid JSON; a bare OK is not, since a JSON string needs double quotes. For plain-text responses read the body with res.text() instead.",
  },
  {
    id: "web-apis-p5",
    skillId: "web-apis",
    topicId: "web-apis-errors-states",
    prompt:
      "A dashboard widget loads its numbers with the code below. When the API is down the widget stays blank, and users report it as broken with no idea why. What is the best improvement?\n\ntry {\n  const stats = await loadStats();\n  render(stats);\n} catch (e) {\n}",
    options: [
      "Retry the request in a tight loop until it succeeds",
      "Render made-up placeholder numbers so that the widget never looks empty",
      "In the catch block, show a clear error message with a retry button",
      "Print the raw error and its stack trace inside the widget",
    ],
    answer: 2,
    explanation:
      "An empty catch block swallows the failure, so the user gets no feedback and no way to recover. A plain-language message with a retry action tells them what happened and what to do; a raw stack trace is noise to users and can expose internal details.",
  },
  {
    id: "web-apis-p6",
    skillId: "web-apis",
    topicId: "web-apis-errors-states",
    prompt:
      "A page lists a student's saved jobs. For a student with none, the request succeeds with [] but the spinner never goes away. What is the fix?\n\nif (jobs.length === 0) {\n  showSpinner();\n} else {\n  renderJobs(jobs);\n}",
    options: [
      "Track loading separately, and show 'No saved jobs yet' when it finishes",
      "Treat an empty array as a failure and show 'Something went wrong'",
      "Hide the spinner after a fixed 10 seconds, whatever the request is doing",
      "Have the API return a 404 status whenever the list is empty",
    ],
    answer: 0,
    explanation:
      "'Still loading' and 'loaded, but empty' are different states, and an empty array cannot tell them apart. Keep a separate loading flag and give the empty result its own message. An empty list is a valid success, so presenting it as an error would mislead the user.",
  },
  {
    id: "web-apis-p7",
    skillId: "web-apis",
    topicId: "web-apis-browser-apis",
    prompt:
      "A user switches your site to dark mode. The choice should still apply when they come back next week in the same browser, without needing an account. Where should the app store it?",
    options: ["sessionStorage", "A global JavaScript variable", "A data-theme attribute on the body element", "localStorage"],
    answer: 3,
    explanation:
      "localStorage persists across tabs and browser restarts until it is explicitly cleared. sessionStorage looks similar but is wiped when the tab closes, and variables or DOM attributes are lost on every page reload.",
  },
  {
    id: "web-apis-p8",
    skillId: "web-apis",
    topicId: "web-apis-browser-apis",
    prompt:
      "A script attaches a click listener to every <li> in a task list when the page loads. Tasks the user adds later do not respond to clicks. What is the most robust fix?",
    options: [
      "Reload the page each time a task is added",
      "Put one listener on the parent <ul> and check event.target",
      "Use setInterval to attach listeners to every <li> again each second",
      "Listen for the 'change' event on each <li> instead of 'click'",
    ],
    answer: 1,
    explanation:
      "Click events bubble up from the clicked element to its ancestors, so one listener on the <ul> handles current and future items alike. Items created after the original listeners were attached never received one, and re-attaching on a timer would pile up duplicate listeners.",
  },

  // ───────── git ─────────
  {
    id: "git-p1",
    skillId: "git",
    topicId: "git-commits",
    prompt:
      "You have edited three files and staged nothing yet. Before committing, you want to read the exact lines you changed. Which command shows them?",
    options: ["git status", "git log", "git diff", "git show"],
    answer: 2,
    explanation:
      "git diff shows the line-by-line changes in your working directory that are not yet staged. git status only lists which files changed, not what changed inside them, and git log and git show look at commits that already exist.",
  },
  {
    id: "git-p2",
    skillId: "git",
    topicId: "git-commits",
    prompt:
      "In one sitting you fixed a login bug in auth.js and also reformatted the unrelated README.md. Neither change is committed yet. Which approach gives the most useful history?",
    options: [
      "Make two commits, one per change, each with a message describing it",
      "Commit both together with the message 'updates'",
      "Hold off until the end of the week and commit everything at once",
      "Commit only the bug fix and throw the README changes away",
    ],
    answer: 0,
    explanation:
      "A commit should hold one logical change, so it can be reviewed, understood and undone on its own. A combined 'updates' commit hides what changed and why, and makes it impossible to undo the fix without also undoing the formatting.",
  },
  {
    id: "git-p3",
    skillId: "git",
    topicId: "git-branches",
    prompt: "You are on main and run git merge feature/cart. There are no conflicts. What is the result?",
    options: [
      "feature/cart receives main's commits and main is unchanged",
      "Both branches are replaced by one new branch that combines all of their commits",
      "feature/cart is deleted now that its work has been merged",
      "main now includes feature/cart's commits and feature/cart is unchanged",
    ],
    answer: 3,
    explanation:
      "git merge brings the named branch into the branch you are currently on, so only main moves. The feature branch still exists and still points at the same commit until you delete it yourself.",
  },
  {
    id: "git-p4",
    skillId: "git",
    topicId: "git-branches",
    prompt:
      "feature/login has been fully merged into main. You tidy up with git branch -d feature/login. What happens to the commits you made on that branch?",
    options: [
      "They are removed from main as well",
      "They stay in main's history; only the branch name is removed",
      "They are moved into the stash",
      "They are deleted from your machine but are still kept on the remote",
    ],
    answer: 1,
    explanation:
      "A branch is just a movable label pointing at a commit, so deleting the label does not delete commits that main can still reach. The lowercase -d flag is also a safety net: Git refuses to delete a branch whose work has not been merged.",
  },
  {
    id: "git-p5",
    skillId: "git",
    topicId: "git-remotes",
    prompt:
      "You create feature/search locally, commit, and run git push. Git replies 'The current branch feature/search has no upstream branch'. What should you run?",
    options: [
      "git push -u origin feature/search",
      "git pull origin main",
      "git commit --amend",
      "git remote add origin feature/search",
    ],
    answer: 0,
    explanation:
      "The branch exists only on your machine, so Git does not know which remote branch to push it to. -u (short for --set-upstream) creates the branch on origin and links the two, so a plain git push or git pull works from then on. git remote add is for registering a repository URL, not a branch.",
  },
  {
    id: "git-p6",
    skillId: "git",
    topicId: "git-remotes",
    prompt:
      "Your team's main branch is protected: changes must be reviewed before they land. You have finished a feature on your local branch feature/filters. What is the normal next step?",
    options: [
      "Merge the branch into your local main and wait for teammates to notice",
      "Rename your branch to main so it replaces the protected one",
      "Push feature/filters to the remote and open a pull request into main",
      "Email the changed files to the reviewer",
    ],
    answer: 2,
    explanation:
      "Pushing the branch puts your commits on the shared remote, and a pull request asks the team to review them and merge them into main. Merging only into your local main leaves the work on your machine, where nobody can review it.",
  },
  {
    id: "git-p7",
    skillId: "git",
    topicId: "git-undoing",
    prompt:
      "You tried an idea in styles.css, have not staged or committed it, and now want to throw those edits away and go back to the last committed version of that file. Which command does this?",
    options: ["git revert styles.css", "git restore styles.css", "git rm styles.css", "git reset styles.css"],
    answer: 1,
    explanation:
      "git restore <file> overwrites the working copy with the last committed version, discarding the unstaged edits for good, so be sure before running it. git revert works on whole commits rather than uncommitted edits, and git reset <file> only unstages, leaving the edits in place.",
  },
  {
    id: "git-p8",
    skillId: "git",
    topicId: "git-undoing",
    prompt:
      "You are halfway through a change on feature/profile and it is not ready to commit. An urgent bug needs you on main right now, with a clean working directory. Which approach keeps your unfinished work safe?",
    options: [
      "git reset --hard, switch to main, and retype the change afterwards",
      "git revert HEAD, then switch to main",
      "Delete the edited files by hand, then switch to main",
      "git stash, switch to main, then git stash pop when you return",
    ],
    answer: 3,
    explanation:
      "git stash shelves your uncommitted changes and leaves the working directory clean; git stash pop brings them back when you return to the branch. git reset --hard also gives a clean directory, but only by permanently discarding the work.",
  },
];
