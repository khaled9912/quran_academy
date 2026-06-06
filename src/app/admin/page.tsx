"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-client";

interface Teacher {
  id: number;
  name: string;
  email: string;
  subject: string;
}

interface CourseItem {
  id: number;
  title: string;
  teacher: string;
  schedule: string;
}

interface StudentAssignment {
  id: number;
  studentName: string;
  courseTitle: string;
}

const DEFAULT_TEACHERS: Teacher[] = [
  {
    id: 1,
    name: "Sheikh Ahmed Al-Mansouri",
    email: "ahmed@example.com",
    subject: "Quran Tajweed",
  },
  {
    id: 2,
    name: "Sister Fatima Al-Rashid",
    email: "fatima@example.com",
    subject: "Arabic Basics",
  },
  {
    id: 3,
    name: "Professor Ibrahim Ali",
    email: "ibrahim@example.com",
    subject: "Islamic Studies",
  },
];

const DEFAULT_COURSES: CourseItem[] = [
  {
    id: 1,
    title: "Quran Tajweed Essentials",
    teacher: "Sheikh Ahmed Al-Mansouri",
    schedule: "Mon & Wed 6:00 PM",
  },
  {
    id: 2,
    title: "Arabic Language Basics",
    teacher: "Sister Fatima Al-Rashid",
    schedule: "Tue & Thu 4:00 PM",
  },
  {
    id: 3,
    title: "Islamic Studies Fundamentals",
    teacher: "Professor Ibrahim Ali",
    schedule: "Sat & Sun 5:00 PM",
  },
];

const DEFAULT_ASSIGNMENTS: StudentAssignment[] = [
  {
    id: 1,
    studentName: "Amina Hassan",
    courseTitle: "Quran Tajweed Essentials",
  },
  {
    id: 2,
    studentName: "Omar Khalid",
    courseTitle: "Arabic Language Basics",
  },
  {
    id: 3,
    studentName: "Sara Ali",
    courseTitle: "Islamic Studies Fundamentals",
  },
];

