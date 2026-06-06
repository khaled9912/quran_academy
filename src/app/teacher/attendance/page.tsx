"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaCheckCircle, FaTimesCircle, FaArrowLeft } from "react-icons/fa";
import { supabase } from "@/lib/supabase-client";
import { backendFetch } from "@/lib/backend-client";

interface AttendanceRecord {
  id: number;
  studentName: string;
  courseTitle: string;
  sessionTime: string;
  status: "present" | "absent" | "pending";
  joinedLinkClicked: boolean;
}

const initialRecords: AttendanceRecord[] = [
  {
    id: 1,
    studentName: "Amina Hassan",
    courseTitle: "Quran Tajweed Essentials",
    sessionTime: "Mon 6:00 PM",
    status: "pending",
    joinedLinkClicked: false,
  },
  {
    id: 2,
    studentName: "Omar Khalid",
    courseTitle: "Arabic Language Basics",
    sessionTime: "Tue 4:00 PM",
    status: "pending",
    joinedLinkClicked: false,
  },
  {
    id: 3,
    studentName: "Sara Ali",
    courseTitle: "Islamic Studies Fundamentals",
    sessionTime: "Sat 5:00 PM",
    status: "pending",
    joinedLinkClicked: false,
  },
];

const TeacherAttendancePage = () => {
  const router = useRouter();
  const [records, setRecords] = useState<AttendanceRecord[]>(initialRecords);

  useEffect(() => {
    const loadAttendance = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        router.push("/login");
        return;
      }

      try {
        const data = await backendFetch("/api/attendance");
        if (data) {
          setRecords(
            data.map((record: any) => ({
              id: record.id,
              studentName: record.student_name ?? record.studentName ?? "Student",
              courseTitle: record.course_title ?? record.courseTitle ?? "Course",
              sessionTime: record.session_time ?? record.sessionTime ?? "TBD",
              status: record.status ?? "pending",
              joinedLinkClicked: record.joined_link_clicked ?? record.joinedLinkClicked ?? false,
            }))
          );
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes("401")) {
          router.push("/login");
          return;
        }
        console.warn("Unable to load attendance from backend:", message);
      }
    };

    loadAttendance();
  }, [router]);

  const syncRecord = async (
    id: number,
    values: Partial<AttendanceRecord>
  ) => {
    setRecords((prev) =>
      prev.map((record) =>
        record.id === id ? { ...record, ...values } : record
      )
    );

    await backendFetch(`/api/attendance/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: values.status,
        joined_link_clicked: values.joinedLinkClicked,
      }),
    });
  };

  const markStatus = (id: number, status: "present" | "absent") => {
    syncRecord(id, { status, joinedLinkClicked: status === "present" ? true : false });
  };

  const markJoined = (id: number) => {
    syncRecord(id, { joinedLinkClicked: true, status: "present" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-16">
        <div className="mb-10">
          <Link
            href="/teacher/schedule"
            className="inline-flex items-center gap-2 text-green-500 hover:text-green-600 mb-4"
          >
            <FaArrowLeft />
            <span>Back to Schedule</span>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Attendance</h1>
          <p className="text-lg text-foreground opacity-75">
            Track student attendance for live classes with simple present /
            absent controls.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {records.map((record) => (
            <div
              key={record.id}
              className="bg-card-bg border border-card-border rounded-lg p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <p className="text-2xl font-semibold">{record.studentName}</p>
                  <p className="text-sm text-foreground opacity-75">
                    {record.courseTitle} • {record.sessionTime}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      record.status === "present"
                        ? "bg-green-100 text-green-700"
                        : record.status === "absent"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {record.status === "present"
                      ? "Present"
                      : record.status === "absent"
                      ? "Absent"
                      : "Pending"}
                  </span>
                  {record.joinedLinkClicked && (
                    <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-semibold">
                      Joined Link
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => markStatus(record.id, "present")}
                  className="flex-1 px-4 py-3 rounded-lg bg-green-500 text-white hover:bg-green-600 transition flex items-center justify-center gap-2"
                >
                  <FaCheckCircle /> Mark Present
                </button>
                <button
                  onClick={() => markStatus(record.id, "absent")}
                  className="flex-1 px-4 py-3 rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition flex items-center justify-center gap-2"
                >
                  <FaTimesCircle /> Mark Absent
                </button>
                <button
                  onClick={() => markJoined(record.id)}
                  className="flex-1 px-4 py-3 rounded-lg border border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition"
                >
                  Auto Joined
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherAttendancePage;
