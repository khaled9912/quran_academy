"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Clock3, RefreshCw } from "lucide-react";
import {
  getAssignedTeacherAvailability,
  getMyLessonRequests,
  requestLessonSlot,
} from "@/services/scheduling.service";
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
  const availabilityQuery = useQuery({
    queryKey: ["availability", "student"],
    queryFn: getAssignedTeacherAvailability,
    enabled: role === "student",
  });
  const requestsQuery = useQuery({
    queryKey: ["lesson-requests", "student"],
    queryFn: getMyLessonRequests,
    enabled: role === "student",
  });
  const requestMutation = useMutation({
    mutationFn: requestLessonSlot,
    onSuccess: async () => {
      setNotice("Your lesson request has been sent to your teacher.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["availability"] }),
        queryClient.invalidateQueries({ queryKey: ["lesson-requests"] }),
      ]);
    },
  });
  const [notice, setNotice] = useState("");

  const availability = availabilityQuery.data ?? null;
  const requests = requestsQuery.data ?? [];
  const hasOpenRequest = requests.some((r) =>
    ["pending_teacher", "pending_admin"].includes(r.status)
  );
  const error =
    availabilityQuery.error ?? requestsQuery.error ?? requestMutation.error;
  const loading = availabilityQuery.isLoading || requestsQuery.isLoading;

  if (loading)
    return (
      <main className="mx-auto max-w-6xl px-5 py-16 text-[#456258]">
        Loading available lesson times…
      </main>
    );
  if (role !== "student")
    return (
      <main className="mx-auto max-w-4xl px-5 py-16">
        Please sign in with a student account to view available slots.
      </main>
    );

  const slots = (availability?.slots ?? [])
    .filter(
      (slot) =>
        slot.status === "available" && new Date(slot.startsAt) > new Date()
    )
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  return (
    <main className="min-h-[75vh] bg-[#fbfaf6] px-5 py-12 text-[#173b35] md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.18em] text-[#a7773e]">
              Student portal
            </p>
            <h1 className="mt-2 text-3xl font-bold">Choose a lesson time</h1>
            <p className="mt-2 text-[#6b7c73]">
              Select one available time with your assigned teacher. Each lesson
              is requested and approved individually.
            </p>
          </div>
          <button
            onClick={() => {
              void availabilityQuery.refetch();
              void requestsQuery.refetch();
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-[#d8e2d4] bg-white px-4 py-2.5 text-sm font-semibold hover:bg-[#f2f6ef]"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
        {error && (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error instanceof Error
              ? error.message
              : "Unable to load available slots."}
          </p>
        )}
        {notice && (
          <p
            role="status"
            className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            {notice}
          </p>
        )}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <section className="rounded-3xl border border-[#e5e9df] bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3">
              <CalendarDays className="text-[#6f8c69]" />
              <div>
                <h2 className="text-xl font-bold">Teacher availability</h2>
                <p className="text-sm text-[#74847b]">
                  {availability?.teacher?.fullName ?? "Your assigned teacher"}
                </p>
              </div>
            </div>
            {hasOpenRequest && (
              <div className="mt-5 rounded-xl bg-[#f8f2e8] p-4 text-sm text-[#80633e]">
                You already have a lesson request waiting for a response. You
                can request another lesson after it is resolved.
              </div>
            )}
            <div className="mt-6 space-y-3">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e6ebe2] p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf3e9] text-[#628166]">
                      <Clock3 size={19} />
                    </div>
                    <div>
                      <p className="font-semibold">{dateTime(slot.startsAt)}</p>
                      <p className="text-sm text-[#7b8981]">
                        Until{" "}
                        {new Date(slot.endsAt).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <button
                    disabled={hasOpenRequest || requestMutation.isPending}
                    onClick={() => {
                      setNotice("");
                      requestMutation.mutate(slot.id);
                    }}
                    className="rounded-xl bg-[#1c5145] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#163f36] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {requestMutation.isPending &&
                    requestMutation.variables === slot.id
                      ? "Requesting…"
                      : "Choose this time"}
                  </button>
                </div>
              ))}
              {!slots.length && (
                <div className="rounded-2xl border border-dashed border-[#d9e3d5] p-8 text-center text-[#75847b]">
                  There are no published slots right now. Please check again
                  later or contact the academy.
                </div>
              )}
            </div>
          </section>
          <aside className="rounded-3xl border border-[#e5e9df] bg-[#eef3e9] p-6 md:p-8">
            <h2 className="text-xl font-bold">Your requests</h2>
            <p className="mt-2 text-sm leading-6 text-[#6b7c73]">
              A lesson becomes confirmed only after your teacher and the academy
              admin approve it.
            </p>
            <div className="mt-5 space-y-3">
              {requests.slice(0, 5).map((request) => (
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
              ))}
              {!requests.length && (
                <p className="rounded-xl bg-white/70 p-4 text-sm text-[#74847b]">
                  You haven't requested a lesson yet.
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
