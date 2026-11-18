"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Mail, Phone, School } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { getStudent } from "@/services/student.service";
import { getTeacherStudentAssignments } from "@/services/assignment.service";
import { getPendingStudents } from "@/services/onboarding.service";
import { useAuth } from "@/providers/auth-provider";
import { GRADE_OPTIONS } from "@/lib/grades";
import { WEEKDAY_SHORT, formatWeeklyTimeRange } from "@/lib/utils";
import { timeZoneLabel } from "@/lib/weekly-time";

const displayName = (student: {
  fullName?: string;
  name?: string;
  email: string;
}) => student.fullName ?? student.name ?? student.email;

const levelWord = (value?: string | null) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : "not given";

const gradeWord = (grade?: string | null) =>
  grade
    ? (GRADE_OPTIONS.find((option) => option.value === grade)?.short ?? grade)
    : "Not given";

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-card-border bg-card-bg p-6">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-[.14em] text-foreground opacity-60">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function AdminStudentProfilePage() {
  const params = useParams<{ id: string }>();
  const studentId = params?.id ?? "";
  const { role } = useAuth();
  const canView = role === "admin" || role === "super_admin";

  const studentQuery = useQuery({
    queryKey: ["students", studentId],
    queryFn: () => getStudent(studentId),
    enabled: canView && Boolean(studentId),
  });
  const assignmentsQuery = useQuery({
    queryKey: ["teacher-student-assignments"],
    queryFn: getTeacherStudentAssignments,
    enabled: canView,
  });
  // The assignment desk holds the plan, the levels, and the booked weekly
  // lessons for every active student, so one call covers all of them.
  const deskQuery = useQuery({
    queryKey: ["students", "pending"],
    queryFn: getPendingStudents,
    enabled: canView,
  });

  if (!canView) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-16">
        Admin access is required to view students.
      </main>
    );
  }

  const student = studentQuery.data;
  const desk = deskQuery.data?.find((row) => row.studentId === studentId);
  const assignment = assignmentsQuery.data?.find(
    (row) => row.studentId === studentId && row.status === "active"
  );
  const planDays = desk?.onboarding?.planDaysPerWeek ?? 0;
  const lessons = desk?.weeklyLessons ?? [];

  return (
    <div className="min-h-screen bg-background pt-8 pb-16 text-foreground">
      <div className="mx-auto max-w-4xl px-4 md:px-8">
        <Link
          href="/admin/students"
          className="mb-6 inline-block text-green-600 hover:text-green-700 dark:text-green-400"
        >
          ← All students
        </Link>

        {studentQuery.error ? (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
          >
            {studentQuery.error instanceof Error
              ? studentQuery.error.message
              : "Unable to load this student."}
          </p>
        ) : studentQuery.isLoading || !student ? (
          <p className="text-foreground opacity-70">Loading student…</p>
        ) : (
          <>
            <header className="mb-8 flex flex-wrap items-center gap-5">
              <Avatar
                name={displayName(student)}
                src={student.avatarUrl}
                className="h-20 w-20 rounded-3xl text-xl"
              />
              <div className="min-w-0">
                <h1 className="text-3xl font-bold md:text-4xl">
                  {displayName(student)}
                </h1>
                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-foreground opacity-70">
                  <span className="inline-flex items-center gap-1.5">
                    <School size={15} /> {gradeWord(student.grade)}
                  </span>
                  {student.isActive === false && (
                    <span className="rounded-full border border-red-400 px-3 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400">
                      Deactivated
                    </span>
                  )}
                </p>
              </div>
            </header>

            <div className="grid gap-5 md:grid-cols-2">
              <Card title="Contact">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Mail size={15} className="opacity-60" />
                    <a
                      href={`mailto:${student.email}`}
                      className="hover:underline"
                    >
                      {student.email}
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone size={15} className="opacity-60" />
                    {student.phoneNumber ?? "No phone number on record"}
                  </li>
                </ul>
              </Card>

              <Card title="Teacher">
                {assignment ? (
                  <Link
                    href={`/teachers/${assignment.teacherId}`}
                    className="font-semibold text-green-700 hover:underline dark:text-green-400"
                  >
                    {assignment.teacherName ?? "View teacher"}
                  </Link>
                ) : (
                  <p className="text-sm text-foreground opacity-70">
                    No teacher assigned yet.{" "}
                    <Link
                      href="/admin/assignments"
                      className="font-semibold text-green-700 hover:underline dark:text-green-400"
                    >
                      Assign one
                    </Link>
                    .
                  </p>
                )}
              </Card>

              <Card title="Plan">
                {desk ? (
                  <>
                    <p className="text-sm">
                      {planDays > 0 ? (
                        <>
                          <span className="font-semibold">
                            {planDays} {planDays === 1 ? "day" : "days"} a week
                          </span>{" "}
                          · {lessons.length} of {planDays} weekly lessons booked
                        </>
                      ) : (
                        "They never chose a plan."
                      )}
                    </p>
                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      {[
                        ["Quran", desk.onboarding?.quranLevel],
                        ["Tajweed", desk.onboarding?.tajweedLevel],
                        [
                          "Islamic studies",
                          desk.onboarding?.islamicStudiesLevel,
                        ],
                        ["Arabic", desk.onboarding?.arabicLevel],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between gap-2">
                          <dt className="text-foreground opacity-60">
                            {label}
                          </dt>
                          <dd className="font-semibold">{levelWord(value)}</dd>
                        </div>
                      ))}
                    </dl>
                  </>
                ) : (
                  <p className="text-sm text-foreground opacity-70">
                    Not in the assignment desk.
                  </p>
                )}
              </Card>

              <Card title="Weekly lessons">
                {lessons.length ? (
                  <ul className="space-y-2 text-sm">
                    {lessons.map((lesson) => (
                      <li
                        key={lesson.id}
                        className="flex items-center justify-between gap-3"
                      >
                        <span className="font-semibold">
                          {WEEKDAY_SHORT[lesson.dayOfWeek]}
                        </span>
                        <span className="text-foreground opacity-70">
                          {formatWeeklyTimeRange(
                            lesson.startsAtTime,
                            lesson.endsAtTime
                          )}
                        </span>
                        <span className="text-xs text-foreground opacity-50">
                          {timeZoneLabel(lesson.timeZoneId)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-foreground opacity-70">
                    No repeating lesson yet.
                  </p>
                )}
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
