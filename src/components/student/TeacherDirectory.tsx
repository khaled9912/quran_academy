"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, CheckCircle2, Mail, Phone } from "lucide-react";
import {
  getAssignedTeacherAvailability,
  getMyLessonRequests,
  getTeacherDirectory,
  requestLessonSlot,
} from "@/services/scheduling.service";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/providers/auth-provider";

const dateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

interface TeacherDirectoryProps {
  compact?: boolean;
}

export function TeacherDirectory({ compact = false }: TeacherDirectoryProps) {
  const { role } = useAuth();
  const enabled = role === "student";
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState("");

  const directoryQuery = useQuery({
    queryKey: ["teachers", "directory"],
    queryFn: getTeacherDirectory,
    enabled,
  });
  const requestsQuery = useQuery({
    queryKey: ["lesson-requests", "student"],
    queryFn: getMyLessonRequests,
    enabled,
  });
  const assignedQuery = useQuery({
    queryKey: ["availability", "student"],
    queryFn: getAssignedTeacherAvailability,
    enabled,
  });

  const requestMutation = useMutation({
    mutationFn: requestLessonSlot,
    onSuccess: async () => {
      setNotice(
        "Your request is on its way. Your teacher confirms the time first, then the academy approves the lesson."
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["teachers"] }),
        queryClient.invalidateQueries({ queryKey: ["lesson-requests"] }),
        queryClient.invalidateQueries({ queryKey: ["availability"] }),
        queryClient.invalidateQueries({ queryKey: ["lessons"] }),
      ]);
    },
  });

  const teachers = [...(directoryQuery.data ?? [])].sort(
    (a, b) => Number(b.slots.length > 0) - Number(a.slots.length > 0)
  );
  const requests = requestsQuery.data ?? [];
  const openRequest = requests.find((request) =>
    request.status.startsWith("pending_")
  );
  const assignedTeacherId = assignedQuery.data?.teacher?.id;
  const visibleTeachers = compact ? teachers.slice(0, 3) : teachers;
  const error = directoryQuery.error ?? requestsQuery.error;
  const loading = directoryQuery.isLoading || requestsQuery.isLoading;

  return (
    <section className="rounded-3xl border border-card-border bg-card-bg p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <CalendarDays className="text-green-600" />
          <div>
            <h2 className="text-2xl font-semibold">Choose your teacher</h2>
            <p className="mt-1 text-sm text-foreground opacity-70">
              Pick a teacher and an open time. The request then follows the
              usual teacher and academy approval.
            </p>
          </div>
        </div>
        {compact && (
          <Link
            href="/student/availability"
            className="shrink-0 text-sm font-semibold text-green-600 hover:underline"
          >
            See all teachers →
          </Link>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error instanceof Error
            ? error.message
            : "Unable to load the teacher list."}
        </p>
      )}

      {openRequest && (
        <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          You already have a lesson request awaiting approval for{" "}
          <strong>{dateTime(openRequest.startsAt)}</strong>. You can request
          another lesson once this one is resolved.
        </p>
      )}

      {notice && (
        <p
          role="status"
          className="mt-5 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          {notice}
        </p>
      )}

      {requestMutation.error && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {requestMutation.error instanceof Error
            ? requestMutation.error.message
            : "Unable to send the request. Please try again."}
        </p>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-foreground opacity-70">
          Loading teacher profiles…
        </p>
      ) : visibleTeachers.length ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleTeachers.map((teacher) => {
            const slots = teacher.slots;
            const shown = compact ? slots.slice(0, 2) : slots.slice(0, 6);
            const isAssigned = teacher.teacher.id === assignedTeacherId;
            return (
              <article
                key={teacher.teacher.id}
                className="flex flex-col rounded-2xl border border-card-border bg-background p-5"
              >
                <div className="flex items-start gap-3">
                  <Avatar
                    name={teacher.teacher.fullName}
                    src={teacher.teacher.avatarUrl}
                    className="h-14 w-14 rounded-2xl text-lg"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold">
                        {teacher.teacher.fullName}
                      </h3>
                      {isAssigned && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-green-800">
                          Your teacher
                        </span>
                      )}
                    </div>
                    {teacher.teacher.email && (
                      <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-foreground opacity-70">
                        <Mail size={13} className="shrink-0" />
                        <span className="truncate">
                          {teacher.teacher.email}
                        </span>
                      </p>
                    )}
                    {teacher.teacher.phoneNumber && (
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-foreground opacity-70">
                        <Phone size={13} className="shrink-0" />
                        {teacher.teacher.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-foreground opacity-60">
                    {slots.length} open {slots.length === 1 ? "time" : "times"}
                  </p>
                  <div className="mt-2 space-y-2">
                    {shown.map((slot) => {
                      const pending =
                        requestMutation.isPending &&
                        requestMutation.variables === slot.id;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={!!openRequest || requestMutation.isPending}
                          onClick={() => {
                            setNotice("");
                            requestMutation.mutate(slot.id);
                          }}
                          className="flex w-full items-center justify-between gap-3 rounded-xl border border-card-border px-3 py-3 text-left text-sm transition hover:border-green-500 hover:bg-green-500/5 disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          <span className="min-w-0">
                            <span className="block font-semibold">
                              {dateTime(slot.startsAt)}
                            </span>
                            <span className="block text-xs text-foreground opacity-65">
                              Ends{" "}
                              {new Date(slot.endsAt).toLocaleTimeString([], {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </span>
                          </span>
                          <span className="shrink-0 text-xs font-semibold text-green-600">
                            {pending ? "Sending…" : "Request"}
                          </span>
                        </button>
                      );
                    })}
                    {!slots.length && (
                      <p className="rounded-xl border border-dashed border-card-border p-4 text-sm text-foreground opacity-65">
                        No open times right now. Check back soon.
                      </p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="mt-6 rounded-2xl border border-dashed border-card-border p-8 text-center text-sm text-foreground opacity-70">
          No teachers are accepting lesson requests right now. Please contact
          the academy.
        </p>
      )}
    </section>
  );
}