const AdminPage = () => {
  const [teachers, setTeachers] = useState<Teacher[]>(DEFAULT_TEACHERS);
  const [courses, setCourses] = useState<CourseItem[]>(DEFAULT_COURSES);
  const [assignments, setAssignments] = useState<StudentAssignment[]>(DEFAULT_ASSIGNMENTS);
  const [teacherName, setTeacherName] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherSubject, setTeacherSubject] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [courseTeacher, setCourseTeacher] = useState("");
  const [courseSchedule, setCourseSchedule] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentCourse, setStudentCourse] = useState("");

  useEffect(() => {
    const loadAdminData = async () => {
      const { data: teacherData } = await supabase.from("teachers").select("*");
      if (teacherData) {
        setTeachers(teacherData as Teacher[]);
      }

      const { data: courseData } = await supabase.from("courses").select("*");
      if (courseData) {
        setCourses(courseData as CourseItem[]);
      }

      const { data: assignmentData } = await supabase
        .from("enrollments")
        .select("*");
      if (assignmentData) {
        setAssignments(
          assignmentData.map((row: any) => ({
            id: row.id,
            studentName: row.student_name ?? row.studentName ?? "Student",
            courseTitle: row.course_title ?? row.courseTitle ?? "Course",
          }))
        );
      }
    };

    loadAdminData();
  }, []);

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName || !teacherEmail || !teacherSubject) return;

    const { data, error } = await supabase
      .from("teachers")
      .insert([
        {
          name: teacherName,
          email: teacherEmail,
          subject: teacherSubject,
        },
      ])
      .select("*");

    if (data?.[0]) {
      setTeachers((prev) => [...prev, data[0] as Teacher]);
    } else {
      setTeachers((prev) => [
        ...prev,
        {
          id: Math.max(0, ...prev.map((t) => t.id)) + 1,
          name: teacherName,
          email: teacherEmail,
          subject: teacherSubject,
        },
      ]);
    }

    setTeacherName("");
    setTeacherEmail("");
    setTeacherSubject("");
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle || !courseTeacher || !courseSchedule) return;

    const { data, error } = await supabase
      .from("courses")
      .insert([
        {
          title: courseTitle,
          teacher: courseTeacher,
          schedule: courseSchedule,
        },
      ])
      .select("*");

    if (data?.[0]) {
      setCourses((prev) => [...prev, data[0] as CourseItem]);
    } else {
      setCourses((prev) => [
        ...prev,
        {
          id: Math.max(0, ...prev.map((c) => c.id)) + 1,
          title: courseTitle,
          teacher: courseTeacher,
          schedule: courseSchedule,
        },
      ]);
    }

    setCourseTitle("");
    setCourseTeacher("");
    setCourseSchedule("");
  };

  const handleAssignStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentCourse) return;

    const { data, error } = await supabase
      .from("enrollments")
      .insert([
        {
          student_name: studentName,
          course_title: studentCourse,
        },
      ])
      .select("*");

    const newAssignment = data?.[0]
      ? {
          id: data[0].id,
          studentName: data[0].student_name ?? studentName,
          courseTitle: data[0].course_title ?? studentCourse,
        }
      : {
          id: Math.max(0, ...assignments.map((a) => a.id)) + 1,
          studentName,
          courseTitle: studentCourse,
        };

    setAssignments((prev) => [...prev, newAssignment]);
    setStudentName("");
    setStudentCourse("");
  };

  const handleRemoveTeacher = async (id: number) => {
    await supabase.from("teachers").delete().eq("id", id);
    setTeachers((prev) => prev.filter((teacher) => teacher.id !== id));
  };

  const handleRemoveCourse = async (id: number) => {
    await supabase.from("courses").delete().eq("id", id);
    setCourses((prev) => prev.filter((course) => course.id !== id));
  };

  const totalStudents = assignments.length;
  const totalTeachers = teachers.length;
  const totalCourses = courses.length;

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
        <div className="mb-12">
          <Link
            href="/"
            className="text-green-500 hover:text-green-600 mb-4 inline-block"
          >
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
          <p className="text-lg text-foreground opacity-75">
            Light admin tools for managing teachers, courses, students, and
            basic stats.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-card-bg border border-card-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Overview</h2>
            <p className="text-foreground opacity-75">Teachers</p>
            <p className="text-3xl font-bold text-green-500 mb-4">
              {totalTeachers}
            </p>
            <p className="text-foreground opacity-75">Courses</p>
            <p className="text-3xl font-bold text-green-500 mb-4">
              {totalCourses}
            </p>
            <p className="text-foreground opacity-75">Assigned Students</p>
            <p className="text-3xl font-bold text-green-500">{totalStudents}</p>
          </div>
          <div className="bg-card-bg border border-card-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Quick actions</h2>
            <p className="text-foreground opacity-75 mb-2">
              Add or remove teachers and courses quickly.
            </p>
            <p className="text-foreground opacity-75">
              Assign students to courses for a lightweight admin workflow.
            </p>
          </div>
          <div className="bg-card-bg border border-card-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Notes</h2>
            <p className="text-sm text-foreground opacity-75">
              This admin view now stores your changes in Supabase. Keep building on it for persistence.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-card-bg border border-card-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Teachers</h2>
              <form
                onSubmit={handleAddTeacher}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
              >
                <input
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="Name"
                  className="w-full px-4 py-2 rounded-lg border border-card-border bg-background text-foreground focus:border-green-500"
                />
                <input
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-4 py-2 rounded-lg border border-card-border bg-background text-foreground focus:border-green-500"
                />
                <input
                  value={teacherSubject}
                  onChange={(e) => setTeacherSubject(e.target.value)}
                  placeholder="Subject"
                  className="w-full px-4 py-2 rounded-lg border border-card-border bg-background text-foreground focus:border-green-500"
                />
                <button
                  type="submit"
                  className="col-span-1 md:col-span-3 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition"
                >
                  Add Teacher
                </button>
              </form>
              <div className="space-y-3">
                {teachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 border border-card-border rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">{teacher.name}</p>
                      <p className="text-sm text-foreground opacity-75">
                        {teacher.subject}
                      </p>
                      <p className="text-sm text-foreground opacity-60">
                        {teacher.email}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveTeacher(teacher.id)}
                      className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card-bg border border-card-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Courses</h2>
              <form
                onSubmit={handleAddCourse}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
              >
                <input
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="Course Title"
                  className="w-full px-4 py-2 rounded-lg border border-card-border bg-background text-foreground focus:border-green-500"
                />
                <input
                  value={courseTeacher}
                  onChange={(e) => setCourseTeacher(e.target.value)}
                  placeholder="Teacher"
                  className="w-full px-4 py-2 rounded-lg border border-card-border bg-background text-foreground focus:border-green-500"
                />
                <input
                  value={courseSchedule}
                  onChange={(e) => setCourseSchedule(e.target.value)}
                  placeholder="Schedule"
                  className="w-full px-4 py-2 rounded-lg border border-card-border bg-background text-foreground focus:border-green-500"
                />
                <button
                  type="submit"
                  className="col-span-1 md:col-span-3 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition"
                >
                  Add Course
                </button>
              </form>
              <div className="space-y-3">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 border border-card-border rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">{course.title}</p>
                      <p className="text-sm text-foreground opacity-75">
                        {course.teacher}
                      </p>
                      <p className="text-sm text-foreground opacity-60">
                        {course.schedule}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveCourse(course.id)}
                      className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card-bg border border-card-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Assign Students</h2>
              <form onSubmit={handleAssignStudent} className="space-y-4">
                <input
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Student Name"
                  className="w-full px-4 py-2 rounded-lg border border-card-border bg-background text-foreground focus:border-green-500"
                />
                <select
                  value={studentCourse}
                  onChange={(e) => setStudentCourse(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-card-border bg-background text-foreground focus:border-green-500"
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.title}>
                      {course.title}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition"
                >
                  Assign Student
                </button>
              </form>
            </div>
            <div className="bg-card-bg border border-card-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">
                Recent Assignments
              </h2>
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="border border-card-border rounded-lg p-4"
                  >
                    <p className="font-semibold">{assignment.studentName}</p>
                    <p className="text-sm text-foreground opacity-75">
                      {assignment.courseTitle}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
