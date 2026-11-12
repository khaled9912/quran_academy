import { sortedBlogPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

export function GET() {
  const posts = sortedBlogPosts();
  const blogLines = posts
    .map(
      (post) =>
        `- [${post.title}](${SITE_URL}/blog/${post.slug}) (${post.category}, ${post.publishedAt}): ${post.description}`
    )
    .join("\n");

  const body = `# Ana Quran Academy — full overview

Ana Quran Academy is an online Quran academy for English-speaking students. Students learn Quran, Tajweed, memorization, Arabic, and Islamic studies through one-to-one online lessons with reviewed teachers. The academy is based in Egypt and teaches students remotely, from their own homes.

Website: ${SITE_URL}
Contact: ${SITE_URL}/contact

## Positioning

Ana Quran Academy is an international online academy, not a local academy tied to one country. It serves English-speaking Muslims: children, adults, beginners, and families. Lessons are taught in English.

Website registration is currently open to the United States, the United Kingdom, Canada, Australia, New Zealand, and Ireland. Students in other countries are welcome to contact the academy, which will tell them what is possible.

We do not claim a local address, branch, or physical campus in any student's country. Students join lessons online from their own homes, subject to teacher availability and time-zone fit.

## Subjects and programs

- Quran reading and recitation: letter recognition, fluency, and confident reading
- Tajweed: articulation points, pronunciation, and recitation rules
- Quran memorization: structured Hifz plans with regular review
- Arabic: reading, vocabulary, and grammar foundations, including Quranic Arabic
- Islamic studies: core beliefs, practice, and history

Programs are adapted to each student's level and goals. Availability varies by teacher and subject.

## Lesson format

- One-to-one lessons: one teacher and one student
- Weekly recurring times chosen from the teacher's published availability
- Lesson lengths of 30, 45, or 60 minutes
- Live online classroom in the browser or the mobile app
- Weekly schedule and progress visible in the student dashboard
- Lesson times are displayed in the student's local time zone

## Teachers

Teachers apply with their experience and CV, and every application is reviewed before onboarding. Approved teachers publish their weekly availability, and students book open times instantly. Our teaching team is based in Egypt.

## Fees and payment

- New students start with a free trial lesson
- After the trial, lessons are billed monthly in US dollars (USD) by bank transfer
- The monthly amount depends on the teacher's rate and the number of lesson minutes
- Students claim each month's payment in their account; the academy confirms it
- Currency conversion or bank fees, if any, are set by the student's bank

## Who it is for

- Children learning to read the Quran
- Adults starting from the beginning
- Students who want Tajweed or memorization support
- Families looking for consistent one-to-one lessons
- English-speaking learners in the US, UK, Canada, Australia, New Zealand, and Ireland

## Frequently asked questions

### Do I need to live in a particular country?

Website registration is currently open to the United States, the United Kingdom, Canada, Australia, New Zealand, and Ireland, and lessons are taught in English. You need an internet connection and a suitable device. Lesson times depend on teacher availability in your time zone. If you live elsewhere, contact the academy and it will tell you what is possible.

### Are lessons in English?

Yes. Lessons and communication are in English.

### Can children and adults learn?

Yes. Lessons are one-to-one and adapted to the student's age, level, and goals.

### Is the first lesson really free?

Yes. A new student's first lesson is a free trial. After that, lessons are billed monthly.

### How much do lessons cost?

The price depends on the teacher's rate and lesson length. Fees are shown and billed in US dollars (USD). Contact the academy for current options.

### How are lessons scheduled?

Each teacher publishes weekly availability. Students choose the times that fit their routine, and the booking repeats weekly. Times are shown in the student's local time zone.

### Is there a physical campus?

No. Ana Quran Academy is an online academy. We do not operate local branches and do not claim a local presence in students' countries.

## Courses

Programmes are one-to-one and taught in English. Availability varies by teacher and subject.

- All programmes: ${SITE_URL}/courses
- Online Quran classes for kids: ${SITE_URL}/courses/quran-for-kids
- Online Tajweed classes: ${SITE_URL}/courses/tajweed

## Blog

The Ana Quran Academy blog publishes practical, globally relevant guides for English-speaking students and parents. Articles cover learning Quran online, Tajweed, memorization, children's lessons, and choosing an academy. They are written for readers in any country and do not assume a UK, US, or single-country audience.

- Blog index: ${SITE_URL}/blog
- RSS feed: ${SITE_URL}/blog/rss.xml

${blogLines}

## Key pages

- Home: ${SITE_URL}/
- About: ${SITE_URL}/about
- Blog: ${SITE_URL}/blog
- Contact: ${SITE_URL}/contact
- Teacher applications: ${SITE_URL}/teach

## Language and regional versions

The public website is English-only. There are no country-specific or language-specific versions of the site.
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
