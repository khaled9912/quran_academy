"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, MessageSquareQuote } from "lucide-react";
import { getPublicTeacher } from "@/services/scheduling.service";
import { Avatar } from "@/components/ui/avatar";
import { StarRating } from "@/components/ui/star-rating";
import { lessonDateTime } from "@/lib/lesson-feedback";
import { useAuth } from "@/providers/auth-provider";

export default function PublicTeacherProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const { role } = useAuth();
  const teacherQuery = useQuery({
    queryKey: ["teachers", "public", id],
    queryFn: () => getPublicTeacher(id),
    enabled: Boolean(id),
  });

  const teacher = teacherQuery.data;
  const bookHref =
    role === "student"
      ? `/student/teachers/${encodeURIComponent(id)}`
      : "/login";

  return (
    <main className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4 md:px-8 lg:px-16">
        <Link
          href="/teachers"
          className="mb-6 inline-block text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-400"
        >
          ← All teachers
        </Link>

        {teacherQuery.error ? (
          <p
            role="alert"
            className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300"
          >
            {teacherQuery.error instanceof Error
              ? teacherQuery.error.message
              : "Unable to load this teacher."}
          </p>
        ) : teacherQuery.isLoading || !teacher ? (
          <p className="text-foreground opacity-70">Loading teacher…</p>
        ) : (
          <>
            <section className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-card-border bg-card-bg p-6 md:p-8">
              <div className="flex items-center gap-5">
                <Avatar
                  name={teacher.fullName}
                  src={teacher.avatarUrl}
                  className="h-24 w-24 rounded-3xl text-2xl"
                />
                <div>
                  <h1 className="text-3xl font-bold">{teacher.fullName}</h1>
                  <StarRating
                    value={teacher.averageRating ?? null}
                    count={teacher.reviewCount}
                    className="mt-2"
                  />
                  <p className="mt-2 text-sm text-foreground opacity-70">
                    Ratings come from students after completed lessons.
                  </p>
                </div>
              </div>
              <Link
                href={bookHref}
                className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-5 py-3 font-semibold text-white transition hover:bg-green-600"
              >
                <CalendarCheck size={18} />
                {role === "student" ? "Book weekly times" : "Sign in to book"}
              </Link>
            </section>

            <section className="mt-6 rounded-3xl border border-card-border bg-card-bg p-6 md:p-8">
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <MessageSquareQuote
                  size={20}
                  className="text-green-600 dark:text-green-400"
                />
                Student reviews
                <span className="text-sm font-normal text-foreground opacity-60">
                  ({teacher.reviewCount})
                </span>
              </h2>

              {teacher.reviews.length ? (
                <div className="mt-5 space-y-4">
                  {teacher.reviews.map((review) => (
                    <article
                      key={review.id}
                      className="rounded-2xl border border-card-border p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <StarRating value={review.rating} count={1} />
                          <span className="text-sm font-semibold">
                            {review.studentName}
                          </span>
                        </div>
                        <span className="text-xs text-foreground opacity-60">
                          {lessonDateTime(review.createdAt)}
                        </span>
                      </div>
                      {review.comment ? (
                        <p className="mt-3 whitespace-pre-line text-sm">
                          {review.comment}
                        </p>
                      ) : (
                        <p className="mt-3 text-sm italic text-foreground opacity-60">
                          No written comment.
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-5 rounded-2xl border border-dashed border-card-border p-6 text-center text-sm text-foreground opacity-70">
                  No reviews yet. Be the first to learn with this teacher.
                </p>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
