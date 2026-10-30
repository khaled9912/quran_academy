"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { getMyLessonRequests } from "@/services/scheduling.service";
import { TeacherDirectory } from "@/components/student/TeacherDirectory";
import { useAuth } from "@/providers/auth-provider";

const dateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export default function StudentAvailabilityPage() {
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const requestsQuery = useQuery({
    queryKey: ["lesson-requests", "student"],
    queryFn: getMyLessonRequests,
    enabled: role === "student",
  });

  const requests = requestsQuery.data ?? [];

  if (role !== "student")
    return (
      <main className="mx-auto max-w-4xl px-5 py-16">
        Please sign in with a student account to view available slots.
      </main>
    );

  return (
    <main className="min-h-[75vh] bg-[#fbfaf6] px-5 py-12 text-[#173b35] md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.18em] text-[#a7773e]">
              Student portal
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              Teachers and lesson times
            </h1>
            <p className="mt-2 max-w-2xl text-[#6b7c73]">
              Browse teacher profiles, pick an open time, and send a request.
              Your teacher confirms first, then the academy approves the
              lesson.
            </p>
          </div>
          <button
            onClick={() => {
              void requestsQuery.refetch();
              void queryClient.invalidateQueries({
                queryKey: ["teachers", "directory"],
              });
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-[#d8e2d4] bg-white px-4 py-2.5 text-sm font-semibold hover:bg-[#f2f6ef]"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {requestsQuery.error && (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {requestsQuery.error instanceof Error
              ? requestsQuery.error.message
              : "Unable to load your requests."}
          </p>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_.6fr]">
          <TeacherDirectory />

          <aside className="h-fit rounded-3xl border border-[#e5e9df] bg-[#eef3e9] p-6 md:p-8">
            <h2 className="text-xl font-bold">Your requests</h2>
            <p className="mt-2 text-sm leading-6 text-[#6b7c73]">
              A lesson becomes confirmed only after your teacher and the academy
              admin approve it.
            </p>
            <div className="mt-5 space-y-3">
              {requestsQuery.isLoading ? (
                <p className="rounded-xl bg-white/70 p-4 text-sm text-[#74847b]">
                  Loading your requests…
                </p>
              ) : requests.length ? (
                requests.slice(0, 5).map((request) => (
                  <div
                    key={request.id}
                    className="rounded-xl border border-[#dce6d8] bg-white p-4"
                  >
                    <p className="text-sm font-semibold">
                      {dateTime(request.startsAt)}
                    </p>
                    <p className="mt-1 text-xs capitalize text-[#74847b]">
                      {request.status.replaceAll("_", " ")}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-xl bg-white/70 p-4 text-sm text-[#74847b]">
                  You haven&apos;t requested a lesson yet.
                </p>
              )}
            </div>
            <Link
              href="/student/dashboard"
              className="mt-6 inline-block text-sm font-semibold text-[#1c5145] hover:underline"
            >
              Back to dashboard →
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
