"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Course {
  id: number;
  title: string;
  instructor: string;
  progress: number;
  thumbnail: string;
}

interface Lesson {
  id: number;
  courseTitle: string;
  topicTitle: string;
  scheduledTime: string;
  meetLink: string;
}

const StudentDashboard = () => {
  const [myCourses] = useState<Course[]>([
    {
      id: 1,
      title: "Quran Reading Basics",
      instructor: "Sheikh Ahmed",
      progress: 65,
      thumbnail: "https://images.pexels.com/photos/16066399/pexels-photo-16066399/free-photo-of-man-reading-koran.jpeg",
    },
    {
      id: 2,
      title: "Arabic Language Fundamentals",
      instructor: "Sister Fatima",
      progress: 45,
      thumbnail: "https://images.pexels.com/photos/8522576/pexels-photo-8522576.jpeg",
    },
    {
      id: 3,
      title: "Islamic Studies",
      instructor: "Sheikh Mohammad",
      progress: 80,
      thumbnail: "https://images.pexels.com/photos/2608353/pexels-photo-2608353.jpeg",
    },
  ]);

  const [upcomingLessons] = useState<Lesson[]>([
    {
      id: 1,
      courseTitle: "Quran Reading Basics",
      topicTitle: "Surah Al-Fatiha",
      scheduledTime: "Today at 6:00 PM",
      meetLink: "https://zoom.us/j/example",
    },
    {
      id: 2,
      courseTitle: "Arabic Language Fundamentals",
      topicTitle: "Verb Conjugation",
      scheduledTime: "Tomorrow at 4:00 PM",
      meetLink: "https://meet.google.com/example",
    },
    {
      id: 3,
      courseTitle: "Islamic Studies",
      topicTitle: "The Five Pillars",
      scheduledTime: "June 7 at 5:00 PM",
      meetLink: "https://zoom.us/j/example2",
    },
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Student Dashboard</h1>
          <p className="text-lg text-foreground opacity-75">Welcome back! Here's your learning overview.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Link href="/schedule">
                <button className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg font-semibold transition">
                  View Schedule
                </button>
              </Link>
              <Link href="/courses">
                <button className="w-full px-4 py-3 border border-green-500 text-green-500 hover:bg-green-500 hover:text-white rounded-lg font-semibold transition">
                  Browse Courses
                </button>
              </Link>
            </div>
            {/* Upcoming Lessons */}
            <section className="bg-card-bg border border-card-border rounded-lg p-8">
              <h2 className="text-2xl font-semibold mb-6">Upcoming Lessons</h2>
              <div className="space-y-4">
                {upcomingLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="border border-card-border rounded-lg p-5 hover:border-green-500 transition"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-green-500 font-semibold uppercase">
                          {lesson.courseTitle}
                        </p>
                        <h3 className="text-lg font-semibold mt-2">{lesson.topicTitle}</h3>
                        <p className="text-foreground opacity-70 mt-2">{lesson.scheduledTime}</p>
                      </div>
                      <a
                        href={lesson.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded font-semibold transition whitespace-nowrap"
                      >
                        Join Class
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* My Courses */}
            <section className="bg-card-bg border border-card-border rounded-lg p-8">
              <h2 className="text-2xl font-semibold mb-6">My Courses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myCourses.map((course) => (
                  <div
                    key={course.id}
                    className="border border-card-border rounded-lg overflow-hidden hover:border-green-500 transition"
                  >
                    <div className="relative h-32 bg-gradient-to-r from-green-400 to-green-600">
                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        fill
                        className="object-cover opacity-50"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold">{course.title}</h3>
                      <p className="text-sm text-foreground opacity-70 mt-1">
                        Instructor: {course.instructor}
                      </p>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-foreground opacity-75">Progress</span>
                          <span className="text-sm font-semibold text-green-500">
                            {course.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-card-border rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <button className="w-full mt-4 px-3 py-2 border border-green-500 text-green-500 hover:bg-green-500 hover:text-white rounded font-semibold transition">
                        Continue Learning
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-card-bg border border-card-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-foreground opacity-70 text-sm">Enrolled Courses</p>
                  <p className="text-3xl font-bold text-green-500">{myCourses.length}</p>
                </div>
                <div>
                  <p className="text-foreground opacity-70 text-sm">Upcoming Classes</p>
                  <p className="text-3xl font-bold text-green-500">{upcomingLessons.length}</p>
                </div>
                <div>
                  <p className="text-foreground opacity-70 text-sm">Average Progress</p>
                  <p className="text-3xl font-bold text-green-500">
                    {Math.round(
                      myCourses.reduce((sum, course) => sum + course.progress, 0) /
                        myCourses.length
                    )}
                    %
                  </p>
                </div>
              </div>
            </div>

            {/* Browse More Courses */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Explore More</h3>
              <p className="text-sm opacity-90 mb-4">
                Discover new courses and expand your knowledge.
              </p>
              <Link href="#courses">
                <button className="w-full px-4 py-2 bg-white text-green-600 hover:bg-opacity-90 rounded font-semibold transition">
                  Browse Courses
                </button>
              </Link>
            </div>

            {/* Need Help */}
            <div className="bg-card-bg border border-card-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
              <p className="text-foreground opacity-70 text-sm mb-4">
                Contact our support team or visit the FAQ.
              </p>
              <Link href="#contacts">
                <button className="w-full px-4 py-2 border border-green-500 text-green-500 hover:bg-green-500 hover:text-white rounded font-semibold transition">
                  Contact Us
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
