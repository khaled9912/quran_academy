"use client";

import { FormEvent, useState } from "react";
import { CalendarPlus, Trash2, RefreshCw } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import {
  deleteAvailability,
  getMyAvailability,
  publishAvailability,
} from "@/services/scheduling.service";

const display = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
export default function TeacherAvailabilityPage() {
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const slotsQuery = useQuery({
    queryKey: ["availability", "teacher"],
    queryFn: getMyAvailability,
    enabled: role === "teacher",
  });
  const invalidateAvailability = () =>
    queryClient.invalidateQueries({ queryKey: ["availability"] });
  const publishMutation = useMutation({
    mutationFn: ({ startsAt, endsAt }: { startsAt: string; endsAt: string }) =>
      publishAvailability(startsAt, endsAt),
    onSuccess: async () => {
      setStart("");
      setEnd("");
      setNotice("Availability published.");
      await invalidateAvailability();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteAvailability,
    onSuccess: invalidateAvailability,
  });
  const slots = slotsQuery.data ?? [];
  const error =
    formError ||
    (slotsQuery.error ?? publishMutation.error ?? deleteMutation.error);
  const saving = publishMutation.isPending;

  function submit(event: FormEvent) {
    event.preventDefault();
    setFormError("");
    setNotice("");
    const a = new Date(start),
      b = new Date(end);
    if (!(a < b)) {
      setFormError("End time must be after start time.");
      return;
    }
    publishMutation.mutate({
      startsAt: a.toISOString(),
      endsAt: b.toISOString(),
    });
  }

  if (slotsQuery.isLoading)
    return (
      <main className="mx-auto max-w-5xl px-5 py-16">
        Loading your availability…
      </main>
    );
  if (role !== "teacher")
    return (
      <main className="mx-auto max-w-5xl px-5 py-16">
        Please sign in with a teacher account.
      </main>
    );
  return (
    <main className="min-h-[75vh] bg-[#fbfaf6] px-5 py-12 text-[#173b35] md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.18em] text-[#a7773e]">
              Teacher portal
            </p>
            <h1 className="mt-2 text-3xl font-bold">Manage availability</h1>
            <p className="mt-2 text-[#6b7c73]">
              Publish the exact lesson times your assigned students can request.
            </p>
          </div>
          <button
            onClick={() => void slotsQuery.refetch()}
            className="inline-flex items-center gap-2 rounded-xl border border-[#d8e2d4] bg-white px-4 py-2.5 text-sm font-semibold"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
        {error && (
          <p
            role="alert"
            className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700"
          >
            {error instanceof Error
              ? error.message
              : error || "Unable to load availability."}
          </p>
        )}
        {notice && (
          <p
            role="status"
            className="mt-6 rounded-xl bg-green-50 p-4 text-sm text-green-800"
          >
            {notice}
          </p>
        )}
        <div className="mt-8 grid gap-6 md:grid-cols-[.8fr_1.2fr]">
          <form
            onSubmit={submit}
            className="h-fit rounded-3xl border border-[#e5e9df] bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <CalendarPlus className="text-[#6f8c69]" />
              <h2 className="text-xl font-bold">Publish a time slot</h2>
            </div>
            <label className="mt-6 block text-sm font-semibold">
              Starts at
              <input
                required
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="mt-2 w-full rounded-xl border border-[#dce5d9] px-3 py-3 font-normal outline-none focus:border-[#6f8c69]"
              />
            </label>
            <label className="mt-4 block text-sm font-semibold">
              Ends at
              <input
                required
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                min={start || new Date().toISOString().slice(0, 16)}
                className="mt-2 w-full rounded-xl border border-[#dce5d9] px-3 py-3 font-normal outline-none focus:border-[#6f8c69]"
              />
            </label>
            <p className="mt-3 text-xs leading-5 text-[#7b8981]">
              Times are converted to UTC before being sent to the API. The
              backend validates conflicts and duration.
            </p>
            <button
              disabled={saving}
              className="mt-6 w-full rounded-xl bg-[#1c5145] px-4 py-3 font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Publishing…" : "Publish availability"}
            </button>
          </form>
          <section className="rounded-3xl border border-[#e5e9df] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Published slots</h2>
            <div className="mt-5 space-y-3">
              {[...slots]
                .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
                .map((slot) => (
                  <div
                    key={slot.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e6ebe2] p-4"
                  >
                    <div>
                      <p className="font-semibold">{display(slot.startsAt)}</p>
                      <p className="mt-1 text-sm capitalize text-[#7b8981]">
                        {slot.status}
                      </p>
                    </div>
                    {slot.status === "available" && (
                      <button
                        onClick={() => deleteMutation.mutate(slot.id)}
                        disabled={
                          deleteMutation.isPending &&
                          deleteMutation.variables === slot.id
                        }
                        aria-label="Remove availability slot"
                        className="rounded-lg p-2 text-[#a65d54] hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              {!slots.length && (
                <p className="rounded-xl border border-dashed border-[#d9e3d5] p-8 text-center text-sm text-[#75847b]">
                  You haven't published any availability yet.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
