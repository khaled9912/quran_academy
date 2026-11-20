export type BlogSection = {
  heading: string;
  paragraphs: string[];
  list?: string[];
  /** Renders the list as numbered step cards instead of bullets. */
  listStyle?: "steps";
  note?: string;
};

export type BlogLevel = {
  intro: string[];
  sections: BlogSection[];
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
  /** Simplified reading level for children; the base content is written for ages 13+. */
  kids?: BlogLevel;
  defaultLevel?: "kids" | "teens";
  /** Slugs of the guides that genuinely continue this one, most relevant first. */
  related: string[];
};

export const BLOG_AUTHOR = "Ana Quran Academy";

export const blogPosts: BlogPost[] = [
  {
    slug: "stories-of-the-prophets",
    title: "Stories of the Prophets: Lessons from the Quran for Kids and Teens",
    seoTitle: "Stories of the Prophets in the Quran (Kids & Teens)",
    description:
      "The stories of Prophets Adam, Nuh, Ibrahim, Musa, Yunus and Muhammad (peace be upon them), told simply for children with deeper lessons for readers 13 and up.",
    excerpt:
      "The Quran tells stories so we can learn from them: patience from Nuh, courage from Ibrahim, trust from Musa, and the power of saying sorry from Adam and Yunus.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 8,
    keywords: [
      "stories of the prophets",
      "prophet stories for kids",
      "stories of the prophets in Islam",
      "prophet Adam story",
      "prophet Yunus and the whale",
    ],
    intro: [
      "The Quran is not a history book, but it is full of stories. It tells them for a reason: \"There was certainly in their stories a lesson for those of understanding\" (Quran 12:111). Each prophet's life teaches one clear thing about trusting Allah, doing right, and coming back after a mistake.",
      "This guide retells six of those stories. Use the reading-level switch above the article: a simple version for children, and a deeper version with Quran references for readers 13 and up. Every one of the 25 prophets named in the Quran also has a full story of their own — the complete collection is indexed below.",
    ],
    sections: [
      {
        heading: "Adam: the first human, and the first repentance",
        paragraphs: [
          "Allah created Adam and taught him the names of things, honouring him above much of creation. When Adam and his wife ate from the tree they were told to avoid, they did not hide or blame each other. They turned back to Allah with words of repentance, and He accepted it.",
          "The lesson is not that humans never slip. It is that the door back is always open: a sincere sorry, spoken to Allah, is never wasted.",
        ],
      },
      {
        heading: "Nuh (Noah): patience that outlasts the mockers",
        paragraphs: [
          "Nuh called his people to Allah for \"a thousand years less fifty\" (Quran 29:14), and most of them laughed. He kept going anyway, and built the ark under their mockery, until the flood came and the believers were carried to safety.",
          "His story teaches steady effort without applause. Results belong to Allah; persistence belongs to us.",
        ],
      },
      {
        heading: "Ibrahim (Abraham): courage to question, trust to obey",
        paragraphs: [
          "Ibrahim looked at the stars, the moon and the sun, and refused to worship what sets and disappears. He stood alone against a whole town of idol-worshippers, and later, with his son Ismail, raised the foundations of the Kaaba in Makkah.",
          "When he was tested with the command to sacrifice his son, he submitted — and Allah ransomed the son at the last moment. Muslims remember that trust every year in Eid al-Adha.",
        ],
      },
      {
        heading: "Musa (Moses): calm at the edge of the sea",
        paragraphs: [
          "Musa stood before Pharaoh with nothing but a staff and the truth, and later led his people out of Egypt. Trapped between the sea and the army, his companions despaired — but Musa answered, \"No! Indeed, with me is my Lord; He will guide me\" (Quran 26:62). The sea opened.",
          "The lesson is not that the sea always opens. It is that certainty in Allah does not depend on seeing the exit first.",
        ],
      },
      {
        heading: "Yunus (Jonah): the prayer from the darkness",
        paragraphs: [
          "Yunus left his people in frustration before Allah's permission came, and ended up in the belly of a whale, in layers of darkness. There he called out: \"There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers\" (Quran 21:87). Allah saved him, and his people believed.",
          "His prayer is still the du'a Muslims repeat in distress: admit the mistake, praise Allah, and ask. No darkness is too deep for that call.",
        ],
      },
      {
        heading: "Muhammad (peace be upon him): character as the final message",
        paragraphs: [
          "Before revelation, his people already called him al-Amin — the trustworthy. After it, he taught that the best of people are those best in character, and he lived it: gentle with children, honest with enemies, patient with harm.",
          "His story closes the line of prophets with a simple standard: faith is proven by how you treat people.",
        ],
      },
      {
        heading: "All 25 prophets, one story each",
        paragraphs: [
          "The Quran names 25 prophets. Each story below is told twice — once for children, once for readers 13 and up — with the Quran references and one clear lesson:",
        ],
        list: [
          "[Adam](/blog/prophet-adam-story) — the first human and the first repentance.",
          "[Idris](/blog/prophet-idris-story) — the truthful one raised to a high station.",
          "[Nuh](/blog/prophet-nuh-story) — patience that outlasts the mockers.",
          "[Hud](/blog/prophet-hud-story) — the warner to Aad and the wind that obeyed Allah.",
          "[Salih](/blog/prophet-salih-story) — the she-camel as a sign and a test.",
          "[Ibrahim](/blog/prophet-ibrahim-story) — courage to question, trust to obey.",
          "[Lut](/blog/prophet-lut-story) — standing for right in a town that chose wrong.",
          "[Ismail](/blog/prophet-ismail-story) — the patient son and the well of Zamzam.",
          "[Ishaq](/blog/prophet-ishaq-story) — the glad tidings that made an old couple laugh.",
          "[Yaqub](/blog/prophet-yaqub-story) — beautiful patience through a long grief.",
          "[Yusuf](/blog/prophet-yusuf-story) — the well, the prison, and the forgiveness that healed a family.",
          "[Ayyub](/blog/prophet-ayyub-story) — patience through years of illness.",
          "[Shuayb](/blog/prophet-shuayb-story) — honest weights and honest trade.",
          "[Musa](/blog/prophet-musa-story) — calm at the edge of the sea.",
          "[Harun](/blog/prophet-harun-story) — the eloquent brother who shared the mission.",
          "[Dawud](/blog/prophet-dawud-story) — the king who fasted, judged, and sang praise.",
          "[Sulaiman](/blog/prophet-sulaiman-story) — the king who thanked Allah for the ants' warning.",
          "[Ilyas](/blog/prophet-ilyas-story) — the lone voice against Baal.",
          "[Al-Yasa](/blog/prophet-al-yasa-story) — the chosen successor, honoured in the Quran's lists.",
          "[Yunus](/blog/prophet-yunus-story) — the prayer from the darkness.",
          "[Zakariya](/blog/prophet-zakariya-story) — the quiet du'a for a child in old age.",
          "[Yahya](/blog/prophet-yahya-story) — wisdom given in childhood.",
          "[Isa](/blog/prophet-isa-story) — the servant and messenger who spoke from the cradle.",
          "[Dhul-Kifl](/blog/prophet-dhul-kifl-story) — the one of responsibility, counted among the patient.",
          "[Muhammad](/blog/prophet-muhammad-story) — character as the final message.",
        ],
      },
      {
        heading: "How to read these stories as a family",
        paragraphs: [
          "Tell one story at a time, then ask one question: \"What would you have done?\" Let children answer before you explain the lesson. For older readers, open the Quran reference together and compare the retelling with the verse.",
        ],
        note: "Stories like these are part of our Islamic studies lessons, taught one-to-one in English. See [how the kids programme works](/courses/quran-for-kids) or read [the five pillars of Islam](/blog/five-pillars-of-islam) next.",
      },
    ],
    kids: {
      intro: [
        "Long ago, Allah chose special people called prophets to teach us how to be good. The Quran tells us their stories — like adventure stories, but true, and each one hides a treasure: a lesson for you.",
        "Here are six of them — and there are 25 storybooks in the whole collection, one for every prophet named in the Quran! Grown-ups can switch to the bigger version with the same button above.",
      ],
      sections: [
        {
          heading: "Adam: the first person who said sorry",
          paragraphs: [
            "Adam was the very first human. Allah taught him the names of everything! Once, Adam made a mistake and ate from a tree he was told not to. He felt bad and said sorry to Allah — and Allah forgave him. Saying sorry is brave, not weak.",
          ],
        },
        {
          heading: "Nuh: the big boat and the animals",
          paragraphs: [
            "Nuh told his people about Allah for a very, very long time, but most laughed at him. He did not give up. Allah told him to build a huge boat, and animals came in pairs — two by two! When the rain came, Nuh and the believers were safe on the boat. Keep doing good, even if nobody claps.",
          ],
        },
        {
          heading: "Ibrahim: the brave builder",
          paragraphs: [
            "Ibrahim knew statues could not hear or help, so he worshipped only Allah, even when everyone around him did not. Later he and his son Ismail built the Kaaba — the black cube house in Makkah that Muslims face when they pray. Being brave means doing right even alone.",
          ],
        },
        {
          heading: "Musa: the sea that opened",
          paragraphs: [
            "Musa had to cross the sea with his people, and a scary army was behind them. Everyone was afraid — but Musa said, \"My Lord is with me.\" Then the sea split into two walls of water, and they walked through on dry ground! Trust Allah even when you cannot see the way out.",
          ],
        },
        {
          heading: "Yunus: the man in the whale",
          paragraphs: [
            "Yunus got upset and left his job too early, and ended up inside a big whale in the dark, dark sea. Inside, he prayed: \"Allah, I made a mistake. You are perfect.\" Allah heard him — the whale let him out! Even in the darkest place, Allah hears your du'a.",
          ],
        },
        {
          heading: "Muhammad (peace be upon him): the kindest teacher",
          paragraphs: [
            "The last prophet, Muhammad, was so honest that people called him \"the trustworthy\" even before he became a prophet. He was kind to children, smiled a lot, and never lied — not even as a joke. The best people are the ones with the best manners.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Pick one story and tell it to someone at home in your own words. Then ask them: what is the treasure (the lesson) hidden in it?",
          ],
          note: "Want more stories with a teacher? Our [Islamic studies lessons for kids](/courses/quran-for-kids) are one-to-one, in English, and start with a free trial.",
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "prophet-yusuf-story",
      "prophet-musa-story",
      "prophet-muhammad-story",
    ],
  },
  {
    slug: "how-to-perform-wudu",
    title: "How to Perform Wudu Step by Step, for Kids and Beginners",
    seoTitle: "How to Perform Wudu Step by Step (Kids & Beginners)",
    description:
      "Wudu in order: intention, hands, mouth, nose, face, arms, head and ears, feet — with how many times to wash each, what breaks wudu, and a simple version for kids.",
    excerpt:
      "Wudu is the washing we do before prayer. Eight steps, in order, right side first — here is the full sequence and a kid-friendly version to practise at the sink.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 6,
    keywords: [
      "how to perform wudu",
      "wudu step by step",
      "wudu for kids",
      "how to make wudu",
      "ablution in Islam",
    ],
    intro: [
      "Wudu is the ritual washing a Muslim does before prayer. It is not just cleaning the body; it is switching the heart into a calmer, ready state. The order comes from the Quran: \"Wash your faces and your hands up to the elbows, wipe your heads, and wash your feet up to the ankles\" (Quran 5:6).",
      "Below is the complete sequence as taught to beginners, followed by a simpler version for children. Switch reading levels above the article.",
    ],
    sections: [
      {
        heading: "Before you start: intention and Bismillah",
        paragraphs: [
          "Wudu begins in the heart: intend that you are purifying yourself for prayer. Then say Bismillah. Use clean water, and do not waste it — a thin, steady stream is enough, and leaving the tap running between steps is disliked.",
        ],
      },
      {
        heading: "The eight steps, in order",
        paragraphs: [
          "Wash three times where the number is given; once is enough, three is the fuller practice. The head and ears are wiped once, not washed. Always begin with the right side.",
        ],
        list: [
          "Wash both hands up to the wrists three times, right first.",
          "Rinse your mouth three times, swirling the water gently.",
          "Sniff water into your nose and blow it out, three times.",
          "Wash your whole face three times: hairline to chin, ear to ear.",
          "Wash your right arm up to and including the elbow three times, then the left.",
          "Wipe your head once with wet hands, and wipe your ears with the same water.",
          "Wash your right foot up to and including the ankle three times, then the left.",
          "Finish with the du'a of wudu and the declaration of faith if you know it.",
        ],
        listStyle: "steps",
      },
      {
        heading: "What breaks wudu",
        paragraphs: [
          "Wudu lasts until something breaks it: using the toilet, passing wind, or deep sleep. After that, repeat the washing before the next prayer. Bleeding, vomiting and touching skin do not all break wudu in every school of law — when in doubt, ask your teacher which ruling your family follows.",
        ],
      },
      {
        heading: "Order and continuity matter",
        paragraphs: [
          "The steps are done in the sequence above, one after another, without letting the previous part dry before the next is washed (in normal weather). Skipping the order turns the washing into ordinary cleaning rather than wudu.",
        ],
        note: "Reading the steps is not the same as being checked on them. In our [one-to-one lessons](/courses) a teacher watches your first wudu and prayer and corrects the small things — the elbows, the ankles, the order. Next, learn [how to pray salah](/blog/how-to-pray-salah).",
      },
    ],
    kids: {
      intro: [
        "Before we talk to Allah in prayer, we get ready with a special wash called wudu. It wakes up your body and your heart, like pressing the \"ready\" button.",
        "Practise it at the sink with a grown-up. Eight little steps — you can learn them in one week!",
      ],
      sections: [
        {
          heading: "The wudu steps",
          paragraphs: [
            "Say Bismillah first, and mean it in your heart: I am getting ready for prayer. Then follow the steps in order — right side always goes first.",
          ],
          list: [
            "Wash your hands three times, right first.",
            "Swish water in your mouth three times, like a gentle rinse.",
            "Sniff a little water into your nose three times, then blow it out.",
            "Wash your face three times, from your hair to your chin, ear to ear.",
            "Wash your arms to the elbows — right, then left — three times.",
            "Wipe your head and ears once with wet hands, like a little rain.",
            "Wash your feet to the ankles, right then left, three times.",
            "All done! You are ready to pray.",
          ],
          listStyle: "steps",
        },
        {
          heading: "When do we do it again?",
          paragraphs: [
            "After the toilet, or after a deep sleep, wudu is gone and we wash again before praying. It is not a punishment — it is just the ready button again.",
          ],
        },
        {
          heading: "Try it this week",
          paragraphs: [
            "Do wudu once a day with a parent, even outside prayer time, and say the steps out loud like a song. By the weekend you will know the order by heart.",
          ],
          note: "A teacher can check your wudu gently, step by step, in a [free trial lesson](/courses/quran-for-kids). Then you can learn [the prayer itself](/blog/how-to-pray-salah).",
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "how-to-pray-salah",
      "five-pillars-of-islam",
      "online-quran-classes-for-kids",
    ],
  },
  {
    slug: "how-to-pray-salah",
    title: "How to Pray Salah: A Step-by-Step Guide for Kids and Beginners",
    seoTitle: "How to Pray Salah Step by Step (Kids & Beginners)",
    description:
      "The five daily prayers and their rak'ahs, one full rak'ah explained step by step, and a gentle way for children and beginners to start praying.",
    excerpt:
      "Five prayers, seventeen rak'ahs, one repeating unit. Here is what happens inside a rak'ah, when each prayer falls in the day, and how to start without overwhelm.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 7,
    keywords: [
      "how to pray salah",
      "salah step by step",
      "how to pray for beginners",
      "number of rakats in each prayer",
      "salah for kids",
    ],
    intro: [
      "Salah is the second pillar of Islam: five appointed meetings with Allah every day. It looks complicated from outside, but it is built from one repeating unit — the rak'ah — and a small number of words you learn once and reuse forever.",
      "This guide walks through one rak'ah, lists the five prayers and their units, and explains how a child or a complete beginner can start small. A simpler version for children is one switch away.",
    ],
    sections: [
      {
        heading: "The five prayers and their rak'ahs",
        paragraphs: [
          "Each prayer has a fixed number of obligatory units (rak'ahs). The times move with the sun, so your local prayer timetable is the authority, not a fixed clock.",
        ],
        list: [
          "Fajr — before sunrise: 2 rak'ahs.",
          "Dhuhr — after midday: 4 rak'ahs.",
          "Asr — afternoon: 4 rak'ahs.",
          "Maghrib — just after sunset: 3 rak'ahs.",
          "Isha — night: 4 rak'ahs.",
        ],
      },
      {
        heading: "One rak'ah, step by step",
        paragraphs: [
          "Start in a state of wudu, facing the qiblah, having intended which prayer you are praying. Then:",
        ],
        list: [
          "Stand and say Allahu akbar — the opening takbir. The prayer has begun.",
          "Recite Surah Al-Fatihah, then a short surah or a few verses.",
          "Bow (ruku) with a flat back: Subhana rabbiyal-azim, three times.",
          "Rise, saying Sami Allahu liman hamidah — Allah hears the one who praises Him.",
          "Prostrate (sujud): forehead, nose, palms, knees and toes touch the ground. Subhana rabbiyal-a'la, three times.",
          "Sit up briefly, then prostrate a second time. One rak'ah is complete.",
          "Stand for the next rak'ah and repeat. In the final sitting, recite the tashahhud and send blessings on the Prophet.",
          "End with the salam, turning right then left: As-salamu alaykum wa rahmatullah.",
        ],
        listStyle: "steps",
      },
      {
        heading: "What the prayer is for",
        paragraphs: [
          "The words matter, but so does the pause. Salah interrupts the day five times to re-aim the heart: gratitude in the standing, humility in the bowing, nearness in the prostration. Praying slowly enough to mean one sentence is better than racing through all of them.",
        ],
        note: "Pronunciation and posture are exactly what a teacher is for. Our [one-to-one lessons](/courses) check your prayer gently, at your pace. First make sure your [wudu](/blog/how-to-perform-wudu) is in order, and see where salah sits among [the five pillars](/blog/five-pillars-of-islam).",
      },
    ],
    kids: {
      intro: [
        "Salah is our five little meetings with Allah every day. In each meeting we stand, bow, and put our foreheads on the ground — that is called a rak'ah, like one round of the prayer.",
        "You do not have to learn everything today. One round, one surah, one prayer at a time.",
      ],
      sections: [
        {
          heading: "The five meetings",
          paragraphs: [
            "Fajr is before the sun wakes up (2 rounds). Dhuhr is at lunchtime (4). Asr is in the afternoon (4). Maghrib is right after sunset (3). Isha is when the night is dark (4).",
          ],
        },
        {
          heading: "What happens in one round",
          paragraphs: [
            "First we do wudu, the ready-wash. Then we face the Kaaba in Makkah and follow the steps.",
          ],
          list: [
            "Stand up and say Allahu akbar — Allah is the greatest.",
            "Say Surah Al-Fatihah, the opening of the Quran.",
            "Bow down with a flat back, like a table, and praise Allah.",
            "Stand up again.",
            "Put your forehead on the ground — this is sujud, the closest moment to Allah.",
            "Sit up, then do sujud one more time. That is one round!",
            "At the very end, say salam to the right and to the left, like greeting the angels.",
          ],
          listStyle: "steps",
        },
        {
          heading: "Start small",
          paragraphs: [
            "Learn Al-Fatihah first — you already hear it in every prayer. Then pray alongside a grown-up and copy what they do, round by round. Allah loves the little deeds we keep doing.",
          ],
          note: "A teacher can watch your bowing and sujud and fix the tiny things, kindly, in a [free trial lesson](/courses/quran-for-kids). Do not forget your [wudu](/blog/how-to-perform-wudu) first!",
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "how-to-perform-wudu",
      "five-pillars-of-islam",
      "learn-quran-with-tajweed",
    ],
  },
  {
    slug: "five-pillars-of-islam",
    title: "The Five Pillars of Islam, Explained for Kids and Teens",
    seoTitle: "The Five Pillars of Islam Explained (Kids & Teens)",
    description:
      "Shahada, salah, zakat, sawm and hajj: what each pillar of Islam means, what it asks of a Muslim, and how the five fit together — with a simple version for kids.",
    excerpt:
      "Islam stands on five pillars: one declaration, five daily prayers, a yearly share for the poor, a month of fasting, and a once-in-a-lifetime journey. Here is what each one means.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 6,
    keywords: [
      "five pillars of Islam",
      "pillars of Islam for kids",
      "what is zakat",
      "what is shahada",
      "pillars of Islam explained",
    ],
    intro: [
      "The Prophet Muhammad (peace be upon him) described Islam as a building standing on five pillars: the declaration of faith, prayer, zakat, fasting Ramadan, and the pilgrimage to Makkah. Remove one and the building leans; keep all five and it stands.",
      "This guide explains each pillar in order — what it is, who it applies to, and what it trains in a person. Children can switch to the simpler version above.",
    ],
    sections: [
      {
        heading: "Shahada: the declaration that starts everything",
        paragraphs: [
          "\"There is no god but Allah, and Muhammad is the Messenger of Allah.\" One sentence, said with understanding and sincerity, is the entry into Islam and the axis of the other four pillars: everything else is worship of the One the sentence names.",
        ],
      },
      {
        heading: "Salah: five appointments a day",
        paragraphs: [
          "Five prayers at appointed times — dawn, midday, afternoon, sunset and night — keep the connection alive through the whole day, not just on Fridays. They are the first deed a person is asked about, and the pillar that structures time itself.",
        ],
      },
      {
        heading: "Zakat: the poor's share, not a favour",
        paragraphs: [
          "Zakat is an annual due of 2.5% of qualifying wealth held for a full lunar year — savings, gold, trade goods — paid to defined categories such as the poor and the needy. It is called purification because it cleanses wealth and the heart from greed: the recipient is receiving a right, not a gift.",
        ],
      },
      {
        heading: "Sawm: fasting Ramadan",
        paragraphs: [
          "In the ninth month, Muslims fast from dawn to sunset: no food, no drink, and a higher guard on the tongue and temper. Fasting is prescribed \"so that you may become righteous\" (Quran 2:183) — it trains self-control and sympathy for the hungry. The sick, travellers, and children before puberty are exempt; Ramadan is also the month the Quran was first revealed.",
        ],
      },
      {
        heading: "Hajj: the journey of a lifetime",
        paragraphs: [
          "Once in a lifetime, every Muslim who is physically and financially able travels to Makkah in the appointed days. In simple white garments, king and labourer stand shoulder to shoulder at Arafat, circling the Kaaba built by Ibrahim and Ismail — a rehearsal of the Day of Judgement and of total equality before Allah.",
        ],
      },
      {
        heading: "How the five fit together",
        paragraphs: [
          "Read them as a rhythm: one declaration for life, five prayers a day, one share a year, one month a year, one journey a lifetime. Belief becomes daily habit, yearly generosity, and a once-in-a-life summit. That rhythm is what makes Islam a lived practice rather than an opinion.",
        ],
        note: "Our Islamic studies lessons cover the pillars, the prophets and everyday manners one-to-one in English — see [the kids programme](/courses/quran-for-kids). Continue with [how to pray salah](/blog/how-to-pray-salah) or [Ramadan for kids](/blog/ramadan-for-kids).",
      },
    ],
    kids: {
      intro: [
        "Imagine a house standing on five strong pillars. If one breaks, the house gets wobbly. Islam is like that house, and its five pillars are five special jobs that keep a Muslim's life strong.",
        "Here they are, one by one.",
      ],
      sections: [
        {
          heading: "1. Shahada — the sentence of faith",
          paragraphs: [
            "We say: there is no god but Allah, and Muhammad is His messenger. It means we love and worship only Allah, and we follow His last teacher. It is the front door of Islam.",
          ],
        },
        {
          heading: "2. Salah — five hugs for the soul",
          paragraphs: [
            "Five times a day we stop and pray: morning, lunchtime, afternoon, sunset and night. Like calling your best friend every day so the friendship stays strong.",
          ],
        },
        {
          heading: "3. Zakat — sharing is a duty",
          paragraphs: [
            "Once a year, Muslims who have enough money give a small share — 2.5% of what they saved — to people who need it. It is not a present; it is the poor person's right. Sharing makes the whole family of Muslims healthier.",
          ],
        },
        {
          heading: "4. Sawm — the fasting month",
          paragraphs: [
            "In Ramadan we do not eat or drink from dawn until sunset. It teaches our bodies to listen to us, and our hearts to feel for hungry people. Kids practise little fasts first — like training wheels for a bike.",
          ],
        },
        {
          heading: "5. Hajj — the big family trip",
          paragraphs: [
            "Once in a lifetime, Muslims who can travel go to Makkah and walk around the Kaaba, the house Ibrahim built. Everyone wears the same simple white clothes — rich and poor look exactly the same, because Allah looks at hearts, not wallets.",
          ],
        },
        {
          heading: "Try it",
          paragraphs: [
            "Draw a house with five pillars and write one pillar on each. Colour the pillar you want to learn more about this week — then ask a grown-up to tell you its story.",
          ],
          note: "Next, read the [stories of the prophets](/blog/stories-of-the-prophets) or learn [how to pray](/blog/how-to-pray-salah) — or meet a teacher in a [free trial lesson](/courses/quran-for-kids).",
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "how-to-pray-salah",
      "ramadan-for-kids",
      "stories-of-the-prophets",
    ],
  },
  {
    slug: "ramadan-for-kids",
    title: "Ramadan for Kids: First Fasts, Suhoor, Iftar and Family Rhythm",
    seoTitle: "Ramadan for Kids: First Fasts & Family Guide",
    description:
      "How to introduce Ramadan to children: what fasting means, practice fasts by age, suhoor and iftar routines, good-deed ideas, and Eid — without pressure or risk.",
    excerpt:
      "Ramadan is the month of the Quran, not a test of endurance. A gentle plan for first fasts, family suhoors and iftars, and the good deeds that make the month glow.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 6,
    keywords: [
      "ramadan for kids",
      "first fast for kids",
      "fasting for children",
      "ramadan activities for kids",
      "suhoor and iftar for kids",
    ],
    intro: [
      "Ramadan is the ninth month of the Islamic calendar, the month the Quran was first revealed. Muslims fast from dawn to sunset, pray more, give more, and guard their tongues. For children, the month should feel like a festival of training — not a test they can fail.",
      "Fasting is not obligatory before puberty. This guide explains how families introduce it gradually, and what to do besides fasting so the month belongs to children too. A simpler telling for kids is one switch away.",
    ],
    sections: [
      {
        heading: "What fasting actually is",
        paragraphs: [
          "From true dawn to sunset: no food, no drink, and extra care with anger, gossip and lying. The fast is broken at sunset with iftar, traditionally dates and water, and preceded before dawn by suhoor, the meal the Prophet (peace be upon him) called blessed.",
          "The point is taqwa — God-consciousness (Quran 2:183) — and sympathy for those who are hungry without choosing it. A fast that ends in shouting has missed its own purpose.",
        ],
      },
      {
        heading: "Practice fasts, by age and not by pressure",
        paragraphs: [
          "Children are exempt until puberty, and scholars differ on when practice begins — some look to around seven, others to ten. A common gentle ladder: a \"fast\" until lunch at first, then half-days, then a full fast on a weekend or the last days of the month, with water and rest always allowed if needed.",
          "Never force a full fast on a young child, and stop if there is dizziness, illness or harm. The goal is love for Ramadan; a child who associates the month with suffering has learned the opposite of the lesson.",
        ],
      },
      {
        heading: "Build the family rhythm: suhoor and iftar",
        paragraphs: [
          "Wake children for suhoor even on non-fasting days — the pre-dawn meal together is half the magic. Let them set the iftar table, count the dates, and make the du'a at breaking time, which is a moment when du'a is accepted.",
          "Keep nights calm: Tarawih prayers in short doses for kids, one page of Quran together, and an early bedtime. Sleep is part of a healthy Ramadan, not a failure of enthusiasm.",
        ],
      },
      {
        heading: "Good deeds beyond the plate",
        paragraphs: [
          "Ramadan is the month of generosity and Quran. Give each child a good-deed jar: a coin for charity per good deed, a helping-hand chart, a neighbour's plate from iftar. Read one short surah's meaning together each night, and let the last ten nights include a family Laylat al-Qadr hunt with quiet worship.",
        ],
      },
      {
        heading: "Eid al-Fitr: the finish line is a gift",
        paragraphs: [
          "The month ends with Eid al-Fitr — a morning prayer, new or clean clothes, sweets, and visits. Zakat al-Fitr, a small food charity given before the Eid prayer, ensures the poor celebrate too. Tell children: the reward of Ramadan is not the sweets; the sweets are the applause for a month of training.",
        ],
        note: "Ramadan, the pillars and the prophets are all part of our Islamic studies lessons — see [the kids programme](/courses/quran-for-kids). For the framework behind the month, read [the five pillars of Islam](/blog/five-pillars-of-islam).",
      },
    ],
    kids: {
      intro: [
        "Ramadan is the month when the Quran first came down from Allah. All around the world, Muslim families wake up early, fast in the daytime, and celebrate together at sunset. It is the coziest month of the year — and you get to train for it, step by step.",
      ],
      sections: [
        {
          heading: "What is fasting?",
          paragraphs: [
            "From the first light of dawn until the sun goes down, we do not eat or drink — and we try extra hard to be kind and calm. When the sun sets, everyone says the du'a and eats: that happy meal is called iftar. The early breakfast before dawn is suhoor.",
          ],
        },
        {
          heading: "Your training fasts",
          paragraphs: [
            "Kids do not have to fast until they are grown. First you might \"fast\" until lunch, then half a day, then one whole day at the weekend — like level 1, level 2, level 3 of a game. If you feel dizzy or unwell, you stop and drink water. That is allowed, and it is smart.",
          ],
        },
        {
          heading: "The best parts of the day",
          paragraphs: [
            "Suhoor with the whole family in the quiet dark. Setting the iftar table and counting the dates. Making du'a right before eating — Allah loves that moment. And after dinner, Tarawih prayers or one story from the Quran with a grown-up.",
          ],
        },
        {
          heading: "The good-deed jar",
          paragraphs: [
            "Every kind deed — helping without being asked, sharing, saying something nice — goes in the jar as a coin or a star. At Eid, the jar becomes charity for someone who needs it. Ramadan is not only about an empty stomach; it is about a full heart.",
          ],
        },
        {
          heading: "Eid: the celebration",
          paragraphs: [
            "When the new moon is seen, Ramadan ends and Eid al-Fitr begins: a special morning prayer, your best clothes, sweets, and visits to family. You trained for a whole month — Eid is the medal ceremony.",
          ],
          note: "Want the whole story of the pillars behind Ramadan? Read [the five pillars](/blog/five-pillars-of-islam), or meet a teacher who tells [prophet stories](/blog/stories-of-the-prophets) in a [free trial lesson](/courses/quran-for-kids).",
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "five-pillars-of-islam",
      "stories-of-the-prophets",
      "islamic-manners-for-kids",
    ],
  },
  {
    slug: "islamic-manners-for-kids",
    title: "Islamic Manners (Akhlaq): Good Character for Kids and Teens",
    seoTitle: "Islamic Manners (Akhlaq) for Kids & Teens",
    description:
      "Akhlaq in Islam: kindness to parents, honesty, gentle speech, control of anger and care for neighbours — what the Quran and the Prophet taught, with a kid-friendly version.",
    excerpt:
      "Good character is worship too. The manners Islam asks for — with parents, with words, with anger, with neighbours — and small habits that build them in children.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 6,
    keywords: [
      "islamic manners for kids",
      "akhlaq in Islam",
      "good character in Islam",
      "kindness to parents in Islam",
      "teaching kids honesty in Islam",
    ],
    intro: [
      "Akhlaq means character and manners: how a Muslim treats parents, family, friends, strangers and animals. The Prophet Muhammad (peace be upon him) said he was sent to complete good character, and taught that the heaviest thing on a believer's scale on Judgement Day is good character.",
      "This guide covers the manners the Quran and the Prophet stressed most, and how to build them as habits in children. Switch to the kids version above for the simple telling.",
    ],
    sections: [
      {
        heading: "Kindness to parents comes right after worship",
        paragraphs: [
          "The Quran places kindness to parents immediately after worshipping Allah: do not say to them even \"uff\", and lower to them the wing of humility (Quran 17:23-24). In practice: answer when called, speak softly when tired, help without being asked, and make du'a for them.",
        ],
      },
      {
        heading: "Honesty, even when it costs",
        paragraphs: [
          "The Prophet was known as al-Amin — the trustworthy — before prophethood, and he never lied, even jokingly. Honesty in Islam includes admitting a mistake before being caught, keeping promises, and returning what is borrowed. A lie told as a joke is still a lie.",
        ],
      },
      {
        heading: "Guard the tongue",
        paragraphs: [
          "The Quran compares backbiting to eating a dead brother's flesh (Quran 49:12) — a deliberately shocking image. The training is simple: say about people only what you would say to their face, greet with salam, and choose silence over a cruel joke. \"Whoever believes in Allah and the Last Day, let him speak good or remain silent.\"",
        ],
      },
      {
        heading: "Anger is a fire; manners are the water",
        paragraphs: [
          "The strong person, the Prophet taught, is not the wrestler but the one who controls himself when angry. The practical steps he gave: seek refuge in Allah, sit down if standing, lie down if sitting, and make wudu. Anger is not forbidden; obeying it is the danger.",
        ],
      },
      {
        heading: "Neighbours, guests and animals",
        paragraphs: [
          "Gabriel kept advising the Prophet about the neighbour until he thought the neighbour would inherit. Share food, keep noise down, check on the elderly. Honour the guest, feed the hungry, and be gentle with animals — a woman was forgiven for giving water to a thirsty dog, and another punished for starving a cat.",
        ],
      },
      {
        heading: "Build the habits small",
        paragraphs: [
          "Character is trained like a muscle: one manner per week. This week, greet first. Next week, no complaining at the table. Praise the specific deed (\"you told the truth even though it was hard\"), not the child's worth. Children copy what they see far more than what they hear.",
        ],
        note: "Manners, prophets and pillars are taught together in our Islamic studies lessons — see [the kids programme](/courses/quran-for-kids). Pair this with [the stories of the prophets](/blog/stories-of-the-prophets), where every manner has a face.",
      },
    ],
    kids: {
      intro: [
        "Did you know being kind is a kind of worship? The Prophet Muhammad (peace be upon him) said the best people are the ones with the best manners. Muslims call good manners akhlaq — and you can train them like superpowers.",
      ],
      sections: [
        {
          heading: "Superpower 1: gentle with parents",
          paragraphs: [
            "When Mum or Dad calls, answer with a smile, not a groan. The Quran says do not even say \"uff\" to them. Help carry the bags, say thank you for the food, and make du'a for them at night. They took care of you when you were tiny — now you can take care of their hearts.",
          ],
        },
        {
          heading: "Superpower 2: tell the truth",
          paragraphs: [
            "Even when the truth is scary, even when it was an accident, even as a joke — tell it. People called the Prophet \"the trustworthy\" because he never lied. A truth-teller is someone everyone can lean on.",
          ],
        },
        {
          heading: "Superpower 3: kind words only",
          paragraphs: [
            "Say salam first. Say please and alhamdulillah. If a word about someone would hurt them if they heard it, swallow it — that is backbiting, and the Quran says it is like eating something dead. Yuck! Choose kind words or quiet.",
          ],
        },
        {
          heading: "Superpower 4: cool down the anger fire",
          paragraphs: [
            "Anger feels like fire in your chest. The Prophet taught us the water: say a'udhu billah, sit down if you are standing, and make wudu. The truly strong person is the one who calms down, not the one who shouts loudest.",
          ],
        },
        {
          heading: "Superpower 5: share and care",
          paragraphs: [
            "Share your snacks with the neighbour, smile at the new kid, give water to a thirsty cat. Allah forgave a woman just for giving a dog a drink! Small kindnesses are big deeds with Allah.",
          ],
        },
        {
          heading: "Try it: one superpower a week",
          paragraphs: [
            "Pick one superpower and practise it for seven days. Put a star on the calendar each day you use it. Next week, pick another. That is how akhlaq grows — one small star at a time.",
          ],
          note: "Meet a teacher who tells [prophet stories](/blog/stories-of-the-prophets) full of these superpowers, in a [free trial lesson](/courses/quran-for-kids).",
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "stories-of-the-prophets",
      "online-quran-classes-for-kids",
      "five-pillars-of-islam",
    ],
  },
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
  {
    slug: "prophet-adam-story",
    title: "The Story of Prophet Adam: The First Human and the First Sorry",
    seoTitle: "Prophet Adam Story in Islam for Kids & Teens",
    description:
      "The story of Prophet Adam (peace be upon him) as the Quran tells it: creation, the angels' prostration, the tree, and the repentance that opened the door back to Allah.",
    excerpt:
      "Adam was the first human — and the first to make a mistake and say sorry. His story teaches that the door back to Allah is never closed.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 6,
    keywords: [
      "prophet Adam story",
      "story of Adam in Islam",
      "Adam and Hawwa story for kids",
      "first prophet in Islam",
    ],
    intro: [
      "Every human story starts with one person: Adam, the first human and the first prophet. The Quran tells his story in several surahs, and it is not mainly about the mistake — it is about what happened right after it.",
      "This guide retells Adam's story from the Quran. Switch the reading level above: a simple version for children, and a deeper one with verse references for readers 13 and up.",
    ],
    sections: [
      {
        heading: "Created and honoured",
        paragraphs: [
          "Allah announced to the angels that He was placing a human on earth, created from clay, and breathed life into him. Then He taught Adam the names of things — knowledge the angels did not have — and asked them to prostrate out of respect (Quran 2:30-34).",
          "All of them did, except Iblis, who refused out of pride: \"I am better than him. You created me from fire and created him from clay.\" Pride, not doubt, was the first refusal.",
        ],
      },
      {
        heading: "The tree and the slip",
        paragraphs: [
          "Adam and his wife were placed in the garden and allowed everything except one tree. Iblis whispered to them, dressed the forbidden thing as something better, and swore he was a sincere adviser. They ate from the tree (Quran 2:35-36, 7:20-22).",
          "The Quran does not linger on blame. It moves immediately to the response — which is the part meant for us.",
        ],
      },
      {
        heading: "The first repentance",
        paragraphs: [
          "Adam did not argue, hide, or accuse his wife. He received words of repentance from his Lord and said them: \"Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers\" (Quran 7:23). Allah accepted his repentance (2:37).",
          "Compare the two responses in the same story: Iblis blamed and grew proud; Adam admitted and turned back. One refusal became permanent, one mistake became forgiven.",
        ],
      },
      {
        heading: "Life on earth, and the promise",
        paragraphs: [
          "Adam and his wife came down to earth, but not abandoned: guidance would come, Allah promised, and whoever follows it has nothing to fear (Quran 2:38). Earth was never a punishment without a way home.",
          "Adam lived as the first prophet, teaching his children to worship Allah alone. Humanity's story begins with a mistake forgiven, not a mistake recorded forever.",
        ],
      },
      {
        heading: "What the story asks of us",
        paragraphs: [
          "Three things: knowledge is an honour, so use it humbly; whispers dress wrong as right, so check before you act; and when you slip, say the sorry immediately instead of defending the slip.",
        ],
        note: "Read the whole line of prophets in [our stories hub](/blog/stories-of-the-prophets), or continue with [the story of Nuh](/blog/prophet-nuh-story), the prophet of patience.",
      },
    ],
    kids: {
      intro: [
        "A very long time ago, Allah made the very first person. His name was Adam. This is his story — and it has the best ending: a sorry that was accepted.",
      ],
      sections: [
        {
          heading: "The first person",
          paragraphs: [
            "Allah made Adam from clay and gave him life. Allah taught Adam the names of everything — things even the angels did not know! The angels bowed with respect, because Allah asked them to.",
            "But one, called Iblis, said, \"No! I am better than him.\" He was proud. Being proud like that is never okay.",
          ],
        },
        {
          heading: "One tree to stay away from",
          paragraphs: [
            "Adam and his wife lived in a beautiful garden. They could eat anything they wanted — except from one tree. Allah said: stay away from that one.",
            "Iblis whispered a trick: \"Eat from it, and you will become even better!\" They listened to the whisper and ate. Oh no.",
          ],
        },
        {
          heading: "The very first sorry",
          paragraphs: [
            "Adam did not say \"it wasn't me!\" He did not blame his wife. He said sorry to Allah with his whole heart: \"Our Lord, we did wrong. Please forgive us.\"",
            "And Allah — who loves to forgive — forgave him. The door back was open, and it still is.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Think of one small thing you did wrong today. You do not have to tell anyone else. Just say sorry to Allah in your own words, like Adam did.",
            "Then ask a grown-up: \"What was the first sorry you ever said?\" Everyone has one. That is why Adam's story is for all of us.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "stories-of-the-prophets",
      "prophet-nuh-story",
      "how-to-make-dua",
    ],
  },
  {
    slug: "prophet-nuh-story",
    title: "The Story of Prophet Nuh (Noah): 950 Years of Patience",
    seoTitle: "Prophet Nuh (Noah) Story in Islam for Kids & Teens",
    description:
      "The Quran's story of Prophet Nuh: 950 years of calling his people, building the ark under mockery, the flood, and the lesson of effort without applause.",
    excerpt:
      "Nuh kept going for 950 years while almost everyone laughed. His story teaches that results belong to Allah — persistence belongs to us.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 6,
    keywords: [
      "prophet Nuh story",
      "Noah story in Islam",
      "Nuh ark story for kids",
      "prophet of patience",
    ],
    intro: [
      "Nuh is the prophet of steady effort. The Quran says he stayed with his people \"a thousand years less fifty\" (Quran 29:14), calling them to Allah while most of them mocked him. Then came the ark, the flood, and one of the hardest moments in any prophet's life.",
      "This guide follows his story as the Quran tells it, with a children's version and a deeper version in the same article.",
    ],
    sections: [
      {
        heading: "A message nobody wanted",
        paragraphs: [
          "Nuh's people had started worshipping idols. He called them back to Allah plainly, night and day, in public and in private (Quran 71:5-9). Their answer was fingers in ears, clothes over heads, and louder mockery.",
          "He did not measure success by the crowd. He measured it by faithfulness to the message — and kept going for centuries.",
        ],
      },
      {
        heading: "Building the ark while they laughed",
        paragraphs: [
          "When Allah commanded him to build the ship, Nuh built it far from any sea. Every passing group of his people laughed at him. He answered: \"If you mock us, we will mock you as you mock\" — the flood would settle the argument (Quran 11:38).",
          "Patience is not passive. Nuh kept hammering wood while being laughed at. That is the picture the Quran wants us to keep.",
        ],
      },
      {
        heading: "The flood, and the son who refused",
        paragraphs: [
          "The water came from the sky and the ground. Nuh carried the believers and pairs of every animal. His own son stood apart, saying he would climb a mountain to escape. Nuh called to him; the wave came between them, and the son was among the drowned (Quran 11:40-43).",
          "Nuh asked Allah about his son, and was corrected gently but firmly: the promise covers the righteous, and family ties do not override faith (11:45-47). Even prophets grieve — and even prophets accept Allah's judgment.",
        ],
      },
      {
        heading: "The resting place and the new beginning",
        paragraphs: [
          "The command came: \"O earth, swallow your water, and O sky, withhold.\" The ark rested on Mount Judi, and the survivors began again (Quran 11:44). Nuh's story ends not with the destruction but with a second start.",
        ],
      },
      {
        heading: "What patience actually looks like",
        paragraphs: [
          "Nuh teaches three things: do the right thing even when the audience booed; results are Allah's department, effort is yours; and grief is allowed, but it never gets the final word over trust.",
        ],
        note: "Continue the series with [Ibrahim's courage](/blog/prophet-ibrahim-story), or go back to [the stories hub](/blog/stories-of-the-prophets).",
      },
    ],
    kids: {
      intro: [
        "Imagine telling people something true, and they laugh at you. Now imagine doing it for a very, very long time and never giving up. That was Prophet Nuh.",
      ],
      sections: [
        {
          heading: "The man who never gave up",
          paragraphs: [
            "Nuh told his people: worship Allah alone, and be good. They laughed, covered their ears, and walked away. Nuh kept telling them — for 950 years! He never said, \"Fine, I quit.\"",
          ],
        },
        {
          heading: "The big boat in the desert",
          paragraphs: [
            "Allah told Nuh to build a giant boat. There was no sea anywhere near! People laughed even harder: \"A boat here?\"",
            "Nuh kept building. Hammer, hammer, hammer. He trusted Allah more than the laughter.",
          ],
        },
        {
          heading: "The water came",
          paragraphs: [
            "Then rain poured from the sky and water burst from the ground. Nuh brought the believers and two of every animal onto the boat. The boat floated safely while the flood covered everything.",
            "Sadly, Nuh's own son would not come aboard, and the water took him. Nuh was very sad. Even prophets feel sad — but he still trusted Allah.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Next time something is hard — homework, learning a new surah, tying your shoes — remember Nuh's hammer. Do one more small try, even if nobody claps.",
            "Draw the ark with your favourite animals on it, and write one word under it: patience.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "stories-of-the-prophets",
      "prophet-adam-story",
      "prophet-ayyub-story",
    ],
  },
  {
    slug: "prophet-ibrahim-story",
    title: "The Story of Prophet Ibrahim (Abraham): The Friend of Allah",
    seoTitle: "Prophet Ibrahim (Abraham) Story for Kids & Teens",
    description:
      "Prophet Ibrahim's story in the Quran: questioning the idols, the cool fire, building the Kaaba with Ismail, and the great test remembered every Eid al-Adha.",
    excerpt:
      "Ibrahim stood alone against a whole town, walked into a fire that became cool, and built the Kaaba with his son. His story is about trust that acts.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 7,
    keywords: [
      "prophet Ibrahim story",
      "Abraham story in Islam",
      "Ibrahim and the fire",
      "Ibrahim building the Kaaba",
      "Eid al-Adha story",
    ],
    intro: [
      "The Quran calls Ibrahim the friend of Allah (4:125). He is the prophet of courage that thinks: he questioned the stars, broke the idols, stood in a fire, and raised the walls of the Kaaba with his son. Muslims remember his greatest test every year at Eid al-Adha.",
      "This guide tells his story in two reading levels — simple for children, deeper with Quran references for ages 13 and up.",
    ],
    sections: [
      {
        heading: "The boy who asked questions",
        paragraphs: [
          "Ibrahim looked at a star, then the moon, then the sun, and watched each one set. \"I do not love things that disappear,\" he concluded — the Creator does not set (Quran 6:74-79). His faith started with honest thinking, not inherited habit.",
          "When his people left, he broke their idols and left the biggest one standing with the axe. Asked if he did it, he said: ask the big one, if it can speak. They knew idols cannot speak or act — and that was exactly his point (21:51-67).",
        ],
      },
      {
        heading: "The fire that became cool",
        paragraphs: [
          "Furious, they built a great fire and threw him in. Allah's command was one sentence: \"O fire, be coolness and safety upon Ibrahim\" (Quran 21:69). The thing meant to destroy him became the place he was safest.",
          "The lesson is not that fire never burns. It is that the One who made fire can overrule it, and trust in Him is never misplaced.",
        ],
      },
      {
        heading: "Building the Kaaba with Ismail",
        paragraphs: [
          "Years later, in a barren valley, Ibrahim and his son Ismail raised the foundations of the House — the Kaaba in Makkah — praying as they built: \"Our Lord, accept this from us\" (Quran 2:127). The same hands that broke idols now built the direction of prayer for every Muslim after them.",
          "Ibrahim also left his wife Hajar and infant Ismail in that valley with trust in Allah's provision; her search for water between Safa and Marwa became the sa'i every pilgrim walks, and Zamzam sprang for the child.",
        ],
      },
      {
        heading: "The greatest test",
        paragraphs: [
          "Ibrahim saw in a dream that he was sacrificing his son. He told the boy, and the son answered: \"O my father, do as you are commanded; you will find me, if Allah wills, among the patient\" (Quran 37:102). At the moment of submission, Allah called out that the test was passed, and ransomed the son with a great sacrifice (37:104-107).",
          "Eid al-Adha remembers this: not the knife, but the willingness — and the mercy that replaced it. That is why the day is about giving meat to the poor as much as celebration.",
        ],
      },
      {
        heading: "What the friend of Allah teaches",
        paragraphs: [
          "Question honestly, stand alone if the truth requires it, build something that outlives you, and submit even when the command is hard — then watch what mercy does at the last moment.",
        ],
        note: "Read [how Hajj works](/blog/what-is-hajj) and [the two Eids](/blog/eid-al-fitr-and-eid-al-adha) to see Ibrahim's story lived out every year, or continue with [Yusuf's story](/blog/prophet-yusuf-story).",
      },
    ],
    kids: {
      intro: [
        "Prophet Ibrahim was brave in the best way: he used his brain, he stood up for what is true, and he trusted Allah even when it was scary.",
      ],
      sections: [
        {
          heading: "The stars that go to bed",
          paragraphs: [
            "Ibrahim looked at the stars and said, \"They disappear. I want to worship the One who made them, who never disappears.\" He thought carefully, and his heart chose Allah.",
          ],
        },
        {
          heading: "The fire that turned into a garden",
          paragraphs: [
            "Some people were angry at Ibrahim and threw him into a huge fire. But Allah said to the fire: \"Be cool and safe for Ibrahim!\" And it was. Inside the fire, Ibrahim was safe and calm.",
            "Allah can change anything. Nothing is too hard for Him.",
          ],
        },
        {
          heading: "Building Allah's house",
          paragraphs: [
            "Ibrahim and his son Ismail built the Kaaba — the cube-shaped house in Makkah that Muslims face when they pray. Stone by stone, they built it, saying, \"Allah, please accept this from us.\"",
            "When you pray, you face the very house they built!",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Ask a grown-up to tell you the rest of Ibrahim's story — the big test and the happy ending we celebrate at Eid al-Adha.",
            "Then build your own little Kaaba from blocks or a box, and say the builders' du'a together: \"Our Lord, accept this from us.\"",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "stories-of-the-prophets",
      "what-is-hajj",
      "eid-al-fitr-and-eid-al-adha",
    ],
  },
  {
    slug: "prophet-yusuf-story",
    title: "The Story of Prophet Yusuf (Joseph): The Best of Stories",
    seoTitle: "Prophet Yusuf (Joseph) Story for Kids & Teens",
    description:
      "The Quran's story of Yusuf: the dream, the well, the prison, the palace, and the forgiveness that reunited a family. Called the best of stories (Quran 12:3).",
    excerpt:
      "From a well to a palace, Yusuf never stopped trusting Allah — and when he finally had power over the brothers who hurt him, he forgave them.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 8,
    keywords: [
      "prophet Yusuf story",
      "Joseph story in Islam",
      "Surah Yusuf story for kids",
      "Yusuf and his brothers",
    ],
    intro: [
      "The Quran calls Yusuf's story \"the best of stories\" (12:3), and it is the only prophet's life told in one complete surah. It has a dream, a jealous plot, a well, a false accusation, a prison, a king's puzzle, and a reunion — and through every twist, the same thread: Allah's plan is working even when nobody can see it.",
      "This guide retells it for children and for readers 13 and up, with the verse references in the deeper level.",
    ],
    sections: [
      {
        heading: "The dream and the well",
        paragraphs: [
          "Young Yusuf told his father Yaqub a dream: eleven stars, the sun and the moon prostrating to him. His father understood it was a sign of future honour, and warned him not to tell his brothers, whose jealousy he feared (Quran 12:4-5).",
          "The brothers plotted anyway. They threw Yusuf into a well and told their father a wolf had eaten him, bringing a shirt with false blood. Yaqub's answer became a model for every grieving believer: \"Beautiful patience; Allah is the one whose help is sought\" (12:18). A passing caravan pulled Yusuf out and sold him in Egypt.",
        ],
      },
      {
        heading: "The test in the house, and the prison",
        paragraphs: [
          "Yusuf grew into a man of remarkable character and appearance in the house of a high official. When the official's wife tried to seduce him, he refused and ran for the door; she tore his shirt from behind, then accused him. The tear at the back proved his innocence — yet he was imprisoned anyway (Quran 12:23-35).",
          "He said prison was dearer to him than sin, and asked Allah for protection. In prison he kept doing good: interpreting dreams, calling people to Allah. The wrong turn was still part of the road.",
        ],
      },
      {
        heading: "The king's dream and the palace",
        paragraphs: [
          "The king dreamed of seven fat cows eaten by seven thin ones. Yusuf interpreted it: seven years of plenty, then seven of famine — store grain now. The king, convinced, raised him to authority over the storehouses (Quran 12:43-56). The boy from the well was now Egypt's minister of food.",
          "When the famine came, his own brothers arrived to buy grain, not recognising him. He knew them; they did not know him.",
        ],
      },
      {
        heading: "\"No blame upon you today\"",
        paragraphs: [
          "After testing their change of heart, Yusuf revealed himself. The brothers were terrified — he now had total power over them. His words are the summit of the story: \"No blame upon you today. Allah will forgive you, and He is the most merciful of the merciful\" (Quran 12:92).",
          "He sent his shirt to heal his father's blindness, and the whole family came to Egypt. The dream of the stars came true, and Yusuf's final prayer was not revenge but gratitude: \"You have given me sovereignty... cause me to die a Muslim and join me with the righteous\" (12:101).",
        ],
      },
      {
        heading: "What the best of stories teaches",
        paragraphs: [
          "Jealousy hurts the jealous first; chastity and honesty cost something now and pay forever; patience is not one act but a chain of them; and the highest use of power is forgiveness.",
        ],
        note: "Read the surah itself with a teacher — it is a favourite in our [Quran classes for kids](/courses/quran-for-kids). Continue with [Musa's story](/blog/prophet-musa-story), another life saved from water.",
      },
    ],
    kids: {
      intro: [
        "This is the story the Quran calls the best one ever. It has a dream, a deep well, a prison, a palace — and a forgiveness so big it fixed a whole family.",
      ],
      sections: [
        {
          heading: "The dream of eleven stars",
          paragraphs: [
            "Yusuf dreamed that eleven stars, the sun and the moon all bowed to him. His dad said, \"Shh — don't tell your brothers.\" They were already jealous of him.",
            "But the brothers did a terrible thing: they threw Yusuf into a deep well and told their dad a wolf ate him. Their dad cried, but he trusted Allah: \"Beautiful patience.\"",
          ],
        },
        {
          heading: "From the well to the prison",
          paragraphs: [
            "Travellers found Yusuf and took him to Egypt. He grew up kind and honest. When someone tried to make him do something wrong, he said no — even though saying no got him thrown in prison.",
            "In prison, Yusuf kept being good. He helped people and told them about Allah. Allah was with him the whole time.",
          ],
        },
        {
          heading: "The king's puzzle",
          paragraphs: [
            "The king had a strange dream: seven fat cows eaten by seven skinny cows! Only Yusuf could explain it: seven good years, then seven hungry years. \"Store food now!\"",
            "The king was so impressed he made Yusuf a big leader. The boy from the well was now in a palace.",
          ],
        },
        {
          heading: "The biggest sorry and the biggest forgiveness",
          paragraphs: [
            "When the hungry years came, Yusuf's brothers came to buy food. They did not know him — but he knew them! He could have punished them. Instead he said: \"No blame on you today. Allah will forgive you.\"",
            "The whole family came together again, and the dream of the stars came true. Forgiveness fixed what jealousy broke.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Is there someone you are annoyed with? Try Yusuf's move: do one kind thing for them this week.",
            "Then ask a grown-up to read Surah Yusuf with you — one page a night. It is the best of stories, one piece at a time.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "stories-of-the-prophets",
      "prophet-musa-story",
      "islamic-manners-for-kids",
    ],
  },
  {
    slug: "prophet-idris-story",
    title: "The Story of Prophet Idris: Truthfulness That Raises a Person",
    seoTitle: "Prophet Idris Story in Islam for Kids & Teens",
    description:
      "What the Quran says about Prophet Idris (Enoch): a man of truth and patience whom Allah raised to a high station, and what his short mention teaches us.",
    excerpt:
      "The Quran gives Idris only two verses — and they contain a whole life's lesson: be truthful, be patient, and Allah raises you.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 5,
    keywords: [
      "prophet Idris story",
      "Idris in the Quran",
      "Enoch in Islam",
      "prophets mentioned in the Quran",
    ],
    intro: [
      "Some prophets fill whole surahs; others are honoured in a single breath. Idris is one of the latter — and the Quran's two verses about him are a complete lesson: \"And mention in the Book, Idris. Indeed, he was a man of truth and a prophet. And We raised him to a high station\" (Quran 19:56-57).",
      "This guide tells what the Quran and Islamic tradition say about him, honestly separating the two, for children and for readers 13 and up.",
    ],
    sections: [
      {
        heading: "What the Quran actually says",
        paragraphs: [
          "Two mentions, both glowing. In Surah Maryam: a man of truth (siddiq) and a prophet, raised to a high station (19:56-57). In Surah al-Anbiya, he is listed with Ismail and Dhul-Kifl: \"all were of the patient\", admitted into Allah's mercy, among the righteous (21:85-86).",
          "Truthfulness and patience — those are the two qualities Allah chose to record about him forever. The Quran does not tell us his town, his trade, or his trials. It tells us his character.",
        ],
      },
      {
        heading: "What Islamic tradition adds",
        paragraphs: [
          "Classical scholars, drawing on early reports, describe Idris as an early prophet after Adam and before Nuh, and remember him as the first to write with a pen and the first to sew and wear stitched garments. These details come from tradition, not from the Quran itself, so we hold them loosely — the certainty belongs to the two verses.",
          "Even the tradition's picture fits the Quran's description: a patient man who learned, made, and taught, raising human life one careful skill at a time.",
        ],
      },
      {
        heading: "Raised to a high station",
        paragraphs: [
          "The Quran says Allah \"raised him to a high station\" without explaining how, and commentators have differed on the details. What is certain is the principle stated elsewhere in the Quran: \"Allah will raise those who have believed among you and those who were given knowledge, by degrees\" (58:11).",
          "Idris is the proof that a quiet, truthful life can end higher than a loud, famous one. He is not remembered for a miracle crowd watched, but for a character Allah praised.",
        ],
      },
      {
        heading: "The lesson for us",
        paragraphs: [
          "You may never be famous. You can still be siddiq — the kind of person whose yes means yes and whose no means no — and patient when the work is slow. That is the life the Quran honoured in two verses, and it is available to anyone.",
        ],
        note: "Continue with [the story of Nuh](/blog/prophet-nuh-story), the next prophet in the line, or browse [all the prophet stories](/blog/stories-of-the-prophets).",
      },
    ],
    kids: {
      intro: [
        "Not every hero needs a big adventure. Prophet Idris is remembered for two quiet superpowers: always telling the truth, and never giving up.",
      ],
      sections: [
        {
          heading: "The truthful one",
          paragraphs: [
            "Allah says about Idris: \"He was a man of truth and a prophet.\" That means when Idris said something, you could trust it completely. No little lies, no big lies. Ever.",
            "Allah loved that so much that He raised Idris to a high, special place. Truthfulness lifts a person up!",
          ],
        },
        {
          heading: "The patient one",
          paragraphs: [
            "The Quran also puts Idris on a list of the most patient people ever. Learning things takes time. Being good takes time. Idris kept going, step by step, like someone climbing a very tall mountain one small step at a time.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Play the Idris game: for one whole day, make every word you say completely true — even when a little lie would be easier. Tell a grown-up at bedtime how it went.",
            "Then pick one slow skill — writing, reading, a surah — and take one patient step on it tomorrow.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "stories-of-the-prophets",
      "prophet-nuh-story",
      "prophet-dhul-kifl-story",
    ],
  },
  {
    slug: "prophet-hud-story",
    title: "The Story of Prophet Hud: Strength That Forgot Its Giver",
    seoTitle: "Prophet Hud and the People of Aad (Kids & Teens)",
    description:
      "The Quran's story of Prophet Hud and the mighty people of Aad: their towers, their boast of strength, the warning wind, and the lesson about gratitude.",
    excerpt:
      "Aad built towers and asked, 'Who is stronger than us?' Hud answered with one sentence. Their strength could not save them from a wind.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 6,
    keywords: [
      "prophet Hud story",
      "people of Aad story",
      "Hud story for kids",
      "Iram of the pillars",
    ],
    intro: [
      "The people of Aad were the superpower of their age: tall, strong, builders of Iram \"with its lofty pillars, the like of which had never been created in the land\" (Quran 89:6-8). They had everything except the one thing that matters — gratitude to the One who gave it. Prophet Hud was sent to remind them.",
      "This is their story as the Quran tells it, in two reading levels.",
    ],
    sections: [
      {
        heading: "The strongest people on earth",
        paragraphs: [
          "Aad carved homes in the plains and raised monuments, and their boast became a sentence the Quran preserves: \"Who is greater than us in strength?\" (41:15). They had confused having power with being safe.",
          "Hud's message was the same one every prophet brought: \"O my people, worship Allah; you have no deity other than Him\" (7:65). He asked them to remember the Giver behind the gifts.",
        ],
      },
      {
        heading: "The answer of the arrogant",
        paragraphs: [
          "They called him foolish and demanded he bring the punishment he warned of (7:70, 46:22). Hud answered with the sentence of every sincere caller: \"I only intend reform as far as I am able. My success is not except through Allah\" — the same humility Shuayb would later voice (11:88).",
          "Then a cloud appeared on the horizon, moving toward their valleys. They rejoiced: \"This is a cloud bringing us rain!\" It was the punishment they had demanded (46:24).",
        ],
      },
      {
        heading: "The wind that ended the boast",
        paragraphs: [
          "A screaming wind, furious, was unleashed on them for seven nights and eight days (69:6-7). The Quran shows the result without triumph: people lying fallen \"as if they were trunks of palm trees uprooted\" (69:7, 54:20). The strongest nation was carried away like leaves.",
          "\"And We saved Hud and those who believed with him, by mercy from Us\" (11:58). The rescue was not strength either — it was mercy.",
        ],
      },
      {
        heading: "What the story asks of us",
        paragraphs: [
          "Strength, money, talent and towers are gifts, not guarantees. The question the Quran puts to Aad is put to every blessed person: \"Will you then be grateful?\" (21:80). Gratitude keeps the gift; arrogance turns it into a test you fail.",
        ],
        note: "Read the companion story of [Salih and Thamud](/blog/prophet-salih-story), another mighty people undone by one boundary they crossed.",
      },
    ],
    kids: {
      intro: [
        "Imagine the strongest, tallest builders in the whole world. That was the people of Aad. They were so strong they forgot who gave them their strength — until a prophet named Hud came to remind them.",
      ],
      sections: [
        {
          heading: "The tower builders",
          paragraphs: [
            "Aad built giant towers and tall pillars. They looked at their muscles and their buildings and said, \"Nobody is stronger than us!\"",
            "Hud said gently: \"Allah gave you all of this. Say thank you, worship Him, and be good.\" But they laughed at him.",
          ],
        },
        {
          heading: "The cloud that was not rain",
          paragraphs: [
            "One day they saw a big cloud coming. \"Rain! Our farms will drink!\" they cheered. But it was not a rain cloud. It was a mighty wind.",
            "The wind blew for seven nights and eight days, and the strong towers could not help at all. Hud and the believers were kept safe by Allah's mercy.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Count three gifts you have — your strong legs, your warm home, your family. Say alhamdulillah for each one. That is the habit Aad forgot.",
            "Then build the tallest tower you can from blocks — and say thank you to Allah for the hands that built it.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "stories-of-the-prophets",
      "prophet-salih-story",
      "prophet-nuh-story",
    ],
  },
  {
    slug: "prophet-salih-story",
    title: "The Story of Prophet Salih: The Camel and the Boundary",
    seoTitle: "Prophet Salih and the She-Camel (Kids & Teens)",
    description:
      "The Quran's story of Prophet Salih and Thamud: homes carved in mountains, the she-camel as a sign, the shared water, and the boundary they crossed.",
    excerpt:
      "Thamud carved mountains into homes and were given one clear sign: a camel, and a rule about water. The story is about what happens when a boundary is mocked.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 6,
    keywords: [
      "prophet Salih story",
      "Salih she camel story",
      "people of Thamud",
      "Salih story for kids",
    ],
    intro: [
      "After Aad came Thamud — heirs to the same strength and the same mistake. They carved homes into the mountains themselves (Quran 7:74), and Allah gave them a sign so clear it could not be argued with: a she-camel, and one rule about her. Prophet Salih's story is about that rule.",
      "Two reading levels below: simple for children, deeper with verse references for ages 13 and up.",
    ],
    sections: [
      {
        heading: "The mountain carvers",
        paragraphs: [
          "Thamud were skilled beyond their neighbours: \"You carve houses from the mountains with great skill\" (Quran 26:149). Salih called them to Allah and to gratitude, and they asked for a miracle to prove he was truly sent (7:73, 26:154).",
          "The sign came: a she-camel, emerging as Allah willed, with a command attached — \"This is the she-camel of Allah, a sign for you. Let her feed on Allah's earth, and do not touch her with harm\" (11:64).",
        ],
      },
      {
        heading: "The water agreement",
        paragraphs: [
          "The camel had her appointed day at the water, and the people had theirs (26:155, 54:28). It was a simple sharing arrangement — a daily test of whether they could respect a boundary that belonged to Allah.",
          "For a while, the arrangement held. Then the most wretched among them rose to do what the whole town had been circling: they hamstrung the camel and killed her (7:77, 54:29), defying the warning to their faces.",
        ],
      },
      {
        heading: "Three days, then the blast",
        paragraphs: [
          "Salih told them: enjoy your homes for three more days — a promise that would not be denied (11:65). They plotted to kill Salih and his family by night, but Allah's plan outran theirs (27:48-51).",
          "The blast took the wrongdoers, and they lay lifeless in their homes, \"as if they had never prospered therein\" (11:67-68). The mountain houses remained; the people who mocked the boundary did not. Salih and the believers were saved (7:79).",
        ],
      },
      {
        heading: "What the story asks of us",
        paragraphs: [
          "Every life has a she-camel: a boundary Allah drew that nobody else can enforce for you — honesty when nobody watches, kindness to a creature that cannot complain, restraint when you have the power to take. Respecting the unseen boundary is what faith actually looks like.",
        ],
        note: "Continue with [Shuayb's story](/blog/prophet-shuayb-story), where the boundary was honesty in trade, or return to [the stories hub](/blog/stories-of-the-prophets).",
      },
    ],
    kids: {
      intro: [
        "The people of Thamud were amazing builders — they carved houses right into mountains! Allah sent them Prophet Salih, and a very special camel with one simple rule.",
      ],
      sections: [
        {
          heading: "The special camel",
          paragraphs: [
            "Allah gave them a she-camel as a sign. The rule was easy: she drinks water on her day, you drink on your day. Share, and do not hurt her.",
            "She was gentle and belonged to Allah. Hurting her would mean saying no to Allah Himself.",
          ],
        },
        {
          heading: "The broken rule",
          paragraphs: [
            "Some people got angry at the camel and the rule. They hurt her, even though Salih warned them. That was a very big mistake.",
            "Salih said: you have three days left to think. But they did not say sorry. A mighty sound came, and the people who broke the rule were gone. Salih and the kind believers were kept safe.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Think of one rule that is hard to follow when nobody is watching — like being gentle with a pet, or not taking a sibling's things. That is your camel. Keep it safe tomorrow.",
            "And remember: Allah loves people who are gentle with animals. Give water or food to a creature this week if you can.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "stories-of-the-prophets",
      "prophet-hud-story",
      "prophet-shuayb-story",
    ],
  },
  {
    slug: "prophet-lut-story",
    title: "The Story of Prophet Lut: Leaving the City That Would Not Change",
    seoTitle: "Prophet Lut Story in the Quran for Kids & Teens",
    description:
      "The Quran's story of Prophet Lut: his migration with Ibrahim, the city that refused to change, the angel guests, and the night departure that saved the believers.",
    excerpt:
      "Lut stood for goodness in a city that mocked it. When the angels came as guests and the mob came to the door, the rescue began with a journey out at night.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 6,
    keywords: [
      "prophet Lut story",
      "Lot story in Islam",
      "Lut story for kids",
      "people of Lut Quran",
    ],
    intro: [
      "Lut believed in Ibrahim when almost nobody else did, and migrated with him to the blessed land (Quran 29:26, 21:71). Then Allah sent him as a prophet to a city whose people had made wrongdoing their public culture. His story is about holding the line when the whole town crosses it.",
      "The Quran tells this story with restraint; this guide keeps that restraint, focusing on what the verses actually say, for children and for readers 13 and up.",
    ],
    sections: [
      {
        heading: "A prophet in a city that chose wrong",
        paragraphs: [
          "The Quran describes the people of Lut as committing an evil no people had done before, and adds that they robbed travellers and did wrong openly in their gatherings (7:80-81, 29:28-29). Their answer to Lut's warning was a threat: \"Bring us the punishment of Allah, if you are of the truthful\" (29:29).",
          "Lut's only weapon was the same one every prophet had: the truth, spoken plainly, and a prayer — \"My Lord, support me against the corrupting people\" (26:169).",
        ],
      },
      {
        heading: "The guests and the mob",
        paragraphs: [
          "Angels came to Lut in the form of handsome young men, on their way from Ibrahim's tent. He was distressed for them, because he knew what his town would try (11:77-78). The men of the city came rushing to his door, and Lut stood in front of his guests, offering everything he could to protect them, saying: \"Would that I had power against you, or could take refuge in a strong support\" (11:80).",
          "A prophet's distress is not weakness. He protected his guests with his own body and reputation before any miracle arrived.",
        ],
      },
      {
        heading: "\"They will not reach you\"",
        paragraphs: [
          "Then the guests revealed themselves: \"O Lut, we are messengers of your Lord. They will not reach you\" (11:81). The mob was blinded, and the command came: leave with your family in the night, and let none of you look back — except his wife, whose heart had stayed with the town (11:81, 66:10).",
          "At morning the city was overturned, and stones of layered clay rained on it (11:82-83). The Quran notes that its ruins lie on a road people still pass, morning and night: \"Then will you not use reason?\" (37:137-138).",
        ],
      },
      {
        heading: "What the story asks of us",
        paragraphs: [
          "Three lessons: protect the guest and the vulnerable even when you stand alone; a home is not just an address — staying in a place that normalises wrong can cost you your heart, as it cost Lut's wife; and when Allah opens a door out of harm, walk through it without looking back.",
        ],
        note: "Read [Ibrahim's story](/blog/prophet-ibrahim-story), the friend Lut believed in, or [the story of Nuh](/blog/prophet-nuh-story), another rescue from a people who refused.",
      },
    ],
    kids: {
      intro: [
        "Prophet Lut lived in a city where many people did bad things and thought they were fine. Lut kept saying, \"Please be good, please worship Allah\" — and one night, everything changed.",
      ],
      sections: [
        {
          heading: "The brave host",
          paragraphs: [
            "One day, special guests came to Lut's house — they were angels, but they looked like young men. The people of the city wanted to hurt the guests.",
            "Lut stood at his door and said no. He was worried and sad, but he protected his guests. Protecting guests is a big deal in Islam!",
          ],
        },
        {
          heading: "The night journey",
          paragraphs: [
            "The angels said: \"We are messengers from Allah. They cannot touch you. Take your family and leave tonight — and do not look back.\"",
            "Lut and the believers walked out into the night. Sadly, his wife stayed behind with the city. In the morning, the city that refused to be good was gone, and Lut was safe.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Practice being a good host: if someone visits, share your snack and make them feel safe and welcome. That is Lut's bravery in small form.",
            "Ask a grown-up: \"What do we do when people around us do something wrong?\" The answer starts with what Lut did: say it is wrong, kindly and clearly.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "stories-of-the-prophets",
      "prophet-ibrahim-story",
      "prophet-nuh-story",
    ],
  },
  {
    slug: "prophet-ismail-story",
    title: "The Story of Prophet Ismail: True to His Promise",
    seoTitle: "Prophet Ismail (Ishmael) Story for Kids & Teens",
    description:
      "The Quran's story of Prophet Ismail: the baby left in Makkah's valley, Zamzam, the patient son of the great test, and the builder of the Kaaba who was true to his promise.",
    excerpt:
      "Ismail was the patient son, the promised son, and the builder of the Kaaba. The Quran's title for him is one of the most beautiful: he was true to his promise.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 6,
    keywords: [
      "prophet Ismail story",
      "Ishmael story in Islam",
      "Ismail and Zamzam",
      "Ismail story for kids",
    ],
    intro: [
      "The Quran gives Ismail a title few people earn: \"Indeed, he was true to his promise, and he was a messenger and a prophet\" (19:54). He is the son of the great test, the child of the empty valley, and the co-builder of the Kaaba — and through all of it, the same quality: he kept his word.",
      "This guide tells his story from the Quran and authentic tradition, in two reading levels.",
    ],
    sections: [
      {
        heading: "The baby in the empty valley",
        paragraphs: [
          "Ibrahim brought Hajar and their infant Ismail to a barren valley — the future Makkah — and left them there by Allah's command. When Hajar asked, \"Did Allah command you to do this?\" and heard yes, she said: \"Then He will not neglect us.\"",
          "Her desperate search for water between Safa and Marwa became the sa'i every pilgrim walks, and Zamzam sprang at the baby's feet. Ismail's life began with a mother's trust and a spring that still flows.",
        ],
      },
      {
        heading: "The patient son",
        paragraphs: [
          "When Ibrahim told him of the dream — that he was sacrificing him — the boy answered: \"O my father, do as you are commanded. You will find me, if Allah wills, of the steadfast\" (Quran 37:102). Both submitted, and at the last moment Allah ransomed him with a great sacrifice (37:107).",
          "The Quran had already called him \"a forbearing boy\" (37:101). His patience was not passivity; it was trust spoken out loud at the hardest moment a son could face.",
        ],
      },
      {
        heading: "The builder of the Kaaba",
        paragraphs: [
          "Father and son raised the foundations of the House together, lifting stones and praying: \"Our Lord, accept this from us. Indeed, You are the Hearing, the Knowing\" (Quran 2:127). Ismail carried the stones; the prayer carried the work.",
          "Every Muslim who faces the Kaaba in prayer faces the building project of a father and his patient son.",
        ],
      },
      {
        heading: "True to his promise",
        paragraphs: [
          "The Quran records that he \"used to enjoin on his people prayer and zakah and was to his Lord pleasing\" (19:55), and lists him among the patient (21:85). His title — true to his promise — is the thread: he kept his word to his father, to his people, and to Allah.",
        ],
        note: "Read [Ibrahim's full story](/blog/prophet-ibrahim-story), or see how the valley he grew up in became [the Hajj journey](/blog/what-is-hajj).",
      },
    ],
    kids: {
      intro: [
        "Prophet Ismail was a baby in a desert, a very brave son, and a builder of the most special house on earth. And he always, always kept his promises.",
      ],
      sections: [
        {
          heading: "The baby and the spring",
          paragraphs: [
            "Ismail's mama, Hajar, was left in an empty valley with him, trusting Allah. When the water ran out, she ran between two hills looking for help — seven times!",
            "Then a spring of water bubbled up right near baby Ismail. That water is called Zamzam, and people still drink it today. Allah did not forget them.",
          ],
        },
        {
          heading: "The bravest answer",
          paragraphs: [
            "When Ismail grew up, his father told him about a very hard dream from Allah. Ismail said: \"Father, do what Allah asks. You will find me patient, if Allah wills.\"",
            "Because they both trusted Allah, Allah saved Ismail and gave them a great gift instead. We remember it every Eid al-Adha.",
          ],
        },
        {
          heading: "Building the Kaaba",
          paragraphs: [
            "Ismail and his father built the Kaaba together — stone by stone, saying, \"Allah, please accept this from us.\" When you pray, you face their building!",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Make one small promise tomorrow — like \"I will tidy my toys after playing\" — and keep it no matter what. That is Ismail's superpower: true to his promise.",
            "Ask a grown-up to show you a picture of the Kaaba and find the corner where the builders stood.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "stories-of-the-prophets",
      "prophet-ibrahim-story",
      "what-is-hajj",
    ],
  },
  {
    slug: "prophet-ishaq-story",
    title: "The Story of Prophet Ishaq: The Gift That Made Sarah Laugh",
    seoTitle: "Prophet Ishaq (Isaac) Story for Kids & Teens",
    description:
      "The Quran's story of Prophet Ishaq: the angels' good news to Ibrahim and Sarah in old age, the blessed son, and the father of Yaqub's line of prophets.",
    excerpt:
      "Ishaq was the son promised to parents who thought it was impossible. His birth made Sarah laugh, and his line carried prophethood for generations.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 5,
    keywords: [
      "prophet Ishaq story",
      "Isaac story in Islam",
      "Ishaq story for kids",
      "Ibrahim and Sarah son",
    ],
    intro: [
      "Ishaq's story begins with laughter. Angels came to Ibrahim with good news, and his wife Sarah — old, and never able to have children — laughed in astonishment. The answer she received is one of the Quran's gentlest lines: \"Do you wonder at the decree of Allah?\" (11:73). The gift was Ishaq.",
      "This guide tells his story in two reading levels, from the Quran's own words.",
    ],
    sections: [
      {
        heading: "The guests and the good news",
        paragraphs: [
          "The same angels who would later visit Lut stopped at Ibrahim's tent. They brought two pieces of news: the coming destruction of Lut's city, and a son for Ibrahim and Sarah. \"She said, 'Woe to me! Shall I give birth while I am an old woman and this, my husband, is an old man? Indeed, this is an amazing thing!'\" (Quran 11:72).",
          "The angels answered: \"The mercy of Allah and His blessings upon you, O people of the house. Indeed, He is Praiseworthy and Glorious\" (11:73). What looks impossible to us is ordinary for the One who says \"Be\".",
        ],
      },
      {
        heading: "The blessed son",
        paragraphs: [
          "The Quran calls Ishaq \"a prophet from among the righteous\" (37:112) and says Allah blessed him and his father (37:113). When Ibrahim left his people for Allah's sake, the gift was a whole family of prophets: \"We gave him Isaac and Jacob, and each We made a prophet\" (19:49).",
          "Ishaq's line — through his son Yaqub, also called Israel — carried prophethood for generations: Yusuf, Musa, Harun, Dawud, Sulaiman, Zakariya, Yahya and Isa all descend from it.",
        ],
      },
      {
        heading: "What the story asks of us",
        paragraphs: [
          "Ishaq's life teaches that Allah's gifts arrive on Allah's schedule, not ours; that a du'a made in youth can be answered in old age; and that the best inheritance a parent leaves is not wealth but faith — the inheritance Ishaq passed down a line of prophets.",
        ],
        note: "Continue with [Yaqub's story](/blog/prophet-yaqub-story), Ishaq's son, or [Yusuf's story](/blog/prophet-yusuf-story), the jewel of that family line.",
      },
    ],
    kids: {
      intro: [
        "Prophet Ishaq was a baby surprise! His mama and papa were very old and thought they would never have a child. Then Allah sent angels with the best news ever.",
      ],
      sections: [
        {
          heading: "The laughing mama",
          paragraphs: [
            "Ishaq's mama, Sarah, heard the news and laughed: \"Me? A baby? But I am so old!\" The angels said: \"Allah can do anything. It is easy for Him!\"",
            "And it happened. Baby Ishaq arrived, and the house that was quiet was full of joy.",
          ],
        },
        {
          heading: "The family of prophets",
          paragraphs: [
            "Ishaq grew up to be a prophet, just like his papa Ibrahim. And his son Yaqub became a prophet too! Their family became a long, beautiful line of prophets — like a tree with many shining branches.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Ask a grown-up about something they waited a very long time for and finally got. Good gifts sometimes come late — Allah's timing is always right.",
            "Then say alhamdulillah for your family, the gift you already have.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "stories-of-the-prophets",
      "prophet-yaqub-story",
      "prophet-ibrahim-story",
    ],
  },
  {
    slug: "prophet-yaqub-story",
    title: "The Story of Prophet Yaqub: Beautiful Patience",
    seoTitle: "Prophet Yaqub (Jacob) Story for Kids & Teens",
    description:
      "The Quran's story of Prophet Yaqub: the father of Yusuf, his beautiful patience through years of grief, and the shirt that healed his eyes and reunited his family.",
    excerpt:
      "Yaqub lost his beloved son for years and said, 'Beautiful patience.' He complained of his grief only to Allah — and in the end, his eyes and his family were both restored.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 6,
    keywords: [
      "prophet Yaqub story",
      "Jacob story in Islam",
      "Yaqub beautiful patience",
      "Yusuf father story",
    ],
    intro: [
      "Yaqub — also called Israel, the father of the twelve tribes — is the Quran's picture of grief that never loses trust. He knew his sons had wronged Yusuf, he wept until his eyes turned white with sorrow, and still his answer was: \"Beautiful patience; Allah is the one whose help is sought\" (Quran 12:18, 12:83).",
      "This guide tells his side of the best of stories, in two reading levels.",
    ],
    sections: [
      {
        heading: "The father who saw through the lie",
        paragraphs: [
          "When the brothers brought Yusuf's shirt with false blood, Yaqub did not believe the wolf story: \"Rather, your souls have enticed you to something. So patience is most fitting\" (12:18). He saw the lie, named it gently, and refused to despair.",
          "Years later, when the brothers returned with a second story about Benjamin, his answer was the same: \"Beautiful patience. Perhaps Allah will bring them all back to me\" (12:83).",
        ],
      },
      {
        heading: "Grief spoken only to Allah",
        paragraphs: [
          "When his sons told him to stop remembering Yusuf, Yaqub answered with one of the most honest lines in the Quran: \"I only complain of my suffering and my grief to Allah, and I know from Allah that which you do not know\" (12:86).",
          "He did not pretend the pain was small. He wept until his eyes whitened (12:84). But he took the pain to Allah, not to blame, and he kept hoping against the evidence.",
        ],
      },
      {
        heading: "The shirt that healed",
        paragraphs: [
          "When Yusuf finally revealed himself in Egypt, he sent his own shirt with a message: cast it over my father's face and he will see. The moment the bearer of good news arrived, Yaqub said: \"Did I not tell you that I know from Allah that which you do not know?\" (12:94-96). His sight returned, and the family came together.",
          "The dream Yusuf had as a boy — the sun and moon prostrating — came true in the reunion of a father who never stopped trusting.",
        ],
      },
      {
        heading: "The last advice",
        paragraphs: [
          "At the end of his life, Yaqub asked his sons what they would worship after him, and heard the answer he wanted: your God and the God of your fathers, Ibrahim, Ismail and Ishaq — one God, and to Him we submit (2:133). His final inheritance was the same as his first: tawhid.",
        ],
        note: "Read [Yusuf's full story](/blog/prophet-yusuf-story) to see the other half of this reunion, or [how to make du'a](/blog/how-to-make-dua) the way Yaqub did.",
      },
    ],
    kids: {
      intro: [
        "Prophet Yaqub was Yusuf's daddy. When Yusuf disappeared, Yaqub was very, very sad — but he never stopped trusting Allah. This is the story of the most patient dad.",
      ],
      sections: [
        {
          heading: "The sad daddy",
          paragraphs: [
            "Yaqub's sons told him a wolf ate Yusuf. But Yaqub knew the story was not true. He cried and cried, but he said: \"Beautiful patience. Allah will help me.\"",
            "He told Allah about his sadness — not anger, not blame. Just: \"Allah, my heart hurts, and I trust You.\"",
          ],
        },
        {
          heading: "The happy surprise",
          paragraphs: [
            "Years later, good news came: Yusuf is alive! He is a big leader in Egypt! Yaqub said, \"I told you Allah knows things we do not.\"",
            "Yusuf sent his shirt, and when it touched Yaqub's face, his eyes could see again! The whole family hugged and came together. The sad years ended with a big, happy family.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Next time you are sad, try Yaqub's way: tell Allah about it in your own words, like talking to the One who loves you most.",
            "Then give the person you love most a big hug. Families are Allah's gift — Yaqub waited years to get his back.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "stories-of-the-prophets",
      "prophet-yusuf-story",
      "prophet-ishaq-story",
    ],
  },
  {
    slug: "prophet-ayyub-story",
    title: "The Story of Prophet Ayyub (Job): Patience Rewarded",
    seoTitle: "Prophet Ayyub (Job) Story for Kids & Teens",
    description:
      "The Quran's story of Prophet Ayyub: wealth, health and family lost, a prayer of perfect manners, and the answer that restored everything. The prophet of patience.",
    excerpt:
      "Ayyub lost everything and never complained about Allah — only to Him. His one-sentence prayer is a masterclass in how to ask when you are broken.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 6,
    keywords: [
      "prophet Ayyub story",
      "Job story in Islam",
      "Ayyub patience story",
      "Ayyub story for kids",
    ],
    intro: [
      "Ayyub had everything: wealth, children, health, and a grateful heart. Then the test came, and everything was taken — and the Quran's record of his response is one sentence that Muslims have been repeating in hardship ever since: \"Indeed, adversity has touched me, and You are the Most Merciful of the merciful\" (Quran 21:83).",
      "This guide tells his story in two reading levels, from the Quran's own words.",
    ],
    sections: [
      {
        heading: "The test that took everything",
        paragraphs: [
          "The Quran does not list Ayyub's losses in detail; it tells us the shape of them through his prayer and his title. Islamic tradition describes years of illness, the loss of his wealth and children, and people drifting away — while his heart stayed attached to Allah.",
          "What the Quran records is the quality: he is named among the patient (21:85), and Surah Sad calls him \"an excellent servant; indeed, he was one who repeatedly turned back\" (38:44). The test took everything except his turning.",
        ],
      },
      {
        heading: "The prayer with perfect manners",
        paragraphs: [
          "When he finally spoke, he did not demand, accuse, or ask why. He described his state — \"adversity has touched me\" — and praised Allah — \"You are the Most Merciful of the merciful\" (21:83). The request is hidden inside the praise; the complaint is wrapped in trust.",
          "This is why scholars call it the most beautiful du'a in the Quran: it asks without accusing, and it trusts before it receives.",
        ],
      },
      {
        heading: "The answer",
        paragraphs: [
          "\"So We responded to him and removed what afflicted him of adversity. And We gave him back his family and the like thereof with them, as mercy from Us and a reminder for the worshippers\" (21:84). In Surah Sad, the answer includes a command: strike the ground with your foot — and a cool spring appeared for him to wash in and drink (38:42).",
          "The restoration was not just the old life returned; it was doubled, and it was recorded as \"a reminder for the worshippers\" — meaning the story exists for you, on your hardest day.",
        ],
      },
      {
        heading: "What the story asks of us",
        paragraphs: [
          "Patience is not pretending the pain is gone. Ayyub felt it, named it, and took it to Allah with manners. The lesson is the sentence itself: describe your hardship honestly, praise Allah sincerely, and leave the timing to Him.",
        ],
        note: "Learn the full etiquette of asking in [our du'a guide](/blog/how-to-make-dua), or read [Yunus's prayer](/blog/prophet-yunus-story), the other great prayer from darkness.",
      },
    ],
    kids: {
      intro: [
        "Prophet Ayyub had a happy life — then very hard things happened, one after another. But his heart stayed soft and trusting. He is the champion of patience.",
      ],
      sections: [
        {
          heading: "When everything went wrong",
          paragraphs: [
            "Ayyub got very sick. His money went away. Hard times came like waves. People felt sorry for him, but Ayyub never said angry words about Allah.",
            "He kept remembering Allah and saying thank you, even on the hard days. That is the hardest kind of brave.",
          ],
        },
        {
          heading: "The beautiful du'a",
          paragraphs: [
            "One day Ayyub said a small, beautiful prayer: \"Allah, hard things have touched me — and You are the kindest of the kind.\"",
            "He did not shout or blame. He just told Allah the truth and praised Him. And Allah answered! His sickness went away, his family came back, and everything good returned — even more than before.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Learn Ayyub's du'a in your own words: \"Allah, this is hard, and You are the kindest.\" Say it next time something feels too big.",
            "Then tell a grown-up one hard thing you went through that got better. Hard things do end — Ayyub is the proof.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "stories-of-the-prophets",
      "how-to-make-dua",
      "prophet-yunus-story",
    ],
  },
  {
    slug: "prophet-shuayb-story",
    title: "The Story of Prophet Shuayb: Honesty in the Marketplace",
    seoTitle: "Prophet Shuayb Story for Kids & Teens",
    description:
      "The Quran's story of Prophet Shuayb and the people of Madyan: cheating in weights and measures, the prophet of fair trade, and the reformer who said 'my success is only through Allah'.",
    excerpt:
      "Shuayb's people cheated in the marketplace and thought it was clever. His message: give full measure, stop stealing from people, and reform — not profit — is the goal.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 6,
    keywords: [
      "prophet Shuayb story",
      "Shuayb Madyan story",
      "honesty in trade Islam",
      "Shuayb story for kids",
    ],
    intro: [
      "Not every prophet's battle was against idols. Shuayb's battle was against the scale: his people, the traders of Madyan, had made cheating a business model. He is the prophet of honest trade, and his story is the Quran's clearest statement that faith includes how you sell.",
      "Two reading levels below, from the Quran's own account.",
    ],
    sections: [
      {
        heading: "The marketplace that stole",
        paragraphs: [
          "Madyan were prosperous traders with two habits: they gave short weight and measure, and they sat on the roads threatening travellers and taking what they could (7:85-86, 11:84-85). Their sin was not ignorance; it was a system.",
          "Shuayb's message tied worship to commerce: \"O my people, worship Allah... and do not decrease from the measure and the scale. Indeed, I see you in prosperity, but indeed, I fear for you the punishment of an all-encompassing Day\" (11:84).",
        ],
      },
      {
        heading: "\"Give full measure\"",
        paragraphs: [
          "His command was concrete: \"Give full measure and weight, and do not deprive people of their things, and do not commit abuse on the earth, spreading corruption\" (7:85). And the principle behind it: \"What remains from Allah is better for you, if you would be believers\" (11:86) — a little that is lawful beats a lot that is stolen.",
          "When they mocked him — \"Does your prayer command you that we leave what our fathers worshipped, or leave doing with our wealth what we please?\" (11:87) — he answered with the sentence every reformer should memorise: \"I only intend reform as far as I am able. My success is not except through Allah. Upon Him I have relied, and to Him I return\" (11:88).",
        ],
      },
      {
        heading: "The end of the cheaters",
        paragraphs: [
          "They demanded a piece of the sky fall on them if he was truthful (26:187). The answer came as the punishment of the day of the overshadowing cloud — a blast that took them, and they lay lifeless in their homes (7:91, 26:189, 11:94-95).",
          "Shuayb turned away from the ruins with a heavy heart: \"O my people, I had certainly conveyed to you the messages of my Lord and advised you, so how could I grieve over a disbelieving people?\" (7:93). Even the prophet of justice grieved for the unjust.",
        ],
      },
      {
        heading: "What the story asks of us",
        paragraphs: [
          "Faith is not only in the prayer mat; it is in the scale, the invoice, the exam, the promise. Give full measure — of goods, of effort, of truth. And when you try to fix something, say Shuayb's sentence: reform is my intention, success is Allah's gift.",
        ],
        note: "Read [halal and haram in food and trade](/blog/halal-and-haram-food), or continue with [Musa's story](/blog/prophet-musa-story) — Musa later found refuge in Madyan itself.",
      },
    ],
    kids: {
      intro: [
        "Prophet Shuayb lived in a town of shopkeepers. Some of them were tricky: they gave people less than they paid for. Shuayb taught them that Allah loves an honest scale.",
      ],
      sections: [
        {
          heading: "The tricky scales",
          paragraphs: [
            "In Madyan, some sellers made their scales lie: you pay for a full bag, but the bag is only half full. They thought nobody would notice.",
            "Shuayb said: \"Allah notices. Give people exactly what they paid for. Be honest, and Allah will bless what you have.\"",
          ],
        },
        {
          heading: "The kind reformer",
          paragraphs: [
            "The traders laughed at him. Shuayb did not get angry. He said: \"I only want to fix things. Allah is the One who helps me.\"",
            "But the cheaters would not stop, and a mighty punishment came. Shuayb and the honest people were kept safe. Even then, Shuayb felt sad for them — he had wanted them to change, not to be hurt.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Play shopkeeper with a grown-up: count out snacks or coins exactly, no sneaky extras or missing pieces. Full measure, like Shuayb asked.",
            "Remember: being honest when nobody is watching is a kind of worship too.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "stories-of-the-prophets",
      "halal-and-haram-food",
      "prophet-musa-story",
    ],
  },
  {
    slug: "prophet-musa-story",
    title: "The Story of Prophet Musa (Moses): The Sea Opened",
    seoTitle: "Prophet Musa (Moses) Story for Kids & Teens",
    description:
      "The Quran's story of Prophet Musa: the basket on the Nile, the fire at Tuwa, standing before Pharaoh, the parting sea, and the certainty that said 'my Lord is with me'.",
    excerpt:
      "From a basket on the Nile to the edge of the sea, Musa's life is the Quran's longest story — and its clearest picture of trust when there is no visible way out.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 8,
    keywords: [
      "prophet Musa story",
      "Moses story in Islam",
      "Musa and Pharaoh",
      "Musa parting the sea",
      "Musa story for kids",
    ],
    intro: [
      "Musa is the most-mentioned prophet in the Quran, and his story has everything: a baby in a basket, a palace, a desert, a burning bush, a tyrant, a sea that opens, and a people who keep forgetting. At its centre is one sentence: \"Indeed, with me is my Lord; He will guide me\" (Quran 26:62).",
      "This guide follows his life in two reading levels, with the verse references in the deeper one.",
    ],
    sections: [
      {
        heading: "The basket on the Nile",
        paragraphs: [
          "Pharaoh was slaughtering the newborn sons of the Children of Israel. Allah inspired Musa's mother: nurse him, and when you fear for him, cast him into the river — \"We will return him to you and make him one of the messengers\" (28:7). The basket floated into Pharaoh's own palace, and by Allah's plan, Musa was returned to his own mother to nurse him (20:40, 28:12-13).",
          "The tyrant's house became the nursery of the prophet who would end his tyranny. The Quran's comment: \"And I brought you up under My eye\" (20:39).",
        ],
      },
      {
        heading: "The fire at Tuwa",
        paragraphs: [
          "Years later, a fugitive in Madyan, Musa saw a fire on the side of the mount and went to bring a brand. There Allah called him: \"Indeed, I am Allah, Lord of the worlds\" (28:30). His staff became a serpent; his hand shone white; and the mission was named: go to Pharaoh, \"indeed, he has transgressed\", and speak to him gently (20:24, 20:43-44).",
          "Musa asked for help — his brother Harun, the eloquent one — and for his own chest to be opened and his task made easy (20:25-32). Even prophets ask for support.",
        ],
      },
      {
        heading: "Before Pharaoh",
        paragraphs: [
          "Musa and Harun stood before the most powerful man on earth with a staff and the truth. Pharaoh's magicians threw their ropes and staffs, and Musa's staff swallowed what they made — and the magicians, who knew the difference between tricks and reality, fell in prostration and believed (7:115-122, 20:66-70). Pharaoh threatened them; they answered that they would never prefer him over the clear proofs (20:72).",
          "The confrontation ended with the exodus: Musa led his people out by night, pursued by Pharaoh's army.",
        ],
      },
      {
        heading: "The sea opened",
        paragraphs: [
          "Trapped between the sea and the army, the people cried: \"Indeed, we are to be overtaken!\" Musa answered: \"No! Indeed, with me is my Lord; He will guide me\" (26:61-62). Then the command: strike the sea with your staff — and it parted, each side like a towering mountain (26:63).",
          "The believers crossed; Pharaoh followed, and the sea closed over him. At the last moment he claimed belief, but it was the belief of a drowning man, not a choosing heart (10:90-91). The lesson is not that the sea always opens — it is that certainty does not wait to see the exit.",
        ],
      },
      {
        heading: "After the miracle: the harder part",
        paragraphs: [
          "The rest of Musa's story is the harder miracle: leading a people who had seen the sea open and still made a golden calf when he was away forty nights (7:142-152, 20:85-97). He returned angry and grieved, and Harun explained he had nearly been overpowered trying to stop them (7:150).",
          "Musa's life teaches that the sea opens once, but patience with people is a daily miracle. He kept leading, kept asking forgiveness for his people, and kept returning to Allah.",
        ],
        note: "Read [Harun's story](/blog/prophet-harun-story), the brother who stood beside him, or [the story of Yusuf](/blog/prophet-yusuf-story), another life saved from water.",
      },
    ],
    kids: {
      intro: [
        "Prophet Musa's story is the biggest adventure in the Quran: a baby in a basket, a glowing fire, a mean king, and a sea that opens like two giant walls of water!",
      ],
      sections: [
        {
          heading: "The baby in the basket",
          paragraphs: [
            "A mean king called Pharaoh was hurting babies. Musa's mama was scared, so Allah told her: put him in a basket on the river. \"We will bring him back to you.\"",
            "The basket floated right into Pharaoh's palace! And guess who got to nurse baby Musa? His own mama. Allah's plan is amazing.",
          ],
        },
        {
          heading: "The talking fire",
          paragraphs: [
            "When Musa grew up, he saw a fire on a mountain at night. But it was not an ordinary fire — Allah spoke to him there! \"I am Allah. Go tell Pharaoh to be good, and speak to him gently.\"",
            "Musa asked for his brother Harun to help him. Allah said yes. Even prophets ask for help!",
          ],
        },
        {
          heading: "The sea that opened",
          paragraphs: [
            "Musa led his people away from Pharaoh, but the army chased them to the sea. Everyone cried, \"We are trapped!\" Musa said: \"No! My Lord is with me. He will guide me.\"",
            "Allah told Musa to tap the sea with his staff — WHOOSH! The water stood up like two mountains, and a dry road appeared in the middle. The people walked through safely. Pharaoh tried to follow, and the sea closed. Musa's trust was bigger than his fear.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Next time you feel stuck — like a hard puzzle or a scary day — say Musa's words: \"My Lord is with me. He will guide me.\" Then take one small step.",
            "Draw the sea as two big walls with a path in the middle, and write the words under it.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "stories-of-the-prophets",
      "prophet-harun-story",
      "prophet-yusuf-story",
    ],
  },
  {
    slug: "prophet-harun-story",
    title: "The Story of Prophet Harun: The Brother Who Stood Beside",
    seoTitle: "Prophet Harun (Aaron) Story for Kids & Teens",
    description:
      "The Quran's story of Prophet Harun: Musa's eloquent brother, his prayer answered before he asked, and his stand against the golden calf when the crowd turned.",
    excerpt:
      "Harun is the prophet of support: the brother Musa asked for, the voice beside the message, and the man who stood against a whole crowd doing wrong.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 5,
    keywords: [
      "prophet Harun story",
      "Aaron story in Islam",
      "Harun and Musa",
      "Harun story for kids",
    ],
    intro: [
      "Some prophets lead; some stand beside the leader and make the mission possible. Harun is the second kind — and the Quran honours him with the same peace it gives Musa: \"Peace upon Moses and Aaron\" (37:120). His story is about the courage of support.",
      "Two reading levels below, from the Quran's account.",
    ],
    sections: [
      {
        heading: "The prayer answered before it was finished",
        paragraphs: [
          "At the burning fire, Musa asked for his task to be made easier and for his brother: \"Appoint for me a minister from my family — Aaron, my brother. Increase through him my strength\" (20:29-32). Allah answered: \"You have been granted your request, O Musa\" (20:36), and gave Harun prophethood out of mercy (19:53).",
          "Harun was eloquent where Musa felt his tongue was tied. The mission needed both: the message and the voice that could carry it to a tyrant's court.",
        ],
      },
      {
        heading: "The stand against the calf",
        paragraphs: [
          "When Musa went to the mount for forty nights, the people made a golden calf and worshipped it. Harun had warned them before: \"O my people, you are only being tested by it, and indeed, your Lord is the Most Merciful, so follow me and obey my order\" (20:90). They answered: we will not stop until Musa returns (20:91).",
          "He nearly was overpowered, and he refused to split the community by force (7:150, 20:94). When Musa returned angry and seized him by the head and beard, Harun's answer was gentle and clear: \"Son of my mother, do not seize me... I feared that you would say, 'You caused division among the Children of Israel'\" (20:94).",
        ],
      },
      {
        heading: "What the story asks of us",
        paragraphs: [
          "Being the support is not a lesser role: Musa's du'a was answered by Harun's presence. Stand beside the person doing right, speak when they cannot, hold the line when the crowd turns — and when you are misunderstood, answer with gentleness, as Harun did.",
        ],
        note: "Read [Musa's full story](/blog/prophet-musa-story) to see the mission they shared, or [the stories hub](/blog/stories-of-the-prophets).",
      },
    ],
    kids: {
      intro: [
        "Every hero needs a helper. Prophet Harun was Musa's big brother and his best helper — and Allah made him a prophet too!",
      ],
      sections: [
        {
          heading: "The brother who was asked for",
          paragraphs: [
            "When Allah gave Musa a big, scary job, Musa asked: \"Can my brother Harun help me? He speaks really well.\" Allah said: \"Yes! You get your wish.\"",
            "So Harun stood right beside Musa in front of the mean king. Two brothers, one brave team.",
          ],
        },
        {
          heading: "Standing up to the crowd",
          paragraphs: [
            "While Musa was away, the people made a golden cow statue and started worshipping it. Harun said: \"Stop! This is a test! Follow Allah!\" But the crowd would not listen.",
            "Harun did not give up and did not fight them. He kept saying the truth until Musa came back. Standing up to a whole crowd is very brave — that was Harun.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Be a Harun this week: help someone do something good — a sibling's homework, a friend who is nervous. Stand beside them.",
            "And if people around you do something wrong, say it kindly, like Harun did. You do not have to shout to be brave.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "stories-of-the-prophets",
      "prophet-musa-story",
      "islamic-manners-for-kids",
    ],
  },
  {
    slug: "prophet-dawud-story",
    title: "The Story of Prophet Dawud (David): The Voice the Mountains Joined",
    seoTitle: "Prophet Dawud (David) Story for Kids & Teens",
    description:
      "The Quran's story of Prophet Dawud: the young shepherd who faced Jalut, the king-prophet whose praise the mountains and birds joined, and the softened iron.",
    excerpt:
      "Dawud faced a giant with a sling, ruled with justice, and sang praise so beautiful that the mountains and birds joined him. His story is about strength used for worship.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 6,
    keywords: [
      "prophet Dawud story",
      "David story in Islam",
      "Dawud and Jalut",
      "Dawud story for kids",
    ],
    intro: [
      "Dawud entered the story as a young man in an army facing a giant, and left it as a king-prophet whose voice the mountains echoed. The Quran gives him three gifts: victory, justice, and a praise so beautiful that creation joined it (21:79).",
      "This guide tells his story in two reading levels, from the Quran's own words.",
    ],
    sections: [
      {
        heading: "The young man and the giant",
        paragraphs: [
          "The army of the believers, led by Talut (Saul), was tested at a river and reduced to a small, patient group. Against them stood Jalut (Goliath) and his forces. Then \"David killed Goliath, and Allah gave him the kingship and wisdom and taught him from that which He willed\" (2:251).",
          "The Quran's point is the pattern: \"If Allah did not check one set of people by means of another, the earth would indeed be full of mischief\" (2:251). Courage in a small group is how corruption is stopped.",
        ],
      },
      {
        heading: "The voice the mountains joined",
        paragraphs: [
          "Allah says: \"We subjected the mountains to exalt Us along with David, and also the birds\" (21:79, 34:10, 38:18-19). When Dawud praised Allah, the mountains and birds praised with him. The Prophet Muhammad later said the most beloved fasting to Allah is the fasting of Dawud — he fasted alternate days — and the most beloved prayer is his: he slept half the night, prayed a third, and slept a sixth (Sahih al-Bukhari and Muslim).",
          "His worship was not occasional intensity; it was a rhythm kept for a lifetime.",
        ],
      },
      {
        heading: "The king who worked with his hands",
        paragraphs: [
          "Allah softened iron for him and taught him to make coats of armour: \"Make coats of armour, and balance the links... and do righteousness, for I am Seeing of what you do\" (34:10-11). A king who forged his own armour — and was told that even his craft is watched by Allah.",
          "He was also a just judge; the Quran records a case about a field overrun by sheep where both Dawud and Sulaiman judged, and Allah gave understanding to the son (21:78-79). Justice ran in the family.",
        ],
      },
      {
        heading: "What the story asks of us",
        paragraphs: [
          "Strength is for worship and protection, not display. Work with your hands honestly. Keep a rhythm of worship you can sustain for decades, not days. And when you are given authority — over a team, a classroom, a family — judge fairly, because Allah is Seeing of what you do.",
        ],
        note: "Continue with [Sulaiman's story](/blog/prophet-sulaiman-story), the son who inherited the kingdom and the wisdom, or [the stories hub](/blog/stories-of-the-prophets).",
      },
    ],
    kids: {
      intro: [
        "Prophet Dawud was a brave young man who faced a giant, a kind king, and the best singer ever — so good that the mountains and birds sang along with him!",
      ],
      sections: [
        {
          heading: "The brave young man",
          paragraphs: [
            "A big, scary fighter called Jalut was frightening everyone. Young Dawud stepped forward with his sling and his trust in Allah — and won! Allah gave him wisdom and made him a king.",
            "You do not have to be the biggest to be the bravest. You just have to trust Allah.",
          ],
        },
        {
          heading: "The singing mountains",
          paragraphs: [
            "When Dawud praised Allah, something amazing happened: the mountains praised with him, and the birds too! Imagine the whole world joining your song.",
            "He also made strong armour with his own hands, and he fasted every other day — a gentle, steady rhythm he kept his whole life.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Say alhamdulillah out loud tonight, and imagine the birds and mountains saying it with you. That is Dawud's song.",
            "Then make something useful with your hands — a drawing, a card, a tidy shelf — and do it well, because Allah sees what we make.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "stories-of-the-prophets",
      "prophet-sulaiman-story",
      "how-to-pray-salah",
    ],
  },
  {
    slug: "prophet-sulaiman-story",
    title: "The Story of Prophet Sulaiman (Solomon): Power That Stayed Grateful",
    seoTitle: "Prophet Sulaiman (Solomon) Story for Kids & Teens",
    description:
      "The Quran's story of Prophet Sulaiman: the wind and the jinn, the valley of ants, the hoopoe and the Queen of Sheba, and the king who said 'this is by the grace of my Lord'.",
    excerpt:
      "Sulaiman had everything a king could want — wind, jinn, treasure, a talking bird. His story is about what he said when he saw it all: 'This is by the grace of my Lord.'",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 7,
    keywords: [
      "prophet Sulaiman story",
      "Solomon story in Islam",
      "Sulaiman and the ants",
      "Sulaiman and Queen of Sheba",
      "Sulaiman story for kids",
    ],
    intro: [
      "Sulaiman inherited his father Dawud's kingdom and received gifts no king before or after him was given: the wind, the jinn, the speech of birds and ants (Quran 38:30-36, 27:16). The Quran's interest is not in the power — it is in what the power did to his heart. And the answer is: nothing, except gratitude.",
      "This guide tells his story in two reading levels, from Surah an-Naml and the Quran's other accounts.",
    ],
    sections: [
      {
        heading: "The valley of the ants",
        paragraphs: [
          "Marching with his enormous army of men, jinn and birds, Sulaiman came to a valley of ants. An ant called out: \"O ants, enter your dwellings, lest Solomon and his soldiers crush you while they perceive not\" (27:18).",
          "Sulaiman heard it — and smiled, laughing at her words. Then he prayed: \"My Lord, enable me to be grateful for Your favour which You have bestowed upon me and upon my parents, and to do righteousness of which You approve\" (27:19). The most powerful king on earth stopped to pray because an ant asked her people to be careful.",
        ],
      },
      {
        heading: "The hoopoe and the queen",
        paragraphs: [
          "Reviewing his birds, Sulaiman noticed the hoopoe missing and demanded an explanation. The bird returned with news: a queen ruling a people who prostrated to the sun instead of Allah (27:20-26). Sulaiman sent a letter — not an invasion — beginning with Bismillah and ending with an invitation: come to me in submission (27:29-31).",
          "The queen — Bilqis, in tradition — consulted her chiefs, sent gifts to test him, and came herself. Sulaiman had her throne brought before her arrival and asked: is your throne like this? She answered with intelligence: \"It is as if it were the same\" (27:42).",
        ],
      },
      {
        heading: "The glass floor and the belief",
        paragraphs: [
          "She was invited into a palace whose floor was glass over water. Thinking it water, she lifted her garment — and Sulaiman explained it was glass. The moment was a gentle unveiling: what she had worshipped, the sun, was a created thing; the Creator was inviting her. \"She said, 'My Lord, indeed I have wronged myself, and I submit with Solomon to Allah, Lord of the worlds'\" (27:44).",
          "The greatest victory in the story is not a conquest. It is one person's heart turning, achieved with letters, gifts refused, and a glass floor — not a sword.",
        ],
      },
      {
        heading: "\"This is by the grace of my Lord\"",
        paragraphs: [
          "When the throne arrived before him, Sulaiman's recorded sentence is the thesis of his life: \"This is by the grace of my Lord, to test me whether I will be grateful or ungrateful. And whoever is grateful — his gratitude is only for himself\" (27:40).",
          "He asked to be kept among the righteous, and the Quran calls him \"an excellent servant; indeed, he was one who repeatedly turned back\" (38:30). Power tested him, and he passed by staying small before Allah.",
        ],
        note: "Read [Dawud's story](/blog/prophet-dawud-story), the father he inherited from, or [the names of Allah](/blog/names-of-allah) he praised.",
      },
    ],
    kids: {
      intro: [
        "Prophet Sulaiman was a king with amazing gifts: he could understand birds and ants, and even the wind obeyed him! But the most amazing thing about him was his thankfulness.",
      ],
      sections: [
        {
          heading: "The little ant",
          paragraphs: [
            "One day Sulaiman's giant army came near an ant valley. A tiny ant shouted: \"Quick, everyone inside! Sulaiman's army might step on us without noticing!\"",
            "Sulaiman heard her and smiled. He did not say, \"I am too big to care about ants.\" He stopped and prayed: \"Allah, help me say thank you for all my gifts.\" The biggest king listened to the smallest creature.",
          ],
        },
        {
          heading: "The bird with big news",
          paragraphs: [
            "Sulaiman's hoopoe bird flew far away and came back with news: a queen whose people worship the sun! Sulaiman sent her a kind letter inviting her to Allah.",
            "The queen came, saw amazing things, and chose to believe in Allah. Sulaiman won a heart without fighting — that is the best kind of win.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Look at something tiny tomorrow — an ant, a seed, a beetle — and remember: Allah made it, and Sulaiman cared about it. Be gentle with small things.",
            "Then say Sulaiman's thank-you: \"Allah, help me be grateful for Your gifts.\" Name three gifts out loud.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "stories-of-the-prophets",
      "prophet-dawud-story",
      "names-of-allah",
    ],
  },
  {
    slug: "prophet-ilyas-story",
    title: "The Story of Prophet Ilyas (Elijah): Against the Idol Called Baal",
    seoTitle: "Prophet Ilyas (Elijah) Story for Kids & Teens",
    description:
      "The Quran's story of Prophet Ilyas: his call to a people who worshipped Baal, the question 'do you leave the best of creators?', and the peace Allah left for him.",
    excerpt:
      "Ilyas asked his people one question: why call on Baal and leave the best of creators? They denied him — but Allah left his name in peace among later generations.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 5,
    keywords: [
      "prophet Ilyas story",
      "Elijah story in Islam",
      "Ilyas and Baal",
      "Ilyas story for kids",
    ],
    intro: [
      "Ilyas's story in the Quran is short and sharp: a prophet, a people attached to an idol named Baal, and one unforgettable question — \"Do you call upon Baal and leave the best of creators?\" (Quran 37:125). The answer of his people was denial; the answer of Allah was peace upon his name forever.",
      "Two reading levels below, from Surah as-Saffat and Surah al-An'am.",
    ],
    sections: [
      {
        heading: "The question that exposes every idol",
        paragraphs: [
          "Ilyas said to his people: \"Will you not fear Allah? Do you call upon Baal and leave the best of creators — Allah, your Lord and the Lord of your first forefathers?\" (37:124-126). Baal was a statue of a fertility god the town had inherited; Ilyas's question put the choice plainly: the made thing, or the Maker?",
          "The Quran lists him among those given guidance and favour: \"And Zakariya and John and Jesus and Elias — all were of the righteous\" (6:85).",
        ],
      },
      {
        heading: "Denial, and the honour that followed",
        paragraphs: [
          "\"And they denied him, so indeed, they will be brought for punishment — except the chosen servants of Allah\" (37:127-128). The Quran does not narrate the punishment's details; it narrates the honour: \"And We left for him favourable mention among later generations: peace upon Elias. Indeed, We thus reward the doers of good. Indeed, he was of Our believing servants\" (37:129-132).",
          "His town rejected him; history, written by Allah, kept his name in peace. That is the trade every sincere caller accepts.",
        ],
      },
      {
        heading: "What the story asks of us",
        paragraphs: [
          "Every age has its Baal: something made that people treat as the Maker — money, fame, a screen, a trend. Ilyas's question still works: does this thing create, hear, and provide — or was it made? Worship the best of creators, and let the made things stay made.",
        ],
        note: "Continue with [Al-Yasa's story](/blog/prophet-al-yasa-story), the prophet who carried on his work, or [the stories hub](/blog/stories-of-the-prophets).",
      },
    ],
    kids: {
      intro: [
        "Prophet Ilyas lived in a town that prayed to a statue called Baal. He asked them one big question: \"Why ask a statue for help when Allah made everything?\"",
      ],
      sections: [
        {
          heading: "The statue or the Maker?",
          paragraphs: [
            "Baal could not hear, could not speak, could not make anything. People had made it with their own hands! Ilyas said: \"Allah made you, your food, the sky, everything. Ask Him, not the statue.\"",
            "Most people said no. That made Ilyas sad, but he kept telling the truth.",
          ],
        },
        {
          heading: "The peace that stayed",
          paragraphs: [
            "Allah honoured Ilyas forever: \"Peace upon Ilyas!\" He is remembered as one of the good, believing servants. The town said no, but Allah said his name with peace — and that is the prize that matters.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Look around your room and find three things people made. Then find three things only Allah made — the moon, a tree, your heartbeat. Thank the Maker, not the made things.",
            "That is Ilyas's question, and you just answered it.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "stories-of-the-prophets",
      "prophet-al-yasa-story",
      "shahada-explained",
    ],
  },
  {
    slug: "prophet-al-yasa-story",
    title: "The Story of Prophet Al-Yasa (Elisha): Among the Chosen",
    seoTitle: "Prophet Al-Yasa (Elisha) in Islam for Kids & Teens",
    description:
      "What the Quran says about Prophet Al-Yasa: named among the chosen and the best, the prophet who carried on Ilyas's mission, and the lesson of quiet faithfulness.",
    excerpt:
      "The Quran mentions Al-Yasa twice, both times among the chosen. His story teaches that a quiet, faithful life can be recorded among the best without a single famous scene.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 4,
    keywords: [
      "prophet Al-Yasa story",
      "Elisha in Islam",
      "Al-Yasa in the Quran",
      "prophets mentioned in the Quran",
    ],
    intro: [
      "Al-Yasa is one of the prophets the Quran names without narrating: twice, in lists of honour — \"And Ishmael and Elisha and Jonah and Lot — and all We preferred over the worlds\" (6:86), and \"And remember Ishmael, Elisha and Dhul-Kifl, and all are among the best\" (38:48). This guide is honest about that brevity, and draws the lesson from it.",
      "Two reading levels below.",
    ],
    sections: [
      {
        heading: "What the Quran says — and does not say",
        paragraphs: [
          "The Quran gives Al-Yasa no dialogue, no miracle scene, no town. It gives him something rarer: a place in two lists of the chosen. \"All are among the best\" (38:48) is Allah's own summary of his life.",
          "Islamic tradition, drawing on earlier scriptures and the reports of the commentators, describes him as the companion and successor of Ilyas, carrying the same message to the same people after him. We hold those details as tradition; the certainty is the Quran's honour.",
        ],
      },
      {
        heading: "The lesson of the quiet name",
        paragraphs: [
          "Not every prophet got a surah. Some got a sentence — and the sentence was enough, because Allah wrote it. Al-Yasa teaches that faithfulness without fame is still recorded, still honoured, still among the best.",
          "The same Quran says: \"Indeed, those who have believed and done righteous deeds — the Most Merciful will appoint for them affection\" (19:96). The quiet life is not the forgotten life.",
        ],
      },
      {
        heading: "What the story asks of us",
        paragraphs: [
          "Do the right thing when the audience is zero. Carry on the good work someone else started. Let Allah's record be the one you care about — because His list of the best includes names the world never made famous.",
        ],
        note: "Read [Ilyas's story](/blog/prophet-ilyas-story), the mission he continued, or [Dhul-Kifl's story](/blog/prophet-dhul-kifl-story), another quiet name among the chosen.",
      },
    ],
    kids: {
      intro: [
        "Some heroes get big adventures in the Quran. Prophet Al-Yasa got something else: Allah put his name on a special list called \"the best.\" That is a very big honour!",
      ],
      sections: [
        {
          heading: "The quiet helper",
          paragraphs: [
            "Al-Yasa helped Prophet Ilyas teach people to worship Allah. When Ilyas's work was done, Al-Yasa kept going — same message, same kindness, no fuss.",
            "The Quran does not tell us his adventures. It tells us his rank: among the chosen, among the best. Allah saw every quiet good thing he did.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Do one good thing tomorrow that nobody will notice or clap for — pick up litter, share without being asked, finish a chore quietly.",
            "Then remember: Allah noticed. That is how you get on the best list, like Al-Yasa.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "stories-of-the-prophets",
      "prophet-ilyas-story",
      "prophet-dhul-kifl-story",
    ],
  },
  {
    slug: "prophet-yunus-story",
    title: "The Story of Prophet Yunus (Jonah): The Prayer from the Darkness",
    seoTitle: "Prophet Yunus (Jonah) and the Whale (Kids & Teens)",
    description:
      "The Quran's story of Prophet Yunus: leaving in anger, the ship and the lots, the whale's belly, the prayer of the darknesses, and the people who believed.",
    excerpt:
      "Yunus left his people too soon and ended up in layers of darkness. His prayer from the whale's belly is still the du'a Muslims repeat when everything feels closed.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 6,
    keywords: [
      "prophet Yunus story",
      "Jonah and the whale Islam",
      "Yunus prayer",
      "Yunus story for kids",
      "dhun-nun",
    ],
    intro: [
      "Yunus is the prophet of the second chance. He left his people in frustration before Allah's permission came, and found himself in the belly of a whale, in layers of darkness. What he said there — \"There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers\" (Quran 21:87) — became one of the most repeated prayers in Islam.",
      "This guide tells his story in two reading levels, from the Quran's own words.",
    ],
    sections: [
      {
        heading: "The departure and the ship",
        paragraphs: [
          "Yunus called his people — a hundred thousand or more (37:147) — and they refused. He \"went off in anger\" (21:87), boarding a laden ship without waiting for Allah's command to leave. At sea, the ship struggled, and lots were drawn to decide who must go overboard; Yunus drew the losing lot (37:140-141).",
          "The Quran's comment is gentle but clear: he thought the decree would not constrain him (21:87). Even a prophet can misjudge the timing — and the story exists to show what comes next.",
        ],
      },
      {
        heading: "The darknesses, and the prayer",
        paragraphs: [
          "\"Then the fish swallowed him, while he was blameworthy\" (37:142). In the belly of the whale, in the night, in the sea — layers of darkness — he called out: \"There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers\" (21:87). No excuse, no demand: tawhid, praise, and admission.",
          "The Quran adds the reason this prayer works: \"And had he not been of those who exalt Allah, he would have remained inside its belly until the Day they are resurrected\" (37:143-144). The years of praise before the crisis were the rope he held in the crisis.",
        ],
      },
      {
        heading: "The shore, the plant, and the believing people",
        paragraphs: [
          "\"So We responded to him and saved him from the distress. And thus do We save the believers\" (21:88). Cast onto the open shore, ill, he was shaded by a gourd vine Allah caused to grow over him (37:145-146).",
          "Then the ending no other prophet's story has: he was sent back to his people — and they believed, all of them, and were given provision for a time (37:147-148, 10:98). The people he had given up on became the only nation that believed after seeing the warning approach.",
        ],
      },
      {
        heading: "What the story asks of us",
        paragraphs: [
          "Do not quit on people too soon. When you are in your own darkness, say Yunus's prayer: praise first, admit second, ask third. And build the habit of praise in easy times — it is what saves you in hard ones.",
        ],
        note: "Learn the full etiquette of asking in [our du'a guide](/blog/how-to-make-dua), or read [Ayyub's story](/blog/prophet-ayyub-story), the other great prayer of hardship.",
      },
    ],
    kids: {
      intro: [
        "Prophet Yunus made a mistake: he gave up on his people too soon. Then came a storm, a ship, and a giant fish. But inside the fish, he said the most beautiful sorry-prayer — and Allah saved him.",
      ],
      sections: [
        {
          heading: "The man who left too soon",
          paragraphs: [
            "Yunus told his people about Allah, and they would not listen. He got frustrated and walked away before Allah said it was time to go.",
            "On a ship, a big storm came. The sailors drew lots, and Yunus was the one who had to go into the sea. A giant fish swallowed him — gulp!",
          ],
        },
        {
          heading: "The prayer in the dark",
          paragraphs: [
            "Inside the fish it was dark, dark, dark. Yunus did not shout or blame. He said: \"Allah, there is no one like You. You are perfect. I was wrong.\"",
            "And Allah heard him! The fish carried him to the shore, and Allah grew a leafy plant to shade him while he got better. Then the best part: his people believed! The ones he gave up on said yes to Allah after all.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Learn Yunus's prayer in your own words: \"Allah, You are perfect, and I was wrong. Please help me.\" Say it when you feel stuck or sad.",
            "And remember: do not give up on people too soon. Sometimes the yes comes later — like Yunus's people.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "stories-of-the-prophets",
      "how-to-make-dua",
      "prophet-ayyub-story",
    ],
  },
  {
    slug: "prophet-zakariya-story",
    title: "The Story of Prophet Zakariya: The Private Prayer That Was Answered",
    seoTitle: "Prophet Zakariya (Zechariah) Story for Kids & Teens",
    description:
      "The Quran's story of Prophet Zakariya: guardian of Maryam, the provision that amazed him, the whispered prayer for an heir in old age, and the sign of three silent nights.",
    excerpt:
      "Zakariya saw Maryam's provision and thought: if Allah provides like this, He can give me an heir too. His whispered prayer in old age became the prophet Yahya.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 6,
    keywords: [
      "prophet Zakariya story",
      "Zechariah story in Islam",
      "Zakariya prayer for a son",
      "Zakariya story for kids",
    ],
    intro: [
      "Zakariya's story begins with a question he asked a young woman in his care: \"O Mary, from where is this provision?\" Her answer — \"It is from Allah\" — unlocked a prayer he had been holding for decades (Quran 3:37). The old prophet whispered, and Allah answered with a son named Yahya.",
      "This guide tells his story in two reading levels, from Surah Maryam and Surah Ali Imran.",
    ],
    sections: [
      {
        heading: "The guardian of Maryam",
        paragraphs: [
          "Zakariya had taken responsibility for Maryam, the girl dedicated to the temple. Each time he entered her prayer chamber, he found provision with her — fruit out of season, by the account of the commentators. \"He said, 'O Mary, from where is this?' She said, 'It is from Allah. Indeed, Allah provides for whom He wills without account'\" (3:37).",
          "The Quran's next sentence is the hinge: \"There Zechariah called upon his Lord\" (3:38). Seeing Allah's provision for Maryam, he reasoned: the same Lord can provide an heir for me.",
        ],
      },
      {
        heading: "The whispered prayer",
        paragraphs: [
          "Surah Maryam opens with his du'a, and it is a masterclass in asking: \"My Lord, indeed my bones have weakened, and my head has filled with white, and never have I been in my supplication to You, my Lord, unhappy\" (19:4). He states his weakness, remembers every past answer, and asks: give me an heir who will carry the message (19:5-6).",
          "The answer came while he stood in prayer: a boy named Yahya — \"We have not assigned to any before this name\" (19:7). When he asked how, the answer was the same one given to Maryam: \"It is easy for Me\" (19:9).",
        ],
      },
      {
        heading: "The sign of three nights",
        paragraphs: [
          "Zakariya asked for a sign, and was given one: he would not speak to people for three nights, though perfectly healthy (19:10). He came out of the prayer chamber and signalled to his people: glorify Allah morning and evening (19:11).",
          "The silence was not punishment; it was a retreat. The man who had whispered his prayer was given three nights of nothing but praise.",
        ],
      },
      {
        heading: "What the story asks of us",
        paragraphs: [
          "No du'a is too late: Zakariya asked in old age, with every natural reason against it, and was answered. Ask with his manners — honesty about your weakness, memory of past answers, and a request that serves the message, not just the ego. And when you see Allah provide for someone else, let it strengthen your own asking, as it strengthened his.",
        ],
        note: "Continue with [Yahya's story](/blog/prophet-yahya-story), the son who was the answer, or learn [how to make du'a](/blog/how-to-make-dua) with Zakariya's manners.",
      },
    ],
    kids: {
      intro: [
        "Prophet Zakariya was a kind old man who looked after a special girl named Maryam. One day he saw something amazing at her place — and it gave him the courage to ask Allah for a very big gift.",
      ],
      sections: [
        {
          heading: "The surprise snacks",
          paragraphs: [
            "Every time Zakariya visited Maryam, he found yummy food with her — food that was not even in season! \"Maryam, where did this come from?\" he asked.",
            "\"From Allah,\" she said. \"Allah gives to whoever He wants, without counting.\" Zakariya thought: if Allah can do that, He can give me a baby too, even though I am very old.",
          ],
        },
        {
          heading: "The quiet prayer",
          paragraphs: [
            "Zakariya whispered a prayer: \"Allah, my bones are old and my hair is white, but You always answer me. Please give me a child to carry on the good work.\"",
            "Allah answered right away: \"You will have a boy named Yahya!\" Zakariya was so amazed he could not speak to people for three nights — he just praised Allah instead. What a happy silence!",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Whisper your own du'a tonight, like Zakariya did. You do not need loud words — Allah hears whispers.",
            "Ask for something good that helps other people too, not just you. That is how Zakariya asked.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "stories-of-the-prophets",
      "prophet-yahya-story",
      "how-to-make-dua",
    ],
  },
  {
    slug: "prophet-yahya-story",
    title: "The Story of Prophet Yahya (John): Wisdom Given to a Child",
    seoTitle: "Prophet Yahya (John) Story for Kids & Teens",
    description:
      "The Quran's story of Prophet Yahya: the son of Zakariya's old age, given judgement as a boy, tenderness and purity, dutiful to his parents, and honoured with peace on three days.",
    excerpt:
      "Yahya was given wisdom while still a child, and the Quran's portrait of him is four words deep: tenderness, purity, dutifulness, and no arrogance.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 5,
    keywords: [
      "prophet Yahya story",
      "John the Baptist in Islam",
      "Yahya story for kids",
      "Yahya in the Quran",
    ],
    intro: [
      "Yahya is the answer to his father's whispered prayer — and the Quran's description of him is one of its most tender portraits: \"O John, take the Scripture with determination. And We gave him judgement while yet a boy, and affection from Us and purity, and he was fearing of Allah, and dutiful to his parents, and he was not a disobedient tyrant\" (Quran 19:12-14).",
      "This guide tells his story in two reading levels.",
    ],
    sections: [
      {
        heading: "The child with judgement",
        paragraphs: [
          "Allah gave Yahya hukm — sound judgement and understanding of the Scripture — while he was still a boy (19:12). The angels' good news to Zakariya had described him in advance: confirming a Word from Allah, noble, chaste, and a prophet from the righteous (3:39).",
          "His mission was to prepare the way for Isa, his relative: calling people back to the Scripture, confirming the truth, and living it so completely that his life became the argument.",
        ],
      },
      {
        heading: "The four qualities",
        paragraphs: [
          "The Quran lists them in sequence: affection from Allah (hanan), purity (zakat), God-consciousness (taqwa), and dutifulness to his parents — with the explicit note that he was \"not a disobedient tyrant\" (19:13-14). Wisdom in a child is rare; wisdom with gentleness is rarer. Yahya had both.",
          "He is honoured with the same three-day peace given to Isa: \"Peace be upon him the day he was born, the day he dies, and the day he is raised alive\" (19:15).",
        ],
      },
      {
        heading: "What the story asks of us",
        paragraphs: [
          "You do not have to be old to be wise, and you do not have to be harsh to be firm. Take the Scripture seriously while you are young; be tender with people and dutiful to your parents; and let purity — of action and intention — be the thing people remember about you.",
        ],
        note: "Read [Zakariya's story](/blog/prophet-zakariya-story), the prayer that produced him, or [Isa's story](/blog/prophet-isa-story), the prophet he prepared the way for.",
      },
    ],
    kids: {
      intro: [
        "Prophet Yahya was a very special boy: Allah gave him wisdom while he was still a child! He was gentle, pure, and kind to his parents — and a prophet.",
      ],
      sections: [
        {
          heading: "The wise boy",
          paragraphs: [
            "Yahya was the baby Allah gave to old Zakariya. As he grew, Allah gave him something amazing: understanding of the holy book while he was still a boy.",
            "He was not a show-off. The Quran says he was gentle, pure, and kind to his mama and papa. Smart AND kind — that is the best combination.",
          ],
        },
        {
          heading: "The helper prophet",
          paragraphs: [
            "Yahya's job was to get people ready for another prophet: Isa. He told people to be good, to follow Allah's book, and to be ready for the truth.",
            "Allah honoured him with peace on three special days: the day he was born, the day he dies, and the day he is raised again. That is Allah's way of saying: this one was Mine.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Do one kind thing for your parents tonight without being asked — that is Yahya's quality: dutiful, not a tyrant.",
            "Then learn one small thing from the Quran and practice it tomorrow. Wisdom starts small, even for prophets.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "stories-of-the-prophets",
      "prophet-zakariya-story",
      "prophet-isa-story",
    ],
  },
  {
    slug: "prophet-isa-story",
    title: "The Story of Prophet Isa (Jesus): The Servant of Allah",
    seoTitle: "Prophet Isa (Jesus) in Islam for Kids & Teens",
    description:
      "The Quran's story of Prophet Isa: born to Maryam, speaking in the cradle, miracles by Allah's permission, and the honoured messenger raised to Allah — as Islam teaches.",
    excerpt:
      "Isa spoke from the cradle, healed by Allah's permission, and called people to worship Allah alone. Islam honours him as a mighty prophet — not as a god or a son.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 7,
    keywords: [
      "prophet Isa story",
      "Jesus in Islam",
      "Isa story for kids",
      "Isa in the Quran",
      "Maryam and Isa",
    ],
    intro: [
      "Islam loves Isa. The Quran names him the Messiah, a Word from Allah, a spirit from Him, and one of the mightiest messengers (3:45, 4:171). It tells his birth, his cradle speech, his miracles, and his honour — and it draws one clear line: he is the servant of Allah and His prophet, not a god and not a son (19:30, 19:35).",
      "This guide tells his story as the Quran tells it, in two reading levels, with respect for the prophet and clarity about the belief.",
    ],
    sections: [
      {
        heading: "The birth given to Maryam",
        paragraphs: [
          "The angel came to Maryam in seclusion with the news of a pure boy. \"How can I have a boy while no man has touched me?\" she asked. The answer: \"Thus; your Lord says, 'It is easy for Me'\" (19:20-21). She withdrew, and the pains of childbirth drove her to a palm trunk, where a voice called: do not grieve — a stream beneath you, dates above you (19:23-25).",
          "When she brought the baby to her people and they accused her, she pointed to the cradle. And the newborn spoke: \"Indeed, I am the servant of Allah. He has given me the Scripture and made me a prophet\" (19:30). His first recorded words defined his whole mission.",
        ],
      },
      {
        heading: "The miracles by permission",
        paragraphs: [
          "The Quran lists his signs, each one qualified: he made a bird from clay and breathed into it, healed the blind and the leper, and gave life to the dead — \"by permission of Allah\" (3:49, 5:110). The qualification is the point: the power was never his own; it was Allah's, displayed through His prophet.",
          "He asked for a table spread from heaven for his disciples as a sign and a festival (5:112-115), and he foretold a messenger to come after him named Ahmad (61:6) — the Prophet Muhammad, peace be upon him.",
        ],
      },
      {
        heading: "The honour and the line",
        paragraphs: [
          "When plots were made against him, \"Allah said, 'O Jesus, indeed I will take you and raise you to Myself'\" (3:55). The Quran states plainly: \"They did not kill him, nor did they crucify him, but it was made to appear so to them... rather, Allah raised him to Himself\" (4:157-158). Islamic tradition holds that he will return before the Day of Judgement.",
          "And the line the Quran draws with full respect: \"The Messiah, son of Mary, was not but a messenger; messengers have passed on before him\" (5:75). \"It is not befitting for Allah to take a son; exalted is He! When He decrees an affair, He only says to it, 'Be,' and it is\" (19:35).",
        ],
      },
      {
        heading: "What the story asks of us",
        paragraphs: [
          "Love Isa as Islam teaches: as the cradle-speaking prophet, the healer by Allah's permission, the one who said \"Allah is my Lord and your Lord, so worship Him. That is a straight path\" (19:36). Honour his mother, whose name titles a whole surah. And keep the line he himself drew: worship the Creator, honour the messenger.",
        ],
        note: "Read [the story of Muhammad](/blog/prophet-muhammad-story), the messenger Isa foretold, or [the shahada explained](/blog/shahada-explained), the line between Creator and creation.",
      },
    ],
    kids: {
      intro: [
        "Prophet Isa is one of the most special prophets in Islam. He was born to a wonderful lady named Maryam, and he could talk when he was still a baby in the cradle!",
      ],
      sections: [
        {
          heading: "The baby who spoke",
          paragraphs: [
            "When Maryam brought baby Isa home, people asked questions. Maryam pointed to the baby — and the baby spoke! \"I am the servant of Allah. He gave me the book and made me a prophet.\"",
            "He also said: be kind to your mama, pray, and give zakat. A baby with the best advice ever!",
          ],
        },
        {
          heading: "The amazing signs",
          paragraphs: [
            "When Isa grew up, Allah gave him amazing signs: he could heal people who could not see, and he made a clay bird that came alive — all by Allah's permission. Every time, the power was Allah's.",
            "Isa always said the same thing: \"Allah is my Lord and your Lord, so worship Him.\" He was a mighty prophet — and he told us exactly who he was: Allah's servant.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Do what baby Isa advised: be kind to your mama tonight. Help her with one thing and say something sweet.",
            "Then ask a grown-up to tell you how Allah honoured Isa and raised him to Himself. Muslims love Isa — and we love the One who sent him even more.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "stories-of-the-prophets",
      "prophet-muhammad-story",
      "shahada-explained",
    ],
  },
  {
    slug: "prophet-dhul-kifl-story",
    title: "The Story of Prophet Dhul-Kifl: The Man of the Pledge",
    seoTitle: "Prophet Dhul-Kifl in Islam for Kids & Teens",
    description:
      "What the Quran and Islamic tradition say about Prophet Dhul-Kifl: named among the patient and the best, and the story of the man who kept his pledge when others could not.",
    excerpt:
      "Dhul-Kifl means 'the one of the pledge'. The Quran lists him among the patient and the best; tradition tells of a man who took on a promise and kept it when everyone else failed.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 5,
    keywords: [
      "prophet Dhul-Kifl story",
      "Dhul-Kifl in the Quran",
      "Dhul-Kifl story for kids",
      "prophets mentioned in the Quran",
    ],
    intro: [
      "Dhul-Kifl's name is itself a lesson: \"the one of the pledge\" (kifl means a pledge or guarantee). The Quran names him twice, both times in honour: \"And Ishmael and Idris and Dhul-Kifl — all were of the patient\" (21:85), and \"all are among the best\" (38:48).",
      "This guide separates what the Quran says from what tradition adds, honestly, in two reading levels.",
    ],
    sections: [
      {
        heading: "What the Quran says",
        paragraphs: [
          "Two mentions, both lists of honour: among the patient who were admitted into Allah's mercy (21:85-86), and among the best (38:48). No narrative, no town, no dialogue. The Quran's record of him is his rank.",
          "Commentators have differed on his identity — some say he was a son of Ayyub, others a righteous man of the Children of Israel. The Quran leaves it open, and so do we.",
        ],
      },
      {
        heading: "The story tradition tells",
        paragraphs: [
          "A well-known report in the classical commentaries tells of a prophet who asked his people: who will take my place, fast by day, pray by night, and judge without anger? One young man stood up. The prophet asked again, and again the same young man stood. He was given the responsibility — and he kept the pledge, even when Iblis tried repeatedly to provoke him to anger and failed.",
          "That is the story the name carries: a man who guaranteed something hard and delivered. Whether or not every detail is established, the quality is certain, because Allah recorded it: patience, and a place among the best.",
        ],
      },
      {
        heading: "What the story asks of us",
        paragraphs: [
          "Be the person who stands up when the responsibility is heavy. Keep the pledge even when nobody checks. And control the anger — the tradition's whole test was whether he would stay gentle under provocation. A kept promise and a controlled temper: that is a life Allah lists among the best.",
        ],
        note: "Read [Ayyub's story](/blog/prophet-ayyub-story), the patience he is linked to, or [Ismail's story](/blog/prophet-ismail-story), the other man of the promise.",
      },
    ],
    kids: {
      intro: [
        "Prophet Dhul-Kifl's name means \"the one who keeps his promise.\" The Quran puts him on two special lists: the patient ones, and the best ones. Here is why.",
      ],
      sections: [
        {
          heading: "The boy who stood up",
          paragraphs: [
            "An old prophet asked: \"Who will take my place and do the hard work — praying, fasting, and being fair, never getting angry?\" A young man stood up: \"I will!\"",
            "He kept his promise. Even when someone tried to make him angry, he stayed calm and fair. He did what he said he would do. That is why his name means \"the one of the pledge.\"",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Make one promise to a grown-up tonight — something small and real — and keep it tomorrow no matter what. Then tell them: \"I kept my pledge, like Dhul-Kifl.\"",
            "And practice the other half: when something makes you angry tomorrow, take a breath and stay gentle. That was his real test.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "stories-of-the-prophets",
      "prophet-ayyub-story",
      "prophet-ismail-story",
    ],
  },
  {
    slug: "prophet-muhammad-story",
    title: "The Story of Prophet Muhammad (peace be upon him): Mercy to the Worlds",
    seoTitle: "Prophet Muhammad Story for Kids & Teens",
    description:
      "The life of Prophet Muhammad (peace be upon him): the trustworthy orphan of Makkah, the first revelation in Hira, the hijra, the farewell sermon, and the character that was the Quran.",
    excerpt:
      "Before revelation they called him al-Amin, the trustworthy. After it, he was mercy to the worlds. His story is the line of prophets completed — and character made the final message.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 9,
    keywords: [
      "prophet Muhammad story",
      "Muhammad story for kids",
      "life of the Prophet",
      "first revelation cave Hira",
      "seerah for kids",
    ],
    intro: [
      "The line of prophets ends with Muhammad, peace be upon him — \"the seal of the prophets\" (Quran 33:40), sent \"as a mercy to the worlds\" (21:107). His life is the best-documented of any prophet: the Quran, the authentic hadith, and the seerah give us his words, his habits, and his character in detail.",
      "This guide tells his story in two reading levels: a simple version for children, and a deeper one with references for ages 13 and up.",
    ],
    sections: [
      {
        heading: "The trustworthy orphan",
        paragraphs: [
          "Born in Makkah around 570 CE, he lost his father before birth and his mother at six, and was raised by his grandfather and then his uncle Abu Talib. He worked as a shepherd and then a trader, and his town gave him a title before any revelation: al-Amin — the trustworthy.",
          "When the clans of Makkah disputed who would place the Black Stone during the Kaaba's rebuilding, they accepted his judgment: he spread a cloak, set the stone on it, and had each clan lift a corner — honour preserved, conflict dissolved. That was his character before prophethood: fairness that made room for everyone.",
        ],
      },
      {
        heading: "\"Read\" — the first revelation",
        paragraphs: [
          "At forty, he used to retreat to the cave of Hira to reflect. There the angel Jibreel came: \"Read!\" He answered, \"I am not a reader.\" The command repeated, and then the first verses: \"Read in the name of your Lord who created — created man from a clinging substance. Read, and your Lord is the most Generous — who taught by the pen — taught man that which he knew not\" (96:1-5).",
          "He came home trembling to Khadijah, his wife, who covered him and became the first believer. The message would continue for twenty-three years — thirteen in Makkah, ten in Madinah.",
        ],
      },
      {
        heading: "The years of harm, and the hijra",
        paragraphs: [
          "Makkah's leaders answered the message with mockery, boycott, and torture of the weak believers. He was offered wealth and kingship to stop; he answered that even if they put the sun in his right hand and the moon in his left, he would not abandon the message. He grieved the loss of his uncle and his wife in the same year, and was comforted by the night journey and ascension (17:1).",
          "In 622 CE he migrated to Madinah — the hijra, from which the Islamic calendar counts. There he built a mosque, a brotherhood between migrants and helpers, and a community bound by a written agreement.",
        ],
      },
      {
        heading: "The return, and the mercy",
        paragraphs: [
          "After years of defence and treaty, Makkah opened to him in 630 CE with almost no bloodshed. To the town that had tortured his companions and driven him out, he said: \"Go, for you are free.\" The conquest became an amnesty.",
          "In the farewell sermon he fixed the standard: all people are from Adam, an Arab has no superiority over a non-Arab nor a white over a black except by piety; women have rights; property and honour are sacred. \"This day I have perfected for you your religion\" (5:3) was revealed in those final days.",
        ],
      },
      {
        heading: "The character that was the Quran",
        paragraphs: [
          "Asked about his character, Aisha answered: \"His character was the Quran\" (Sahih Muslim). He was gentle with children, honest with enemies, patient with harm, and constant in worship until his feet swelled. He died in 632 CE in Madinah, leaving no wealth — only the message and the example.",
          "The Quran's summary is the one Muslims repeat in every prayer: \"Indeed, in the Messenger of Allah you have an excellent example\" (33:21). His story closes the line of prophets with a simple standard: faith is proven by how you treat people.",
        ],
        note: "Start the line from the beginning with [Adam's story](/blog/prophet-adam-story), or read [the five pillars](/blog/five-pillars-of-islam) he taught. Our [Islamic studies lessons](/courses) cover his seerah one-to-one in English.",
      },
    ],
    kids: {
      intro: [
        "Prophet Muhammad, peace be upon him, is the last prophet — and Muslims love him more than anyone except Allah. Even before he became a prophet, everyone called him al-Amin: the trustworthy one.",
      ],
      sections: [
        {
          heading: "The honest boy",
          paragraphs: [
            "Muhammad lost his mama and papa when he was small, and his kind uncle raised him. He grew up so honest that the whole town called him al-Amin — the trustworthy.",
            "Once, the tribes were arguing about a special stone. Muhammad spread a cloak, put the stone on it, and let every tribe lift a corner. Everyone was happy! He was a peacemaker before he was a prophet.",
          ],
        },
        {
          heading: "The cave and the first words",
          paragraphs: [
            "When he was forty, an angel came to him in a cave called Hira and said: \"Read!\" The first words from Allah were about reading, learning, and the pen. Muhammad was so excited and scared he ran home to his wife Khadijah, and she believed in him first.",
            "For twenty-three years, Allah kept sending the message — piece by piece — until it was complete: the Quran.",
          ],
        },
        {
          heading: "The kindest conqueror",
          paragraphs: [
            "Some people in Makkah were very mean to him for years. But when he finally came back with a big army, he did not hurt them. He said: \"Go, you are free.\" That is mercy.",
            "He told everyone: no skin colour or language makes you better than anyone else — only being good does. He was gentle with children, kind to animals, and honest even with people who hated him.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Be al-Amin tomorrow: tell the truth in every single thing, even the small ones. That is how the Prophet was known before any miracle.",
            "Then send salawat with a grown-up: Allahumma salli ala Muhammad. Muslims do it to say thank you for the best teacher ever.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "stories-of-the-prophets",
      "prophet-isa-story",
      "five-pillars-of-islam",
    ],
  },
  {
    slug: "what-is-hajj",
    title: "What Is Hajj? The Pilgrimage Step by Step",
    seoTitle: "What Is Hajj? The Pilgrimage Explained (Kids & Teens)",
    description:
      "Hajj explained from the Quran and Sunnah: who must go, the five days from ihram to the farewell tawaf, Arafat as the heart of it, and what the journey teaches.",
    excerpt:
      "Hajj is the fifth pillar: one journey to Makkah in a lifetime, for those who are able. Five days, one white cloth, and a standing on Arafat that is the heart of it all.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 8,
    keywords: [
      "what is Hajj",
      "Hajj steps",
      "Hajj pilgrimage explained",
      "Hajj for kids",
      "day of Arafat",
    ],
    intro: [
      "Hajj is the fifth pillar of Islam: a journey to Makkah that every adult Muslim who is physically and financially able must make once in a lifetime (Quran 3:97). It happens on fixed days in Dhul-Hijjah, the twelfth month of the Islamic calendar, and it re-enacts the story of Ibrahim, Hajar and Ismail.",
      "This guide walks through the journey day by day, with a children's version and a deeper one in the same article.",
    ],
    sections: [
      {
        heading: "Who must go, and when",
        paragraphs: [
          "The obligation is conditional: \"And due to Allah from the people is a pilgrimage to the House — for whoever is able to find a way\" (3:97). Ability means health, safety of the route, and money beyond what your dependants need. Nobody is obliged beyond their capacity.",
          "The days are fixed: the core rites run from the 8th to the 12th or 13th of Dhul-Hijjah. The Prophet said, \"Hajj is Arafat\" (Tirmidhi) — the standing on the plain of Arafat on the 9th is the pillar without which there is no Hajj.",
        ],
      },
      {
        heading: "Ihram: the white cloth that erases rank",
        paragraphs: [
          "Before entering Makkah, pilgrims enter ihram at the appointed boundary (miqat): two unstitched white cloths for men, modest dress for women, with the intention and the talbiyah: \"Labbayk Allahumma labbayk\" — here I am, O Allah, here I am.",
          "In ihram, certain things become forbidden: cutting hair or nails, perfume, hunting, marital relations, and quarrelling (2:197). The king and the labourer wear the same cloth and say the same words. The Quran's rule for the journey: \"No rafath (obscenity), no wickedness, no disputing during Hajj\" (2:197).",
        ],
      },
      {
        heading: "The five days",
        paragraphs: [
          "The journey has a fixed shape. Here is the sequence most pilgrims follow:",
        ],
        list: [
          "8th Dhul-Hijjah (Yawm al-Tarwiyah): pilgrims travel to Mina and spend the day and night in prayer.",
          "9th (the Day of Arafat): after Fajr, they move to the plain of Arafat and stand in du'a until sunset — the heart of Hajj.",
          "After sunset on the 9th: they move to Muzdalifah, pray Maghrib and Isha together, and gather pebbles under the open sky.",
          "10th (Eid al-Adha): back to Mina to stone the largest pillar (Jamarat al-Aqaba), then the sacrifice, then shaving or trimming the hair.",
          "10th onward: Tawaf al-Ifadah in Makkah — seven circuits of the Kaaba — and sa'i between Safa and Marwa.",
          "11th–13th: staying in Mina, stoning all three pillars each afternoon; then the farewell tawaf before leaving Makkah.",
        ],
        listStyle: "steps",
      },
      {
        heading: "Why these places",
        paragraphs: [
          "Every stop is a memory. Safa and Marwa re-walk Hajar's desperate search for water for baby Ismail — and Zamzam still flows. The sacrifice remembers Ibrahim's submission and the ransom Allah provided (37:107). Arafat is where the Prophet delivered the farewell sermon, and where tradition holds Adam and Hawwa were reunited after the descent.",
          "The Quran ties the House to Ibrahim directly: \"And We showed Abraham the site of the House: do not associate anything with Me, and purify My House for those who circle it, and those who stand, and those who bow and prostrate\" (22:26).",
        ],
      },
      {
        heading: "What the journey teaches",
        paragraphs: [
          "Hajj is a rehearsal of the Day of Judgement: one cloth, one plain, one call, no rank. It teaches that provision is from Allah (Zamzam), that patience is a route (Hajar's seven walks), and that the best provision is taqwa: \"And take provisions, but indeed, the best provision is righteousness\" (2:197).",
        ],
        note: "Read [Umrah step by step](/blog/umrah-step-by-step), the smaller pilgrimage, or [the story of Ibrahim](/blog/prophet-ibrahim-story), whose family the journey remembers.",
      },
    ],
    kids: {
      intro: [
        "Hajj is a very special trip that Muslims make to Makkah once in their life if they can. Everyone wears simple white clothes, and everyone is equal — like one big family visiting Allah's house.",
      ],
      sections: [
        {
          heading: "The white clothes",
          paragraphs: [
            "Before the trip starts, pilgrims put on special simple clothes called ihram. No fancy outfits, no rich-and-poor differences. Everyone says the same happy call: \"Labbayk! Here I am, Allah!\"",
            "While wearing ihram, you do not argue, you do not hurt anything, and you stay kind. It is like wearing a kindness uniform.",
          ],
        },
        {
          heading: "The five-day adventure",
          paragraphs: [
            "The trip has five big days. Pilgrims sleep in tents in a place called Mina. Then comes the most important day: standing on a big plain called Arafat, asking Allah for everything good until the sun goes down.",
            "After that: throwing little pebbles at three pillars (saying no to Shaytan!), the Eid sacrifice, walking around the Kaaba seven times, and walking between two hills seven times — just like Hajar did when she was looking for water for baby Ismail.",
          ],
        },
        {
          heading: "Hajar's run and the magic water",
          paragraphs: [
            "Long ago, Hajar ran between the two hills seven times looking for water for her baby. Allah made a spring appear — Zamzam! Pilgrims still walk her walk, and still drink her water.",
            "The lesson: keep trying, and trust Allah. He does not forget anyone.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Draw the Hajj journey: the Kaaba, the tents of Mina, the plain of Arafat, and the two hills. Label each stop with what happens there.",
            "Then ask a grown-up: \"If we went on Hajj, what would you ask Allah for on Arafat?\" Make your own list too.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "umrah-step-by-step",
      "prophet-ibrahim-story",
      "eid-al-fitr-and-eid-al-adha",
    ],
  },
  {
    slug: "umrah-step-by-step",
    title: "Umrah Step by Step: The Smaller Pilgrimage",
    seoTitle: "Umrah Step by Step Guide (Kids & Teens)",
    description:
      "How to perform Umrah: ihram at the miqat, seven circuits of tawaf, sa'i between Safa and Marwa, and halq or taqsir — with what makes it different from Hajj.",
    excerpt:
      "Umrah is the smaller pilgrimage: four steps, any time of year. Ihram, tawaf, sa'i, and the haircut that ends it — each step with a memory behind it.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 6,
    keywords: [
      "Umrah step by step",
      "how to perform Umrah",
      "Umrah vs Hajj",
      "Umrah for kids",
      "tawaf and sai",
    ],
    intro: [
      "Umrah is the smaller pilgrimage to Makkah. Unlike Hajj, it has no fixed season and no standing at Arafat — it can be performed at any time of year, and its rites are four: ihram, tawaf, sa'i, and halq or taqsir. It does not replace the obligatory Hajj.",
      "This guide walks through each step, with a children's version and a deeper one.",
    ],
    sections: [
      {
        heading: "Step 1: Ihram at the miqat",
        paragraphs: [
          "Before crossing the appointed boundary (miqat), the pilgrim makes the intention for Umrah and enters ihram: two white unstitched cloths for men, modest dress for women. The talbiyah begins: \"Labbayk Allahumma labbayk, labbayk la sharika laka labbayk...\" — here I am, O Allah, You have no partner.",
          "From this moment the ihram restrictions apply: no cutting hair or nails, no perfume, no hunting, no marital relations, no quarrelling. The pilgrim arrives in Makkah saying the talbiyah.",
        ],
        listStyle: "steps",
        list: [
          "Make the intention for Umrah and enter ihram at the miqat; begin the talbiyah.",
          "Perform tawaf: seven circuits around the Kaaba, starting and ending at the Black Stone, with the Kaaba on your left.",
          "Pray two rak'ahs behind Maqam Ibrahim if possible, and drink Zamzam.",
          "Perform sa'i: seven walks between Safa and Marwa, starting at Safa and ending at Marwa.",
          "End ihram by shaving (halq) or trimming (taqsir) the hair; women trim a fingertip's length.",
        ],
      },
      {
        heading: "Step 2: Tawaf — seven circuits",
        paragraphs: [
          "Tawaf is seven circuits around the Kaaba, beginning at the Black Stone corner. Men uncover the right shoulder and walk briskly in the first three circuits (idtiba and raml); the remaining four are at a normal pace. Each circuit passes the Yemeni corner, where the du'a is: \"Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire\" (2:201).",
          "After tawaf, two rak'ahs are prayed near Maqam Ibrahim — the station of Ibrahim, who built the House with Ismail (2:125-127) — and Zamzam is drunk.",
        ],
      },
      {
        heading: "Step 3: Sa'i — Hajar's seven walks",
        paragraphs: [
          "Sa'i is seven walks between the hills of Safa and Marwa, starting at Safa and ending at Marwa. At each hill the pilgrim faces the Kaaba and praises Allah. Between the green markers, men walk briskly — the stretch where Hajar ran when the valley hid her from view.",
          "The rite is a direct memory: Hajar, left in the valley with baby Ismail, ran between these hills searching for water or a passing caravan, and Zamzam sprang at the child's feet. The Quran honours the two hills: \"Indeed, Safa and Marwah are among the symbols of Allah\" (2:158).",
        ],
      },
      {
        heading: "Step 4: Halq or taqsir, and the difference from Hajj",
        paragraphs: [
          "Umrah ends with the hair: men shave (halq, the more complete) or trim (taqsir); women trim a small length. With that, ihram ends and everything forbidden in it becomes lawful again.",
          "The differences from Hajj: Umrah has no fixed days, no Arafat, no Muzdalifah, no stoning, no sacrifice — and it does not discharge the obligation of Hajj. The Prophet performed Umrah and said it is an expiation for the sins between it and the previous one (Bukhari and Muslim).",
        ],
        note: "Read [what Hajj is](/blog/what-is-hajj), the greater pilgrimage, or [the story of Ismail](/blog/prophet-ismail-story), the baby Hajar ran for.",
      },
    ],
    kids: {
      intro: [
        "Umrah is like a mini-Hajj: a special visit to the Kaaba that you can do any time of year. It has four steps, and each one remembers something amazing.",
      ],
      sections: [
        {
          heading: "The four steps",
          paragraphs: [
            "First: put on ihram, the simple white clothes, and say \"Labbayk! Here I am, Allah!\"",
            "Second: walk around the Kaaba seven times — that is tawaf. Third: walk between two hills seven times — that is sa'i, Hajar's walk. Fourth: cut a little hair, and the special visit is complete!",
          ],
        },
        {
          heading: "The mama who ran",
          paragraphs: [
            "The sa'i walk remembers Hajar, baby Ismail's mama. She ran between the hills seven times looking for water. She did not give up — and Allah made the Zamzam spring appear!",
            "When pilgrims walk her walk, they are saying: we trust Allah like Hajar did. Keep trying, and He provides.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Practice the count: walk around a table seven times, then walk between two chairs seven times. That is the shape of Umrah — tawaf and sa'i.",
            "Then ask a grown-up to tell you the Zamzam story again. It is the best water story in the world.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "what-is-hajj",
      "prophet-ismail-story",
      "five-pillars-of-islam",
    ],
  },
  {
    slug: "zakat-explained",
    title: "Zakat Explained: The 2.5% That Purifies Wealth",
    seoTitle: "Zakat Explained: Rules, Nisab & Recipients (Kids & Teens)",
    description:
      "Zakat explained from the Quran and Sunnah: who pays, the nisab threshold, the lunar year, the 2.5% rate, the eight categories of recipients, and how it differs from sadaqah.",
    excerpt:
      "Zakat is not charity you choose; it is a right the poor hold over qualifying wealth. 2.5% of what has been above the nisab for a lunar year — and it purifies the rest.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 7,
    keywords: [
      "what is zakat",
      "zakat explained",
      "zakat nisab",
      "zakat 2.5 percent",
      "zakat for kids",
    ],
    intro: [
      "Zakat is the third pillar of Islam, and the Quran pairs it with prayer again and again: establish salah, give zakat. The word itself means purification and growth — because giving the due share purifies what remains, and blesses it. It is not optional generosity; it is a right Allah has placed in wealth for specific people (Quran 70:24-25).",
      "This guide explains the rules simply, with a children's version and a deeper one.",
    ],
    sections: [
      {
        heading: "Who must pay",
        paragraphs: [
          "Zakat is obligatory on every adult, sane Muslim whose qualifying wealth reaches the nisab — the minimum threshold — and stays at or above it for a full lunar (hijri) year. The classical nisab is the value of 85 grams of gold or 595 grams of silver; many scholars advise using the silver standard because it is lower and includes more people in the giving.",
          "Qualifying wealth includes cash, savings, gold and silver, trade goods, and certain investments — not the house you live in, the car you drive, or the tools of your trade. Debts due are deducted according to the detailed rules.",
        ],
      },
      {
        heading: "How much: 2.5%",
        paragraphs: [
          "The rate on monetary wealth is 2.5% — one fortieth — of the total qualifying wealth held for the year, not just the income earned that year. If you have held the equivalent of 10,000 above the nisab for a lunar year, the zakat is 250.",
          "Agricultural produce, livestock and mined wealth have their own rates in the Sunnah; the 2.5% is the rate most people meet first.",
        ],
      },
      {
        heading: "Who receives it: the eight categories",
        paragraphs: [
          "The Quran names the recipients precisely: \"Zakat expenditures are only for the poor, and the needy, and those employed to administer it, and those whose hearts are to be reconciled, and for freeing slaves, and for those in debt, and in the cause of Allah, and for the traveller\" (9:60).",
          "It is not a general charity fund: it cannot go to mosques or projects as such, nor to one's own parents, children or spouse, whose support is already obligatory. It goes to people, in the categories Allah named.",
        ],
      },
      {
        heading: "Zakat, sadaqah, and zakat al-fitr",
        paragraphs: [
          "Sadaqah is voluntary charity: any amount, any time, any recipient — even a smile is sadaqah (Tirmidhi). Zakat is the obligatory annual due with fixed rules. Zakat al-fitr is a separate small due at the end of Ramadan, given as food or its value for every member of the household before the Eid prayer, so the fasting person's shortfalls are covered and the poor can celebrate.",
          "The Quran's promise for the giver: \"Whatever you give of zakat, seeking the countenance of Allah — those are the multipliers\" (30:38-39). And the warning for the hoarder is severe (9:34-35). The wealth was never fully yours; the due share was always theirs.",
        ],
        note: "Read [the five pillars](/blog/five-pillars-of-islam) to see where zakat sits, or [the two Eids](/blog/eid-al-fitr-and-eid-al-adha) for zakat al-fitr in context.",
      },
    ],
    kids: {
      intro: [
        "Zakat is Islam's sharing rule: if you have enough money for a whole year, you give a small piece — 2.5 out of every 100 — to people who need it. It makes your money clean and blessed.",
      ],
      sections: [
        {
          heading: "The sharing jar",
          paragraphs: [
            "Imagine 100 coins in a jar. Zakat says: 2 and a half of those coins belong to the poor — Allah put them there. You give them away once a year, and the rest becomes pure and blessed.",
            "It is not a favour you do. It is their right. That is why zakat feels different from a gift: you are returning something that was never fully yours.",
          ],
        },
        {
          heading: "Who gets it",
          paragraphs: [
            "Allah named eight kinds of people who receive zakat: the poor, the needy, people in debt, travellers stranded far from home, and others. Not buildings or boxes — people.",
            "And there is a small extra zakat at the end of Ramadan called zakat al-fitr, so every family has food for the Eid party.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Count out 100 small things — coins, buttons, beads. Take away 2 and a half. That is zakat's share. Put it in a giving jar.",
            "Then do one sadaqah tonight — a smile, a kind word, a shared snack. Sadaqah is the anytime version, and even a smile counts!",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "five-pillars-of-islam",
      "eid-al-fitr-and-eid-al-adha",
      "ramadan-for-kids",
    ],
  },
  {
    slug: "shahada-explained",
    title: "The Shahada Explained: The Sentence That Opens Islam",
    seoTitle: "The Shahada Explained for Kids & Teens",
    description:
      "What the shahada means: la ilaha illa Allah, Muhammad rasul Allah — its two halves, what each one commits a person to, and why it is the first pillar of Islam.",
    excerpt:
      "The shahada is one sentence with two halves: none is worthy of worship except Allah, and Muhammad is His messenger. Everything in Islam grows from those two commitments.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 6,
    keywords: [
      "what is the shahada",
      "shahada meaning",
      "la ilaha illa Allah",
      "first pillar of Islam",
      "shahada for kids",
    ],
    intro: [
      "The shahada — the testimony — is the first pillar of Islam and its doorway: \"Ash-hadu an la ilaha illa Allah, wa ash-hadu anna Muhammadan rasul Allah.\" I bear witness that none is worthy of worship except Allah, and I bear witness that Muhammad is the messenger of Allah. One sentence, two halves, and a whole life reorganised around them.",
      "This guide explains each half, with a children's version and a deeper one.",
    ],
    sections: [
      {
        heading: "The first half: la ilaha illa Allah",
        paragraphs: [
          "The phrase does not merely say \"there is one God.\" It says: none is worthy of worship except Allah — a denial followed by an affirmation. Every rival object of ultimate trust and devotion is denied, and worship is given to Allah alone. This is tawhid, the message every prophet brought: \"And We sent not before you any messenger except that We revealed to him that there is no deity except Me, so worship Me\" (21:25).",
          "It commits a person to take Allah as the ultimate authority: what He commands is followed, what He forbids is avoided, and what He decrees is trusted — above culture, desire, and fear.",
        ],
      },
      {
        heading: "The second half: Muhammad rasul Allah",
        paragraphs: [
          "The second half names the channel: Muhammad, peace be upon him, is the messenger of Allah — the final one (33:40). Believing in him means accepting his message as Allah's, loving him more than oneself, and following his example: \"Indeed, in the Messenger of Allah you have an excellent example\" (33:21).",
          "The two halves cannot be separated: worshipping Allah without the messenger's guidance is guesswork, and honouring the messenger without tawhid misses his entire message. Isa himself drew the line: \"Allah is my Lord and your Lord, so worship Him\" (19:36).",
        ],
      },
      {
        heading: "More than words",
        paragraphs: [
          "The shahada is said with the tongue, believed in the heart, and proven by the limbs. The Prophet said that whoever says it sincerely from the heart enters Paradise (Bukhari) — and sincerity is exactly what the second half tests: do you follow the messenger when following costs something?",
          "It is the first thing whispered to a newborn and the last thing a Muslim hopes to say at death. Everything between those two moments — prayer, fasting, zakat, Hajj, manners — is the sentence being lived.",
        ],
        note: "Read [the five pillars](/blog/five-pillars-of-islam) that grow from it, or [the story of the Prophet](/blog/prophet-muhammad-story), the messenger it names.",
      },
    ],
    kids: {
      intro: [
        "The shahada is the special sentence that makes someone a Muslim. It has two halves, and each half is a promise. Let's learn them!",
      ],
      sections: [
        {
          heading: "Half one: only Allah",
          paragraphs: [
            "\"La ilaha illa Allah\" means: nobody deserves worship except Allah. Not a statue, not a star, not money, not a screen. Only the One who made everything.",
            "It is a promise: I will love and obey Allah most of all.",
          ],
        },
        {
          heading: "Half two: the messenger",
          paragraphs: [
            "\"Muhammad rasul Allah\" means: Muhammad is Allah's messenger. He brought us the Quran and showed us how to live. We love him and follow his example.",
            "It is a promise: I will learn from the best teacher, peace be upon him.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Say the shahada slowly with a grown-up, and say what each half means in your own words.",
            "Then pick one way to live the sentence tomorrow: one prayer on time, one honest word, one kind act. That is the shahada growing.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "five-pillars-of-islam",
      "prophet-muhammad-story",
      "names-of-allah",
    ],
  },
  {
    slug: "eid-al-fitr-and-eid-al-adha",
    title: "Eid al-Fitr and Eid al-Adha: The Two Celebrations Explained",
    seoTitle: "Eid al-Fitr vs Eid al-Adha Explained (Kids & Teens)",
    description:
      "The two Eids explained: what each celebrates, zakat al-fitr and qurbani, the Eid prayer, the takbir, and the sunnahs that shape the days — from the Quran and Sunnah.",
    excerpt:
      "One Eid thanks Allah for completing the fast; the other remembers Ibrahim's submission. Both begin with a prayer, a takbir, and food shared with the poor.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 6,
    keywords: [
      "Eid al-Fitr vs Eid al-Adha",
      "what is Eid",
      "Eid explained for kids",
      "zakat al-fitr",
      "qurbani",
    ],
    intro: [
      "Islam has two Eids — two festivals, no more. Eid al-Fitr closes Ramadan on the 1st of Shawwal; Eid al-Adha falls on the 10th of Dhul-Hijjah, inside the Hajj days. Both begin with a special prayer and the takbir, and both are built around sharing: one shares food through zakat al-fitr, the other through the sacrifice.",
      "This guide explains each day, with a children's version and a deeper one.",
    ],
    sections: [
      {
        heading: "Eid al-Fitr: the feast of breaking the fast",
        paragraphs: [
          "After a month of fasting, Muslims gather on the morning of the 1st of Shawwal for the Eid prayer — two rak'ahs with extra takbirs, followed by a sermon. Fasting on this day is forbidden: it is Allah's gift of celebration after the month of restraint.",
          "Before the prayer, every Muslim who can must give zakat al-fitr — a small measure of staple food (or its value, per the schools that allow it) for each member of the household — so the poor can celebrate too. The Sunnah is to eat dates before leaving for the prayer, to take one route there and another back, and to say the takbir along the way.",
        ],
      },
      {
        heading: "Eid al-Adha: the feast of sacrifice",
        paragraphs: [
          "Eid al-Adha remembers Ibrahim's willingness to sacrifice his son and Allah's ransom (37:102-107). On the 10th of Dhul-Hijjah, after the Eid prayer, those who are able offer the qurbani — a sheep, goat, cow or camel — and the meat is shared: traditionally in thirds, for the family, for friends and neighbours, and for the poor.",
          "The Quran is explicit that the meat and blood do not reach Allah — \"but righteousness from you reaches Him\" (22:37). The sacrifice is an act of taqwa, and the sharing is its proof. The days of eating and remembrance continue through the 11th, 12th and 13th (the days of tashriq).",
        ],
      },
      {
        heading: "What the two days share",
        paragraphs: [
          "Both begin with the takbir: \"Allahu akbar, Allahu akbar, la ilaha illa Allah, wallahu akbar, Allahu akbar wa lillahi l-hamd.\" Both gather the whole community — men, women and children — for the prayer. Both are days of new clothes, visits, gifts, and reconciliation.",
          "And both are deliberately tied to worship, not just festivity: one thanks Allah for the fast completed, the other for the test passed. The joy is real, and it has a direction.",
        ],
        note: "Read [Ramadan for families](/blog/ramadan-for-kids) for the month that ends in the first Eid, or [what Hajj is](/blog/what-is-hajj) for the journey the second Eid sits inside.",
      },
    ],
    kids: {
      intro: [
        "Muslims have two big party days called Eid! One comes after Ramadan, and one comes during the Hajj days. Both have a special prayer, yummy food, and lots of sharing.",
      ],
      sections: [
        {
          heading: "Eid number one: the fast is done!",
          paragraphs: [
            "After a whole month of fasting, Eid al-Fitr arrives! Everyone says \"Allahu akbar!\" together, prays the special Eid prayer, and eats something sweet — usually dates — before the prayer.",
            "Before the party, every family gives a small gift of food called zakat al-fitr, so families who do not have much can party too. That is the rule: nobody celebrates alone.",
          ],
        },
        {
          heading: "Eid number two: Ibrahim's big trust",
          paragraphs: [
            "Eid al-Adha remembers Prophet Ibrahim and his son, who trusted Allah completely — and Allah saved the son and gave a great gift instead.",
            "Families who can, share meat from a special animal with neighbours and the poor. The Quran says Allah does not need the meat — He wants the goodness in your heart. The sharing is the proof.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Learn the takbir with a grown-up: \"Allahu akbar, Allahu akbar, la ilaha illa Allah!\" Say it together — that is the Eid sound.",
            "Then plan one Eid kindness: a card for a neighbour, a shared treat, or a gift for someone who would not expect one.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "ramadan-for-kids",
      "what-is-hajj",
      "prophet-ibrahim-story",
    ],
  },
  {
    slug: "how-the-quran-was-revealed",
    title: "How the Quran Was Revealed: From Hira to the Mushaf",
    seoTitle: "How the Quran Was Revealed & Compiled (Kids & Teens)",
    description:
      "The Quran's revelation explained: the first verses in cave Hira, 23 years of gradual revelation, memorisation and writing, and the compilation under Abu Bakr and Uthman.",
    excerpt:
      "The Quran came down over 23 years, piece by piece, into a living community that memorised it and wrote it down — then gathered it into one book that has not changed.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 7,
    keywords: [
      "how the Quran was revealed",
      "first revelation cave Hira",
      "Quran compilation",
      "Quran revealed over 23 years",
      "Quran for kids",
    ],
    intro: [
      "The Quran was not handed down as a finished book. It was revealed over twenty-three years, verse by verse, into real situations — a question asked, a battle fought, a grief felt — and the community around the Prophet memorised it, wrote it, and lived it. Then it was gathered into one mushaf, and it has remained unchanged since.",
      "This guide tells that story, with a children's version and a deeper one.",
    ],
    sections: [
      {
        heading: "The first night: cave Hira",
        paragraphs: [
          "In the year 610 CE, Muhammad, peace be upon him, was reflecting in the cave of Hira on the mountain of Light near Makkah. The angel Jibreel appeared and commanded: \"Read!\" Three times the command came, and then the first verses: \"Read in the name of your Lord who created... who taught by the pen, taught man that which he knew not\" (96:1-5).",
          "The first revelation was about knowledge and the Creator — a fitting opening for a book that would call itself \"a guidance for the righteous\" (2:2). The Prophet returned trembling to Khadijah, who became the first believer.",
        ],
      },
      {
        heading: "Twenty-three years, piece by piece",
        paragraphs: [
          "Revelation continued for twenty-three years: thirteen in Makkah, where the verses built faith, patience and tawhid under persecution; and ten in Madinah, where they built law, community and worship. The Quran explains the gradual method itself: \"And it is a Quran which We have separated by intervals, that you might recite it to the people over a prolonged period, and We have sent it down progressively\" (17:106).",
          "Verses came for moments: the slander against Aisha, the question about the Spirit, the treaty at Hudaybiyah. The book grew inside a life, which is why it reads like a conversation with a community rather than a textbook.",
        ],
      },
      {
        heading: "Memorised and written from the start",
        paragraphs: [
          "The Prophet recited each new passage, and the companions memorised it — an oral culture with extraordinary memories. At the same time, designated scribes wrote the verses on available materials: parchment, bone, palm branches, flat stones. Zayd ibn Thabit was one of the chief scribes.",
          "The Quran itself promises the preservation: \"Indeed, it is We who sent down the Reminder, and indeed, We will be its guardian\" (15:9). The means were human — memory and writing — and the promise was divine.",
        ],
      },
      {
        heading: "One book: Abu Bakr, then Uthman",
        paragraphs: [
          "After the Prophet's death in 632 CE, many memorisers fell in the battle of Yamama. Umar urged Abu Bakr to gather the written Quran into one collection; Zayd ibn Thabit led the work, verifying every verse against written and memorised witnesses. That collection passed to Umar, then to his daughter Hafsa.",
          "As Islam spread, Uthman had standard copies made from that collection and sent to the major cities, uniting the community on one text. Every Quran printed today matches that text — the same book, letter for letter, that the companions recited.",
        ],
        note: "Start reading it with a teacher: our [Quran classes](/courses/quran-reading) begin with the letters and build to fluent recitation, and [Tajweed lessons](/courses/tajweed) perfect it.",
      },
    ],
    kids: {
      intro: [
        "The Quran did not arrive all at once like a parcel. It came down piece by piece over 23 years — like a letter from Allah sent a little at a time, exactly when people needed it.",
      ],
      sections: [
        {
          heading: "The cave and the first words",
          paragraphs: [
            "Prophet Muhammad used to think quietly in a cave called Hira. One night, the angel Jibreel came and said: \"Read!\" The first words were about Allah who made everything, and about learning.",
            "Muhammad ran home to his wife Khadijah, and she believed him first. Then more words came — and kept coming for 23 years!",
          ],
        },
        {
          heading: "The memorisers and the writers",
          paragraphs: [
            "Every time new words came, the Prophet said them out loud, and his friends memorised them — hundreds of people carried the Quran in their hearts!",
            "Writers also wrote the words down on whatever they had: flat stones, palm leaves, bones. Later, it was all gathered into one book. And here is the amazing part: the Quran today is exactly the same as it was then. Not one letter changed.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Memorise one short surah tonight — like al-Ikhlas — and say it from memory tomorrow. You are doing exactly what the first Muslims did!",
            "Then ask a grown-up: how does it feel to carry Allah's words in your heart?",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "prophet-muhammad-story",
      "learn-quran-with-tajweed",
      "names-of-allah",
    ],
  },
  {
    slug: "names-of-allah",
    title: "The Beautiful Names of Allah: Knowing Whom You Worship",
    seoTitle: "The 99 Names of Allah Explained (Kids & Teens)",
    description:
      "The beautiful names of Allah explained: what the 99 names mean, key names like Ar-Rahman, Al-Khaliq and Al-Wadud, and how to call on Allah by them in du'a.",
    excerpt:
      "Allah has the most beautiful names, and the Quran tells us to call on Him by them. Each name is a window: mercy, creation, hearing, love — knowing the names changes the du'a.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 6,
    keywords: [
      "names of Allah",
      "99 names of Allah",
      "Asma ul Husna",
      "Ar-Rahman Ar-Rahim meaning",
      "names of Allah for kids",
    ],
    intro: [
      "\"And to Allah belong the best names, so invoke Him by them\" (Quran 7:180). The names of Allah are not labels; they are descriptions of who He is — the Merciful, the Creator, the Hearing, the Loving. The Prophet said Allah has ninety-nine names, and whoever enumerates them enters Paradise (Bukhari and Muslim) — meaning whoever learns them, believes in them, and lives by them.",
      "This guide introduces the names and how to use them, with a children's version and a deeper one.",
    ],
    sections: [
      {
        heading: "Why the names matter",
        paragraphs: [
          "You cannot love someone you do not know. The names are how Allah made Himself known: every name answers a question the heart asks. Who provides? Ar-Razzaq. Who forgives? Al-Ghafur. Who hears the whisper? As-Sami. Who sees the hidden? Al-Basir.",
          "The Quran opens with two of them — Ar-Rahman, Ar-Rahim, the Entirely Merciful, the Especially Merciful — and every surah but one begins with them. Mercy is the first thing Allah wants you to know about Him.",
        ],
      },
      {
        heading: "A few names to start with",
        paragraphs: [
          "Begin with a handful and go deep rather than wide:",
        ],
        list: [
          "Ar-Rahman, Ar-Rahim — the Merciful to all creation, and especially to the believers.",
          "Al-Khaliq — the Creator, who made everything from nothing.",
          "Al-Ghafur, At-Tawwab — the Forgiving, the Acceptor of repentance.",
          "As-Sami, Al-Basir — the All-Hearing, the All-Seeing; no whisper is lost.",
          "Al-Wadud — the Loving; He loves His righteous servants and they love Him (5:54).",
          "Al-Hakim — the Wise; nothing in His decree is random.",
          "Al-Hayy, Al-Qayyum — the Ever-Living, the Sustainer of all (2:255).",
        ],
      },
      {
        heading: "Calling on Allah by His names",
        paragraphs: [
          "The Quran's instruction is practical: invoke Him by the names (7:180). Match the name to the need: \"Ya Razzaq, provide for me\"; \"Ya Ghafur, forgive me\"; \"Ya Shafi, heal\"; \"Ya Wadud, put love in our home.\" The du'a of Yunus and Ayyub both work this way — praise the name, then present the need.",
          "The Prophet taught that the greatest name is in the du'a of Yunus and in the living, sustaining names of Ayat al-Kursi. Learning the names is not a memory game; it is learning whom you are talking to.",
        ],
        note: "Learn the full etiquette in [our du'a guide](/blog/how-to-make-dua), or read [Ayyub's prayer](/blog/prophet-ayyub-story), the model of praising before asking.",
      },
    ],
    kids: {
      intro: [
        "Allah has the most beautiful names — like Ar-Rahman (the Super-Merciful) and Al-Khaliq (the Maker of everything). Each name tells you something wonderful about Him.",
      ],
      sections: [
        {
          heading: "Names are like windows",
          paragraphs: [
            "Imagine a house with many windows. Each window shows you something about who lives inside. Allah's names are like that: Ar-Razzaq shows you He gives food, As-Sami shows you He hears every whisper, Al-Wadud shows you He loves.",
            "The Quran says: call Allah by His beautiful names! So when you need something, use the matching name.",
          ],
        },
        {
          heading: "Three names to learn tonight",
          paragraphs: [
            "Ar-Rahman: the Merciful — His mercy covers everyone, even people who forget Him.",
            "Al-Khaliq: the Creator — He made the stars, the ants, and you.",
            "Al-Ghafur: the Forgiving — when you say sorry, He loves to forgive.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Pick one name and use it in your du'a tonight: \"Ya Rahman, be merciful to my family.\" That is how the Quran tells us to ask.",
            "Then learn one new name each week. In a year you will know 52 windows into who Allah is!",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "how-to-make-dua",
      "shahada-explained",
      "prophet-ayyub-story",
    ],
  },
  {
    slug: "angels-in-islam",
    title: "Angels in Islam: The Unseen Helpers Made of Light",
    seoTitle: "Angels in Islam Explained for Kids & Teens",
    description:
      "Belief in angels explained from the Quran and Sunnah: what angels are, Jibreel, Mikail and Israfil, the recording angels, and why believing in them is part of faith.",
    excerpt:
      "Angels are real creations made of light, never disobeying Allah, each with a duty: revelation, provision, the trumpet, the records. Believing in them is the second article of faith.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 6,
    keywords: [
      "angels in Islam",
      "Jibreel Mikail Israfil",
      "belief in angels",
      "angels for kids",
      "recording angels",
    ],
    intro: [
      "Belief in angels is the second article of faith in Islam, named beside belief in Allah in the Quran: \"Righteousness is... one who believes in Allah, the Last Day, the angels, the Book, and the prophets\" (2:177). Angels are real creations, made of light (Muslim), who never disobey Allah and do exactly what they are commanded (66:6).",
      "This guide explains who they are and what they do, with a children's version and a deeper one.",
    ],
    sections: [
      {
        heading: "What angels are — and are not",
        paragraphs: [
          "Angels are not humans who died, not symbols, and not divine. They are a distinct creation: made of light, able to take forms by Allah's permission, without free will to disobey. \"They do not precede Him in word, and they act by His command\" (21:27). They do not eat, drink, or tire of worship: \"They exalt Him night and day and do not slacken\" (21:20).",
          "The Quran corrects two errors about them: they are not female (43:19, 37:150), and they are not Allah's children (19:88-92). They are honoured servants.",
        ],
      },
      {
        heading: "The named angels and their duties",
        paragraphs: [
          "The Quran and authentic Sunnah name several:",
        ],
        list: [
          "Jibreel (Gabriel) — the angel of revelation, who brought the Quran to the Prophet (2:97, 26:193).",
          "Mikail (Michael) — entrusted with rain and provision (mentioned in 2:98).",
          "Israfil — the angel who will blow the trumpet at the Hour (named in the Sunnah; the trumpet is in the Quran, 39:68).",
          "The angel of death — who takes souls at the appointed time (32:11).",
          "Malik — the keeper of Hell (43:77).",
        ],
      },
      {
        heading: "The angels around you",
        paragraphs: [
          "The Quran describes angels closer than the famous ones: recording angels who write every deed — \"Not a word does he utter except that there is a watcher by him, ready\" (50:18); guardians appointed over each person (6:61, 82:10-12); and angels who descend with peace on the night of decree (97:4).",
          "The Prophet said angels gather at the places of dhikr, and that when Allah loves a servant, He tells Jibreel, and love for that person is placed on earth (Bukhari). The unseen world is not distant; it is attentive.",
        ],
      },
      {
        heading: "Why believing in them changes you",
        paragraphs: [
          "If every word is recorded, speech becomes careful. If angels gather at dhikr, the gathering becomes worth attending. If revelation came through an angel, the Quran is not a human book. Belief in angels makes the unseen real — and the real unseen changes the visible life.",
        ],
        note: "Read [the Day of Judgement](/blog/day-of-judgment-in-islam), the day the trumpet sounds, or [the names of Allah](/blog/names-of-allah), the One the angels worship.",
      },
    ],
    kids: {
      intro: [
        "Angels are real! Allah made them from light, and they are His helpers. You cannot see them, but the Quran tells us their names and their jobs.",
      ],
      sections: [
        {
          heading: "Made of light",
          paragraphs: [
            "Angels are not people and not ghosts. Allah made them from light, and they always, always obey Him. They never get tired of saying His praise.",
            "Jibreel brought the Quran to the Prophet. Mikail looks after the rain and the food that grows. Israfil will blow a great trumpet on the last day. And the angel of death takes souls when their time comes.",
          ],
        },
        {
          heading: "The writers and the guards",
          paragraphs: [
            "Here is the amazing part: angels write down everything you do and say — the good and the bad. And other angels guard you by Allah's command.",
            "So your kind words are written. Your secret good deed is written. Nothing good is ever lost. That is why Muslims are careful with words and generous with good deeds.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Say something kind tonight — and remember it is being written down by an angel. That is a very special autograph!",
            "Then sit quietly for one minute and say subhanallah. The Prophet said angels gather where Allah is remembered. Maybe they are gathering right now.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "day-of-judgment-in-islam",
      "names-of-allah",
      "how-the-quran-was-revealed",
    ],
  },
  {
    slug: "day-of-judgment-in-islam",
    title: "The Day of Judgement in Islam: What Muslims Believe",
    seoTitle: "The Day of Judgement in Islam (Kids & Teens)",
    description:
      "The Last Day explained from the Quran: the trumpet, the resurrection, the records and the scales, the sirat, and Paradise and Hell — and why the belief gives life meaning.",
    excerpt:
      "The Last Day is the fifth article of faith: a trumpet, a gathering, a book of deeds, and scales that weigh a mustard seed. Nothing good is lost, and nothing wrong is ignored.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 7,
    keywords: [
      "Day of Judgement in Islam",
      "the Last Day Islam",
      "Yawm al-Qiyamah",
      "Paradise and Hell Islam",
      "Day of Judgement for kids",
    ],
    intro: [
      "Belief in the Last Day is the fifth article of faith, named in the Quran's definition of righteousness (2:177). The Quran returns to it constantly — not to frighten, but to give weight to choices: \"And We place the scales of justice for the Day of Resurrection, so no soul will be treated unjustly at all\" (21:47).",
      "This guide explains what Muslims believe about that Day, with a children's version and a deeper one.",
    ],
    sections: [
      {
        heading: "The trumpet and the gathering",
        paragraphs: [
          "The Hour comes suddenly; its timing is known only to Allah (7:187). Israfil blows the trumpet, and all in the heavens and earth fall senseless, then a second blast raises them: \"Then when the trumpet is blown, there will be no relationships between them that Day, nor will they ask about one another\" (23:101, 39:68).",
          "Everyone is gathered, barefoot and uncircumcised as the hadith describes, each person absorbed in their own matter: \"On that Day you will be exposed; no secret of yours will remain hidden\" (69:18).",
        ],
      },
      {
        heading: "The records and the scales",
        paragraphs: [
          "The recording angels' books are presented: \"Read your record. Sufficient is yourself against you this Day as accountant\" (17:14). The righteous receive the record in the right hand and are judged with an easy reckoning; the wrongdoer receives it behind the back (84:7-12, 69:19-25).",
          "The scales weigh deeds with perfect justice: \"And if there is even the weight of a mustard seed, We will bring it forth. And sufficient are We as accountant\" (21:47). The Prophet said the heaviest thing on the scale is good character (Tirmidhi).",
        ],
      },
      {
        heading: "The sirat, and the two homes",
        paragraphs: [
          "The sirat is the path over Hell that everyone crosses; the believers cross it at speeds according to their deeds — like lightning, like wind, like a running horse — while others are caught (Bukhari and Muslim). The Quran describes the rescue: \"Then We will save those who feared Allah\" (19:72).",
          "Paradise (Jannah) is gardens beneath which rivers flow, eternal, where no idle speech is heard — only peace (19:61-63, 13:35). Hell (Jahannam) is the home of those who rejected the truth and wronged people; the Quran's descriptions are severe, and its door is entered by choice made in life, not by accident.",
        ],
      },
      {
        heading: "Why the belief gives life meaning",
        paragraphs: [
          "Without the Last Day, the oppressor who dies rich and the victim who dies unheard leave the story unfinished. With it, every hidden good is recorded and every hidden wrong is answered. The belief does two things at once: it makes you careful — every word is written — and it makes you hopeful — every patience is paid.",
          "The Quran's balance: \"Whoever does an atom's weight of good will see it, and whoever does an atom's weight of evil will see it\" (99:7-8). Nothing is too small to matter.",
        ],
        note: "Read [the angels who record](/blog/angels-in-islam), or [how to make du'a](/blog/how-to-make-dua) for a good ending.",
      },
    ],
    kids: {
      intro: [
        "One day, Allah will gather everyone who ever lived. It is called the Day of Judgement. It sounds big — and it is! But for people who try to be good, it is the best day ever.",
      ],
      sections: [
        {
          heading: "The book of everything",
          paragraphs: [
            "Remember the writing angels? On that Day, their books are opened. Every kind word, every shared snack, every secret good deed — it is all there!",
            "Allah has special scales that weigh deeds. Even a tiny good deed, as small as a mustard seed, is weighed. Nothing good you do is ever lost.",
          ],
        },
        {
          heading: "The two homes",
          paragraphs: [
            "People who believed and tried to be good go to Jannah — a garden home with rivers, where everyone is happy forever and nobody gets sick or sad.",
            "People who chose to be bad and hurt others face a very sad place. That is why Muslims try hard to be kind and honest now — the choices we make today build our home tomorrow.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Do one tiny good deed tonight that nobody will notice — and remember: it will be on the scales, even if it is as small as a seed.",
            "Then ask Allah for Jannah in your own words. He loves to give it.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "angels-in-islam",
      "names-of-allah",
      "five-pillars-of-islam",
    ],
  },
  {
    slug: "how-to-make-dua",
    title: "How to Make Du'a: Talking to Allah the Prophetic Way",
    seoTitle: "How to Make Du'a: Etiquette & Best Times (Kids & Teens)",
    description:
      "Du'a explained from the Quran and Sunnah: why it is worship itself, the etiquette of asking, the best times and places, the prayers of the prophets, and why answers come in three forms.",
    excerpt:
      "Du'a is not a last resort; it is worship itself. Praise first, send salawat, ask with certainty, and be patient — the answer comes in one of three forms, and none is wasted.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 7,
    keywords: [
      "how to make dua",
      "dua etiquette",
      "best times for dua",
      "dua for kids",
      "prophets duas",
    ],
    intro: [
      "\"And your Lord says, 'Call upon Me; I will respond to you'\" (Quran 40:60). Du'a — calling on Allah — is not the emergency exit of faith; the Prophet called it worship itself (Tirmidhi). This guide gathers the etiquette, the best times, and the model prayers of the prophets, so your asking has both manners and confidence.",
      "Two reading levels below: simple for children, deeper with references for ages 13 and up.",
    ],
    sections: [
      {
        heading: "The etiquette of asking",
        paragraphs: [
          "The Sunnah gives du'a a shape: begin by praising Allah and sending salawat on the Prophet — the Prophet heard a man ask without these and said he had been hasty (Tirmidhi). Face the qiblah if you can, raise your hands, and ask with certainty: \"Call upon Allah with certainty that He will answer\" (Tirmidhi).",
          "Ask in any language — Allah understands all of them — and repeat: the Prophet liked to ask three times. Do not say \"I asked but was not answered\"; that impatience is the one thing that blocks the answer (Bukhari and Muslim). And do not ask for sin or for cutting family ties.",
        ],
      },
      {
        heading: "The best times and places",
        paragraphs: [
          "The texts name moments when the doors are widest:",
        ],
        list: [
          "In sujood — \"The nearest a servant is to his Lord is when he is prostrating, so increase du'a there\" (Muslim).",
          "The last third of the night — Allah descends to the lowest heaven and asks: who is calling on Me, that I may answer? (Bukhari and Muslim).",
          "Between the adhan and iqamah — du'a is not rejected then (Abu Dawud, Tirmidhi).",
          "While fasting, and at iftar — the fasting person has a du'a that is not rejected (Ibn Majah).",
          "On Friday, in the hour of response (Bukhari and Muslim).",
          "In distress, with the du'a of Yunus: la ilaha illa anta subhanaka inni kuntu min az-zalimin (21:87).",
        ],
      },
      {
        heading: "The prayers of the prophets",
        paragraphs: [
          "The Quran preserves the prophets' du'as as templates: Adam's words of repentance (7:23), Nuh's plea for deliverance (23:26-29), Ibrahim's \"make me an establisher of prayer, and from my descendants\" (14:40), Ayyub's \"adversity has touched me, and You are the Most Merciful\" (21:83), Yunus's prayer from the darkness (21:87), and Zakariya's whispered \"give me from Yourself an heir\" (19:5) and \"do not leave me alone\" (21:89).",
          "Notice the pattern: each one praises before it asks, admits before it requests, and asks for something that serves the message — not just the self.",
        ],
      },
      {
        heading: "The three forms of answer",
        paragraphs: [
          "The Prophet said no Muslim's du'a is rejected: Allah either gives the thing asked, or stores it for the Hereafter, or turns away an equivalent harm (Ahmad). The answer is guaranteed; the form is His wisdom.",
          "So ask for everything — the small and the huge — and trust the form. \"And when My servants ask you concerning Me — indeed I am near. I respond to the invocation of the supplicant when he calls upon Me\" (2:186).",
        ],
        note: "Read [Ayyub's story](/blog/prophet-ayyub-story) and [Yunus's story](/blog/prophet-yunus-story), the two great prayers of hardship, or [the names of Allah](/blog/names-of-allah) to call on Him by.",
      },
    ],
    kids: {
      intro: [
        "Du'a means talking to Allah. You do not need special words or a special place — He hears you everywhere, in any language, even in a whisper.",
      ],
      sections: [
        {
          heading: "The du'a recipe",
          paragraphs: [
            "Here is the Prophet's recipe: first say something beautiful about Allah — like \"Ya Rahman, You are the kindest.\" Then send salawat on the Prophet. Then ask for what you need, like you are sure He will answer.",
            "Raise your hands, say it three times, and do not give up. Allah always answers — sometimes He gives the thing, sometimes He saves it for later, and sometimes He protects you from something bad instead. All three are gifts!",
          ],
        },
        {
          heading: "The best times",
          paragraphs: [
            "Some times are extra-special: when your forehead is on the ground in sujood, late at night when the world is quiet, right before the prayer starts, when you are fasting, and on Fridays.",
            "And when you feel sad or stuck, say Yunus's prayer: \"Allah, there is no one like You. You are perfect. I was wrong.\" It works in every darkness.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Make a du'a list: three things for you, three for your family, three for other people. Ask for all of them tonight with the recipe.",
            "Then pick one prophet's du'a — Ayyub's or Yunus's — and learn it by heart. It will be your friend on hard days.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "names-of-allah",
      "prophet-ayyub-story",
      "prophet-yunus-story",
    ],
  },
  {
    slug: "halal-and-haram-food",
    title: "Halal and Haram: What Muslims Eat and Why",
    seoTitle: "Halal & Haram Food Explained (Kids & Teens)",
    description:
      "Halal and haram explained from the Quran: what is forbidden and why, the rules of slaughter, the tayyib principle, and the table manners the Prophet taught.",
    excerpt:
      "Halal means permitted, haram means forbidden — and the list is short. The bigger principle is tayyib: good, pure, wholesome. What you eat is part of worship.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 6,
    keywords: [
      "halal and haram food",
      "what is halal",
      "haram food in Islam",
      "halal for kids",
      "Islamic eating manners",
    ],
    intro: [
      "\"O mankind, eat from whatever is on earth that is lawful and good\" (Quran 2:168). The Quran's food rule has two words: halal (lawful) and tayyib (good, pure, wholesome). The forbidden list is short and explicit; everything else is permitted. This guide explains both the list and the manners, with a children's version and a deeper one.",
      "The same honesty applies beyond food: the prophet Shuayb's message was about fair trade, and the Quran ties lawful earnings to accepted du'a.",
    ],
    sections: [
      {
        heading: "The short forbidden list",
        paragraphs: [
          "The Quran names the prohibitions plainly: \"He has only forbidden to you dead animals, blood, the flesh of swine, and that which has been dedicated to other than Allah\" (2:173, repeated in 5:3 and 6:145). The detailed list in 5:3 adds animals killed by strangling, a blow, a fall, or goring, and what predators have partially eaten — unless slaughtered properly before death.",
          "Also forbidden: intoxicants (khamr) in all forms (5:90), and animals with fangs and talons per the Sunnah. Everything beyond the list is halal by default — the rule is permission, not suspicion.",
        ],
      },
      {
        heading: "The slaughter rules",
        paragraphs: [
          "For land animals to be halal, the slaughter (dhabihah) requires: a sane Muslim or a person of the Book, the name of Allah pronounced at slaughter (6:121), a sharp cut to the throat severing the windpipe, food pipe and the two jugular veins, and the blood drained. The animal must be alive at the cut, treated gently, and not shown the blade or other animals being slaughtered — the Prophet commanded excellence (ihsan) in slaughter (Muslim).",
          "Seafood is broadly permitted: \"Lawful to you is game from the sea and its food\" (5:96). The schools differ on details, but the default of the sea is permission.",
        ],
      },
      {
        heading: "Tayyib: the bigger principle",
        paragraphs: [
          "Halal is the floor; tayyib is the direction. The Quran pairs them: lawful AND good (2:168, 5:88). Food earned by cheating is not tayyib even if the animal was slaughtered correctly — the Prophet described a man whose food, drink and clothing were haram, and asked how his du'a could be answered (Muslim).",
          "So the question is not only \"is this meat halal?\" but \"is this money clean, is this trade fair, is this body being fed well?\" Moderation is part of it: \"Eat and drink, but be not excessive\" (7:31).",
        ],
      },
      {
        heading: "The table manners of the Prophet",
        paragraphs: [
          "The Sunnah gives the table a shape: say Bismillah at the start, eat with the right hand, eat from what is nearest, and if you forget, say \"Bismillah fi awwalihi wa akhirihi\" (Abu Dawud, Tirmidhi). Do not criticise food — the Prophet never found fault with it; if he liked it he ate it, if not he left it (Bukhari and Muslim).",
          "Eat together, share, and thank Allah at the end: \"Alhamdulillah alladhi at'amani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah.\" The table is a place of worship, not just fuel.",
        ],
        note: "Read [Shuayb's story](/blog/prophet-shuayb-story), the prophet of honest trade, or [the five pillars](/blog/five-pillars-of-islam) the lawful life supports.",
      },
    ],
    kids: {
      intro: [
        "Halal means \"okay to eat,\" and haram means \"not okay.\" Allah made the list of not-okay foods very short — and He gave us yummy, good food for everything else!",
      ],
      sections: [
        {
          heading: "The short list",
          paragraphs: [
            "Muslims do not eat pork, or blood, or animals that died on their own, or food offered to idols. And no drinks that make people dizzy and silly — those are haram too.",
            "Everything else — fruit, vegetables, fish, chicken and meat prepared the halal way — is halal. Allah's default is yes!",
          ],
        },
        {
          heading: "The table superpowers",
          paragraphs: [
            "The Prophet gave us table superpowers: say Bismillah before you eat, use your right hand, eat from the plate near you, and never say yucky things about the food.",
            "If you forget Bismillah, just say it when you remember — Allah is not counting mistakes. And at the end, say alhamdulillah. That is how eating becomes worship.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "At dinner tonight, use all four superpowers: Bismillah, right hand, near plate, alhamdulillah at the end.",
            "Then share one thing from your plate with someone. The Prophet said food for two is enough for three — sharing is a blessing multiplier.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "prophet-shuayb-story",
      "five-pillars-of-islam",
      "islamic-manners-for-kids",
    ],
  },
  {
    slug: "arabic-alphabet-for-beginners",
    title: "The Arabic Alphabet: 28 Letters, One Beautiful Family",
    seoTitle: "Arabic Alphabet for Beginners (Kids & Teens)",
    description:
      "Learn the 28 Arabic letters as shape families, meet the sounds English does not have, and follow a classroom-tested order for learning them — with a kids' version.",
    excerpt:
      "Arabic has 28 letters, written right to left, and most of them are cousins that share one shape. Learn the families first and the alphabet stops being scary.",
    category: "Arabic",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 6,
    keywords: [
      "Arabic alphabet for beginners",
      "28 Arabic letters",
      "learn Arabic letters",
      "Arabic alphabet for kids",
      "Arabic letters pronunciation",
    ],
    intro: [
      "\"Indeed, We have sent it down as an Arabic Qur'an that you might understand\" (Quran 12:2). The Quran was revealed in Arabic, so learning its letters is the first step to reading it the way it was revealed — not only in translation.",
      "The alphabet is smaller than it looks: 28 letters, written from right to left, and most of them belong to shape families. This guide is written for two readers at once — a child meeting the letters for the first time, and a student or teacher who wants a reliable order to learn and teach them.",
    ],
    sections: [
      {
        heading: "28 letters, a few shape families",
        paragraphs: [
          "Most Arabic letters are one base shape with different dots. Once you see the families, the alphabet shrinks from 28 strangers to about 10 shapes:",
        ],
        list: [
          "ب ت ث ن ي — one boat shape with 1, 2, 3 dots below or 2 above (ba, ta, tha, nun, ya).",
          "ج ح خ — one belly shape, dot inside, no dot, dot above (jim, ha, kha).",
          "د ذ and ر ز — two pairs of simple curves (dal, dhal, ra, zay).",
          "س ش and ص ض — the toothed shapes and the looped shapes (sin, shin, sad, dad).",
          "ط ظ and ع غ — the tall loop and the eye shape (ta, za, ayn, ghayn).",
          "ف ق — two loop-and-dot cousins (fa, qaf).",
          "ك ل م ه و ي ا ء — the remaining single shapes (kaf, lam, mim, ha, waw, ya, alif, hamza).",
        ],
        note: "Teaching tip: introduce one shape family per lesson, dots and all. Students who learn ب ت ث together confuse them far less than students who meet them weeks apart.",
      },
      {
        heading: "Sounds English does not have",
        paragraphs: [
          "Five letters need special care because English has no equivalent: ح (a sharp, breathy h from the middle of the throat), ع (a deep voiced sound from the same place), ق (a k made far back, at the uvula), ض (a heavy d unique to Arabic — the language is nicknamed \"the language of the dad\"), and the emphatic pair ص and ط, which are s and t said with the tongue raised and the mouth full.",
          "Do not approximate these with English sounds. A wrong mouth position changes the letter, and in the Quran a changed letter can change the meaning — قلب (qalb, heart) and كلب (kalb, dog) differ by one letter. This is why the letters are learned by listening and imitating a teacher, not by reading transliteration.",
        ],
      },
      {
        heading: "A reliable order to learn them",
        paragraphs: [
          "The classical primers — the Noorani Qaida tradition used across the Muslim world — teach the letters in small groups, each with its sound, then immediately join them into short words. A workable order: alif and the boat family (ب ت ث), then ج ح خ, then د ذ ر ز, then س ش ص ض, then ط ظ ع غ, then ف ق ك, then ل م ن ه و ي, and finally hamza.",
          "Three rules make it stick: say the sound before the name, write the letter while saying it, and review yesterday's family before starting today's. Ten focused minutes a day beats a two-hour weekend session — the mouth learns by repetition, not by marathon.",
        ],
      },
      {
        heading: "Why the letters matter",
        paragraphs: [
          "Reading the Arabic text connects a Muslim to the Quran directly: the rhythm, the rhyme, and the precision of the words are part of the message. Translation carries the meaning; the Arabic carries the meaning and the music.",
          "You do not need to speak Arabic fluently to read it. Millions of Muslims read the Quran letter by letter without conversational Arabic — reading is a separate skill, and it is the one the Quran itself asks for: \"...so recite what is easy of the Qur'an\" (73:20).",
        ],
        note: "Next: [how the letters change shape when they join hands](/blog/arabic-letter-shapes-and-connections), then [the vowel marks that give them sound](/blog/arabic-harakat-short-vowels).",
      },
    ],
    kids: {
      intro: [
        "Arabic has 28 letters, and they are written from right to left — like a mirror game! Most of the letters are cousins: they wear the same shape and only change their dots.",
      ],
      sections: [
        {
          heading: "The dot family",
          paragraphs: [
            "Look at ب ت ث. They all ride in the same little boat! Ba has one dot below, ta has two dots above, tha has three dots above. One shape, three letters — the dots are the name tags.",
            "And ج ح خ share one big belly shape: jim hides a dot inside, ha has no dot at all, and kha wears a dot on its head.",
          ],
        },
        {
          heading: "Letters with secret sounds",
          paragraphs: [
            "Some Arabic letters make sounds your mouth has never made before — like ح, a warm breath from the middle of your throat, and ق, a k from way, way back. That is okay! Your mouth is learning gymnastics.",
            "The best way to learn them is to listen to your teacher and copy, like a parrot with a very good ear. Transliteration is training wheels — the real sound comes from listening.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Open any page of the Quran with a grown-up and go on a dot hunt: find three letters with one dot, two letters with two dots, and one letter with three dots.",
            "Then say ba, ta, tha out loud five times, pointing at each one. You just read your first Arabic letters!",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "arabic-letter-shapes-and-connections",
      "arabic-harakat-short-vowels",
      "how-to-start-reading-arabic",
    ],
  },
  {
    slug: "arabic-letter-shapes-and-connections",
    title: "Arabic Letter Shapes: How Letters Join Hands",
    seoTitle: "Arabic Letter Shapes & Connections (Kids & Teens)",
    description:
      "Every Arabic letter has up to four shapes — alone, first, middle, last. Learn the four positions, the six letters that never join forward, and the special lam-alif.",
    excerpt:
      "Arabic is a cursive script: letters hold hands inside a word. Four positions, six shy letters, and one special pair — that is the whole system.",
    category: "Arabic",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 6,
    keywords: [
      "Arabic letter shapes",
      "Arabic letter connections",
      "Arabic letters joining",
      "initial medial final Arabic",
      "Arabic writing for beginners",
    ],
    intro: [
      "Arabic is always cursive — even in print. Inside a word, letters join to the letter after them, so each letter changes its shape depending on where it stands. This is the single biggest surprise for new readers, and the single biggest unlock once it clicks.",
      "The system is small: four positions, six letters that refuse to join forward, and one special pair. This guide walks through all of it with examples you can check in any mushaf.",
    ],
    sections: [
      {
        heading: "The four positions",
        paragraphs: [
          "A letter can stand alone, at the start of a word, in the middle, or at the end. Take ب (ba): alone it is ب, at the start it is بـ (the boat loses its tail and keeps the dot below), in the middle it is ـبـ (a short tooth with a dot below), and at the end it is ـب (the full boat again, joined from the right).",
          "Most letters follow the same logic: the beginning and middle forms are shortened connectors, the end and alone forms are the full shape. You do not memorise four separate alphabets — you learn one shape and how it trims itself to hold hands.",
        ],
      },
      {
        heading: "The six shy letters",
        paragraphs: [
          "Six letters never join to the letter after them: ا د ذ ر ز و (alif, dal, dhal, ra, zay, waw). They accept a hand from the letter before them, but they keep their full shape and leave a small gap after.",
          "That gap is a reading gift: it splits long words into visible chunks. In a word like وَرَدَ (warada, \"he arrived\"), none of the three letters joins forward, so the word reads as three clear pieces. Teachers call these the \"non-connecting six\" — drill them early and students stop trying to join what cannot join.",
        ],
        note: "Teaching tip: write وَرَدَ and مَرَرْتُ on the board and ask students to circle every gap after a shy letter. The gaps are the lesson.",
      },
      {
        heading: "The special pair: lam-alif",
        paragraphs: [
          "When ل (lam) meets ا (alif), they merge into one ligature: لا. It is not a 29th letter — it is lam plus alif written as a single graceful shape, like the way \"fi\" merges in some English fonts.",
          "You see it constantly: لَا (la, \"no\"), and inside the shahada — لَا إِلَٰهَ إِلَّا اللَّه. Recognising لا as two letters, not one, is a milestone in early reading.",
        ],
      },
      {
        heading: "How to practise joining",
        paragraphs: [
          "The classical primers join letters immediately: after learning ب ت ث, the student writes بَتَ, تَبَ, ثَبَتَ — real syllables, not isolated letters. This is why the Qaida method works: the shapes are learned in their natural habitat.",
          "A good daily drill: take three known letters, write them in all possible orders, and read each one aloud with its vowel marks. Ten minutes of this builds the shape-recognition that fluent reading runs on.",
        ],
        note: "Continue with [the vowel marks](/blog/arabic-harakat-short-vowels) and [the full reading path](/blog/how-to-start-reading-arabic).",
      },
    ],
    kids: {
      intro: [
        "Arabic letters hold hands inside a word! When they hold hands, they change their shape a little — like how you stand differently in a line than when you stand alone.",
      ],
      sections: [
        {
          heading: "Four ways to stand",
          paragraphs: [
            "A letter can stand alone, be first in line, be in the middle, or be last. First and middle letters stretch out a little arm to hold the next letter's hand. Last and alone letters keep their full shape.",
            "Look at the ba boat: ب alone, بـ first, ـبـ middle, ـب last. Same boat, same dot — just different arms!",
          ],
        },
        {
          heading: "The six shy letters",
          paragraphs: [
            "Six letters are shy: ا د ذ ر ز و. They will hold the hand of the letter before them, but they never reach forward. After a shy letter there is always a tiny gap in the word.",
            "The gaps are helpful! They chop big words into small, easy pieces — like the spaces between stepping stones.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Write the word بَاب (bab, \"door\") with a grown-up. Find the two ba boats holding hands around the tall alif in the middle.",
            "Then hunt for a shy letter on any Quran page and point to the little gap after it. You are reading shapes like a detective!",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "arabic-alphabet-for-beginners",
      "arabic-harakat-short-vowels",
      "first-arabic-words-for-kids",
    ],
  },
  {
    slug: "arabic-harakat-short-vowels",
    title: "Harakat: The Tiny Marks That Give Arabic Its Voice",
    seoTitle: "Arabic Harakat: Fatha, Kasra, Damma & More",
    description:
      "Fatha, kasra, damma, sukun, shadda and tanwin explained simply — the vowel marks that turn Arabic letters into sounds, with long vowels and a kids' version.",
    excerpt:
      "Arabic letters are the body; harakat are the voice. Three short vowels, a stop sign, a doubler and an n-sound — six tiny marks that make the whole language readable.",
    category: "Arabic",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 6,
    keywords: [
      "Arabic harakat",
      "fatha kasra damma",
      "Arabic vowel marks",
      "sukun shadda tanwin",
      "learn to read Arabic",
    ],
    intro: [
      "An Arabic letter without vowel marks is a body without a voice: ب could be ba, bi, bu, or just the consonant b. The harakat — the tiny marks above and below the letters — tell you exactly which sound to make. The Quran is printed fully vowelled, so a beginner can read every word correctly without guessing.",
      "There are only six marks to learn. This guide covers each one, then the long vowels that grow out of them — the same long vowels the tajweed rules of madd stretch and measure.",
    ],
    sections: [
      {
        heading: "The three short vowels",
        paragraphs: [
          "Fatha (َ ) is a small stroke above the letter: it says \"a\" — بَ = ba. Kasra (ِ ) is the same stroke below the letter: it says \"i\" — بِ = bi. Damma (ُ ) is a tiny curl above, shaped like a little waw: it says \"u\" — بُ = bu.",
          "Each short vowel is one count — one quick beat. The classic first drill is the triple: بَ بِ بُ (ba, bi, bu), then the same with every letter of the alphabet. When a student can run the triple across all 28 letters without hesitation, the vowel system is installed.",
        ],
      },
      {
        heading: "Sukun: the stop sign",
        paragraphs: [
          "Sukun (ْ ) is a small circle above the letter and means \"no vowel — stop on the consonant.\" In بَاب (bab), the alif carries no mark of its own; the first ba has fatha, and the word ends on a closed b sound. Sukun is what makes a syllable closed: بَتْ = bat.",
          "Sukun also appears on the letters of madd (long vowels) and on the noon of noon sakinah — the starting point of four important tajweed rules. A small circle, a big job.",
        ],
      },
      {
        heading: "Shadda and tanwin",
        paragraphs: [
          "Shadda (ّ ) looks like a tiny shin and means \"double this letter\": رَبُّ = rabbu, not rabu. The letter is said twice — first with sukun, then with its vowel — fused into one strong sound. Shadda plus noon or meem also triggers ghunnah, the two-count nasal hum of tajweed.",
          "Tanwin is a doubled fatha, kasra or damma (ً ٍ ٌ) at the end of a word, and it adds an \"n\" sound: كِتَابٌ = kitabun, كِتَابٍ = kitabin, كِتَابًا = kitaban. It is the \"-n\" of Arabic grammar, written as a vowel mark. In recitation, tanwin follows exactly the same four rules as noon sakinah.",
        ],
        note: "Teaching tip: teach shadda as \"a hidden sukun letter plus a vowelled letter\" — رَبُّ = رَبْ + بُ. Students who see the two parts stop dropping the doubling.",
      },
      {
        heading: "The long vowels: madd",
        paragraphs: [
          "Three letters stretch the short vowels into long ones: alif after a fatha (بَا = baa), waw with sukun after a damma (بُو = buu), and ya with sukun after a kasra (بِي = bii). Each is held two counts — twice the length of a short vowel. This natural lengthening is called madd tabi'i.",
          "When a hamza or a sukun comes after a long vowel, the stretch grows to four, five or six counts — the madd rules of tajweed. Learn the two-count foundation first; the rest is built on it.",
        ],
        note: "Go deeper: [the madd rules and their counts](/blog/madd-rules-in-tajweed), and [the full path from marks to fluent reading](/blog/how-to-start-reading-arabic).",
      },
    ],
    kids: {
      intro: [
        "Arabic letters wear tiny hats and shoes! The hats and shoes are called harakat, and they tell the letter which sound to make. Without them, a letter is quiet. With them, it sings!",
      ],
      sections: [
        {
          heading: "Three tiny sounds",
          paragraphs: [
            "Fatha is a little hat ABOVE the letter and says \"a\" — بَ is ba! Kasra is a little slide BELOW the letter and says \"i\" — بِ is bi! Damma is a tiny curl above and says \"u\" — بُ is bu!",
            "Say them like a song: ba, bi, bu! Now try ta, ti, tu! Every letter in Arabic can sing this song.",
          ],
        },
        {
          heading: "The stop sign and the doubler",
          paragraphs: [
            "Sukun is a little circle that says \"stop here, no vowel!\" It is like a red light for the sound. And shadda is a tiny w that says \"say me TWICE!\" رَبُّ is rabbu — two b's squeezed into one strong b.",
            "Tanwin is a double hat at the end of a word, and it adds an n: kitabun! It is the word's way of saying \"and that's the end, n!\"",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Play the ba-bi-bu game with a grown-up: they point to بَ بِ بُ and you sing the sounds. Then swap — you point, they sing. If they make a mistake, catch it!",
            "Bonus round: find a shadda on any Quran page and say its letter twice, like a drumbeat. Dum-dum!",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "arabic-alphabet-for-beginners",
      "madd-rules-in-tajweed",
      "how-to-start-reading-arabic",
    ],
  },
  {
    slug: "arabic-sun-and-moon-letters",
    title: "Sun and Moon Letters: Why the L Sometimes Disappears",
    seoTitle: "Arabic Sun & Moon Letters Explained (Kids & Teens)",
    description:
      "The 14 sun letters melt the lam of \"al-\" and the 14 moon letters keep it. Learn both lists, the tongue-tip trick, and Quran examples like ash-shams and al-qamar.",
    excerpt:
      "Why do we say ash-shams but al-qamar? Half the alphabet melts the \"l\" of \"the\", half keeps it. Two lists of 14 and one tongue trick explain the whole rule.",
    category: "Arabic",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 5,
    keywords: [
      "Arabic sun and moon letters",
      "sun letters list",
      "moon letters list",
      "al- lam pronunciation",
      "Arabic definite article rule",
    ],
    intro: [
      "Every Arabic beginner notices it: the word for \"the\" is ال (al-), yet we say ash-shams (the sun), not al-shams, and ar-rahman, not al-rahman — but al-qamar (the moon) keeps its l. The alphabet is split into two teams of 14, and the team decides what happens to the lam.",
      "This is one of the first tajweed rules a child learns, and one of the easiest to make permanent, because the rule lives in the mouth: sun letters are made at the tip of the tongue, right next to where lam is made.",
    ],
    sections: [
      {
        heading: "The rule in one sentence",
        paragraphs: [
          "If the letter after ال is a sun letter, the lam is not pronounced — it melts into the next letter, which is doubled (written with shadda). If the letter is a moon letter, the lam is pronounced clearly. الشمس = ash-shams (sun letter ش), القمر = al-qamar (moon letter ق).",
          "The lam is still written in both cases — this is a rule of pronunciation, not spelling. In a mushaf you will often see a small sad-shaped mark above the lam of a sun-letter word, a reminder to skip it.",
        ],
      },
      {
        heading: "The two lists",
        paragraphs: [
          "The 14 sun letters (al-huruf ash-shamsiyyah): ت ث د ذ ر ز س ش ص ض ط ظ ل ن. The 14 moon letters (al-huruf al-qamariyyah): ا ب ج ح خ ع غ ف ق ك م ه و ي.",
          "You do not have to memorise both lists. The sun letters are exactly the letters made with the tip or blade of the tongue near the front teeth — the same neighbourhood as lam (ل). Because they are neighbours, the tongue slides straight from the lam position into the doubled letter. The moon letters are made elsewhere — the throat, the lips, the back of the tongue — so the lam gets its own clear moment.",
        ],
        note: "Teaching tip: have students say ل then each candidate letter slowly. If the tongue tip barely moves, it is a sun letter. The mouth discovers the list before the memory does.",
      },
      {
        heading: "Quran examples to practise",
        paragraphs: [
          "Open al-Fatiha and the rule appears four times: الْحَمْد (al-hamdu — moon letter ح, lam clear), الرَّحْمَٰن (ar-rahmani — sun letter ر, lam melted), الرَّحِيم (ar-rahimi — same), and الصِّرَاط (as-sirata — sun letter ص).",
          "The rule also applies inside words and to the lam of the divine name: اللَّه is pronounced Allaha, with the lam doubled, because ل is itself a sun letter. Reciters apply this automatically — it is one of the first habits a tajweed teacher installs.",
        ],
        note: "This rule is part of the bigger tajweed map — see [tajweed rules for beginners](/blog/tajweed-rules-for-beginners) and [the letters' articulation points](/blog/makharij-arabic-letter-sounds).",
      },
    ],
    kids: {
      intro: [
        "In Arabic, \"the\" is al-. But sometimes the l plays hide-and-seek! The letters of the alphabet are two teams — the Sun team and the Moon team — and the team decides if the l is heard or hidden.",
      ],
      sections: [
        {
          heading: "Sun melts it, moon keeps it",
          paragraphs: [
            "The sun is hot — it MELTS the l! When a sun letter comes after al-, the l disappears and the next letter gets doubled: ash-shams, not al-shams. The sun is so bright you can't see the l!",
            "The moon is cool — it KEEPS the l safe. When a moon letter comes after al-, you say the l clearly: al-qamar. The moon shines gently on the l and it stays.",
          ],
        },
        {
          heading: "The tongue-tip trick",
          paragraphs: [
            "Here is the secret: sun letters are made with the tip of your tongue, right behind your top teeth — the same place as l! So your tongue just slides over and the l melts in.",
            "Moon letters are made somewhere else — your throat, your lips, the back of your mouth. Your tongue has to travel, so the l gets its own say first.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Say ash-shams five times, then al-qamar five times. Feel your tongue tip stay home for shams and travel for qamar!",
            "Then open al-Fatiha with a grown-up and find ar-Rahman and ar-Raheem — two melted l's hiding in the very first page of the Quran.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "arabic-alphabet-for-beginners",
      "tajweed-rules-for-beginners",
      "arabic-harakat-short-vowels",
    ],
  },
  {
    slug: "first-arabic-words-for-kids",
    title: "First Arabic Words: Greetings, Manners and Everyday Treasures",
    seoTitle: "First Arabic Words for Kids (with Meanings)",
    description:
      "Salam, shukran, bismillah and more: the first Arabic words every child can learn this week — greetings, classroom words, numbers 1-10 and the daily dhikr phrases.",
    excerpt:
      "A child's first Arabic words should be the ones they can use today: salam at the door, shukran at the table, bismillah before everything. Here is the starter treasure chest.",
    category: "Arabic",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 5,
    keywords: [
      "first Arabic words for kids",
      "Arabic greetings",
      "basic Arabic words",
      "Arabic numbers 1 to 10",
      "Islamic phrases for kids",
    ],
    intro: [
      "The best first words in any language are the ones a child can use before the lesson ends. For Arabic, those words are already part of a Muslim child's day: the greeting at the door, the thanks at the table, the bismillah before eating. This guide collects them into one starter chest — with meanings, and a teacher's note on how to make them stick.",
      "No alphabet knowledge is needed for this list. These are spoken treasures first; the written forms come later, and they come easier once the mouth already owns the word.",
    ],
    sections: [
      {
        heading: "Greetings and manners",
        paragraphs: [
          "The greeting is a du'a: as-salamu alaykum — \"peace be upon you\" — and the reply is wa alaykumu s-salam — \"and upon you peace.\" The Prophet taught that those nearest to Allah are those who are first to give the salam (Abu Dawud), and that spreading salam is a cause of love between people (Muslim).",
          "The manners kit: shukran (thank you), afwan (you're welcome), min fadlak (please), na'am (yes), la (no), and the beautiful reply to thanks: jazak Allahu khayran — \"may Allah reward you with good\" (Tirmidhi).",
        ],
      },
      {
        heading: "The daily phrases",
        paragraphs: [
          "These five phrases turn ordinary moments into worship: bismillah (in the name of Allah) before starting, alhamdulillah (all praise is for Allah) after finishing or when grateful, subhanallah (glory be to Allah) at wonder, Allahu akbar (Allah is the greatest) in prayer and amazement, and insha'Allah (if Allah wills) when planning — following the Quran's own instruction in 18:23-24.",
          "Teach them as anchors, not vocabulary: bismillah lives at the start of eating, alhamdulillah at the end, insha'Allah on every \"tomorrow we will...\". A phrase tied to a moment is remembered for life.",
        ],
        note: "Teaching tip: adopt ONE phrase per week as the class ritual — everyone says it at the same moment every lesson. By week five the class runs on Arabic without noticing.",
      },
      {
        heading: "Home and classroom words",
        paragraphs: [
          "Ten objects a child can point at today: kitab (book), qalam (pen), bab (door), bayt (house), madrasa (school), ma' (water), yad (hand), ayn (eye), shams (sun), qamar (moon). Point, say, repeat — the classic method, and it works because the word lands on a real thing.",
          "And the numbers one to ten: wahid, ithnan, thalatha, arba'a, khamsa, sitta, sab'a, thamaniya, tis'a, ashara. Count fingers, count steps, count spoons — numbers are the easiest vocabulary to practise because the world is full of things to count.",
        ],
      },
      {
        heading: "How to make them stick",
        paragraphs: [
          "Three rules from the classroom: use the word in a real moment the same day it is learned; greet the child in Arabic every single time so the greeting becomes reflex; and never correct a child's pronunciation harshly — model the right sound and let them copy. The Prophet was gentle with beginners; a child who fears mistakes stops speaking.",
          "When the spoken chest is full, the written journey begins naturally: the child already knows what بَاب means when they meet it in letters — the shape is the only new thing.",
        ],
        note: "Next steps: [the alphabet](/blog/arabic-alphabet-for-beginners), [Islamic manners for kids](/blog/islamic-manners-for-kids), and [the full reading path](/blog/how-to-start-reading-arabic).",
      },
    ],
    kids: {
      intro: [
        "Arabic is a treasure chest of words you can use TODAY — at the door, at the table, and when you see something amazing. Here are the first treasures. No reading needed — just your voice!",
      ],
      sections: [
        {
          heading: "The greeting superpower",
          paragraphs: [
            "When you meet someone, say: as-salamu alaykum! It means \"peace be upon you\" — you are giving them a gift of peace. They answer: wa alaykumu s-salam — \"and peace upon you too!\"",
            "The Prophet said the people nearest to Allah are the ones who say salam FIRST. So be quick — be the first to give the gift!",
          ],
        },
        {
          heading: "Magic words for every day",
          paragraphs: [
            "Bismillah before you start anything. Alhamdulillah when you finish or when something good happens. Subhanallah when you see something amazing — a rainbow, a baby, a huge mountain! Allahu akbar — Allah is the greatest! And insha'Allah when you plan: \"Tomorrow we will play, insha'Allah!\"",
            "And shukran means thank you. Say it at dinner tonight and watch someone smile.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Give three people the salam gift tonight — family, a friend, even the cat (the cat gets a bonus treat). Then say shukran at dinner and alhamdulillah after.",
            "Count your fingers in Arabic: wahid, ithnan, thalatha, arba'a, khamsa! Five fingers, five new words. You are already speaking Arabic!",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "arabic-alphabet-for-beginners",
      "islamic-manners-for-kids",
      "how-to-start-reading-arabic",
    ],
  },
  {
    slug: "how-to-start-reading-arabic",
    title: "How to Start Reading Arabic: The Step-by-Step Path",
    seoTitle: "How to Start Reading Arabic (Step-by-Step Path)",
    description:
      "From the 28 letters to reading the Quran: the classical step-by-step path, realistic timelines for kids and adults, daily practice habits, and how a teacher accelerates it.",
    excerpt:
      "Letters, vowel marks, joining, short words, then the mushaf. The classical path has five rungs and no shortcuts — but with ten minutes a day, most students climb it in months, not years.",
    category: "Arabic",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 7,
    keywords: [
      "how to start reading Arabic",
      "learn to read Quran",
      "Noorani Qaida method",
      "Arabic reading for beginners",
      "learn Arabic online",
    ],
    intro: [
      "Reading Arabic is a skill with a known map. For over a century the Muslim world has taught it through the same ladder — the Noorani Qaida and its relatives — and the ladder works for six-year-olds and sixty-year-olds alike. This guide lays out the five rungs, the habits that make them climbable, and the honest timelines.",
      "The goal of the path is not conversational Arabic. It is reading: seeing a fully vowelled word and saying it correctly. That is a separate, smaller skill than fluency — and it is the one that opens the Quran.",
    ],
    sections: [
      {
        heading: "The five rungs",
        paragraphs: [
          "Each rung is mastered before the next begins. The classical primers are built exactly this way — which is why a good teacher with a Qaida can take a zero-beginner to reading short surahs in a few months of steady lessons.",
        ],
        listStyle: "steps",
        list: [
          "Letters and sounds — the 28 letters in shape families, correct makharij from day one.",
          "Harakat — the three short vowels, then sukun, shadda, tanwin, drilled as syllables.",
          "Joining — four positions, the six shy letters, short real words.",
          "Connected reading — vowelled phrases and verses, sun/moon letters, first tajweed rules.",
          "The mushaf — Juz 'Amma, then longer surahs, real pages at a steady pace.",
        ],
      },
      {
        heading: "The daily habit that beats everything",
        paragraphs: [
          "Ten to fifteen minutes every day, out loud, with correction. The mouth is a muscle and reading is a motor skill — frequency beats duration. A child who reads ten minutes daily will outpace a child who reads two hours every Saturday, because the mouth forgets less between sessions.",
          "Read aloud, always. Silent reading hides mistakes; the ear catches what the eye misses. And record yourself once a week — the gap between what you think you said and what you actually said is where the learning lives.",
        ],
      },
      {
        heading: "Why a teacher changes the timeline",
        paragraphs: [
          "The sounds of Arabic are learned mouth-to-mouth. The classical chain is talaqqi — the student sits before a teacher, hears the letter, copies it, and is corrected on the spot. A video cannot hear your ح and tell you it became ه. This is why the Prophet's companions learned by sitting with him, and why the recitation chains (isnad) run teacher to student back to the Prophet himself.",
          "A good teacher also diagnoses: an adult who already knows the alphabet skips rung 1; a child who confuses ض and ظ gets a week of minimal pairs. Self-study plateaus at exactly the mistakes you cannot hear — a teacher is the mirror your ear does not have.",
        ],
        note: "Our [online Quran classes for kids](/blog/online-quran-classes-for-kids) and [one-to-one lessons](/courses) follow this path with qualified teachers. See also [what tajweed adds once you can read](/blog/learn-quran-with-tajweed).",
      },
      {
        heading: "Honest timelines",
        paragraphs: [
          "With two or three lessons a week plus daily practice: most children reach connected reading in three to six months and Juz 'Amma within a year. Adults often move faster through the letters (they understand the system) but slower through the new sounds (the mouth is less plastic) — expect a similar overall range, with the throat letters taking the longest.",
          "The plateau to expect is rung 3 to 4: joining feels slow and words feel long. It passes. Every fluent reader you have ever heard once sounded out بَاب letter by letter. The only failure mode is stopping.",
        ],
        note: "Teaching tip: keep a one-page error log per student — the three sounds they miss most. Five minutes of targeted drilling per lesson fixes more than an hour of general reading.",
      },
    ],
    kids: {
      intro: [
        "Learning to read Arabic is like climbing a ladder with five steps. You start at the bottom with the letters, and one day — without even noticing — you are reading the Quran at the top!",
      ],
      sections: [
        {
          heading: "The five steps",
          paragraphs: [
            "Step 1: meet the 28 letters and their sounds. Step 2: learn the tiny hats and shoes (harakat) that give the letters their voice. Step 3: watch the letters hold hands inside words. Step 4: read short verses, nice and slow. Step 5: read real Quran pages — starting with the short surahs at the back!",
            "You climb one step at a time, and your teacher makes sure each step is strong before you go up. No rushing — strong steps make fast climbers!",
          ],
        },
        {
          heading: "The ten-minute secret",
          paragraphs: [
            "Here is the secret that beats everything: ten minutes EVERY DAY, out loud. Not two hours once a week — ten minutes every day! Your mouth is like a muscle: it grows a little every day you use it.",
            "Read out loud so your ears can help your eyes. And once a week, record yourself and listen back — you will hear yourself getting better, like a plant you can actually watch grow.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Ask a grown-up to read al-Fatiha with you, one verse at a time. You repeat after them — that is exactly how the companions learned from the Prophet!",
            "Then pick your ten-minute time: after breakfast? After school? Before bed? Tell your grown-up your time, and start tomorrow. The ladder is waiting!",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "arabic-alphabet-for-beginners",
      "learn-quran-with-tajweed",
      "online-quran-classes-for-kids",
    ],
  },
  {
    slug: "tajweed-rules-for-beginners",
    title: "Tajweed Rules for Beginners: The Complete Map",
    seoTitle: "Tajweed Rules for Beginners (Kids & Teens)",
    description:
      "What tajweed is, why the Quran commands it, and the seven rule families every beginner meets — makharij, sifat, noon and meem sakinah, madd, qalqalah, ghunnah and stopping.",
    excerpt:
      "Tajweed means giving every letter its right and its due. The rules look like a jungle, but they are seven families on one map — and you already use half of them when you read.",
    category: "Tajweed",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 7,
    keywords: [
      "tajweed rules for beginners",
      "what is tajweed",
      "tajweed rules list",
      "learn tajweed",
      "Quran recitation rules",
    ],
    intro: [
      "\"...and recite the Qur'an with measured recitation\" (Quran 73:4). The word the Quran uses is tartil — slow, clear, beautiful recitation, each letter given its full weight. Tajweed is the science that makes tartil possible: the rules for pronouncing every letter exactly as it was revealed.",
      "The word tajweed itself means \"to make better.\" Technically it is giving every letter its right (its articulation point and permanent qualities) and its due (the rules that apply in context — when to stretch, merge, hide or bounce). This guide is the map of the whole territory, with links into each region.",
    ],
    sections: [
      {
        heading: "Why the rules exist",
        paragraphs: [
          "Arabic is a language where one letter changes everything: قلب (qalb) is heart, كلب (kalb) is dog; حَلَق (halaq) is to shave, هَلَكَ (halaka) is to perish. The Quran was revealed with precise sounds, and the Prophet recited it to the companions exactly as Jibril recited it to him. The companions recited to the next generation, and so on — an unbroken chain of mouths and ears.",
          "Tajweed is not decoration added later. It is the preservation of the revealed sound. The scholars wrote the rules down so that any student, in any century, could check their recitation against the standard the chain carried.",
        ],
      },
      {
        heading: "The seven families",
        paragraphs: [
          "Every tajweed rule belongs to one of seven families. Learn the map first and each rule you meet later has a home:",
        ],
        list: [
          "Makharij — where each letter is born: the 17 articulation points in five regions of the mouth, throat and nose.",
          "Sifat — the permanent qualities of each letter: heavy or light, whispered or voiced, and the special ones like the bounce of qalqalah.",
          "Noon sakinah and tanween — the four rules (izhar, idgham, iqlab, ikhfa) for a noon with no vowel, plus the three rules for meem sakinah.",
          "Madd — the stretchy vowels: two counts naturally, up to six when a hamza or sukun follows.",
          "Qalqalah — the echo on five letters (ق ط ب ج د) when they carry sukun.",
          "Ghunnah — the two-count nasal hum on noon and meem with shadda.",
          "Waqf and ibtida — where to stop and where to start again, so the meaning is never cut in the wrong place.",
        ],
        note: "Start with [makharij](/blog/makharij-arabic-letter-sounds), then [noon sakinah](/blog/noon-sakinah-and-tanween-rules), then [madd](/blog/madd-rules-in-tajweed) and [qalqalah & ghunnah](/blog/qalqalah-and-ghunnah) — that is the order most teachers use.",
      },
      {
        heading: "The order to learn them",
        paragraphs: [
          "The classical order is: letters and their points first (makharij), then their qualities (sifat), then the contextual rules (noon/meem, madd, qalqalah, ghunnah), then stopping and starting. The logic is simple: you cannot apply a rule to a letter you cannot pronounce. A student who says ح as h will apply the izhar rule perfectly and still recite incorrectly.",
          "In practice a good teacher interleaves: a new rule each week, drilled on real verses, while the mouth positions are corrected continuously. Rules without recitation are trivia; recitation without rules is guesswork. The two grow together.",
        ],
      },
      {
        heading: "How to actually learn",
        paragraphs: [
          "Tajweed is transmitted, not downloaded. The chain is talaqqi — sitting before a teacher, hearing, copying, being corrected. A book can tell you that ikhfa hides the noon; only a teacher can hear whether you hid it correctly. This is why every recitation chain (isnad) in the world runs through named teachers back to the Prophet.",
          "Between lessons: listen to one reciter daily (al-Husary is the classic teaching recitation — slow, exact, every rule audible), read aloud, and record yourself weekly. The ear trains the mouth. Our [tajweed course guide](/blog/learn-quran-with-tajweed) explains what structured study looks like, and [online Quran classes](/blog/online-quran-classes-for-kids) put a teacher in the loop from day one.",
        ],
        note: "Teaching tip: teach one rule per week on ONE short surah the student already knows. New rule + familiar text = the ear hears the rule, not the struggle of decoding.",
      },
    ],
    kids: {
      intro: [
        "The Quran has its own beautiful music — and tajweed is the secret of keeping that music exactly right! Allah said to recite the Quran slowly and beautifully (73:4). Tajweed rules are like the rules of a game: once you know them, reciting becomes more fun, not less.",
      ],
      sections: [
        {
          heading: "Why sounds matter",
          paragraphs: [
            "In Arabic, one letter can change the whole meaning! Qalb means heart, but kalb means dog. So when we read the Quran, we give every letter its exact sound — like a musician playing exactly the right note.",
            "The Prophet read the Quran to his friends, and they read it to their friends, all the way down to your teacher today. Tajweed is how the beautiful sound travelled through time without changing.",
          ],
        },
        {
          heading: "The rule families",
          paragraphs: [
            "There are seven rule families: where letters live in your mouth (makharij), how letters behave (sifat), the chameleon noon rules, the stretchy vowels (madd), the bouncing letters (qalqalah), the humming letters (ghunnah), and where to stop and start.",
            "You already know some! When you say ash-shams instead of al-shams, that is a tajweed rule. When you stretch the aa in al-Fatiha, that is madd. You are already playing the game!",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Listen to al-Fatiha by a slow, clear reciter with a grown-up. Clap softly every time you hear a LONG stretched sound — those are the madd letters!",
            "Then recite al-Fatiha yourself, nice and slow, like honey pouring. That slow, beautiful way is called tartil — and it is exactly what Allah asked for.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "makharij-arabic-letter-sounds",
      "noon-sakinah-and-tanween-rules",
      "learn-quran-with-tajweed",
    ],
  },
  {
    slug: "makharij-arabic-letter-sounds",
    title: "Makharij: Where Every Arabic Letter Is Born",
    seoTitle: "Makharij al-Huruf: 17 Articulation Points",
    description:
      "The five regions and 17 articulation points of Arabic letters — throat, tongue, lips, nose and the empty space — with the tricky pairs every non-Arab must drill.",
    excerpt:
      "Every Arabic letter has a birthplace: one of 17 points in five regions of the mouth, throat and nose. Find the birthplace and the sound follows.",
    category: "Tajweed",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 7,
    keywords: [
      "makharij al-huruf",
      "Arabic articulation points",
      "makharij of letters",
      "Arabic pronunciation",
      "tajweed makharij",
    ],
    intro: [
      "Makharij al-huruf means \"the exit points of the letters\" — where each sound is born. Classical tajweed counts 17 specific points spread across five general regions: the empty space (al-jawf), the throat (al-halq), the tongue (al-lisan), the two lips (ash-shafatan), and the nasal passage (al-khayshum).",
      "This is the foundation of all recitation: every other rule assumes the letter itself is correct. A student who masters makharij has done the hardest half of tajweed before meeting a single rule.",
    ],
    sections: [
      {
        heading: "The five regions",
        paragraphs: [
          "Al-jawf (the empty space of mouth and throat) is the home of the three madd letters — alif, waw and ya — whose sound ends only when the breath ends. Al-halq (the throat) hosts six letters in three points: ء and ه at the deepest point, ع and ح in the middle, غ and خ at the nearest point to the mouth.",
          "Al-lisan (the tongue) is the biggest region: ten points, from the back of the tongue (ق, then ك) through the middle (ج ش ي) and the sides (ض, then ل) to the tip (ن, ر, ط د ت, ص ز س, ظ ذ ث). Ash-shafatan (the lips) hosts ف (lower lip with upper teeth) and ب م و (the two lips). Al-khayshum (the nasal passage) is the home of ghunnah — the hum that rides on noon and meem.",
        ],
      },
      {
        heading: "The throat letters, one by one",
        paragraphs: [
          "The six throat letters are the hardest for non-Arabs because English uses almost none of them. Deepest point: ء (hamza, a clean glottal stop) and ه (ha, a soft breath from the depths — the h of \"ahead\" said with feeling). Middle: ع (ayn, a voiced squeeze of the throat) and ح (ha, the sharp breathy h of fogging a mirror, from mid-throat). Nearest: غ (ghayn, a gargling g) and خ (kha, the same place unvoiced — the ch of Scottish \"loch\").",
          "The drill that works: hand on throat, say each pair slowly, feel the vibration. ء and ه differ by voicing; ع and ح differ by voicing; غ and خ differ by voicing. Three pairs, one contrast each — the throat is a small, learnable instrument.",
        ],
        note: "Teaching tip: teach the throat letters with the student's hand on their own throat. Feeling the difference between ع (buzz) and ح (breath) installs in one lesson what transliteration never installs.",
      },
      {
        heading: "The tricky pairs to drill",
        paragraphs: [
          "Beyond the throat, five pairs cause most errors: س/ص/ث (three different s-sounds — plain, heavy, and lisped), ذ/ز/ظ (three different dh/z sounds — soft, buzzing, heavy), ت/ط (light t and heavy t), د/ض (light d and the heavy side-of-tongue d), and ق/ك (back k and front k).",
          "Drill them as minimal pairs — words that differ by exactly one letter: سَيْف (sayf, sword) vs صَيْف (sayf, summer); قَلْب (qalb, heart) vs كَلْب (kalb, dog). The ear learns the contrast first; the mouth follows. Ten minutes of minimal pairs a week fixes what months of general reading cannot.",
        ],
      },
      {
        heading: "How to practise at home",
        paragraphs: [
          "Three tools: a mirror (watch the lips and jaw — heavy letters raise the back of the tongue and round the mouth slightly), a recording (say the pair, listen back, compare with a teacher's model), and a slow reciter (al-Husary pronounces every point audibly — listen for where each letter lives).",
          "The goal is not speed. A letter said correctly slowly will become fast with repetition; a letter said wrongly fast becomes a permanent error. The classical teachers spent weeks on the throat letters alone — and their students recited for sixty years without drift.",
        ],
        note: "Continue with [the full tajweed map](/blog/tajweed-rules-for-beginners), [the bouncing and humming letters](/blog/qalqalah-and-ghunnah), and [the alphabet behind the points](/blog/arabic-alphabet-for-beginners).",
      },
    ],
    kids: {
      intro: [
        "Every Arabic letter has a home — a special place in your mouth, throat or nose where it is born! Learning where each letter lives is called makharij, and it is the first secret of beautiful recitation.",
      ],
      sections: [
        {
          heading: "The five neighbourhoods",
          paragraphs: [
            "Your sounds live in five neighbourhoods: the empty space (where the long stretchy vowels float), the throat (six letters live there!), the tongue (the biggest neighbourhood — ten streets!), the lips, and the nose (where the humming sound lives).",
            "Put your hand on your throat and say aaaa — feel it? Now say hhhh — that is ha, a throat letter! Your throat is a letter apartment building.",
          ],
        },
        {
          heading: "The throat family",
          paragraphs: [
            "Six letters live in the throat, two on each floor: hamza and ha in the basement (deepest), ayn and ha on the middle floor, ghayn and kha on the top floor (nearest your mouth).",
            "Try the mirror game: say ح like you are fogging a mirror — hhhhaaa! That breathy sound is a real Arabic letter, and it lives right in the middle of your throat.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Play the throat detective with a grown-up: hand on throat, say ha (ه) and feel the soft breath, then say ha (ح) and feel the sharp foggy breath. Two different letters, two different floors!",
            "Then say qalb (heart) and kalb (dog) — feel how qaf comes from way back and kaf from the front? One letter changes a heart into a dog. Sounds are powerful!",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "tajweed-rules-for-beginners",
      "arabic-alphabet-for-beginners",
      "qalqalah-and-ghunnah",
    ],
  },
  {
    slug: "noon-sakinah-and-tanween-rules",
    title: "Noon Sakinah and Tanween: The Four Chameleon Rules",
    seoTitle: "Noon Sakinah & Tanween Rules (Izhar, Idgham, Iqlab, Ikhfa)",
    description:
      "The four rules for noon with sukun and for tanween — izhar, idgham, iqlab and ikhfa — with their letter groups, Quran examples, and the three meem sakinah rules.",
    excerpt:
      "A noon with no vowel is a chameleon: it stays clear, merges, flips to meem, or hides — depending on the letter after it. Four rules, four behaviours, one noon.",
    category: "Tajweed",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 7,
    keywords: [
      "noon sakinah rules",
      "tanween rules",
      "izhar idgham iqlab ikhfa",
      "noon saakin and tanween",
      "tajweed noon rules",
    ],
    intro: [
      "When a noon carries sukun (نْ) — or when a word ends in tanween, which sounds like a hidden noon — the next letter decides what happens to that noon. It can stay clear, melt into the next letter, flip into a meem, or hide halfway. These are the four rules of noon sakinah and tanween, and they are the most-used rules in all of tajweed: you meet them on every page of the Quran.",
      "Tanween follows exactly the same rules as noon sakinah, because tanween is pronounced as a noon at the end of the word. Learn the four once, apply them twice.",
    ],
    sections: [
      {
        heading: "Izhar: the clear noon",
        paragraphs: [
          "Izhar means \"to make clear.\" When the letter after the noon is one of the six throat letters — ء ه ع ح غ خ — the noon is pronounced fully and clearly, with no extra hum. Example: أَنْعَمْتَ (an'amta, al-Fatiha 1:7) — the noon before ع rings out clean.",
          "The logic is physical: the throat letters are born far from the noon's home at the tongue tip, so the two sounds never collide. Distance keeps the noon honest.",
        ],
      },
      {
        heading: "Idgham: the merging noon",
        paragraphs: [
          "Idgham means \"to merge.\" The six letters يرملون (yarmalun) absorb the noon into themselves. Four of them — ي ن م و (mnemonic: yanmu) — absorb it WITH ghunnah, a two-count nasal hum: مَن يَعْمَلْ (man ya'mal, 99:7) reads as may-ya'mal with a hum. Two of them — ل and ر — absorb it WITHOUT ghunnah: مِن رَّبِّهِمْ (mir-rabbihim, 2:5) reads as mir-rabbihim, the noon simply gone.",
          "In the mushaf, idgham is often marked by a shadda on the following letter (with a small noon or meem above it for the ghunnah case). The noon is written but not pronounced as a noon — it has become part of its neighbour.",
        ],
      },
      {
        heading: "Iqlab: the flipping noon",
        paragraphs: [
          "Iqlab means \"to flip.\" One letter only — ب — flips the noon into a meem, held with ghunnah for two counts: مِن بَعْدِ (min ba'di) is pronounced mim-ba'di, with the lips lightly closed for the meem. The mushaf marks it with a small meem above the noon.",
          "Why meem? Because noon (tongue tip) and ba (lips) are awkward neighbours; meem (lips) is the natural bridge. The mouth takes the shortest path, and the rule codifies it.",
        ],
      },
      {
        heading: "Ikhfa: the hiding noon",
        paragraphs: [
          "Ikhfa means \"to hide.\" The remaining fifteen letters — ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك — make the noon hide: not a clear noon, not a full merge, but a light nasal sound held two counts, with the tongue hovering near (but not touching) the noon's home, ready for the next letter. Example: مِن دُونِ (min duni) — the noon becomes a hum, not an n.",
          "Ikhfa is the rule beginners overdo: the tongue must NOT touch the roof for the noon, or it becomes izhar; and the hum must not vanish, or it becomes idgham. The middle path is the rule.",
        ],
        note: "Teaching tip: drill one rule per week with colour-coding — students highlight every noon sakinah in one short surah and label it I, Id, Iq or Ik before reciting. The eye teaches the mouth.",
      },
      {
        heading: "Bonus: the three meem sakinah rules",
        paragraphs: [
          "A meem with sukun has its own three rules, all about the lips: before ب it hides with ghunnah (ikhfa shafawi — تَرْمِيهِم بِحِجَارَةٍ, 105:4); before another م it merges with ghunnah (idgham shafawi — قُلُوبِهِم مَّرَضٌ, 2:10); before any other letter it stays clear (izhar shafawi — هُمْ فِيهَا, 23:104).",
          "Together, the noon and meem rules cover almost every nasal moment in the Quran. Master these seven behaviours and the recitation acquires the hum-and-flow that distinguishes a trained reader.",
        ],
        note: "Next on the map: [madd](/blog/madd-rules-in-tajweed), [qalqalah and ghunnah](/blog/qalqalah-and-ghunnah), and [the full beginner's overview](/blog/tajweed-rules-for-beginners).",
      },
    ],
    kids: {
      intro: [
        "The letter noon is a chameleon! When it has no vowel (we call it noon sakinah), it changes its behaviour depending on which letter comes next. Sometimes it stays clear, sometimes it melts, sometimes it flips into a meem, and sometimes it plays hide-and-seek!",
      ],
      sections: [
        {
          heading: "The four behaviours",
          paragraphs: [
            "IZHAR — the clear noon! Before the six throat letters, noon says its full n sound, loud and proud: an'amta in al-Fatiha!",
            "IDGHAM — the melting noon! Before the letters of yarmalun, noon melts into the next letter. With ya, nun, mim and waw it melts with a hum; with lam and ra it melts silently.",
            "IQLAB — the flipping noon! Before ba, noon flips into a meem! Min ba'di becomes mim ba'di. Flip!",
            "IKHFA — the hiding noon! Before the other fifteen letters, noon hides and becomes a soft hum for two beats. Not an n, not gone — a secret hum!",
          ],
        },
        {
          heading: "The chameleon game",
          paragraphs: [
            "Here is how to remember: look at the letter AFTER the noon. Throat letter? Clear! Yarmalun letter? Melt! Ba? Flip! Anything else? Hide!",
            "Your teacher will show you the tiny marks in the Quran that hint at the rule — a little meem means flip, a shadda means melt. The mushaf is leaving you clues!",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Open al-Fatiha and find أَنْعَمْتَ. The letter after the noon is ayn — a throat letter! So the noon is CLEAR: an'amta. Say it five times with a proud, clear n.",
            "Then ask a grown-up to help you find a noon with a tiny meem mark above it anywhere in the Quran. That tiny meem is the flip clue — iqlab! You are reading tajweed clues like a detective!",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "tajweed-rules-for-beginners",
      "qalqalah-and-ghunnah",
      "madd-rules-in-tajweed",
    ],
  },
  {
    slug: "madd-rules-in-tajweed",
    title: "Madd: The Stretchy Vowels of Quran Recitation",
    seoTitle: "Madd Rules in Tajweed: Types & Counts",
    description:
      "Madd tabi'i, wajib muttasil, ja'iz munfasil, lazim and 'arid lis-sukun — what each stretch is, when it happens, and how many counts to hold it, with Quran examples.",
    excerpt:
      "Two counts naturally, four or five before a hamza, six before a permanent sukun. Madd is the breathing of the Quran — here is when to stretch and by how much.",
    category: "Tajweed",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 6,
    keywords: [
      "madd rules tajweed",
      "types of madd",
      "madd tabi'i",
      "madd lazim six counts",
      "Quran elongation rules",
    ],
    intro: [
      "Madd means \"to stretch.\" Three letters are the stretchy letters of Arabic: alif after a fatha, waw with sukun after a damma, and ya with sukun after a kasra. When one of them appears, the vowel is held longer than a short vowel — and exactly how much longer depends on what comes next.",
      "The unit is the count (harakah): roughly the time of one quick finger-tap, or saying one short vowel. Natural madd is two counts. Everything else in the madd system is a variation on that two.",
    ],
    sections: [
      {
        heading: "Madd tabi'i: the natural two",
        paragraphs: [
          "When a madd letter stands with nothing special after it — no hamza, no sukun — the stretch is exactly two counts. This is madd tabi'i, the natural madd: قَالَ (qaala), يَقُولُ (yaquulu), قِيلَ (qiila). It never drops below two and never rises above two.",
          "This is the foundation. Every other madd type is the natural two plus a reason to stretch further. If the natural two is not steady, the longer madds will wobble — so teachers drill it first, with a metronome-like tap.",
        ],
      },
      {
        heading: "The hamza madds: four or five",
        paragraphs: [
          "When a hamza follows the madd letter IN THE SAME WORD, the stretch is obligatory (wajib muttasil): four or five counts. Example: جَاءَ (jaa'a), السَّمَاء (as-samaa'). When the hamza is in the NEXT WORD, the stretch is permitted (ja'iz munfasil): commonly four or five in the Hafs recitation, though some recitation routes hold it at two. Example: بِمَا أُنزِلَ (bimaa unzila).",
          "The practical rule for a student: pick one length for each type — four or five — and keep it consistent throughout the recitation. Consistency is itself a requirement; wavering between two and five in the same session is the error, not the choice of length.",
        ],
      },
      {
        heading: "Madd lazim: the full six",
        paragraphs: [
          "When a permanent sukun — a sukun that stays whether you stop or continue — follows the madd letter in the same word, the stretch is six counts, the longest in the system. This is madd lazim. The famous example is the end of al-Fatiha: الضَّالِّينَ (ad-daalleen) — the alif before the doubled lam is held a full six.",
          "Six counts is long — longer than beginners expect. The test: if you can say the whole word الضَّالِّينَ in one comfortable breath without rushing the stretch, you are close. Teachers tap six beats and have the student hold the aa across all six.",
        ],
      },
      {
        heading: "The stopping madds: two, four or six",
        paragraphs: [
          "When you STOP on a word whose last letter becomes sukun because of the stop, and a madd letter stands before it, the stretch is 'arid lis-sukun: two, four or six counts, chosen consistently. Example: stopping on الْعَالَمِينَ (al-'aalameen) — the ya before the stopped noon stretches. Continuing the verse, it is just the natural two.",
          "A cousin is madd lin: when waw or ya with sukun follows a FATTA (not their matching vowel) and you stop — like قُرَيْش (Quraysh) or خَوْف (khawf) — the stretch is two, four or six. These only appear at stops; in continuous reading they are ordinary letters.",
        ],
        note: "Teaching tip: teach madd with physical beats — tap the table for each count. Students who feel the six beats in their hand hold the six counts in their mouth. The ear alone underestimates long madd.",
      },
      {
        heading: "The quick chart",
        paragraphs: [
          "The whole system on one card:",
        ],
        list: [
          "Tabi'i (natural) — nothing special after — 2 counts — قَالَ.",
          "Wajib muttasil — hamza in the same word — 4 or 5 — جَاءَ.",
          "Ja'iz munfasil — hamza in the next word — 2 to 5 by route — بِمَا أُنزِلَ.",
          "Lazim — permanent sukun after — 6 — الضَّالِّينَ.",
          "'Arid lis-sukun — stopping on the word — 2, 4 or 6 — الْعَالَمِينَ at a stop.",
          "Lin — waw/ya after fatha, at a stop — 2, 4 or 6 — قُرَيْش at a stop.",
        ],
        note: "The vowel marks behind madd are in [the harakat guide](/blog/arabic-harakat-short-vowels); the full rule map is in [tajweed for beginners](/blog/tajweed-rules-for-beginners). For memorisation, steady madd is half the battle — see [memorising the Quran online](/blog/quran-memorization-online).",
      },
    ],
    kids: {
      intro: [
        "Some Arabic vowels are stretchy, like rubber bands! When you see alif, waw or ya in the right place, you stretch the sound — two beats, four beats, or even six! These stretches are called madd, and they make the Quran sound like beautiful singing.",
      ],
      sections: [
        {
          heading: "The stretchy letters",
          paragraphs: [
            "Three letters are the stretchy ones: alif stretches the a (baa!), waw stretches the u (buu!), and ya stretches the i (bii!). A normal stretch is TWO beats — tap-tap!",
            "But if a hamza comes after, the stretch grows to FOUR or FIVE beats. And if a strong stop comes after — like in ad-daalleen at the end of al-Fatiha — you stretch for SIX whole beats! That is the longest stretch in the whole Quran!",
          ],
        },
        {
          heading: "The clapping game",
          paragraphs: [
            "Here is how to practise: clap once for each beat! Qaala = clap-clap (2). Jaa'a = clap-clap-clap-clap (4). Ad-daalleen = clap-clap-clap-clap-clap-clap (6)!",
            "Keep the same number of claps every time you read the same word. If you clap 4 today and 6 tomorrow for the same word, the rubber band is confused! Consistency is the secret.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Recite al-Fatiha with a grown-up and stretch ad-daalleen for SIX claps. Feel how long six is? That long stretch is a special gift at the end of the surah — most words never get it!",
            "Then find qaala or any two-beat stretch and clap it. You are playing the music of the Quran!",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "tajweed-rules-for-beginners",
      "arabic-harakat-short-vowels",
      "quran-memorization-online",
    ],
  },
  {
    slug: "qalqalah-and-ghunnah",
    title: "Qalqalah and Ghunnah: The Bouncing and Humming Letters",
    seoTitle: "Qalqalah & Ghunnah Rules (Kids & Teens)",
    description:
      "The five qalqalah letters (qutb jad) and their echo at sukun and stops, plus ghunnah — the two-count nasal hum on noon and meem with shadda. Examples and the nose test.",
    excerpt:
      "Five letters bounce when they stop — qaf, ta, ba, jim, dal. Two letters hum when doubled — noon and meem. The bounce and the hum are two of recitation's most beautiful signatures.",
    category: "Tajweed",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 5,
    keywords: [
      "qalqalah letters",
      "qutb jad",
      "ghunnah rule",
      "qalqalah examples",
      "tajweed bouncing letters",
    ],
    intro: [
      "Two of tajweed's most audible signatures are the bounce and the hum. Qalqalah is the echo that rings off five letters when they carry sukun — a clean rebound, not an added vowel. Ghunnah is the two-count nasal hum that rides on noon and meem when they carry shadda.",
      "Both are easy to hear in a good reciter and easy to get wrong alone: the bounce becomes a vowel (\"qaf-a\"), the hum becomes too short or too long. This guide gives the letters, the mechanics, and the tests that catch the errors.",
    ],
    sections: [
      {
        heading: "Qalqalah: the five bouncing letters",
        paragraphs: [
          "The five letters are ق ط ب ج د, remembered by the phrase قُطْبُ جَدّ (qutb jad). When one of them carries sukun — in the middle of a word or at a stop — its sound rebounds: a short, clean echo, as if the letter bounces off the closed mouth. يَقْطَعُونَ (yaqta'uun) — the qaf bounces. أَطْعَمَهُمْ (at'amahum) — the ta bounces.",
          "The bounce comes in two strengths: sughra (small) when the sukun is in the middle of a word, and kubra (big) when it is at a stop — the stop's closure makes the rebound stronger. The end of al-Ikhlas is the classic drill: أَحَدٌ stopped as أَحَدْ — the dal gives a firm, audible bounce.",
        ],
      },
      {
        heading: "The bounce is not a vowel",
        paragraphs: [
          "The most common error is adding a vowel to the bounce: saying \"ahad-a\" instead of a clean rebounding \"ahad.\" The echo has no fatha, no kasra, no damma — it is the letter's own sound ringing off the closure, like a ball off a wall. If a vowel appears, the qalqalah has become a different letter.",
          "The second error is over-bouncing at mid-word sukun, making every qalqalah a drumbeat. The mid-word bounce is light; the stop bounce is strong. Listen to al-Husary's al-Ikhlas and hear the difference — the final dal rings, the middle letters merely rebound.",
        ],
        note: "Teaching tip: have students say the letter with sukun and clap once at the rebound. The clap marks the echo's timing; if they clap a vowel (\"da\"), the hand catches what the ear misses.",
      },
      {
        heading: "Ghunnah: the two-count hum",
        paragraphs: [
          "Ghunnah is a nasal sound born in al-khayshum, the nasal passage. It is obligatory on noon and meem with shadda: إِنَّ (inna), ثُمَّ (thumma), النَّاس (an-naas). The hum is held two counts — the same length as madd tabi'i — and it is the same hum that rides on idgham with ghunnah, iqlab and ikhfa.",
          "The test is the nose pinch: say إِنَّ while pinching your nose closed. The sound should stop or change sharply — because the hum lives in the nose. If pinching changes nothing, the ghunnah is missing and the noon is being said as a plain n.",
        ],
      },
      {
        heading: "Where they meet the other rules",
        paragraphs: [
          "The bounce and the hum are not isolated tricks — they are the surface of deeper rules. Qalqalah is one of the sifat (permanent qualities) of its five letters. Ghunnah is the nasal quality that the noon-sakinah rules switch on and off: izhar has none, idgham with ghunnah has two counts, iqlab and ikhfa carry it, and noon/meem with shadda always carry it.",
          "Learn them together with [the noon sakinah rules](/blog/noon-sakinah-and-tanween-rules) and [the articulation points](/blog/makharij-arabic-letter-sounds), and the recitation acquires its full texture: clear where it should be clear, humming where it should hum, bouncing where it should bounce.",
        ],
        note: "The full map is in [tajweed rules for beginners](/blog/tajweed-rules-for-beginners). Practise both signatures on al-Ikhlas and al-Fatiha — between them they contain every case.",
      },
    ],
    kids: {
      intro: [
        "Some Arabic letters BOUNCE and some letters HUM! The bouncing letters are called qalqalah, and the humming sound is called ghunnah. They are two of the coolest sounds in Quran recitation — and you can learn both tonight!",
      ],
      sections: [
        {
          heading: "The bouncing letters",
          paragraphs: [
            "Five letters bounce when they stop: qaf, ta, ba, jim and dal! Remember them with the magic phrase QUTB JAD. When one of these letters has no vowel, its sound bounces like a ball off a wall — boing!",
            "Try the end of al-Ikhlas: ahad! Feel the dal bounce at the end? That is qalqalah! But careful — the bounce is NOT a vowel. Do not say ahad-A. Just a clean boing!",
          ],
        },
        {
          heading: "The humming letters",
          paragraphs: [
            "Noon and meem are the humming letters! When they wear a shadda (the little w that means double), you hum through your nose for two beats: innnnna, thummmma.",
            "Here is the magic test: pinch your nose and say inna. The sound stops! That is because the hum lives in your NOSE. If pinching your nose changes nothing, the hum is missing — try again!",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Play the bounce game: say ahad, ahad, ahad — five times, with a strong dal bounce at the end of each one. Then say inna and thumma with a two-beat nose hum.",
            "Bonus: pinch your nose during the hum and feel it stop. You just proved your ghunnah is real! Tell your teacher tomorrow — they will be impressed!",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "noon-sakinah-and-tanween-rules",
      "makharij-arabic-letter-sounds",
      "tajweed-rules-for-beginners",
    ],
  },
  {
    slug: "stories-of-the-companions",
    title: "Stories of the Companions: The People Who Carried Islam",
    seoTitle: "Stories of the Companions of the Prophet (Kids & Teens)",
    description:
      "The companions of Prophet Muhammad (peace be upon him): Abu Bakr, Umar, Uthman, Ali, Khadija, Bilal, Salman and more — true stories from the Quran and authentic hadith, for kids and teens.",
    excerpt:
      "The prophets brought the message; the companions carried it. A freed slave, a seeker from Persia, a wealthy merchant, a teenage cousin — each one chose truth when it cost them everything.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 7,
    keywords: [
      "stories of the companions",
      "companions of the Prophet",
      "sahaba stories for kids",
      "ten promised paradise",
      "Abu Bakr story",
    ],
    intro: [
      "\"The first forerunners among the Muhajirun and the Ansar and those who followed them with good conduct — Allah is pleased with them, and they are pleased with Him\" (Quran 9:100). The companions (sahaba) were the people who believed, migrated, fought, traded, taught and built around the Prophet Muhammad (peace be upon him). They were not angels: they were merchants, slaves, farmers, teenagers and mothers — and their choices are the bridge between revelation and the world we live in.",
      "This collection tells their stories from the Quran, the authentic hadith collections (Bukhari, Muslim, Tirmidhi and others) and the classical biographies — Ibn Hisham's Seerah, Ibn Sa'd's Tabaqat and Ibn al-Athir's Usd al-Ghabah. Some accounts were translated from Arabic sources such as islamweb.net. Each story comes in two reading levels: one for children, one for readers 13 and up.",
    ],
    sections: [
      {
        heading: "Why their stories matter",
        paragraphs: [
          "The Quran describes them in one sentence: \"Muhammad is the Messenger of Allah; and those with him are severe against disbelievers, merciful among themselves. You see them bowing and prostrating, seeking bounty from Allah and pleasure\" (48:29). Strong outward, soft inward — that is the character the stories keep showing.",
          "And the standard they set is not perfection but honesty: \"Among the believers are men who have been true to their covenant with Allah. Of them some have completed their vow, and some still wait, but they have never changed\" (33:23). Every story below is about someone keeping a promise — to Allah, to the Prophet, or to their own conscience.",
        ],
      },
      {
        heading: "The ten promised Paradise",
        paragraphs: [
          "The Prophet named ten companions who would enter Paradise (Tirmidhi). Their stories form the heart of this collection:",
        ],
        list: [
          "[Abu Bakr as-Siddiq](/blog/abu-bakr-story) — the first free man to believe, the companion of the cave.",
          "[Umar ibn al-Khattab](/blog/umar-story) — the fierce opponent whose conversion opened Makkah's hearts.",
          "[Uthman ibn Affan](/blog/uthman-story) — the modest one of two lights, who equipped an army and gathered the Quran.",
          "[Ali ibn Abi Talib](/blog/ali-story) — the first youth to believe, who slept in the Prophet's bed on the night of the hijra.",
          "[Talha and az-Zubayr](/blog/talha-and-zubayr-story) — the shield of Uhud and the Prophet's disciple.",
          "[Abd al-Rahman ibn Awf](/blog/abd-al-rahman-ibn-awf-story) — the migrant who asked only for the way to the market.",
          "[Sa'd ibn Abi Waqqas](/blog/saad-ibn-abi-waqqas-story) — the first archer of Islam, whose du'as were answered.",
          "[Sa'id ibn Zayd](/blog/saeed-ibn-zayd-story) — the quiet brother-in-law whose prayers Allah answered.",
          "[Abu Ubayda ibn al-Jarrah](/blog/abu-ubayda-story) — the trustworthy one of this ummah.",
        ],
      },
      {
        heading: "Beyond the ten",
        paragraphs: [
          "Paradise was not limited to ten, and neither is this collection. These companions carry lessons the ten cannot:",
        ],
        list: [
          "[Khadija bint Khuwaylid](/blog/khadija-story) — the first believer of all, who spent everything before anyone else believed.",
          "[Bilal ibn Rabah](/blog/bilal-story) — the enslaved man whose one word broke his torturers, and whose voice called the first adhan.",
          "[Salman al-Farisi](/blog/salman-al-farisi-story) — the Persian seeker who crossed an empire and slavery to find the truth.",
          "[Mus'ab ibn Umayr](/blog/musab-ibn-umayr-story) — the richest youth of Makkah, Islam's first ambassador.",
          "[Sumayya and Ammar](/blog/sumayya-and-ammar-story) — the first martyr of Islam and her son, who was told to be patient.",
          "[Khalid ibn al-Walid](/blog/khalid-ibn-al-walid-story) — the sword of Allah, who never lost a battle.",
          "[Abu Dharr al-Ghifari](/blog/abu-dharr-story) — the truthful one, who owned almost nothing and feared nothing.",
        ],
      },
      {
        heading: "How to read these stories as a family",
        paragraphs: [
          "Read one story a week, and ask the same question the prophet stories ask: what did this person give up, and what did they gain? For children, the answer is usually simple — Bilal gave up comfort and gained a voice that still calls the adhan today. For older readers, open the hadith reference together and notice how precise the sources are: these are not legends, they are reported events with named narrators.",
        ],
        note: "Start with [the stories of the prophets](/blog/stories-of-the-prophets) — the companions were living what the prophets taught. Or see how the message reached them in [how the Quran was revealed](/blog/how-the-quran-was-revealed).",
      },
    ],
    kids: {
      intro: [
        "The Prophet Muhammad (peace be upon him) had special friends called the companions. They were not superheroes — they were normal people: a shopkeeper, a slave, a rich teenager, a brave mum. But when they heard the truth, they held onto it like a treasure, even when it was very, very hard.",
        "Here is the whole collection. Every story has a kids' version and a bigger version — use the switch above!",
      ],
      sections: [
        {
          heading: "The ten with a promise",
          paragraphs: [
            "The Prophet gave ten of his friends the happiest news ever: they would enter Paradise! Abu Bakr the truthful, Umar the just, Uthman the shy, Ali the brave, Talha the generous, Zubayr the helper, Abd al-Rahman the trader, Sa'd the archer, Sa'id the quiet one, and Abu Ubayda the trustworthy.",
            "But they were not the only ones! Khadija was the very first believer, Bilal had the most beautiful voice, Salman travelled the whole world for truth, and Mus'ab gave up all his toys and treasures for Islam.",
          ],
        },
        {
          heading: "What they all had in common",
          paragraphs: [
            "Every companion gave something up: money, comfort, safety, even family. And every one of them gained something bigger: a heart full of faith, a family of believers, and a promise from Allah.",
            "The Quran says Allah is pleased with them, and they are pleased with Him (9:100). That is the best deal anyone ever made!",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Pick one companion's story from the list and read it with a grown-up. Then answer one question: what did they give up, and what did they gain?",
            "Tomorrow, try one small thing they were famous for: say salam first like Abu Bakr, share like Talha, or tell the truth like Abu Dharr — even when it is hard.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "stories-of-the-prophets",
      "abu-bakr-story",
      "khadija-story",
    ],
  },
  {
    slug: "abu-bakr-story",
    title: "Abu Bakr as-Siddiq: The Friend Who Believed First",
    seoTitle: "Abu Bakr Story for Kids & Teens (Sahih Sources)",
    description:
      "The story of Abu Bakr as-Siddiq: first free man to believe, companion of the cave (Quran 9:40), freer of slaves, first caliph, and the man who gathered the Quran.",
    excerpt:
      "When everyone else hesitated, Abu Bakr believed without asking for a sign. When the Prophet needed a friend in a cave, he was there. When Islam needed a leader, he stepped forward — and when the Quran needed protecting, he gathered it.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 7,
    keywords: [
      "Abu Bakr story",
      "Abu Bakr as-Siddiq",
      "companion of the cave",
      "first caliph",
      "Abu Bakr for kids",
    ],
    intro: [
      "Before Islam, Abu Bakr was a quiet, successful cloth merchant in Makkah — known for his honesty, his knowledge of the Arab tribes, and his gentle character. When the Prophet told him about the revelation, he did not ask for a miracle or a sign. He believed immediately. That is why the Prophet called him as-Siddiq: the one who always confirms the truth.",
      "His story is not one dramatic moment but a lifetime of being there: in the cave, in the marketplace buying slaves their freedom, in the mosque leading the prayer when the Prophet could no longer stand, and in the first years after the Prophet's death, holding the community together.",
    ],
    sections: [
      {
        heading: "The companion of the cave",
        paragraphs: [
          "When the Prophet migrated from Makkah to Madinah, the Quraysh put a price on his head. Abu Bakr travelled with him, and for three nights they hid in the cave of Thawr while search parties passed the entrance. The Quran records the moment: \"...when he was in the cave with his companion, when he said to his companion, 'Do not grieve; indeed Allah is with us'\" (9:40). Abu Bakr's fear was not for himself — he later said he feared for the Prophet, not for his own life.",
          "The Prophet's love for him was open and declared: \"If I were to take an intimate friend other than my Lord, I would take Abu Bakr\" (Bukhari and Muslim). And in the final illness, when the Prophet could no longer lead the prayer, he insisted: \"Tell Abu Bakr to lead the people in prayer\" (Bukhari and Muslim).",
        ],
      },
      {
        heading: "The man who bought freedom",
        paragraphs: [
          "In Makkah, the weakest believers were enslaved people tortured for their faith. Abu Bakr used his wealth to buy their freedom — Bilal ibn Rabah most famously, but also Amir ibn Fuhayra, Umm Ubays and others. His father asked why he did not free strong men who could protect him; Abu Bakr answered that he was doing it for Allah, not for protection.",
          "The Prophet said: \"The most beneficial of people to me in his companionship and his wealth was Abu Bakr\" (Bukhari). When the migration needed funds, Abu Bakr brought his entire savings — 5,000 or 6,000 dirhams — and left nothing for his family. Umar, by contrast, brought half. The Prophet asked Abu Bakr: \"What have you left for your family?\" He answered: \"Allah and His Messenger\" (Abu Dawud, Tirmidhi).",
        ],
      },
      {
        heading: "The first caliph, and the Quran's first gathering",
        paragraphs: [
          "When the Prophet died in 11 AH, the community nearly broke apart. Some tribes refused zakat; some claimed new prophets. Abu Bakr, the first caliph, held the line with the calm of a man who had already lost everything once and survived: \"By Allah, if they withhold from me a rope they used to give the Messenger of Allah, I will fight them for it\" (Bukhari and Muslim).",
          "After the battle of Yamamah, where many Quran memorisers were killed, Umar urged him to gather the Quran into one written collection. Abu Bakr hesitated — how could he do something the Prophet had not done? — then agreed, and commissioned Zayd ibn Thabit to collect it from written fragments and the chests of memorisers (Bukhari). That collection, kept with Abu Bakr, then Umar, then Umar's daughter Hafsa, became the basis of Uthman's standard mushaf.",
        ],
        note: "Read [Uthman's story](/blog/uthman-story) for the next chapter of the Quran's preservation, and [Bilal's story](/blog/bilal-story) for the man Abu Bakr freed.",
      },
      {
        heading: "The lesson: showing up",
        paragraphs: [
          "Abu Bakr was not the strongest, the richest or the most eloquent companion. He was the most present. He believed first, gave everything, stood in the cave, led the prayer, held the community, and gathered the Book. He died in 13 AH, two years after the Prophet, and was buried beside him — the friend who was there at the beginning and at the end.",
          "The lesson is quiet but enormous: faith is mostly showing up. Not the dramatic moment — the thousand ordinary ones.",
        ],
      },
    ],
    kids: {
      intro: [
        "Abu Bakr was the Prophet's best friend. He was a kind cloth-seller in Makkah, and when the Prophet told him about Islam, he believed right away — no questions, no waiting. That is why he was called as-Siddiq, \"the one who always believes the truth.\"",
      ],
      sections: [
        {
          heading: "The cave adventure",
          paragraphs: [
            "When the Prophet had to travel secretly to Madinah, Abu Bakr went with him. They hid in a cave for three nights while angry men searched for them. Abu Bakr was scared — not for himself, but for the Prophet! The Prophet said: \"Do not be sad. Allah is with us\" (Quran 9:40).",
            "Later, when the Prophet was too sick to lead the prayer, he said: \"Tell Abu Bakr to lead.\" That is how much he trusted his friend.",
          ],
        },
        {
          heading: "The freedom buyer",
          paragraphs: [
            "In Makkah, some cruel masters hurt their slaves for becoming Muslim. Abu Bakr used his money to buy those slaves and set them free! The most famous was Bilal — the man with the beautiful voice who later called the adhan.",
            "When the Prophet needed money for the big journey, Abu Bakr brought ALL his money. \"What did you leave for your family?\" asked the Prophet. \"Allah and His Messenger,\" said Abu Bakr. What a friend!",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Abu Bakr's superpower was showing up — being there when someone needs you. Tonight, show up for someone: help a brother or sister, sit with a grandparent, or help a parent without being asked.",
            "Then say: \"Allah and His Messenger\" — the answer Abu Bakr gave when he gave everything away. He knew the best treasure is not money.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "stories-of-the-companions",
      "umar-story",
      "bilal-story",
    ],
  },
  {
    slug: "umar-story",
    title: "Umar ibn al-Khattab: The Lion Who Became a Shepherd",
    seoTitle: "Umar ibn al-Khattab Story (Kids & Teens)",
    description:
      "The story of Umar ibn al-Khattab: his dramatic conversion through Surah Ta-Ha, his justice as caliph, the Quran verses that matched his views, and the night he carried flour on his back.",
    excerpt:
      "Umar set out to kill the Prophet and came back a Muslim. The man the Quraysh feared became the caliph who carried flour to hungry strangers at night and wept over a single verse.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 7,
    keywords: [
      "Umar ibn al-Khattab story",
      "Umar conversion Surah Ta-Ha",
      "Umar justice",
      "second caliph",
      "Umar for kids",
    ],
    intro: [
      "Before Islam, Umar ibn al-Khattab was the man Makkah feared: tall, strong, hot-tempered, a wrestler and a drinker, the loudest opponent of the new message. The Prophet had made a du'a: \"O Allah, strengthen Islam with whichever of the two Umars is more beloved to You\" — Umar ibn al-Khattab or Amr ibn Hisham (Tirmidhi). Allah answered with the first.",
      "His conversion is one of the most famous scenes in the Seerah, recorded by Ibn Hisham and others — and the man who emerged from it became the opposite of everything he had been: the justest ruler, the tenderest heart, the one Shaytan himself avoided.",
    ],
    sections: [
      {
        heading: "The road to his sister's house",
        paragraphs: [
          "In the sixth year of the prophethood, Umar left his house with his sword, intending to kill the Prophet. On the way he was told: your own sister Fatimah and her husband Sa'id ibn Zayd have become Muslims. He turned to their house first. Inside, the teacher Khabbab ibn al-Aratt was reading Surah Ta-Ha from a sheet. Umar struck his sister; seeing her blood, he softened and asked for the sheet. She made him wash first. He read: \"Ta-Ha. We have not sent down to you the Qur'an that you be distressed...\" (20:1-2).",
          "\"How beautiful and how noble this speech is!\" he said — and went straight to the house of al-Arqam, where the Prophet was, and declared his Islam. The Muslims, who had been praying in secret, felt safe enough to pray openly in two rows behind the Prophet that day. Ibn Mas'ud said: \"We have been mighty since Umar became Muslim\" (Bukhari).",
        ],
      },
      {
        heading: "The man whose views the Quran confirmed",
        paragraphs: [
          "Three times Umar's judgement matched what Allah then revealed: he suggested taking the standing-place of Ibrahim as a prayer spot, and 2:125 came down; he urged the Prophet's wives to observe hijab, and the verse of hijab came down (33:53); he argued that the captives of Badr should not be ransomed, and 8:67-68 came down agreeing with him. The Prophet said: \"Allah has placed truth on Umar's tongue and in his heart\" (Abu Dawud, Tirmidhi), and: \"If there were to be a prophet after me, it would be Umar\" (Tirmidhi).",
          "He was also the one Shaytan avoided: \"I never saw Shaytan flee from anyone more than he flees from you, Umar\" the Prophet told him (Bukhari). The fierce energy had not disappeared — it had been redirected.",
        ],
      },
      {
        heading: "The caliph who carried flour",
        paragraphs: [
          "As the second caliph (13-23 AH), Umar ruled an empire that grew to include Syria, Egypt, Iraq and Persia — and lived on patched clothes and barley bread. He established the diwan (state registers), the Hijri calendar, regular stipends, and judges independent of governors. He patrolled Madinah at night in disguise.",
          "One night he found a mother cooking stones in a pot to comfort her hungry children until they slept. Umar ran to the storehouse, loaded a sack of flour and fat onto his own back, and refused to let his servant carry it: \"Will you carry my burden on the Day of Resurrection?\" He cooked for the children himself and watched them laugh before he left. When he wept over a verse, he wept until he was sick; when he remembered the Hereafter, the lines on his face were said to be from tears.",
        ],
        note: "His brother-in-law [Sa'id ibn Zayd](/blog/saeed-ibn-zayd-story) was in that room when Umar converted. And [Abu Bakr's story](/blog/abu-bakr-story) is the caliphate Umar inherited.",
      },
      {
        heading: "The lesson: strength in the right direction",
        paragraphs: [
          "Umar was stabbed by a Persian slave named Abu Lu'lu'ah in 23 AH while leading Fajr. He asked his son to greet the Prophet's wife Aisha and ask permission to be buried beside the Prophet and Abu Bakr — and when permission came, he said it was the dearest wish of his life. He died three days later.",
          "The lesson of Umar is not that strong people make good leaders. It is that strength is raw material: the same fire that made him Makkah's fiercest opponent made him Islam's most tireless servant. What changed was the direction, not the engine.",
        ],
      },
    ],
    kids: {
      intro: [
        "Umar was the strongest, loudest man in Makkah — and at first he hated Islam. He even set out with his sword to hurt the Prophet! But on the way, something amazing happened at his sister's house, and the lion became a lamb.",
      ],
      sections: [
        {
          heading: "The beautiful words",
          paragraphs: [
            "Umar heard his sister Fatimah had become Muslim, and he was very angry. But when he saw he had hurt her, he felt sorry. She was reading from a page of the Quran — Surah Ta-Ha. Umar asked to see it. He washed, then read: \"We have not sent down the Quran to make you sad...\"",
            "\"How beautiful these words are!\" he said. And right then, his heart changed. He went straight to the Prophet and became Muslim. The Muslims were so happy — they had been hiding, but now they felt brave!",
          ],
        },
        {
          heading: "The flour on his back",
          paragraphs: [
            "Years later, Umar became the leader of all the Muslims — a huge job! But he still walked around at night to check on people. One night he found a mum cooking stones in a pot, just to make her hungry children think food was coming so they would fall asleep.",
            "Umar ran to get flour and carried the heavy sack on his OWN back. His servant said, \"Let me carry it!\" Umar said, \"Will you carry my sins on Judgment Day?\" Then he cooked for the children himself and waited until they laughed. That is a real leader.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Umar's superpower was using his strength to help, not to hurt. Tonight, use your strength for someone smaller: carry something heavy for a parent, or stand up for someone being teased.",
            "And remember: even the fiercest person can change when they hear something beautiful and true. Never give up on anyone — not even yourself.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "stories-of-the-companions",
      "abu-bakr-story",
      "saeed-ibn-zayd-story",
    ],
  },
  {
    slug: "uthman-story",
    title: "Uthman ibn Affan: The Modest One of Two Lights",
    seoTitle: "Uthman ibn Affan Story for Kids & Teens",
    description:
      "The story of Uthman ibn Affan: Dhul-Nurayn, the man the angels were shy of, who bought the well of Rumah, equipped the army of Tabuk, and gathered the Quran into one mushaf.",
    excerpt:
      "Uthman was so modest the angels were shy of him. He was also so generous that one gift — the army of Tabuk — made the Prophet say nothing he did afterwards could harm him.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 7,
    keywords: [
      "Uthman ibn Affan story",
      "Dhul-Nurayn",
      "Uthman mushaf",
      "well of Rumah",
      "Uthman for kids",
    ],
    intro: [
      "Uthman ibn Affan was a wealthy, soft-spoken merchant of the Umayyad clan — one of the first to believe, and one of the few who could read and write. He married the Prophet's daughter Ruqayyah, and after her death, her sister Umm Kulthum — which earned him the title Dhul-Nurayn, \"the one of two lights.\" No other man married two daughters of a prophet.",
      "His modesty was legendary. Aisha reported that once the Prophet was resting with part of his body uncovered, and when Abu Bakr and Umar entered he stayed as he was — but when Uthman asked permission to enter, the Prophet sat up and arranged his clothes. When asked why, he said: \"Should I not be shy of a man of whom the angels are shy?\" (Muslim).",
    ],
    sections: [
      {
        heading: "The well of Rumah",
        paragraphs: [
          "When the Muslims migrated to Madinah, water was scarce. The well of Rumah belonged to a Jewish man who sold its water by the bucket, and the poor Muslims struggled. The Prophet said: \"Whoever buys the well of Rumah and makes his bucket like the buckets of the Muslims will have Paradise\" (Tirmidhi). Uthman bought it — first half, then the whole — and made it free for everyone, rich and poor, Muslim and traveller. The well's endowment still existed in Madinah centuries later, its revenues funding charity.",
          "This was Uthman's pattern: quiet, permanent generosity. Not a gift that makes noise, but a gift that keeps giving after the giver is forgotten.",
        ],
      },
      {
        heading: "The army of difficulty",
        paragraphs: [
          "In 9 AH, the expedition to Tabuk faced a brutal summer, a long march, and an empty treasury. The Prophet appealed for donations. Uthman equipped a third of the army — 300 camels with their saddles, 50 horses, and 1,000 dinars poured into the Prophet's lap. The Prophet turned the coins over and said: \"Nothing Uthman does after today will harm him\" (Tirmidhi).",
          "The Quran's \"hour of difficulty\" (9:117) remembers that expedition — and the ones who gave when giving hurt: \"...those who, when they came to you for mounts, and you said, 'I cannot find anything to give you,' turned back with their eyes overflowing with tears...\" (9:92). Uthman was the answer to those tears.",
        ],
      },
      {
        heading: "One Book for one ummah",
        paragraphs: [
          "As the third caliph (23-35 AH), the empire stretched from Libya to Central Asia, and new Muslims recited the Quran in differing dialects. Hudhayfah ibn al-Yaman, campaigning in Armenia, saw the disputes and warned Uthman: \"Save this ummah before they differ about the Book as the Jews and Christians differed.\" Uthman borrowed the original collection kept with Hafsa and commissioned Zayd ibn Thabit with a committee of Quraysh to copy it into standard mushafs, sent to every major city, with orders that all other copies be burned (Bukhari).",
          "Every mushaf printed today — every copy in every mosque on earth — descends from that decision. It is arguably the most consequential act of preservation in Islamic history, and it was done by the shyest of the companions.",
        ],
        note: "The collection Uthman standardised began with [Abu Bakr](/blog/abu-bakr-story) after Yamamah. Read [how the Quran was revealed](/blog/how-the-quran-was-revealed) for the full story of the Book.",
      },
      {
        heading: "The lesson: quiet strength",
        paragraphs: [
          "Uthman was killed in 35 AH by rebels who besieged his house — fasting, reading the Quran, refusing to let his defenders fight inside the Prophet's city. He was 80 or 82. The mushaf he was reading was spattered with his blood.",
          "The lesson of Uthman is that modesty is not weakness. The man too shy to uncover his knee bought a well for a city, equipped an army, and saved a Book. Strength does not have to be loud to be enormous.",
        ],
      },
    ],
    kids: {
      intro: [
        "Uthman was the shyest of the Prophet's friends — so shy that even the angels felt shy around him! But being shy did not stop him from doing huge, brave, generous things. He married two of the Prophet's daughters, so they called him \"the one of two lights.\"",
      ],
      sections: [
        {
          heading: "The free water well",
          paragraphs: [
            "In Madinah, water was hard to find. One well belonged to a man who made everyone PAY for every bucket. Poor Muslims were thirsty. The Prophet said: \"Whoever buys that well and shares its water will get Paradise!\"",
            "Uthman bought the whole well — and made the water FREE for everyone. Rich, poor, traveller, everyone! People still used that free well hundreds of years later. That is a gift that never stops giving.",
          ],
        },
        {
          heading: "The big bag of coins",
          paragraphs: [
            "Once the Muslims needed to go on a long, hard journey, but there was no money for camels and food. Uthman brought 300 camels, 50 horses, and a thousand gold coins — and poured the coins into the Prophet's lap!",
            "The Prophet smiled and said: \"Nothing Uthman does after today will harm him.\" That is the biggest thank-you ever. Uthman did not brag about it. He just quietly kept giving.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Uthman's superpower was quiet giving — doing good without making noise. Tonight, do one secret good deed: tidy something without being asked, or leave a kind note where someone will find it. Do not tell anyone!",
            "And remember his well: the best gifts keep giving. Sharing your favourite book or teaching a friend something is a gift that grows.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "stories-of-the-companions",
      "abu-bakr-story",
      "ali-story",
    ],
  },
  {
    slug: "ali-story",
    title: "Ali ibn Abi Talib: The First Youth, the Lion of Khaybar",
    seoTitle: "Ali ibn Abi Talib Story (Kids & Teens)",
    description:
      "The story of Ali ibn Abi Talib: first youth to believe, who slept in the Prophet's bed on the hijra night, carried the banner at Khaybar, and married Fatima.",
    excerpt:
      "Ali grew up in the Prophet's house, believed before any other boy, slept in the Prophet's bed when assassins surrounded it, and was given the banner at Khaybar because he loved Allah and His Messenger — and they loved him.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 7,
    keywords: [
      "Ali ibn Abi Talib story",
      "Ali Khaybar banner",
      "first youth to believe",
      "Ali and Fatima",
      "Ali for kids",
    ],
    intro: [
      "Ali ibn Abi Talib was the Prophet's cousin, ten years younger, raised in the Prophet's household when famine struck his father Abu Talib. He was the first youth to accept Islam — a boy of about ten, watching Khadija and the Prophet pray, asking what they were doing, and choosing it for himself. He never bowed to an idol in his life.",
      "His courage became proverbial, but the hadith that defines him is not about fighting. It is about love: at Khaybar, the Prophet said he would give the banner to \"a man who loves Allah and His Messenger, and Allah and His Messenger love him\" (Bukhari and Muslim) — and called Ali.",
    ],
    sections: [
      {
        heading: "The night he slept in the Prophet's bed",
        paragraphs: [
          "On the night of the hijra, the Quraysh surrounded the Prophet's house with young men from every clan, swords drawn, waiting to strike as one so no single clan could be blamed. The Prophet told Ali to sleep in his bed, covered in his green mantle. Ali — a young man with his whole life ahead of him — lay down in the bed of a man marked for death, knowing the swords might fall on him instead.",
          "The assassins peered in all night and saw a figure sleeping. By morning the Prophet was miles away, and Ali walked out unharmed. It was the first of a lifetime of standing where others would not.",
        ],
      },
      {
        heading: "The banner of Khaybar",
        paragraphs: [
          "At Khaybar in 7 AH, the fortresses held out. The Prophet said: \"Tomorrow I will give the banner to a man who loves Allah and His Messenger, and Allah and His Messenger love him; Allah will grant victory through him.\" That night every companion hoped it would be him. In the morning the Prophet called Ali, who was suffering from sore eyes; the Prophet applied his saliva to them and they were cured, and gave him the banner (Bukhari and Muslim).",
          "Ali fought the champion Marhab and took the fortress. And the Prophet told him: \"You are to me as Harun was to Musa, except that there is no prophet after me\" (Bukhari and Muslim) — the closest possible comparison, minus prophethood itself.",
        ],
      },
      {
        heading: "The husband of Fatima, the judge, the fourth caliph",
        paragraphs: [
          "Ali married Fatima, the Prophet's beloved daughter. Their marriage was famously simple — a modest mahr, a household of two hands grinding grain and drawing water — and from them descend the Prophet's only surviving line, Hasan and Husayn. The Prophet said of the five under the cloak: \"These are my Ahl al-Bayt\" (Muslim).",
          "He was sent as judge to Yemen while still young, and said: \"You send me to judge while I am young?\" The Prophet placed his hand on Ali's chest and prayed for his guidance; Ali said he never doubted a judgement afterwards. As the fourth caliph (35-40 AH), he ruled through civil war with the same austerity — patched garments, barley bread, refusing the treasury's comforts. He was killed in 40 AH by Ibn Muljam while going to Fajr.",
        ],
        note: "The Prophet's family line continues through [Ali and Fatima's story](/blog/ali-story) — read [Khadija's story](/blog/khadija-story) for the mother of that household.",
      },
      {
        heading: "The lesson: courage rooted in love",
        paragraphs: [
          "Ali's bravery was real — the bed, the banner, the duels. But the hadith does not say \"the strongest man.\" It says the man who loves and is loved. His courage grew out of that love, not out of pride. That is the difference between a fighter and a lion of Allah: one fights for himself, the other for what he loves.",
        ],
      },
    ],
    kids: {
      intro: [
        "Ali was the Prophet's little cousin. He grew up in the Prophet's house, and when he was about ten years old, he saw the Prophet and Khadija praying and asked: \"What are you doing?\" When they told him, he became Muslim — the very first kid to believe!",
      ],
      sections: [
        {
          heading: "The bravest bedtime",
          paragraphs: [
            "One scary night, angry men surrounded the Prophet's house with swords, waiting to hurt him. The Prophet asked Ali to sleep in HIS bed, wearing his blanket, so the men would think the Prophet was still home.",
            "Ali was young, but he said yes! He slept in the bed all night while swords waited outside. In the morning, the Prophet was safe far away — and Ali walked out without a scratch. That is the bravest bedtime story ever.",
          ],
        },
        {
          heading: "The special flag",
          paragraphs: [
            "At a place called Khaybar, the Muslims could not open the big fort. The Prophet said: \"Tomorrow I will give the flag to a man who loves Allah and His Messenger — and Allah and His Messenger love HIM!\"",
            "Everyone hoped it would be them. But the Prophet called Ali! Ali's eyes were sore, so the Prophet gently touched them and they got better. Then Ali carried the flag and won. The best prize is not being the strongest — it is being loved by Allah.",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Ali's superpower was being brave for people he loved. Tonight, be brave for someone: tell the truth even if you might get in trouble, or stand next to a friend who feels alone.",
            "And say thank you to the people who take care of you — Ali loved the Prophet like family, because the Prophet WAS his family. Love your family out loud tonight.",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "stories-of-the-companions",
      "khadija-story",
      "prophet-muhammad-story",
    ],
  },
  {
    slug: "khadija-story",
    title: "Khadija bint Khuwaylid: The First Believer",
    seoTitle: "Khadija Story for Kids & Teens (Sahih Sources)",
    description:
      "The story of Khadija bint Khuwaylid: the first person to believe in Islam, who comforted the Prophet after the first revelation, spent her wealth for the faith, and was greeted by Jibril with salam from Allah.",
    excerpt:
      "Before anyone else believed, Khadija believed. When the Prophet came down from the cave trembling, she did not doubt him — she wrapped him in a blanket and said the words every believer needs to hear.",
    category: "Islamic studies",
    publishedAt: "2026-11-17",
    updatedAt: "2026-11-17",
    readingMinutes: 7,
    keywords: [
      "Khadija story",
      "Khadija bint Khuwaylid",
      "first believer in Islam",
      "Khadija and the Prophet",
      "Khadija for kids",
    ],
    intro: [
      "Khadija bint Khuwaylid was Makkah's most successful merchant — a widow who ran caravans to Syria and hired the honest young man Muhammad (peace be upon him) to trade for her. Impressed by his character, she proposed marriage through a friend. He was 25; she was 40. Their marriage lasted 25 years, and he took no other wife while she lived.",
      "When the revelation came, she was the first human being to believe — before Abu Bakr, before Ali, before anyone. The story of that first night is recorded in Sahih al-Bukhari, the very first long hadith of the collection, narrated by Aisha.",
    ],
    sections: [
      {
        heading: "The night of the first revelation",
        paragraphs: [
          "The Prophet came down from the cave of Hira trembling, his heart pounding, and said to Khadija: \"Cover me! Cover me!\" She wrapped him until the fear passed. Then he told her everything — the angel, the command to read, the words pressed into his chest — and said: \"I fear for myself.\"",
          "Her answer is one of the most important sentences in Islamic history: \"Never! By Allah, Allah will never disgrace you. You keep good relations with your kith and kin, help the poor and the destitute, serve your guests generously, and assist those stricken by calamity\" (Bukhari). She did not argue theology. She told him who he was — and that Allah does not abandon people like him. Then she took him to her cousin Waraqa ibn Nawfal, a Christian scholar, who confirmed: this is the same Namus (angel) that came to Musa.",
        ],
      },
      {
        heading: "The wealth that became Islam",
        paragraphs: [
          "For ten years in Makkah, while the boycott starved the believers in the valley of Abu Talib and torture broke the weak, Khadija's wealth was the shelter of the whole community. She bought freedom for enslaved believers, fed the hungry, and spent everything until nothing was left. The Prophet later said: \"She believed in me when people disbelieved, she trusted me when people called me a liar, she spent her wealth for me when people deprived me\" (Ahmad).",
          "She died in the tenth year of the prophethood, three years before the hijra — the same year Abu Talib died. The Prophet called it the Year of Sorrow. He never stopped mentioning her: Aisha said he would slaughter a sheep and send gifts to Khadija's friends, and when Aisha once felt jealous, he said: \"Allah has not given me better than her\" (Muslim).",
        ],
      },
      {
        heading: "The salam from Allah",
        paragraphs: [
          "Once Jibril came to the Prophet and said: \"O Messenger of Allah, this is Khadija. When she comes to you, convey to her salam from her Lord and from me, and give her the glad tidings of a house in Paradise made of qasab (hollow pearls/reeds), in which there is no noise and no fatigue\" (Bukhari and Muslim).",
          "A house with no noise and no fatigue — for the woman who carried the noise and fatigue of the first ten years of Islam so the Prophet could carry the message. The reward matches the service exactly.",
        ],
        note: "Khadija is the mother of [Fatima](/blog/ali-story), through whom the Prophet's line continues. Read [the Prophet's story](/blog/prophet-muhammad-story) for the life she sheltered.",
      },
      {
        heading: "The lesson: believing before it is safe",
        paragraphs: [
          "Khadija believed when belief cost everything and proved nothing. No community, no mosque, no victory — just a trembling husband and an angel's words. She chose trust. Every Muslim who has ever been the only believer in a room owes something to the first woman who was.",
        ],
      },
    ],
    kids: {
      intro: [
        "Khadija was a clever, kind businesswoman in Makkah. She hired the Prophet to trade for her, and when she saw how honest he was, she asked him to marry her! They were very happy together. And when something amazing and scary happened to the Prophet, Khadija was the FIRST person in the whole world to believe him.",
      ],
      sections: [
        {
          heading: "\"Cover me! Cover me!\"",
          paragraphs: [
            "One night the Prophet came home from a cave, shaking with fear. An angel had come to him with words from Allah! \"Cover me! Cover me!\" he said. Khadija wrapped him in a warm blanket and held him until he felt safe.",
            "Then she said the most beautiful words: \"Never! Allah will never let you down. You are kind to your family, you help the poor, you are generous to guests, and you help people in trouble.\" She knew his heart was good — so she knew Allah would take care of him. Then she became the very first Muslim!",
          ],
        },
        {
          heading: "The house with no noise",
          paragraphs: [
            "Khadija used all her money to help the Muslims — buying food, freeing slaves, keeping everyone safe. She did not keep any treasures for herself.",
            "One day the angel Jibril came with a special message just for her: \"Give Khadija salam from Allah — and tell her she will have a house in Paradise with no noise and no tiredness!\" After all her hard work, Allah promised her the most peaceful home ever. What a reward!",
          ],
        },
        {
          heading: "Try it tonight",
          paragraphs: [
            "Khadija's superpower was believing in someone when they were scared. Tonight, be that person: if someone in your family is worried or sad, sit with them and say something kind — \"I believe in you. Allah is with you.\"",
            "And make a blanket-fort or a cosy corner for someone who needs a safe place. Khadija's blanket is still famous 1,400 years later!",
          ],
        },
      ],
    },
    defaultLevel: "kids",
    related: [
      "stories-of-the-companions",
      "prophet-muhammad-story",
      "ali-story",
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
