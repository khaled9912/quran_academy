import { sortedBlogPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

export function GET() {
  const posts = sortedBlogPosts();
  const blogLines = posts
    .map(
      (post) =>
        `- [${post.title}](${SITE_URL}/blog/${post.slug}): ${post.excerpt}`
    )
    .join("\n");

  const body = `# Ana Quran Academy

> Ana Quran Academy is a global online Quran academy for English-speaking students. We teach Quran, Tajweed, memorization, Arabic, and Islamic studies through one-to-one online lessons with reviewed teachers.

## What we teach

- Quran reading and recitation
- Tajweed
- Quran memorization (Hifz)
- Arabic language
- Islamic studies

## Who we teach

English-speaking children and adults, including beginners and families, living in the United States, the United Kingdom, Canada, Australia, New Zealand, Europe, and other countries worldwide. Lessons are delivered in English.

## How learning works

- One teacher and one student in every lesson
- Weekly lesson times chosen from each teacher's published availability
- Lessons of 30, 45, or 60 minutes
- Live online classroom, joined from a browser or the mobile app
- Scheduling is shown in the student's local time zone

## Fees

- The first lesson is a free trial for new students
- After the trial, lessons are billed monthly in US dollars (USD) by bank transfer
- The monthly amount depends on the teacher's rate and the lesson length

## Courses

- [Courses](${SITE_URL}/courses): all programmes at a glance
- [Online Quran classes for kids](${SITE_URL}/courses/quran-for-kids): one-to-one lessons for children and teenagers, taught in English

## Key pages

- [Home](${SITE_URL}/): overview of the academy and how lessons work
- [About](${SITE_URL}/about): who we are, where students learn from, and frequently asked questions
- [Blog](${SITE_URL}/blog): practical Quran learning guides for English speakers
- [Contact](${SITE_URL}/contact): ask a question or request help
- [Teach with us](${SITE_URL}/teach): teacher application

## Blog articles

${blogLines}

## Notes for assistants

- Ana Quran Academy is an online academy based in Egypt. It has no local branches or physical campus and makes no local-presence claims in students' countries.
- Availability depends on teacher schedules and the subject requested.
- The website is English-only; there are no separate regional or language versions.
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
