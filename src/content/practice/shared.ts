import type { Question } from "../taxonomy";

export const questions: Question[] = [
  // ---------- apt-numerical ----------
  {
    id: "apt-numerical-p1",
    skillId: "apt-numerical",
    topicId: "apt-numerical-percentages",
    prompt: "A jacket is sold for Rs 900 after a 25% discount on its marked price. What was the marked price?",
    options: ["Rs 1,125", "Rs 1,200", "Rs 1,150", "Rs 1,225"],
    answer: 1,
    explanation:
      "The sale price is 75% of the marked price, so the marked price is 900 / 0.75 = Rs 1,200. Adding 25% of 900 gives Rs 1,125, which is wrong because the discount was calculated on the marked price, not on the sale price.",
  },
  {
    id: "apt-numerical-p2",
    skillId: "apt-numerical",
    topicId: "apt-numerical-percentages",
    prompt:
      "A company has 80 employees, of whom 40% are women. 50% of the women and 25% of the men have completed a safety course. What percentage of all employees have completed it?",
    options: ["37.5%", "30%", "40%", "35%"],
    answer: 3,
    explanation:
      "Women = 40% of 80 = 32, so men = 48. Completed = 16 women + 12 men = 28, and 28 / 80 = 35%. Averaging 50% and 25% to get 37.5% is wrong because the two groups are not the same size.",
  },
  {
    id: "apt-numerical-p3",
    skillId: "apt-numerical",
    topicId: "apt-numerical-ratios",
    prompt:
      "In a company, the ratio of interns to junior engineers is 2 : 3, and the ratio of junior engineers to senior engineers is 4 : 5. What is the ratio of interns to senior engineers?",
    options: ["8 : 15", "2 : 5", "3 : 4", "5 : 8"],
    answer: 0,
    explanation:
      "Make the junior engineers match in both ratios: 2 : 3 = 8 : 12 and 4 : 5 = 12 : 15, so interns : juniors : seniors = 8 : 12 : 15 and interns : seniors = 8 : 15. Taking the first and last numbers to get 2 : 5 is wrong because the 3 in one ratio and the 4 in the other describe the same group.",
  },
  {
    id: "apt-numerical-p4",
    skillId: "apt-numerical",
    topicId: "apt-numerical-ratios",
    prompt: "A shopkeeper mixes 12 kg of tea costing Rs 60 per kg with 8 kg of tea costing Rs 85 per kg. What is the cost per kg of the mixture?",
    options: ["Rs 72.50", "Rs 68", "Rs 70", "Rs 75"],
    answer: 2,
    explanation:
      "Total cost = 12 x 60 + 8 x 85 = 720 + 680 = Rs 1,400 for 20 kg, so the mixture costs 1,400 / 20 = Rs 70 per kg. The simple average of the two prices, Rs 72.50, would only be right if equal weights were mixed.",
  },
  {
    id: "apt-numerical-p5",
    skillId: "apt-numerical",
    topicId: "apt-numerical-data-interpretation",
    prompt:
      "Support tickets closed by a team in one week: Mon 42, Tue 38, Wed 50, Thu 46, Fri 34. On how many days was the number closed above the week's daily average?",
    options: ["4", "3", "1", "2"],
    answer: 3,
    explanation:
      "Total = 42 + 38 + 50 + 46 + 34 = 210, so the daily average is 210 / 5 = 42. Only Wednesday (50) and Thursday (46) are above it. Monday's 42 equals the average, so it does not count as above.",
  },
  {
    id: "apt-numerical-p6",
    skillId: "apt-numerical",
    topicId: "apt-numerical-data-interpretation",
    prompt:
      "Monthly revenue and cost (in Rs lakh): January 58 and 43; February 62 and 52; March 50 and 38; April 70 and 61. Which month had the highest profit?",
    options: ["January", "February", "March", "April"],
    answer: 0,
    explanation:
      "Profit = revenue - cost: January 15, February 10, March 12, April 9, so January is highest. April has the highest revenue but also the highest cost, which leaves it with the lowest profit.",
  },
  {
    id: "apt-numerical-p7",
    skillId: "apt-numerical",
    topicId: "apt-numerical-time-work-rate",
    prompt: "6 testers can complete a regression test cycle in 10 days. Working at the same rate, how many days will 15 testers take?",
    options: ["25 days", "6 days", "4 days", "5 days"],
    answer: 2,
    explanation:
      "The job needs 6 x 10 = 60 tester-days of work, so 15 testers take 60 / 15 = 4 days. 25 days comes from scaling the time up with the team size, but more people means less time, not more.",
  },
  {
    id: "apt-numerical-p8",
    skillId: "apt-numerical",
    topicId: "apt-numerical-time-work-rate",
    prompt:
      "A delivery rider travels 60 km to a town at 30 km/h and returns by the same road at 20 km/h. What is the average speed for the whole trip?",
    options: ["25 km/h", "24 km/h", "26 km/h", "22 km/h"],
    answer: 1,
    explanation:
      "Time out = 60 / 30 = 2 hours and time back = 60 / 20 = 3 hours. Average speed = total distance / total time = 120 / 5 = 24 km/h. It is not 25 km/h, because the rider spends more time at the slower speed.",
  },

  // ---------- apt-logical ----------
  {
    id: "apt-logical-p1",
    skillId: "apt-logical",
    topicId: "apt-logical-sequences",
    prompt: "What is the next letter in the series: B, E, H, K, ?",
    options: ["M", "O", "N", "L"],
    answer: 2,
    explanation:
      "Each letter is 3 places after the one before: B (2nd), E (5th), H (8th), K (11th), so the next is the 14th letter, N. M is only 2 places after K, which breaks the pattern.",
  },
  {
    id: "apt-logical-p2",
    skillId: "apt-logical",
    topicId: "apt-logical-sequences",
    prompt: "What is the next number in the series: 4, 20, 7, 17, 10, 14, ?",
    options: ["13", "11", "17", "12"],
    answer: 0,
    explanation:
      "Two series are interleaved: the 1st, 3rd and 5th terms go 4, 7, 10 (adding 3) and the 2nd, 4th and 6th go 20, 17, 14 (subtracting 3). The next term belongs to the first series, so it is 10 + 3 = 13. 11 wrongly continues the second series.",
  },
  {
    id: "apt-logical-p3",
    skillId: "apt-logical",
    topicId: "apt-logical-deduction",
    prompt: "All testers on a team know SQL. Some testers on the team also know Python. Which conclusion must be true?",
    options: [
      "Everyone who knows SQL is a tester",
      "All testers on the team know Python",
      "No one who knows Python knows SQL",
      "Some people who know SQL also know Python",
    ],
    answer: 3,
    explanation:
      "The testers who know Python are still testers, so they also know SQL: at least some people know both. \"Everyone who knows SQL is a tester\" reverses the first statement, which says testers know SQL, not that nobody else does.",
  },
  {
    id: "apt-logical-p4",
    skillId: "apt-logical",
    topicId: "apt-logical-deduction",
    prompt: "Whenever it rains heavily, the office shuttle runs late. This morning the shuttle ran late. What can you conclude with certainty?",
    options: [
      "It rained heavily this morning",
      "Whether it rained heavily cannot be determined",
      "It did not rain heavily this morning",
      "The shuttle runs late only when it rains heavily",
    ],
    answer: 1,
    explanation:
      "The rule says heavy rain leads to a late shuttle, not that a late shuttle must be caused by rain; traffic or a breakdown could also delay it. Concluding that it rained reads the rule backwards.",
  },
  {
    id: "apt-logical-p5",
    skillId: "apt-logical",
    topicId: "apt-logical-arrangements",
    prompt:
      "Four presentations, by Asha, Bilal, Chitra and Dev, are given one after another in slots 1 to 4. Chitra presents immediately after Asha. Dev presents some time before Asha. Bilal is neither first nor last. Who presents in slot 3?",
    options: ["Asha", "Bilal", "Chitra", "Dev"],
    answer: 0,
    explanation:
      "Asha and Chitra take consecutive slots with Dev somewhere before them, so they are in slots 2-3 or 3-4. Slots 2-3 would force Dev first and Bilal last, which is not allowed. So the order is Dev, Bilal, Asha, Chitra, and Asha is in slot 3.",
  },
  {
    id: "apt-logical-p6",
    skillId: "apt-logical",
    topicId: "apt-logical-arrangements",
    prompt:
      "Six colleagues, Farah, Gopal, Hema, Imran, Jaya and Kunal, sit evenly spaced around a round table. Farah sits directly opposite Gopal. Hema sits next to Farah. Imran sits directly opposite Hema. Jaya does not sit next to Gopal. Who sits directly between Farah and Imran?",
    options: ["Hema", "Kunal", "Jaya", "Gopal"],
    answer: 2,
    explanation:
      "Hema is beside Farah, so Imran, who is opposite Hema, is beside Gopal. That leaves two empty seats: one between Farah and Imran, and one between Hema and Gopal. Jaya cannot be next to Gopal, so Jaya takes the seat between Farah and Imran, and Kunal takes the other.",
  },
  {
    id: "apt-logical-p7",
    skillId: "apt-logical",
    topicId: "apt-logical-problem-solving",
    prompt: "Six teams play a round-robin tournament in which every team plays every other team exactly once. How many matches are played in total?",
    options: ["30", "15", "12", "36"],
    answer: 1,
    explanation:
      "Each of the 6 teams plays 5 others, giving 6 x 5 = 30, but that counts every match twice (once for each team in it), so the total is 30 / 2 = 15. Stopping at 30 is the common mistake.",
  },
  {
    id: "apt-logical-p8",
    skillId: "apt-logical",
    topicId: "apt-logical-problem-solving",
    prompt:
      "A support queue receives no new tickets during the week. On Monday the team closes half of the open tickets. On Tuesday they close 10 more. On Wednesday they close half of what is left, and 9 tickets remain. How many tickets were open at the start of Monday?",
    options: ["28", "46", "76", "56"],
    answer: 3,
    explanation:
      "Work backwards: 9 left after halving means 18 before Wednesday; adding back Tuesday's 10 gives 28; that was half of Monday's starting number, so the start was 56. Checking forwards: 56, 28, 18, 9. Stopping at 28 forgets to undo Monday's halving.",
  },

  // ---------- comm-written ----------
  {
    id: "comm-written-p1",
    skillId: "comm-written",
    topicId: "comm-written-clarity",
    prompt: "A non-technical sales manager asks why the customer portal was unavailable this morning. Which reply is clearest for them?",
    options: [
      "\"The auth service pod was OOM-killed after a memory leak, so the load balancer health checks failed until we rolled back.\"",
      "\"There was a technical issue on the back end, which the team has now resolved.\"",
      "\"Things went down for a bit, but it's all sorted now.\"",
      "\"The portal was down from 9:10 to 9:40 AM because a server ran out of memory. It is fixed, and no customer data was affected.\"",
    ],
    answer: 3,
    explanation:
      "It says what happened, for how long, why in plain words, and what it means for customers. The jargon-heavy reply may be accurate, but this reader cannot use it, and \"a technical issue\" tells them nothing.",
  },
  {
    id: "comm-written-p2",
    skillId: "comm-written",
    topicId: "comm-written-clarity",
    prompt: "You want a teammate to review part of a document you wrote. Which message is clearest?",
    options: [
      "\"Please take a look at the guide when you can and share your thoughts.\"",
      "\"Please check sections 2 and 3 of the onboarding guide for factual errors by Thursday noon.\"",
      "\"Review needed ASAP.\"",
      "\"It would be great if you could possibly find some time to go through the document I shared the other day and let me know if there is anything at all that you feel should be changed.\"",
    ],
    answer: 1,
    explanation:
      "It names the exact sections, the kind of review wanted and the deadline, so the teammate knows what is being asked. \"Take a look and share your thoughts\" sounds polite but leaves open which part, what to look for and by when.",
  },
  {
    id: "comm-written-p3",
    skillId: "comm-written",
    topicId: "comm-written-structure",
    prompt: "You need a colleague to answer three separate questions about a project. What is the best way to lay out the email?",
    options: [
      "One long paragraph that covers the background and includes the three questions along the way",
      "The questions placed in an attached document, with \"see attached\" as the email body",
      "One line stating the purpose, then the three questions as a numbered list",
      "The full project history first, with the three questions in the final paragraph",
    ],
    answer: 2,
    explanation:
      "A numbered list makes each question easy to spot and lets the colleague reply point by point without missing one. Questions buried in a paragraph are the usual reason only the first one gets answered.",
  },
  {
    id: "comm-written-p4",
    skillId: "comm-written",
    topicId: "comm-written-structure",
    prompt: "After a project meeting you are asked to send the follow-up email. Which structure is most useful to the attendees?",
    options: [
      "Decisions made, then action items with an owner and due date for each",
      "A full account of who said what, in the order it was said, so that nothing is left out",
      "A thank-you note saying the meeting was productive and that notes will follow at some point",
      "Your own view of each topic, with the action items mentioned in the closing paragraph",
    ],
    answer: 0,
    explanation:
      "People open a follow-up to find out what was decided and what they must do by when, so those go first and in a form that is easy to scan. A full account contains the same information but forces every reader to dig it out.",
  },
  {
    id: "comm-written-p5",
    skillId: "comm-written",
    topicId: "comm-written-tone",
    prompt:
      "A colleague from another team asks you to take on an extra task this week, but your week is fully committed to a release. Which reply is most professional?",
    options: [
      "\"No, I'm too busy. Please ask someone else.\"",
      "\"Thanks for asking. I can't take this on this week because of the release, but I can start on Monday. Would that work?\"",
      "\"Sure, I'll try to squeeze it in somehow!\"",
      "\"As I have already told several people, my schedule has no room for other teams' requests, and I would appreciate it if these were sent through the proper channels in future.\"",
    ],
    answer: 1,
    explanation:
      "It declines clearly, gives a brief reason and offers a realistic alternative, so the colleague can plan. A flat \"no\" is honest but curt, and agreeing to \"squeeze it in\" when you cannot only sets up a missed commitment.",
  },
  {
    id: "comm-written-p6",
    skillId: "comm-written",
    topicId: "comm-written-tone",
    prompt: "You are reviewing a teammate's draft and find one section confusing. Which written comment has the best tone?",
    options: [
      "\"This section makes no sense.\"",
      "\"Did you proofread this before sending it to me?\"",
      "\"Looks great, nice work!\"",
      "\"I found this section hard to follow. Could we put the steps in order and add an example?\"",
    ],
    answer: 3,
    explanation:
      "It describes the problem from the reader's side and suggests a concrete fix, which is both respectful and useful. \"Looks great\" is pleasant but untrue here, and the blunt comments criticise without helping the writer improve.",
  },
  {
    id: "comm-written-p7",
    skillId: "comm-written",
    topicId: "comm-written-updates",
    prompt: "You are stuck on an error and want help from a senior in the team chat. Which message is best?",
    options: [
      "\"I get 'permission denied' when I run the deploy script on staging. I've checked my role and logged in again. Screenshot attached. Any idea what I'm missing?\"",
      "\"Hi\" (then waiting for a reply before saying anything more)",
      "\"It's not working, can you help?\"",
      "\"Sorry to bother you, I know you're very busy. I have a small question if you get a few minutes at some point today. Let me know when is a good time and I'll explain.\"",
    ],
    answer: 0,
    explanation:
      "It gives the exact error, where it happens and what you have already tried, so the senior can answer in one reply. A bare \"Hi\" or \"it's not working\" forces them to ask questions before they can start helping.",
  },
  {
    id: "comm-written-p8",
    skillId: "comm-written",
    topicId: "comm-written-updates",
    prompt:
      "Your lead posts in the team channel: \"Can someone check why last night's report job failed?\" You decide to pick it up. What is the best way to handle it in chat?",
    options: [
      "Start investigating quietly and post only if you find the cause",
      "React with a thumbs-up and say nothing more, even after you have fixed it",
      "Reply in the thread that you are on it, then post the cause and the fix there when done",
      "Send your lead a private message once it is fixed and leave the channel thread unanswered",
    ],
    answer: 2,
    explanation:
      "Saying you have picked it up stops others duplicating the work, and posting the outcome in the same thread closes the loop for everyone who saw the question. Working silently leaves the team guessing whether anyone is on it.",
  },

  // ---------- soft-workplace ----------
  {
    id: "soft-workplace-p1",
    skillId: "soft-workplace",
    topicId: "soft-workplace-ownership",
    prompt:
      "While setting up your laptop, you find that a step in the team's setup guide is outdated, and it costs you an hour. The guide is maintained by another teammate. What should you do?",
    options: [
      "Leave it; the guide is not your document",
      "Post in the team chat that the documentation is unreliable",
      "Tell the owner what is wrong and offer to correct the step",
      "Save the correct step in your own private notes, so that you at least will not lose the hour again",
    ],
    answer: 2,
    explanation:
      "Getting a problem you have found fixed, through the person who owns it, saves the next joiner the same hour. Private notes solve it only for you, and complaining in chat raises the issue without helping to fix it.",
  },
  {
    id: "soft-workplace-p2",
    skillId: "soft-workplace",
    topicId: "soft-workplace-ownership",
    prompt: "You finish your assigned work two days before the sprint ends. What is the best thing to do?",
    options: [
      "Tell your lead you have capacity and ask what would help the team most",
      "Keep quiet and stretch the remaining work so that it appears to fill the two days",
      "Start rewriting a module you think is badly designed, without telling anyone, to show initiative",
      "Wait until someone notices and assigns you something new",
    ],
    answer: 0,
    explanation:
      "Making your spare capacity visible lets the lead point it at what matters most. Rewriting a module unasked looks like initiative, but changes nobody agreed to create risk and extra review work for the team.",
  },
  {
    id: "soft-workplace-p3",
    skillId: "soft-workplace",
    topicId: "soft-workplace-teamwork",
    prompt: "In a review meeting, your manager praises you for an analysis that a teammate mostly did. What should you do?",
    options: [
      "Accept the praise; correcting your manager in a meeting would be awkward",
      "Say right away that your teammate did most of the analysis",
      "Say nothing in the meeting, then tell your teammate privately that they deserved the credit",
      "Change the subject quickly so that the meeting moves on to the next item",
    ],
    answer: 1,
    explanation:
      "Giving credit where it is due, at the moment it is misplaced, is fair to your teammate and builds trust in you. Telling the teammate privately is kind, but it leaves your manager with the wrong picture.",
  },
  {
    id: "soft-workplace-p4",
    skillId: "soft-workplace",
    topicId: "soft-workplace-teamwork",
    prompt:
      "A teammate regularly hands over their part later than agreed, which leaves you short of time for yours. What should you do first?",
    options: [
      "Complain to your manager without speaking to the teammate",
      "Start handing over your own work late so that they see how it feels",
      "Say nothing and work late each time to make up the lost hours",
      "Talk to them privately, explain the effect, and agree a handover time",
    ],
    answer: 3,
    explanation:
      "A direct, private conversation gives the teammate a chance to fix a problem they may not know they are causing. Going to the manager first skips that step; it becomes reasonable only if the direct conversation does not work.",
  },
  {
    id: "soft-workplace-p5",
    skillId: "soft-workplace",
    topicId: "soft-workplace-feedback",
    prompt: "In a one-to-one, your manager says only, \"You need to communicate better.\" What is the best response?",
    options: [
      "Ask for a recent example and what better would have looked like",
      "Agree, and start sending much longer emails about everything you do",
      "Point out that nobody else has complained about your communication",
      "Nod and hope the meaning becomes clearer over the coming weeks",
    ],
    answer: 0,
    explanation:
      "Vague feedback cannot be acted on, so asking for a specific example turns it into something you can change. Guessing what was meant, such as writing longer emails, may fix nothing or make things worse.",
  },
  {
    id: "soft-workplace-p6",
    skillId: "soft-workplace",
    topicId: "soft-workplace-feedback",
    prompt:
      "A teammate asks for your honest opinion on slides they will present tomorrow. You think several slides are too crowded to read. What should you do?",
    options: [
      "Say the slides are perfect, so that they go in feeling confident",
      "Tell them the slides are a mess and should be redone from scratch tonight",
      "Say what works, then name the crowded slides and suggest what to cut",
      "Say you did not get time to look, to avoid an awkward conversation",
    ],
    answer: 2,
    explanation:
      "Useful feedback is honest, specific and comes with a suggestion the person can act on in the time they have. Saying the slides are perfect feels kind, but it withholds help they asked for while there is still time to fix them.",
  },
  {
    id: "soft-workplace-p7",
    skillId: "soft-workplace",
    topicId: "soft-workplace-prioritisation-integrity",
    prompt:
      "On Monday morning you have three things waiting: a bug that is stopping customers from paying, a report due on Friday, and a teammate's request to look over their notes when you can. How should you handle them?",
    options: [
      "The teammate's notes first, because it is quick and keeps them happy",
      "The report first, because it is the largest piece of work and will take the most effort",
      "In the order they reached your inbox, so that nobody is treated unfairly",
      "The payment bug first, then plan time for the report and tell the teammate when you will get to the notes",
    ],
    answer: 3,
    explanation:
      "Order work by impact and urgency: customers unable to pay is both, the report has days in hand, and the notes can wait as long as the teammate knows when. Starting with the quick favour feels productive but leaves the costliest problem running.",
  },
  {
    id: "soft-workplace-p8",
    skillId: "soft-workplace",
    topicId: "soft-workplace-prioritisation-integrity",
    prompt:
      "A teammate who is locked out of the admin system asks to use your login \"just for five minutes\" to finish an urgent job. Company policy forbids sharing accounts. What should you do?",
    options: [
      "Share your password this once and change it afterwards",
      "Decline, and help them get their own access restored quickly",
      "Log in yourself and let them work under your account while you are away from your desk",
      "Refuse, and report them to HR straight away for asking you to break the policy",
    ],
    answer: 1,
    explanation:
      "Anything done under your login is recorded as your action, and the policy exists so that access stays traceable; urgency does not change that. Changing the password afterwards does not undo the breach, whereas helping them get access restored solves the real problem.",
  },
];
