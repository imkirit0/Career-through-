import type { Question } from "../../taxonomy";

export const questions: Question[] = [
  // ---------- apt-numerical ----------
  {
    id: "apt-numerical-q9",
    skillId: "apt-numerical",
    topicId: "apt-numerical-percentages",
    prompt:
      "A support team received 240 tickets in a week and closed 168 of them. What percentage of the week's tickets were still open at the end of the week?",
    options: ["30%", "28%", "70%", "32%"],
    answer: 0,
    explanation:
      "Open tickets = 240 - 168 = 72, and 72 / 240 = 30%. Check: closed = 168 / 240 = 70%, so open = 100% - 70% = 30%. 70% is the share that was closed, not the share still open.",
  },
  {
    id: "apt-numerical-q10",
    skillId: "apt-numerical",
    topicId: "apt-numerical-percentages",
    prompt: "30% of a project's budget is Rs 54,000. How much is 45% of the same budget?",
    options: ["Rs 62,100", "Rs 75,000", "Rs 81,000", "Rs 90,000"],
    answer: 2,
    explanation:
      "Whole budget = 54,000 / 0.30 = Rs 1,80,000, and 45% of that is Rs 81,000. Check: 45% is 1.5 times 30%, so 54,000 x 1.5 = Rs 81,000. Adding 15% of 54,000 gives Rs 62,100, which is wrong because the extra 15% is of the budget, not of the 54,000.",
  },
  {
    id: "apt-numerical-q11",
    skillId: "apt-numerical",
    topicId: "apt-numerical-ratios",
    prompt:
      "A team is made up only of developers and testers, in the ratio 5 : 2. There are 15 more developers than testers. How many people are in the team?",
    options: ["25", "21", "42", "35"],
    answer: 3,
    explanation:
      "The difference is 5 - 2 = 3 parts = 15 people, so 1 part = 5 and the team is 7 parts = 35 (25 developers and 10 testers). Check with algebra: (t + 15) / t = 5/2 gives t = 10 testers, so 10 + 25 = 35. 25 is only the developers.",
  },
  {
    id: "apt-numerical-q12",
    skillId: "apt-numerical",
    topicId: "apt-numerical-ratios",
    prompt:
      "A 40-litre container is full of a well-stirred mixture of milk and water in the ratio 3 : 1. 8 litres of the mixture are taken out and replaced with 8 litres of water. What is the new ratio of milk to water?",
    options: ["5 : 3", "3 : 2", "11 : 9", "2 : 1"],
    answer: 1,
    explanation:
      "At the start there are 30 L of milk and 10 L of water. The 8 L removed contains 6 L of milk and 2 L of water, leaving 24 L and 8 L; adding 8 L of water gives 24 : 16 = 3 : 2. Check: one-fifth of the mixture is removed, so milk = 30 x 4/5 = 24 L out of 40 L. 11 : 9 wrongly treats the 8 litres removed as pure milk.",
  },
  {
    id: "apt-numerical-q13",
    skillId: "apt-numerical",
    topicId: "apt-numerical-data-interpretation",
    prompt:
      "A pie chart shows how a department spends its annual budget of Rs 72 lakh. The sector for salaries has an angle of 150 degrees. How much is spent on salaries?",
    options: ["Rs 24 lakh", "Rs 36 lakh", "Rs 27 lakh", "Rs 30 lakh"],
    answer: 3,
    explanation:
      "The full circle is 360 degrees, so salaries take 150 / 360 = 5/12 of the budget: 5/12 x 72 = Rs 30 lakh. Check: each degree is worth 72 / 360 = Rs 0.2 lakh, and 150 x 0.2 = Rs 30 lakh.",
  },
  {
    id: "apt-numerical-q14",
    skillId: "apt-numerical",
    topicId: "apt-numerical-data-interpretation",
    prompt: `Last month a shop sold three products:

Product A: 300 units at Rs 40 each
Product B: 200 units at Rs 90 each
Product C: 500 units at Rs 20 each

What percentage of the month's total revenue came from Product B?`,
    options: ["20%", "45%", "40%", "30%"],
    answer: 1,
    explanation:
      "Revenue: A = 300 x 40 = 12,000; B = 200 x 90 = 18,000; C = 500 x 20 = 10,000; total = Rs 40,000. B's share = 18,000 / 40,000 = 45%. Check: the revenues are in the ratio 6 : 9 : 5, and 9 / 20 = 45%. 20% is B's share of units sold (200 of 1,000), not of revenue.",
  },
  {
    id: "apt-numerical-q15",
    skillId: "apt-numerical",
    topicId: "apt-numerical-time-work-rate",
    prompt:
      "An inlet pipe can fill an empty tank in 4 hours. A drain can empty the full tank in 6 hours. The tank is empty and both the pipe and the drain are opened together. How long does the tank take to fill?",
    options: ["12 hours", "10 hours", "5 hours", "2.4 hours"],
    answer: 0,
    explanation:
      "Net rate = 1/4 - 1/6 = 3/12 - 2/12 = 1/12 of the tank per hour, so it fills in 12 hours. Check with a 12-unit tank: the pipe adds 3 units an hour and the drain removes 2, a net 1 unit an hour, so 12 hours. 2.4 hours comes from adding the two rates, but the drain works against the pipe.",
  },
  {
    id: "apt-numerical-q16",
    skillId: "apt-numerical",
    topicId: "apt-numerical-time-work-rate",
    prompt:
      "Ravi leaves the office at 8:00 AM, cycling at 12 km/h. Sana leaves the same office at 8:30 AM and follows the same route on a scooter at 30 km/h. At what time does Sana catch up with Ravi?",
    options: ["8:45 AM", "9:00 AM", "8:50 AM", "8:42 AM"],
    answer: 2,
    explanation:
      "By 8:30 Ravi is 12 x 0.5 = 6 km ahead. Sana closes the gap at 30 - 12 = 18 km/h, so she needs 6 / 18 hour = 20 minutes: 8:50 AM. Check: by 8:50 Ravi has cycled 50 minutes at 12 km/h = 10 km, and Sana has ridden 20 minutes at 30 km/h = 10 km. 8:42 ignores that Ravi keeps moving.",
  },

  // ---------- apt-logical ----------
  {
    id: "apt-logical-q9",
    skillId: "apt-logical",
    topicId: "apt-logical-sequences",
    prompt: "What is the next number in the series: 3, 6, 18, 72, 360, ?",
    options: ["1,800", "2,160", "720", "1,440"],
    answer: 1,
    explanation:
      "Each term is multiplied by one more than the last time: x2, x3, x4, x5, so the next step is x6 and 360 x 6 = 2,160. Check: the terms are 3 x 1, 3 x 2, 3 x 6, 3 x 24, 3 x 120, so the next is 3 x 720 = 2,160. 1,800 repeats the x5 step.",
  },
  {
    id: "apt-logical-q10",
    skillId: "apt-logical",
    topicId: "apt-logical-sequences",
    prompt: "What is the next letter in the series: A, C, F, J, O, ?",
    options: ["T", "V", "S", "U"],
    answer: 3,
    explanation:
      "The letter positions are 1, 3, 6, 10, 15, with gaps of 2, 3, 4, 5, so the next gap is 6 and 15 + 6 = 21, the letter U. Check: the positions are 1, 1 + 2, 1 + 2 + 3 and so on, and 1 + 2 + 3 + 4 + 5 + 6 = 21. T repeats the gap of 5.",
  },
  {
    id: "apt-logical-q11",
    skillId: "apt-logical",
    topicId: "apt-logical-deduction",
    prompt: "No managers at a company are interns. All team leads at the company are managers. Which conclusion must be true?",
    options: [
      "All managers are team leads",
      "Some interns are team leads",
      "No team leads are interns",
      "All non-interns are managers",
    ],
    answer: 2,
    explanation:
      "Every team lead is a manager, and no manager is an intern, so no team lead can be an intern. \"All managers are team leads\" reverses the second statement: it says team leads are managers, not that every manager is a team lead.",
  },
  {
    id: "apt-logical-q12",
    skillId: "apt-logical",
    topicId: "apt-logical-deduction",
    prompt:
      "Every shortlisted candidate has passed the aptitude test. Everyone who passed the aptitude test had registered online. Kiran is shortlisted. Which conclusion must be true?",
    options: [
      "Kiran must have registered online",
      "Everyone who registered online was shortlisted",
      "Everyone who passed the test was shortlisted",
      "Kiran topped the aptitude test",
    ],
    answer: 0,
    explanation:
      "Kiran is shortlisted, so Kiran passed the test, and everyone who passed had registered online, so Kiran had registered. \"Everyone who passed the test was shortlisted\" reads the first statement backwards: passing is needed for shortlisting, but it does not guarantee it.",
  },
  {
    id: "apt-logical-q13",
    skillId: "apt-logical",
    topicId: "apt-logical-arrangements",
    prompt:
      "Five colleagues, Anil, Bina, Chetan, Divya and Esha, each work on a different floor of an office with floors numbered 1 (lowest) to 5 (highest). Bina works on the floor immediately above Divya. Anil works on a higher floor than Bina but a lower floor than Chetan. Esha works on the floor immediately below Chetan. Who works on floor 3?",
    options: ["Anil", "Bina", "Chetan", "Esha"],
    answer: 0,
    explanation:
      "Divya, Bina and Anil are in rising order with Anil below Chetan, and Esha takes the floor just under Chetan, so Anil is at least two floors below Chetan. That puts four people below Chetan, so Chetan is on floor 5 and the order from floor 1 is Divya, Bina, Anil, Esha, Chetan. Check: Bina (2) is just above Divya (1), Anil (3) is between Bina and Chetan (5), and Esha (4) is just below Chetan.",
  },
  {
    id: "apt-logical-q14",
    skillId: "apt-logical",
    topicId: "apt-logical-arrangements",
    prompt:
      "30 students stand in a single row. Aman is 8th from the left end and Bela is 12th from the right end. How many students stand between Aman and Bela?",
    options: ["9", "11", "12", "10"],
    answer: 3,
    explanation:
      "Bela is 30 - 12 + 1 = 19th from the left, so the students between them are in positions 9 to 18: 10 students. Check: Aman and everyone to his left make 8, Bela and everyone to her right make 12, and 30 - 8 - 12 = 10. 11 is the gap between positions 19 and 8, which counts Bela as well.",
  },
  {
    id: "apt-logical-q15",
    skillId: "apt-logical",
    topicId: "apt-logical-problem-solving",
    prompt:
      "A delivery robot starts at its charging dock and moves 9 m north. It turns right and moves 12 m, then turns right again and moves 4 m. How far is it from the dock in a straight line?",
    options: ["17 m", "13 m", "25 m", "5 m"],
    answer: 1,
    explanation:
      "The moves are 9 m north, 12 m east and 4 m south, so the robot ends 12 m east and 9 - 4 = 5 m north of the dock. The straight-line distance is the square root of 12 x 12 + 5 x 5 = 169, which is 13 m (the 5-12-13 right triangle). 25 m is the length of the path travelled, and 17 m adds the two sides instead of using the diagonal.",
  },
  {
    id: "apt-logical-q16",
    skillId: "apt-logical",
    topicId: "apt-logical-problem-solving",
    prompt:
      "Exactly one of three interns, Asha, Bala and Chirag, broke the build. Asha says: \"It was Bala.\" Bala says: \"It was not me.\" Chirag says: \"It was not me.\" Exactly one of these three statements is true. Who broke the build?",
    options: ["Asha", "Bala", "Chirag", "It cannot be determined"],
    answer: 2,
    explanation:
      "Asha's and Bala's statements contradict each other, so exactly one of those two is true. That uses up the one true statement, so Chirag's \"It was not me\" is false: Chirag broke the build. Check each case: if Asha did it, two statements are true (Bala's and Chirag's); if Bala did it, two are true (Asha's and Chirag's); if Chirag did it, only Bala's is true.",
  },

  // ---------- comm-written ----------
  {
    id: "comm-written-q9",
    skillId: "comm-written",
    topicId: "comm-written-clarity",
    prompt: "A team's access request form must reach IT this week. Which sentence makes it clearest who must do what, and by when?",
    options: [
      "The access request form should be submitted to IT at some point before the end of this week.",
      "It would be good if the access request form got to IT soon.",
      "Nikhil, please submit the access request form to IT by Friday 5 PM.",
      "The access request form is still pending and needs to be looked into by the team.",
    ],
    answer: 2,
    explanation:
      "It names the person, the action and an exact deadline. \"Should be submitted before the end of this week\" gives a rough deadline but no owner, so every reader can assume that someone else will do it.",
  },
  {
    id: "comm-written-q10",
    skillId: "comm-written",
    topicId: "comm-written-clarity",
    prompt: "A team lead is announcing a change to how new joiners are set up. Which sentence tells the reader most clearly what is changing?",
    options: [
      "Going forward, we will leverage cross-team synergies to optimise the end-to-end onboarding experience.",
      "From 1 July, new joiners will receive their laptop and logins on day one instead of day three.",
      "We are in the process of working towards making a number of improvements to onboarding.",
      "Onboarding will get much better soon, so watch this space for more details.",
    ],
    answer: 1,
    explanation:
      "It uses plain words and gives the date, what changes and from what to what. The \"leverage synergies\" sentence sounds impressive, but after reading it nobody can say what will actually be different.",
  },
  {
    id: "comm-written-q11",
    skillId: "comm-written",
    topicId: "comm-written-structure",
    prompt:
      "You have emailed your manager a comparison of two vendors. The purchase order must be raised this week. Which closing line is best?",
    options: [
      "Let me know your thoughts whenever you get a chance, and we can take it forward from there once you have had time to decide.",
      "I will check in with you on Friday in case you have any questions about the comparison before we move ahead.",
      "Hope this comparison helps. I am happy to share more detail on either vendor if you need it. Thanks and regards.",
      "Please confirm by Wednesday noon whether we go with Vendor A or B, and I will raise the purchase order the same day.",
    ],
    answer: 3,
    explanation:
      "A good close states the decision needed, the deadline and who takes the next step. \"Let me know your thoughts whenever you get a chance\" invites a reply, but asks for no decision and sets no date, although the order has to go out this week.",
  },
  {
    id: "comm-written-q12",
    skillId: "comm-written",
    topicId: "comm-written-structure",
    prompt:
      "An email thread titled \"Re: Team lunch on Friday\" has drifted into a discussion of a production bug. To investigate the bug, you need database access by 3 PM today from the DevOps lead, who is not on the thread. What is the best way to ask?",
    options: [
      "Send the DevOps lead a new email with the subject \"Access request: read access to orders DB, needed by 3 PM today (bug #318)\"",
      "Add the DevOps lead to the lunch thread and reply there with the request, since the whole bug discussion is already in that thread",
      "Send the DevOps lead a new email with the subject \"Urgent\" and explain the request in the body",
      "Reply on the lunch thread asking whether anyone knows someone who can arrange database access",
    ],
    answer: 0,
    explanation:
      "A new request to a new reader needs its own email, with a subject that states the action, the item and the deadline. Adding the DevOps lead to the lunch thread hides the request under a misleading subject and makes them read unrelated messages to find it; \"Urgent\" alone does not say what is needed.",
  },
  {
    id: "comm-written-q13",
    skillId: "comm-written",
    topicId: "comm-written-tone",
    prompt:
      "Your manager emails the team proposing to release on Friday. You know that two test cycles on the payments module are still pending and will finish only on Monday. Which reply is best?",
    options: [
      "\"Friday is impossible. Whoever planned this date clearly did not check with the testing team first, because two payments test cycles are pending until Monday.\"",
      "\"I have a concern about Friday: two payments test cycles will finish only on Monday. Could we release on Tuesday instead, or on Friday without the payments module?\"",
      "\"Sure, Friday works for me! I will have my part merged by Thursday evening so that the release can go out on time. Let me know if you need anything else from me.\"",
      "\"I may be wrong, and it is of course entirely your call, but perhaps the Friday date could possibly be looked at again if you feel that might be needed at some stage.\"",
    ],
    answer: 1,
    explanation:
      "It disagrees respectfully: it states the concern, gives the fact behind it and offers options. The heavily hedged reply is polite, but it never says what the problem is, so the manager cannot act on it; the others blame someone or hide the risk.",
  },
  {
    id: "comm-written-q14",
    skillId: "comm-written",
    topicId: "comm-written-tone",
    prompt:
      "A colleague from another team posts in a shared channel: \"Your team's API is broken AGAIN. Fix it.\" You check: the API is working, and the errors come from an expired access key on their side. Which response is most professional?",
    options: [
      "\"It is not broken. I checked, and the errors come from an expired access key on your side. Please check your own setup before blaming other teams in public next time.\"",
      "\"Sorry about that! We will look into the API right away and get back to you with an update as soon as we can. Apologies to your team for the trouble this is causing.\"",
      "Say nothing in the channel, and message your manager: \"Their errors come from an expired access key on their side, not from our API. Could you speak to their lead about the tone?\"",
      "\"I checked: the API is up, and the errors come from an expired access key on your side. A new key from Settings should fix it. If not, tell me and I'll look at it with you.\"",
    ],
    answer: 3,
    explanation:
      "It stays calm, gives the facts and the fix, and offers help, without answering rudeness with rudeness. The apology sounds polite, but it accepts blame for a fault that does not exist and leaves the colleague's real problem unsolved.",
  },
  {
    id: "comm-written-q15",
    skillId: "comm-written",
    topicId: "comm-written-updates",
    prompt:
      "You are going on leave for a week from tomorrow. Two of your tasks are still in progress, and your teammate Farah has agreed to cover them. Which handover message is best?",
    options: [
      "\"Handover for 12-16 May. Vendor onboarding: waiting for the vendor's signed form; please follow up on Wednesday (contact: Ritu). Weekly dashboard: due Friday; steps are in the 'Dashboard guide' doc.\"",
      "\"I'm on leave 12-16 May. Vendor onboarding and the weekly dashboard are still open. Everything is in the shared folder, so please take a look, and you can call me any time if anything comes up.\"",
      "\"All good from my side for 12-16 May, nothing much pending as such. Vendor onboarding and the weekly dashboard are both moving along and should need very little from you. See you next week!\"",
      "A day-by-day account of everything you did this month, from the invoice report to team meetings, with the two open tasks and the Wednesday follow-up mentioned somewhere in the middle",
    ],
    answer: 0,
    explanation:
      "For each open task it gives the current state, the next action, the date and where to find what is needed, so Farah can carry on without calling you. \"Everything is in the shared folder\" leaves her to work out what is pending and makes your leave depend on phone calls.",
  },
  {
    id: "comm-written-q16",
    skillId: "comm-written",
    topicId: "comm-written-updates",
    prompt:
      "Card payments on your company's website started failing 30 minutes ago. Your team is investigating but does not know the cause yet, and the sales and support teams are asking for news in the incident channel. Which update is best?",
    options: [
      "\"We are looking into it. The whole team is on this as the top priority, and we know how much it matters to sales and support. Will update here as soon as there is something to share.\"",
      "Post nothing until the root cause is confirmed, then send one complete update with the cause, the fix and the recovery time, so that nobody acts on incomplete information",
      "\"2:15 PM update: card payments have been failing for about 1 in 5 customers since 1:45 PM; net banking is working. Cause not yet known; we are checking the gateway logs. Next update at 2:45 PM.\"",
      "\"2:15 PM update: it is almost certainly the payment gateway's fault and should be fixed in ten minutes, so there is no need to worry. Please ask customers to try their card again shortly.\"",
    ],
    answer: 2,
    explanation:
      "A good incident update says what is known, what is not yet known, what is being done and when the next update will come, so support can tell customers something accurate. \"We are looking into it\" is honest but gives the other teams nothing to use and no time to expect more; guessing at a cause and a fix time risks being wrong in public.",
  },

  // ---------- soft-workplace ----------
  {
    id: "soft-workplace-q9",
    skillId: "soft-workplace",
    topicId: "soft-workplace-ownership",
    prompt:
      "You finish a task and mark the ticket as done. The next day you notice that the feature does not load on the test server, although your code was merged correctly. What should you do?",
    options: [
      "Leave it, since your ticket is closed and the test server is looked after by the DevOps team",
      "Check what is wrong, tell your lead, and follow it up with DevOps until the feature works",
      "Wait for the testers to report it, since finding such problems is their job",
      "Mention it in passing at the next team lunch, in case someone wants to take a look",
    ],
    answer: 1,
    explanation:
      "The work is done when the feature works, not when the ticket is closed, so you follow it through even if the cause turns out to be outside your code. Waiting for the testers gets it fixed eventually, but it wastes their time on a problem you already know about.",
  },
  {
    id: "soft-workplace-q10",
    skillId: "soft-workplace",
    topicId: "soft-workplace-ownership",
    prompt: "Your lead assigns you a task that needs a reporting tool you have never used. It is due in four days. What is the best approach?",
    options: [
      "Tell your lead you know the tool, learn it quietly in the evenings, and raise it only if the deadline starts to slip",
      "Tell your lead the tool is new to you, and ask for the task to be given to someone who already knows it well",
      "Ask a teammate who knows the tool to build that part for you, and hand in the finished task as your own work",
      "Tell your lead the tool is new to you, work through its documentation today, and ask a teammate specific questions when stuck",
    ],
    answer: 3,
    explanation:
      "Being open about the gap and then closing it yourself keeps the lead informed and the task moving, and four days leaves room to learn. Asking for the task to be reassigned is honest, but it gives up before trying and leaves you just as stuck the next time the tool comes up.",
  },
  {
    id: "soft-workplace-q11",
    skillId: "soft-workplace",
    topicId: "soft-workplace-teamwork",
    prompt:
      "Your team discussed two designs and chose design A, although you argued for design B. A week later, a teammate who also preferred B suggests that the two of you quietly build your part the B way. What should you do?",
    options: [
      "Keep to design A, and if you find new evidence against it, raise it with the whole team",
      "Agree, since two of you think design B is better and the finished result will prove it",
      "Build design A, but slowly and with little effort, so that its weaknesses show",
      "Report the teammate to your manager straight away for trying to undermine the team's decision",
    ],
    answer: 0,
    explanation:
      "Once the team has decided, you commit to the decision, and reopen it only in the open and with new evidence. Reporting the teammate straight away overreacts to a suggestion you can simply turn down yourself.",
  },
  {
    id: "soft-workplace-q12",
    skillId: "soft-workplace",
    topicId: "soft-workplace-teamwork",
    prompt:
      "A teammate reviewing your code asks you to change one function. You believe the change would introduce a bug. What should you do?",
    options: [
      "Make the change without comment to avoid an argument, and plan to fix the bug later if it actually appears",
      "Mark the comment as resolved without making the change, and merge your code as it is once it is approved",
      "Explain your concern in the review with an example, ask for their reasoning, and involve your lead only if you cannot agree",
      "Ask a different teammate to review and approve the code instead, so that the disputed comment no longer stands in the way of the merge",
    ],
    answer: 2,
    explanation:
      "Disagreeing with reasons, in the review itself, lets the better argument win and keeps the reviewer involved. Making the change silently avoids friction, but it knowingly ships what you believe is a bug and withholds something the reviewer needs to know.",
  },
  {
    id: "soft-workplace-q13",
    skillId: "soft-workplace",
    topicId: "soft-workplace-feedback",
    prompt:
      "For the second time this month, your lead points out that you submitted work without running the team's checklist. What is the best response?",
    options: [
      "Apologise again, fix the work, and promise your lead that you will be much more careful about the checklist in every future submission",
      "Acknowledge it, fix the work, and explain that you were under heavy deadline pressure on both of those occasions",
      "Acknowledge it, fix the work, and ask your lead to remind you about the checklist before each submission you make",
      "Acknowledge it, fix the work, and tell your lead what you are changing, such as attaching the completed checklist to every submission",
    ],
    answer: 3,
    explanation:
      "Repeated feedback needs a change in how you work, not just another apology, and telling your lead the change lets them see it happen. Promising to be more careful is what failed the first time: it names no concrete step, so nothing is different.",
  },
  {
    id: "soft-workplace-q14",
    skillId: "soft-workplace",
    topicId: "soft-workplace-feedback",
    prompt:
      "Two seniors review your design document. One asks you to add much more detail; the other says it is too long and should be cut. What should you do?",
    options: [
      "Show both reviewers the two comments, ask what each needs, and agree a structure, such as a short summary with detail in an appendix",
      "Follow the more senior reviewer's comment in full, and leave the other comment unanswered, since seniority should settle it",
      "Leave the document as it is, since the two comments cancel each other out, and tell both reviewers that no change is needed",
      "Write two versions, one longer and one shorter, and send each reviewer the version they asked for to approve separately",
    ],
    answer: 0,
    explanation:
      "Conflicting feedback is settled by making the conflict visible and finding out what each reviewer actually needs; often both can be met. Writing two versions seems to please both, but it hides the disagreement and leaves the team with two documents and no agreed one.",
  },
  {
    id: "soft-workplace-q15",
    skillId: "soft-workplace",
    topicId: "soft-workplace-prioritisation-integrity",
    prompt:
      "It is 2 PM, and you need three more hours to finish a report that is due at 5 PM today. A teammate asks for an hour of your help with a task that is due next week. What should you do?",
    options: [
      "Help straight away, and send the report an hour late without telling anyone",
      "Tell them that their task is not your responsibility and carry on working",
      "Explain that you have a 5 PM deadline, and offer to help first thing tomorrow",
      "Help straight away, then skip the final checks on the report to send it by 5 PM",
    ],
    answer: 2,
    explanation:
      "The report has no spare time and the teammate's task has a week, so the report comes first; offering a specific time still gets them the help. Helping now and skipping the report's checks keeps both promises on paper, but it does so by lowering the quality of the work that is due today.",
  },
  {
    id: "soft-workplace-q16",
    skillId: "soft-workplace",
    topicId: "soft-workplace-prioritisation-integrity",
    prompt:
      "You must send a monthly figures report by 6 PM today. At 5 PM, 20 of its 200 rows are still unverified. A teammate suggests copying last month's values into those rows because \"they rarely change\". What should you do?",
    options: [
      "Copy last month's values into the 20 rows and send the report as complete, since those figures rarely change from month to month",
      "Tell your lead now which 20 rows are unverified, and ask whether to send it on time with those rows marked or finish it tomorrow morning",
      "Hold the report back until every one of the 200 rows is verified, and send it late without warning anyone, since accuracy matters most",
      "Copy last month's values into the 20 rows for now, send the report on time, and quietly correct any that turn out to be wrong later",
    ],
    answer: 1,
    explanation:
      "Passing off unchecked numbers as verified is false reporting, however likely they are to be right; saying exactly what is unverified keeps the report honest and lets the lead choose between on time and complete. Holding the report back keeps the numbers accurate, but it turns a manageable gap into a missed deadline that nobody was warned about.",
  },
];
