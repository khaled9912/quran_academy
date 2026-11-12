"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, RefreshCw } from "lucide-react";
import { getPublicTeachers } from "@/services/scheduling.service";
import { Avatar } from "@/components/ui/avatar";
import { StarRating } from "@/components/ui/star-rating";
import { lessonDateTime } from "@/lib/lesson-feedback";
import { useAuth } from "@/providers/auth-provider";

export default function PublicTeachersPage() {
  const { role } = useAuth();
  const teachersQuery = useQuery({
    queryKey: ["teachers", "public"],
    queryFn: getPublicTeachers,
    // Students only ever see the teacher the academy assigned them.
    enabled: role !== "student",
  });

  const teachers = teachersQuery.data ?? [];

  if (role === "student") {
    return (
      <main className="min-h-screen bg-background text-foreground pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-4 md:px-8 lg:px-16">
          <div className="rounded-3xl border border-card-border bg-card-bg p-8 text-center">
            <h1 className="text-2xl font-bold">
              The academy chooses your teacher
            </h1>
            <p className="mt-3 text-foreground opacity-75">
              Your teacher is matched to your level and your times, and shows on
              your dashboard as soon as it is set.
            </p>
            <Link
              href="/student/dashboard"
              className="mt-6 inline-block rounded-xl bg-green-500 px-5 py-2.5 font-semibold text-white transition hover:bg-green-600"
            >
              Go to my dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="mx-auto max-w-6xl px-4 md:px-8 lg:px-16">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.18em] text-green-600 dark:text-green-400">
              Our teachers
            </p>
            <h1 className="mt-2 text-4xl font-bold">
              Learn from reviewed tutors
            </h1>
            <p className="mt-2 max-w-2xl text-lg text-foreground opacity-75">
              Every rating comes from a student after a completed lesson. Open a
              teacher to read their reviews and see what they teach.
            </p>
          </div>
          <button
            onClick={() => void teachersQuery.refetch()}
            className="inline-flex items-center gap-2 rounded-xl border border-card-border bg-card-bg px-4 py-2.5 text-sm font-semibold hover:border-green-500"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {teachersQuery.error && (
          <p
            role="alert"
            className="mb-6 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300"
          >
            {teachersQuery.error instanceof Error
              ? teachersQuery.error.message
              : "Unable to load the teachers."}
          </p>
        )}

        {teachersQuery.isLoading ? (
          <p className="text-foreground opacity-70">Loading teachers…</p>
        ) : teachers.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {teachers.map((teacher) => {
              const latestReview = teacher.reviews[0];
              return (
                <Link
                  key={teacher.id}
                  href={`/teachers/${teacher.id}`}
                  className="flex flex-col rounded-3xl border border-card-border bg-card-bg p-6 transition hover:border-green-500"
                >
                  <div className="flex items-center gap-4">
                    <Avatar
                      name={teacher.fullName}
                      src={teacher.avatarUrl}
                      className="h-16 w-16 rounded-2xl text-xl"
                    />
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold">
                        {teacher.fullName}
                      </h2>
                      <StarRating
                        value={teacher.averageRating ?? null}
                        count={teacher.reviewCount}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex-1 rounded-2xl bg-background p-4">
                    {latestReview ? (
                      <>
                        <p className="text-xs font-semibold uppercase tracking-wide text-foreground opacity-60">
                          Latest review
                        </p>
                        <p className="mt-2 line-clamp-4 text-sm">
                          {latestReview.comment ||
                            "Rated the lesson without a comment."}
                        </p>
                        <p className="mt-2 text-xs text-foreground opacity-60">
                          {latestReview.studentName} ·{" "}
                          {lessonDateTime(latestReview.createdAt)}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-foreground opacity-70">
                        This teacher has not been reviewed yet.
                      </p>
                    )}
                  </div>

                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400">
                    <GraduationCap size={16} /> View profile
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-card-border bg-card-bg p-10 text-center text-foreground opacity-70">
            Teachers will appear here as soon as they join the academy.
          </div>
        )}
      </div>
    </main>
  );
}
