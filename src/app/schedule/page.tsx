"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaClock,
  FaCalendar,
  FaUser,
  FaArrowLeft,
} from "react-icons/fa";
import { supabase } from "@/lib/supabase-client";
import { backendFetch } from "@/lib/backend-client";

interface ClassSession {
  id: number;
  courseTitle: string;
  teacher: string;
  day: string;
  time: string;
  endTime: string;
  room: string;
  students: number;
  capacity: number;
  meetLink: string;
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const TIME_SLOTS = [
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
  "9:00 PM",
];

const SESSION_FALLBACK: ClassSession[] = [
  {
    id: 1,
    courseTitle: "Quran Tajweed Essentials",
    teacher: "Sheikh Ahmed Al-Mansouri",
    day: "Monday",
    time: "6:00 PM",
    endTime: "7:30 PM",
    room: "Room A",
    students: 25,
    capacity: 30,
    meetLink: "https://zoom.us/j/example",
  },
  {
    id: 2,
    courseTitle: "Arabic Language Basics",
    teacher: "Sister Fatima Al-Rashid",
    day: "Monday",
    time: "4:00 PM",
    endTime: "5:30 PM",
    room: "Room B",
    students: 20,
    capacity: 25,
    meetLink: "https://meet.google.com/example",
  },
  {
    id: 3,
    courseTitle: "Quran Tajweed Essentials",
    teacher: "Sheikh Ahmed Al-Mansouri",
    day: "Wednesday",
    time: "6:00 PM",
    endTime: "7:30 PM",
    room: "Room A",
    students: 25,
    capacity: 30,
    meetLink: "https://zoom.us/j/example",
  },
  {
    id: 4,
    courseTitle: "Arabic Language Basics",
    teacher: "Sister Fatima Al-Rashid",
    day: "Tuesday",
    time: "4:00 PM",
    endTime: "5:30 PM",
    room: "Room B",
    students: 20,
    capacity: 25,
    meetLink: "https://meet.google.com/example",
  },
  {
    id: 5,
    courseTitle: "Islamic Studies Fundamentals",
    teacher: "Sheikh Mohammad Al-Aziz",
    day: "Saturday",
    time: "5:00 PM",
    endTime: "6:30 PM",
    room: "Room C",
    students: 30,
    capacity: 35,
    meetLink: "https://zoom.us/j/example2",
  },
  {
    id: 6,
    courseTitle: "Islamic Studies Fundamentals",
    teacher: "Sheikh Mohammad Al-Aziz",
    day: "Sunday",
    time: "5:00 PM",
    endTime: "6:30 PM",
    room: "Room C",
    students: 30,
    capacity: 35,
    meetLink: "https://zoom.us/j/example2",
  },
];

const StudentSchedulePage = () => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ClassSession[]>(SESSION_FALLBACK);
  const [joinedSessions, setJoinedSessions] = useState<number[]>([]);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const data = await backendFetch("/api/sessions");
        if (data) {
          setSessions(
            data.map((session: any, index: number) => ({
              id: session.id ?? index,
              courseTitle: session.course_title ?? session.courseTitle ?? "Live session",
              teacher: session.teacher ?? "Teacher",
              day: session.day ?? "Monday",
              time: session.time ?? "TBD",
              endTime: session.end_time ?? session.endTime ?? "TBD",
              room: session.room ?? "Room",
              students: session.students ?? 0,
              capacity: session.capacity ?? 20,
              meetLink: session.live_link ?? session.meet_link ?? session.meetLink ?? "#",
            }))
          );
        }
      } catch (error) {
        console.warn("Unable to load sessions from backend:", error instanceof Error ? error.message : error);
      }
    };

    loadSessions();
  }, []);

  const courses = Array.from(new Set(sessions.map((session) => session.courseTitle)));

  const filteredSessions = sessions.filter((session) => {
    if (selectedDay && session.day !== selectedDay) return false;
    if (selectedCourse && session.courseTitle !== selectedCourse) return false;
    return true;
  });

  const handleJoinSession = (sessionId: number, link: string) => {
    if (!joinedSessions.includes(sessionId)) {
      setJoinedSessions((prev) => [...prev, sessionId]);
    }
    window.open(link, "_blank");
  };

  const getSessionsByDay = (day: string) => {
    return sessions.filter((session) => session.day === day).sort((a, b) => (a.time > b.time ? 1 : -1));
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/student-dashboard"
            className="inline-flex items-center gap-2 text-green-500 hover:text-green-600 mb-4"
          >
            <FaArrowLeft />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Weekly Schedule</h1>
          <p className="text-lg text-foreground opacity-75">
            View all class sessions and manage your enrollment
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Filter by Day */}
          <div>
            <label className="text-sm font-semibold text-foreground opacity-75 block mb-3">
              Filter by Day
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedDay(null)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  selectedDay === null
                    ? "bg-green-500 text-white"
                    : "border border-card-border text-foreground hover:border-green-500"
                }`}
              >
                All Days
              </button>
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    selectedDay === day
                      ? "bg-green-500 text-white"
                      : "border border-card-border text-foreground hover:border-green-500"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Filter by Course */}
          <div>
            <label className="text-sm font-semibold text-foreground opacity-75 block mb-3">
              Filter by Course
            </label>
            <select
              value={selectedCourse || ""}
              onChange={(e) => setSelectedCourse(e.target.value || null)}
              className="w-full px-4 py-2 bg-card-bg border border-card-border rounded-lg text-foreground focus:outline-none focus:border-green-500 transition"
            >
              <option value="">All Courses</option>
              {courses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Weekly Schedule Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card-bg border border-card-border rounded-lg p-6 sticky top-24">
              <h3 className="text-xl font-semibold mb-4">Schedule Summary</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-foreground opacity-70 mb-1">
                    Total Classes
                  </p>
                  <p className="text-3xl font-bold text-green-500">
                    {sessions.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-foreground opacity-70 mb-1">
                    Filtered Results
                  </p>
                  <p className="text-3xl font-bold text-green-500">
                    {filteredSessions.length}
                  </p>
                </div>
                <div className="pt-4 border-t border-card-border">
                  <p className="text-sm font-semibold text-foreground mb-2">
                    Your Courses
                  </p>
                  <div className="space-y-2">
                    {courses.slice(0, 3).map((course) => (
                      <p
                        key={course}
                        className="text-sm text-foreground opacity-75 line-clamp-2"
                      >
                        • {course}
                      </p>
                    ))}
                    {courses.length > 3 && (
                      <p className="text-sm text-green-500 font-semibold">
                        +{courses.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Schedule */}
          <div className="lg:col-span-3">
            {/* If no day selected, show day cards */}
            {selectedDay === null ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {DAYS_OF_WEEK.map((day) => {
                  const daySessions = getSessionsByDay(day);
                  return (
                    <div
                      key={day}
                      className="bg-card-bg border border-card-border rounded-lg p-6 hover:border-green-500 transition cursor-pointer"
                      onClick={() => setSelectedDay(day)}
                    >
                      <h3 className="text-lg font-semibold mb-4">{day}</h3>
                      <div className="space-y-3">
                        {daySessions.length > 0 ? (
                          daySessions.map((session) => (
                            <div
                              key={session.id}
                              className="text-sm border-l-4 border-green-500 pl-3 py-2"
                            >
                              <p className="font-semibold text-foreground">
                                {session.time}
                              </p>
                              <p className="text-foreground opacity-70 text-xs">
                                {session.courseTitle}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-foreground opacity-50 text-sm">
                            No classes scheduled
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Show detailed sessions for selected day/filter
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">
                  {selectedDay} {selectedCourse && `- ${selectedCourse}`}
                </h2>
                {filteredSessions.length > 0 ? (
                  filteredSessions.map((session) => (
                    <div
                      key={session.id}
                      className="bg-card-bg border border-card-border rounded-lg p-6 hover:border-green-500 transition"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-xl font-semibold mb-4">
                            {session.courseTitle}
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <FaUser className="text-green-500" />
                              <div>
                                <p className="text-sm text-foreground opacity-70">
                                  Instructor
                                </p>
                                <p className="font-semibold">
                                  {session.teacher}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <FaClock className="text-green-500" />
                              <div>
                                <p className="text-sm text-foreground opacity-70">
                                  Time
                                </p>
                                <p className="font-semibold">
                                  {session.time} - {session.endTime}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <FaCalendar className="text-green-500" />
                              <div>
                                <p className="text-sm text-foreground opacity-70">
                                  Location
                                </p>
                                <p className="font-semibold">{session.room}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          {/* Enrollment Status */}
                          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg p-6 mb-4">
                            <p className="text-sm text-foreground opacity-70 mb-2">
                              Student Capacity
                            </p>
                            <div className="mb-4">
                              <div className="flex justify-between mb-2">
                                <p className="font-semibold text-lg">
                                  {session.students}/{session.capacity}
                                </p>
                                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                  {Math.round(
                                    (session.students / session.capacity) * 100
                                  )}
                                  %
                                </p>
                              </div>
                              <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-3">
                                <div
                                  className="bg-green-500 h-3 rounded-full transition-all"
                                  style={{
                                    width: `${(session.students / session.capacity) * 100}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                            <p className="text-sm text-foreground opacity-70">
                              {session.capacity - session.students} spots
                              available
                            </p>
                          </div>

                          <div className="space-y-3">
                            <button
                              type="button"
                              onClick={() =>
                                handleJoinSession(session.id, session.meetLink)
                              }
                              className={`w-full px-4 py-3 rounded-lg font-semibold transition ${
                                session.students < session.capacity
                                  ? "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white"
                                  : "bg-gray-400 text-gray-600 cursor-not-allowed opacity-50"
                              }`}
                              disabled={session.students >= session.capacity}
                            >
                              {session.students >= session.capacity
                                ? "Class Full"
                                : "Join Class"}
                            </button>
                            <p
                              className={`text-sm font-semibold ${joinedSessions.includes(session.id) ? "text-green-600" : "text-gray-500"}`}
                            >
                              {joinedSessions.includes(session.id)
                                ? "Joined link clicked"
                                : "Not joined yet"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-card-bg border border-card-border rounded-lg p-12 text-center">
                    <p className="text-foreground opacity-70 text-lg">
                      No classes match your filters
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSchedulePage;
