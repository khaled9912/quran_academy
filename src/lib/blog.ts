export type BlogSection = {
  heading: string;
  paragraphs: string[];
  list?: string[];
  note?: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  keywords: string[];
  intro: string[];
  sections: BlogSection[];
  /** Slugs of the guides that genuinely continue this one, most relevant first. */
  related: string[];
};

export const BLOG_AUTHOR = "Ana Quran Academy";

export const blogPosts: BlogPost[] = [
  {
    slug: "choose-online-quran-academy",
    title: "How to Choose an Online Quran Academy for English Speakers",
    seoTitle: "How to Choose an Online Quran Academy",
    description:
      "A practical checklist for choosing an online Quran academy: teachers, lesson format, English instruction, time zones, fees, and what to ask before enrolling.",
    excerpt:
      "A good academy is more than a polished website. Here is what to compare before you enroll, from teacher review to time zones, currency, and trial lessons.",
    category: "Choosing a program",
    publishedAt: "2026-11-05",
    updatedAt: "2026-11-10",
    readingMinutes: 9,
    keywords: [
      "best online Quran academy for English speakers",
      "how to choose an online Quran academy",
      "online Quran classes in English",
      "private Quran lessons in English",
      "affordable online Quran classes",
    ],
    intro: [
      "Searching for an online Quran academy returns a long list of websites that often sound similar. The differences that matter are not in the slogans; they are in who teaches, how lessons run, how scheduling works, and what you pay.",
      "This checklist is written for English-speaking students and parents comparing academies online. Use it to compare academies calmly, ask better questions, and avoid surprises after enrolling.",
    ],
    sections: [
      {
        heading: "Ask who teaches, and how teachers are selected",
        paragraphs: [
          "A teacher's experience matters more than the design of the website. Ask how the academy reviews teachers before they join, what subjects they teach, and whether they have experience with your age group or level.",
          "At Ana Quran Academy, teachers apply with their experience and CV, and every application is reviewed before onboarding. You can also read student ratings and reviews from completed lessons when you browse teachers.",
        ],
      },
      {
        heading: "Confirm the lesson format",
        paragraphs: [
          "Find out whether lessons are one-to-one or in groups, how long each lesson lasts, and how often you meet. One-to-one lessons give the teacher room to correct pronunciation, adjust the pace, and focus on your goals. Group lessons can be useful for review or community, but they suit different purposes.",
          "Also ask what happens if you need to reschedule, and whether the same teacher stays with you from week to week. A stable teacher makes progress easier to measure.",
        ],
      },
      {
        heading: "Check the language of instruction",
        paragraphs: [
          "If you are an English speaker, the lesson should be taught in clear English, including explanations of Tajweed and Arabic terms. Ask how the teacher explains new concepts and whether materials are available in English.",
          "Language matters for parents too. You should be able to discuss your child's progress without needing a translator.",
        ],
      },
      {
        heading: "Understand scheduling and time zones",
        paragraphs: [
          "An online academy can serve students across many countries, but that only works if scheduling is clear. Ask whether lesson times are shown in your local time zone, how weekly slots are chosen, and how far ahead you can book.",
          "A time that looks convenient in one country may be late at night in another. Confirm the slot against your own routine before you commit.",
        ],
      },
      {
        heading: "Ask about fees, currency, and billing",
        paragraphs: [
          "Ask what the trial costs, whether lessons are billed monthly or per lesson, which currency is used, and how payment is made. Check whether the price depends on lesson length or teacher, and whether there are any additional charges.",
          "At Ana Quran Academy, a new student's first lesson is a free trial. Lessons are then billed monthly in US dollars (USD) by bank transfer, and your bank may apply its own conversion or transfer fees.",
        ],
      },
      {
        heading: "Look for a clear plan and honest communication",
        paragraphs: [
          "A serious academy can explain what the first month will cover, how progress is reviewed, and how you or your child will be supported between lessons. Vague promises of fluency in a few weeks are a warning sign.",
          "Ask whether lesson reports, progress notes, or parent updates are provided, and who you contact if something goes wrong.",
        ],
      },
      {
        heading: "Be careful with local-presence claims",
        paragraphs: [
          "Many online academies teach students worldwide and do not have branches in the student's country. That is normal. What matters is whether the academy is honest about where it operates and what it can support.",
          "Do not choose an academy because of an address alone. Check the teaching, the format, and the terms, and ask directly if you are unsure about local availability.",
        ],
      },
      {
        heading: "Use the trial lesson to test the fit",
        paragraphs: [
          "A trial is not only for the teacher to assess the student. It is your chance to see how the teacher corrects mistakes, how patient they are, and whether the lesson feels structured. Prepare two or three questions before you join.",
          "Useful questions include: What will we cover in the first month? How much practice should we do between lessons? Which Mushaf or materials should we use? How will you tell us that progress is happening?",
        ],
      },
      {
        heading: "Red flags worth taking seriously",
        paragraphs: [
          "Most disappointing academies reveal themselves in the first conversation. You do not need proof of bad intent; you only need a clear reason to keep looking.",
        ],
        list: [
          "No way to speak to a human before you pay.",
          "Prices that change once you ask, or fees that only appear after the first invoice.",
          "A different teacher each week, with no record of what was covered.",
          "Promises of fluent recitation or complete memorization on a fixed deadline.",
          "No explanation of how progress is reviewed or what happens when you miss a lesson.",
          "Pressure to pay for months upfront to keep an offer.",
        ],
        note: "If you want to compare formats before you decide, start with [the programmes at Ana Quran Academy](/courses) and read [how weekly lessons work](/about).",
      },
    ],
    related: [
      "how-to-learn-quran-online",
      "learn-quran-with-tajweed",
      "online-quran-classes-for-kids",
    ],
  },
  {
    slug: "quran-memorization-online",
    title: "Quran Memorization Online: Building a Hifz Routine That Lasts",
    seoTitle: "Quran Memorization Online: A Hifz Guide",
    description:
      "A sustainable approach to online Quran memorization: choosing a daily portion, balancing new memorization with revision, and working with a teacher who listens.",
    excerpt:
      "Memorization is built by routine, not by bursts of effort. A practical guide to sabaq, sabqi, and manzil, with realistic ways to keep revision steady.",
    category: "Memorization",
    publishedAt: "2026-11-02",
    updatedAt: "2026-11-10",
    readingMinutes: 8,
    keywords: [
      "Quran memorization online",
      "online Hifz classes",
      "memorize Quran with a teacher",
      "Quran memorization plan",
      "online Quran classes for adults",
    ],
    intro: [
      "Memorizing the Quran is often described as a test of memory, but in practice it is a test of routine. Students who memorize steadily usually do less each day than they expect, and revise far more than they expected.",
      "Online lessons can support that routine well, provided the plan is realistic and a teacher hears the new portion regularly.",
    ],
    sections: [
      {
        heading: "Choose a portion you can sustain",
        paragraphs: [
          "A daily portion should be small enough that you can recite it accurately and still review it the next day. Three solid lines every day are more valuable than a page once a week that disappears by the following month.",
          "Ask your teacher to calibrate the portion after the first week. The right amount is the amount you can maintain on a busy day, not only on your best day.",
        ],
      },
      {
        heading: "Use the three-part routine",
        paragraphs: [
          "A common structure divides the daily work into three parts: new memorization (sabaq), recent revision (sabqi), and older revision (manzil). The names are less important than the balance.",
        ],
        list: [
          "New portion: memorize a small amount carefully, with correct recitation.",
          "Recent revision: recite what you memorized in the last few days or weeks.",
          "Older revision: cycle through previously completed portions so they stay fresh.",
        ],
        note: "If revision starts to slip, reduce the new portion before you reduce revision. New memorization built on weak revision rarely lasts.",
      },
      {
        heading: "Memorize with a teacher listening",
        paragraphs: [
          "It is possible to memorize alone, but it is easy to memorize a mistake and repeat it hundreds of times. A teacher catches pronunciation and wording errors early, before they become habits.",
          "In an online lesson, recite the new portion first, then the recent revision. Keep a simple log of what you recited and what needs repeating.",
        ],
      },
      {
        heading: "Stick to one Mushaf and one reciter",
        paragraphs: [
          "Visual memory supports memorization. Using the same Mushaf keeps the page layout familiar, and listening to one reciter keeps the rhythm consistent. Changing both frequently makes recall harder.",
          "If you use an app, choose a fixed setting for the page and reciter rather than switching between layouts.",
        ],
      },
      {
        heading: "Treat revision as the real work",
        paragraphs: [
          "Memorizing a portion is only the beginning. Without revision, even strong memorization fades. Build revision into the week instead of treating it as something you will do when there is extra time.",
          "Spaced review helps: revisit a portion soon after learning it, then again after a few days, then after a longer gap. Your teacher can help you plan the cycle.",
        ],
      },
      {
        heading: "Expect plateaus",
        paragraphs: [
          "Every student reaches weeks where nothing feels solid. Plateaus are normal, especially after a period of fast progress. They are not evidence that memorization is not for you.",
          "When progress stalls, check sleep, reduce the new portion for a week, and increase revision. Consistency during a plateau matters more than pushing harder.",
        ],
      },
      {
        heading: "Build accountability around the routine",
        paragraphs: [
          "A weekly lesson gives the routine a fixed checkpoint. Tell your teacher what you struggled with, not only what you completed. That information shapes the next week's plan.",
          "If you are a parent supporting a child, keep the routine visible and calm. The goal is a steady habit, not a race against another student.",
        ],
      },
      {
        heading: "A sample week that stays realistic",
        paragraphs: [
          "Plans fail when they assume every day is the same. This is a shape that working adults and school-age students can usually keep, with the portion size set by the teacher after the first fortnight.",
        ],
        list: [
          "Before the lesson: recite the new portion slowly three times and read its meaning once.",
          "Day after the lesson: memorize the first half in short blocks rather than one long sitting.",
          "Next day: memorize the second half, then recite the whole portion once from memory.",
          "Middle of the week: recent revision only, with no new material added.",
          "Later in the week: recite the new portion to a family member, or record it and listen back.",
          "Before the next lesson: older revision, cycling one portion from last month.",
          "Lesson day: recite, note what slipped, and agree what to repeat.",
        ],
        note: "Two lessons a week changes the arithmetic: split the new portion across both days instead of doubling it. Correcting recitation before memorizing new text usually pays off, as covered in [learning Quran with Tajweed](/blog/learn-quran-with-tajweed), and you can see how lessons are structured in [our programmes](/courses).",
      },
    ],
    related: [
      "learn-quran-with-tajweed",
      "how-to-learn-quran-online",
      "choose-online-quran-academy",
    ],
  },
  {
    slug: "learn-quran-with-tajweed",
    title: "Learn Quran with Tajweed: What Beginners Should Expect",
    seoTitle: "Learn Quran with Tajweed: A Beginner's Guide",
    description:
      "What Tajweed study actually involves for beginners, from letter sounds and articulation points to madd, noon rules, qalqalah, and regular correction.",
    excerpt:
      "Tajweed is learned by reciting and being corrected, not by memorizing rule names. Here is what the first months usually look like.",
    category: "Tajweed",
    publishedAt: "2026-10-28",
    updatedAt: "2026-11-10",
    readingMinutes: 9,
    keywords: [
      "learn Quran with Tajweed",
      "online Tajweed classes",
      "Tajweed for beginners",
      "English Quran teachers",
      "one-to-one Quran lessons",
    ],
    intro: [
      "Tajweed is the set of rules and habits that help you recite the Quran accurately and beautifully. Beginners often imagine a long list of rules to memorize. In practice, Tajweed is a skill: you learn it by reciting, listening, and being corrected.",
      "This guide explains what the first months usually involve, so you know what to expect from a one-to-one online class.",
    ],
    sections: [
      {
        heading: "Tajweed is a skill, not a theory exam",
        paragraphs: [
          "Knowing the name of a rule is not the same as applying it while reciting. A good lesson spends most of its time on recitation, with the teacher listening and correcting in real time.",
          "You will still learn terms such as makharij, madd, and qalqalah, but they should serve the recitation rather than replace it.",
        ],
      },
      {
        heading: "Start with the letters",
        paragraphs: [
          "Correct Tajweed begins with correct letters. Each Arabic letter has an articulation point and distinguishing characteristics, and some letters are easy to confuse when they are learned quickly.",
          "Expect focused practice on a small number of letters at a time, especially the ones that are difficult for English speakers. Slow, accurate repetition is more useful than speed.",
        ],
      },
      {
        heading: "Use short surahs you already know",
        paragraphs: [
          "Al-Fatihah and the short surahs are excellent practice ground because you already know the words. Applying a new rule to familiar text makes it easier to hear the difference.",
          "Your teacher may also use short phrases from the Quran to isolate a rule before returning to full verses.",
        ],
      },
      {
        heading: "The rules you will meet first",
        paragraphs: [
          "Most beginners start with a small set of high-impact rules. These often include madd (the length of vowel sounds), the rules of noon sakinah and tanween, and qalqalah (the echoing sound on certain letters).",
          "You do not need to learn every rule at once. One rule at a time, applied to your recitation, holds better than a long list reviewed without practice.",
        ],
        note: "Tajweed is transmitted through a teacher. Use online guides to review, not to replace correction from someone who can hear your recitation.",
      },
      {
        heading: "Listen, repeat, and record",
        paragraphs: [
          "Listening to one consistent reciter helps you internalize the sound of correct recitation. Repeat a short passage slowly, then record yourself and compare. You will hear issues that are hard to notice while reciting.",
          "Share the recording with your teacher if they ask for it. The point is not to sound perfect; it is to notice patterns you can correct.",
        ],
      },
      {
        heading: "Common beginner mistakes",
        paragraphs: [
          "Most early problems come from rushing, not from a lack of rules. Rushing shortens madd, blurs letters, and makes correction harder.",
        ],
        list: [
          "Reciting quickly before the letters are stable.",
          "Ignoring the length of madd because it feels slow.",
          "Practicing alone for long stretches and reinforcing mistakes.",
          "Changing reciters or methods every week.",
          "Skipping revision of rules you have already covered.",
        ],
      },
      {
        heading: "What progress looks like",
        paragraphs: [
          "Progress in Tajweed is usually gradual. A teacher may point to clearer letters, steadier madd, or fewer repeated mistakes. Those small changes are the real signs that the work is taking hold.",
          "Be cautious of anyone promising perfect recitation in a few weeks. Tajweed is a long-term discipline, and steady correction is more valuable than a fast start.",
        ],
      },
      {
        heading: "How Tajweed fits with reading and memorization",
        paragraphs: [
          "Learners often treat reading, Tajweed, and memorization as three separate courses. They are three sides of the same skill, and the order you take them in matters more than the labels.",
          "Reading first: if the letters are not yet stable, build reading fluency before studying rules in detail. A rule applied to a word you cannot yet read confidently is hard to hear.",
          "Tajweed alongside reading: once you can read a page with vowel marks, correct recitation becomes the focus of most lessons. This is the stage where a teacher's ear matters most.",
          "Memorization after accuracy: memorizing accurate recitation is worth doing, but memorizing a mistake takes far longer to undo. Many students add structured Hifz once short surahs are recited correctly, as described in [our guide to online Quran memorization](/blog/quran-memorization-online).",
        ],
      },
      {
        heading: "What to bring to your first Tajweed lesson",
        paragraphs: [
          "Preparation is small, but it changes what the teacher can assess in the first sitting.",
        ],
        list: [
          "One Mushaf, and the same printed layout every week.",
          "Headphones or a quiet room, so the teacher can hear the thin differences between letters.",
          "A notebook for the one rule you are working on, not a list of every rule you have heard.",
          "Two or three short verses you already recite, so your current level is heard quickly.",
        ],
        note: "The first lesson is a free trial for new students, and the teacher uses it to hear your letters before suggesting a plan. See [what our Tajweed classes cover](/courses/tajweed), or read [how to learn Quran online](/blog/how-to-learn-quran-online) if you are still working on the letters.",
      },
    ],
    related: [
      "how-to-learn-quran-online",
      "quran-memorization-online",
      "online-quran-classes-for-kids",
    ],
  },
  {
    slug: "online-quran-classes-for-kids",
    title: "Online Quran Classes for Kids: A Parent's Guide",
    seoTitle: "Online Quran Classes for Kids: Parent Guide",
    description:
      "How to choose and support online Quran classes for children: lesson length by age, a calm routine, parent involvement, online safety, and signs of progress.",
    excerpt:
      "Children do well online when lessons are short, predictable, and supported at home. A parent-focused guide to format, routine, safety, and realistic progress.",
    category: "For parents",
    publishedAt: "2026-10-24",
    updatedAt: "2026-11-10",
    readingMinutes: 8,
    keywords: [
      "online Quran classes for kids",
      "Quran classes for children online",
      "online Quran learning for families",
      "Quran classes for beginners",
      "online Quran classes in English",
    ],
    intro: [
      "Online Quran classes can work very well for children, but they are not simply the family class moved to a screen. Children need shorter lessons, predictable routines, and an adult nearby for the early years.",
      "This guide covers the decisions that make the biggest difference for parents, from lesson length to online safety. If you are ready to compare format and enrolment, see [online Quran classes for kids](/courses/quran-for-kids).",
    ],
    sections: [
      {
        heading: "Match lesson length to age",
        paragraphs: [
          "Attention spans vary, but a useful starting point is a shorter lesson for younger children and a longer one for teenagers. A 15 to 20 minute lesson can be enough for a very young beginner, while a 30 minute lesson often suits a child who can already read some Arabic.",
          "Ask the teacher to adjust as the child settles in. A lesson that ends with attention still in hand is better than one that runs long and ends in frustration.",
        ],
      },
      {
        heading: "Look for one-to-one attention",
        paragraphs: [
          "Children need frequent correction and encouragement. In a one-to-one lesson, the teacher can hear every child clearly, adjust the pace, and notice when a letter or rule needs more practice.",
          "Group classes can be valuable for community and review later, but the foundations of reading and pronunciation benefit from individual attention.",
        ],
      },
      {
        heading: "Keep the weekly times predictable",
        paragraphs: [
          "A consistent slot helps children know what to expect. Choose times when the child is rested and not rushing between school, meals, and bedtime.",
          "If a time stops working, change it deliberately rather than skipping weeks. Consistency is one of the strongest predictors of progress.",
        ],
      },
      {
        heading: "Create a simple lesson ritual",
        paragraphs: [
          "A short routine before the lesson reduces friction. Ask the child to use the bathroom, have water, and bring the Mushaf and a pencil before the lesson starts.",
          "For younger children, stay nearby during the lesson. You do not need to teach, but your presence helps with focus and technical problems.",
        ],
      },
      {
        heading: "Keep home practice short and positive",
        paragraphs: [
          "Five to ten minutes of daily practice is usually more effective than a long session once a week. Praise effort and accuracy, not speed.",
          "Avoid turning practice into a punishment or a competition with siblings. The goal is a calm habit that the child can keep.",
        ],
      },
      {
        heading: "Talk about online safety",
        paragraphs: [
          "Ask the academy how lessons are accessed, who can join, and what policies apply to recordings and communication. Keep account details with a parent, and use a quiet, shared space rather than an isolated room for young children.",
          "If something feels unclear, ask before enrolling. A serious academy should be comfortable explaining its arrangements.",
        ],
      },
      {
        heading: "Signs that it is working",
        paragraphs: [
          "Progress may look small at first: a child recognizes a few more letters, recites a short surah with fewer prompts, or settles into the lesson routine with less resistance.",
          "Ask the teacher for one or two concrete goals each month, and review them together. Visible, modest goals are more motivating than vague promises of fluency.",
        ],
      },
      {
        heading: "What happens in the first lesson",
        paragraphs: [
          "The first lesson is a free trial, and its purpose is assessment rather than progress. The teacher checks what the child already recognizes, how they respond to correction, and how long their attention holds.",
          "Expect a report on three things afterwards: a starting point, a suggested lesson length, and whether a shorter or slower beginning would suit the child better. A serious academy will say honestly if a child is not ready yet.",
        ],
        note: "You can see how each age stage is taught in [our kids programme](/courses/quran-for-kids), including lesson length, equipment, and what parents should expect.",
      },
    ],
    related: [
      "choose-online-quran-academy",
      "how-to-learn-quran-online",
      "learn-quran-with-tajweed",
    ],
  },
  {
    slug: "how-to-learn-quran-online",
    title: "How to Learn Quran Online: A Practical Guide for English Speakers",
    seoTitle: "How to Learn Quran Online: A Practical Guide",
    description:
      "A step-by-step guide to learning Quran online: setting a goal, choosing one-to-one lessons, building a weekly rhythm, practicing at home, and tracking progress.",
    excerpt:
      "You do not need to live near a teacher to learn the Quran. A clear goal, a steady weekly rhythm, and the right teacher are enough to begin.",
    category: "Getting started",
    publishedAt: "2026-10-20",
    updatedAt: "2026-11-10",
    readingMinutes: 10,
    keywords: [
      "learn Quran online",
      "online Quran classes",
      "Quran classes online",
      "online Quran learning",
      "learn Quran online from home",
      "online Quran academy",
    ],
    intro: [
      "Learning the Quran online can be flexible and personal, but it works best when you start with a clear goal and a steady weekly rhythm. This guide walks through the decisions that matter most, whether you are a complete beginner or returning after a long break.",
      "You do not need to live in a particular country or travel to a class. A quiet space, a reliable connection, and the right teacher are enough to begin.",
    ],
    sections: [
      {
        heading: "Start with one clear goal",
        paragraphs: [
          "Quran learning can mean several different things: reading fluently, correcting recitation with Tajweed, memorizing portions, or understanding Arabic. Trying to do all of them at once usually slows everything down.",
          "Choose one primary goal for the next two to three months, and tell your teacher. Beginners often combine reading fluency with basic Tajweed, then add memorization once the letters are stable.",
        ],
      },
      {
        heading: "Choose one-to-one lessons for the early stage",
        paragraphs: [
          "The foundations of Quran reading depend on correction. A teacher needs to hear you clearly to fix a letter, a vowel, or a length. One-to-one lessons make that possible and let the lesson move at your pace.",
          "Group classes can be useful later for review, confidence, and community. For the first stage, individual attention is usually the faster route to accurate reading.",
        ],
      },
      {
        heading: "Commit to a weekly rhythm",
        paragraphs: [
          "Two lessons a week plus short daily practice is usually more effective than a long weekend session. The weekly rhythm keeps the material familiar and gives you a regular checkpoint.",
          "Pick times you can protect. If your schedule changes often, choose a slot that is realistic on your busiest day rather than your best day. You can read more about [how weekly lessons work](/about) at Ana Quran Academy.",
        ],
      },
      {
        heading: "Set up a simple learning space",
        paragraphs: [
          "You do not need a dedicated study. You need a quiet corner, a stable internet connection, headphones if possible, and the same Mushaf each time. Keep a notebook for new letters, rules, and reminders.",
          "Join the lesson a couple of minutes early and test your microphone. Small technical frictions become bigger reasons to skip when they happen every week.",
        ],
      },
      {
        heading: "Ask your teacher for a plan you can see",
        paragraphs: [
          "A good first lesson includes a short assessment and a plan. Ask what you will cover in the first month, what practice you should do between lessons, and how progress will be reviewed.",
          "If you are booking a trial, treat it as a fit check. Notice whether the teacher explains clearly, corrects patiently, and gives you something specific to practice.",
        ],
      },
      {
        heading: "Practice out loud, even when alone",
        paragraphs: [
          "Quran recitation is physical. Silent reading does not build the same habits as reciting aloud. Practice the assigned portion slowly and repeat it until the words feel familiar.",
          "Record yourself occasionally and listen back, or send the recording to your teacher if they ask. Comparing recordings over a few weeks is one of the clearest ways to hear progress.",
        ],
      },
      {
        heading: "Review before adding new material",
        paragraphs: [
          "It is tempting to keep moving forward, but new material built on shaky review does not last. Spend part of each practice session on what you learned last week before adding anything new.",
          "A simple rule helps: if you cannot recite the previous portion with reasonable accuracy, review it before asking for more.",
        ],
      },
      {
        heading: "Learn from wherever you are",
        paragraphs: [
          "Online learning removes the need to live near a teacher or attend a local class. Your schedule is shown in your local time zone, and lessons are taught in English for English-speaking students.",
          "Availability still depends on teacher schedules and the subject you want to study. If you are unsure where to start, [contact the academy](/contact) and ask which teacher and weekly times fit your level and time zone.",
        ],
      },
      {
        heading: "If you cannot read Arabic yet",
        paragraphs: [
          "Start with the letters, not with a surah you hope to memorize. Adult beginners usually work through a graded primer that teaches isolated letters, their connecting forms, and vowel marks before continuous Quran text. Many academies use a first book for this stage; the title matters far less than the sequence.",
          "Set expectations honestly. Reading the letters takes weeks, reading a page takes months, and reciting with steady Tajweed takes years. The first milestone is deliberately small, which is why it should be the only target for the first month.",
          "Tell your teacher you are starting from zero. It changes the pace, the materials, and the practice you are assigned. Most adult beginners are in exactly this position, so there is nothing to hide.",
        ],
        note: "If you already read the letters and want to correct your recitation, [what Tajweed lessons cover](/blog/learn-quran-with-tajweed) is the next guide, and [our Tajweed classes](/courses/tajweed) explain how correction works in a real lesson.",
      },
      {
        heading: "A realistic first week",
        paragraphs: [
          "Momentum in week one comes from a plan small enough to survive a bad week. This is a shape that works for most adults and older students.",
        ],
        list: [
          "Before the trial: choose two weekly times that survive your busiest week, and test your microphone and connection.",
          "Trial lesson: recite what you can, ask what the first month covers, and write down the practice you are given.",
          "Day after the trial: practise the assigned portion for ten minutes, out loud.",
          "Midweek: ten more minutes, plus five minutes reviewing the letters or rule from the day before.",
          "Before the second lesson: recite the whole assigned portion once and mark where it breaks down.",
          "Second lesson: recite, get it corrected, and agree the next small step.",
        ],
        note: "One lesson a week is enough to begin, and two is faster. Lessons last 30, 45, or 60 minutes; you can compare the formats in [our programmes](/courses).",
      },
    ],
    related: [
      "learn-quran-with-tajweed",
      "choose-online-quran-academy",
      "quran-memorization-online",
    ],
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function sortedBlogPosts() {
  return [...blogPosts].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt)
  );
}

export function relatedBlogPosts(slug: string, limit = 3) {
  const current = getBlogPost(slug);
  if (!current) return sortedBlogPosts().slice(0, limit);

  const chosen = current.related
    .map((relatedSlug) => getBlogPost(relatedSlug))
    .filter((post): post is BlogPost => post !== undefined);

  if (chosen.length >= limit) return chosen.slice(0, limit);

  // Guard against a mistyped or missing slug so the section is never short.
  const fallback = sortedBlogPosts().filter(
    (post) =>
      post.slug !== slug &&
      !chosen.some((candidate) => candidate.slug === post.slug)
  );

  return [...chosen, ...fallback].slice(0, limit);
}

export function formatBlogDate(isoDate: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}
