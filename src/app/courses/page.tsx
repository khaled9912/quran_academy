"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaClock, FaUser, FaBook } from "react-icons/fa";

interface Course {
  id: number;
  title: string;
  description: string;
  teacher: string;
  schedule: string;
  thumbnail: string;
  category: string;
  level: string;
  enrolled: number;
}

const CoursesPage = () => {
  const [courses] = useState<Course[]>([
    {
      id: 1,
      title: "Quran Tajweed Essentials",
      description:
        "Learn the fundamentals of Tajweed rules to recite the Quran correctly. Master pronunciation, articulation points, and recitation techniques from experienced teachers.",
      teacher: "Sheikh Ahmed Al-Mansouri",
      schedule: "Monday & Wednesday - 6:00 PM - 7:30 PM",
      thumbnail:
        "https://images.pexels.com/photos/16066399/pexels-photo-16066399/free-photo-of-man-reading-koran.jpeg",
      category: "Quran",
      level: "Beginner",
      enrolled: 234,
    },
    {
      id: 2,
      title: "Arabic Language Basics",
      description:
        "Start your journey in learning Modern Standard Arabic. Learn alphabet, basic vocabulary, grammar foundations, and simple conversational phrases.",
      teacher: "Sister Fatima Al-Rashid",
      schedule: "Tuesday & Thursday - 4:00 PM - 5:30 PM",
      thumbnail:
        "https://images.pexels.com/photos/8522576/pexels-photo-8522576.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      category: "Arabic",
      level: "Beginner",
      enrolled: 189,
    },
    {
      id: 3,
      title: "Islamic Studies Fundamentals",
      description:
        "Explore the core principles of Islam including the Five Pillars, Islamic history, and Islamic jurisprudence basics. Perfect for newcomers and those seeking deeper knowledge.",
      teacher: "Sheikh Mohammad Al-Aziz",
      schedule: "Saturday & Sunday - 5:00 PM - 6:30 PM",
      thumbnail:
        "https://images.pexels.com/photos/2608353/pexels-photo-2608353.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      category: "Islamic Studies",
      level: "Beginner",
      enrolled: 312,
    },
    {
      id: 4,
      title: "Quranic Arabic for Beginners",
      description:
        "Understand the Arabic used in the Quran. Learn vocabulary, grammatical structures, and translation techniques specific to Quranic texts.",
      teacher: "Dr. Layla Hassan",
      schedule: "Monday & Friday - 7:00 PM - 8:30 PM",
      thumbnail:
        "https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg",
      category: "Arabic",
      level: "Intermediate",
      enrolled: 156,
    },
    {
      id: 5,
      title: "Advanced Tajweed Techniques",
      description:
        "Master advanced Tajweed rules including rare characteristics and complex recitation rules. For those who have completed the basics.",
      teacher: "Sheikh Ahmed Al-Mansouri",
      schedule: "Wednesday - 8:00 PM - 9:30 PM",
      thumbnail:
        "https://images.pexels.com/photos/16066399/pexels-photo-16066399/free-photo-of-man-reading-koran.jpeg",
      category: "Quran",
      level: "Advanced",
      enrolled: 87,
    },
    {
      id: 6,
      title: "Islamic History & Civilization",
      description:
        "Journey through Islamic history from the Prophet Muhammad to modern times. Understand the rich heritage and contributions of Islamic civilization.",
      teacher: "Professor Ibrahim Ali",
      schedule: "Tuesday & Saturday - 3:00 PM - 4:30 PM",
      thumbnail:
        "https://images.pexels.com/photos/2608353/pexels-photo-2608353.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      category: "Islamic Studies",
      level: "Intermediate",
      enrolled: 203,
    },
  ]);

  const categories = [...new Set(courses.map((c) => c.category))];

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Our Courses</h1>
          <p className="text-lg text-foreground opacity-75">
            Explore our comprehensive selection of Islamic and Arabic courses, designed for all levels.
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`}>
              <div className="bg-card-bg border border-card-border rounded-lg overflow-hidden hover:border-green-500 transition cursor-pointer h-full flex flex-col group">
                {/* Course Thumbnail */}
                <div className="relative h-48 bg-gradient-to-br from-green-400 to-green-600 overflow-hidden">
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover group-hover:scale-110 transition duration-300"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                      {course.category}
                    </span>
                    <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                      {course.level}
                    </span>
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-xl font-semibold mb-2 line-clamp-2 group-hover:text-green-500 transition">
                    {course.title}
                  </h3>
                  <p className="text-foreground opacity-70 text-sm mb-4 line-clamp-3 flex-1">
                    {course.description}
                  </p>

                  {/* Teacher Info */}
                  <div className="mb-3 pb-3 border-b border-card-border">
                    <div className="flex items-center gap-2 text-sm">
                      <FaUser className="text-green-500" />
                      <span className="text-foreground opacity-75">{course.teacher}</span>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="mb-4">
                    <div className="flex items-start gap-2 text-sm">
                      <FaClock className="text-green-500 mt-0.5" />
                      <span className="text-foreground opacity-75">{course.schedule}</span>
                    </div>
                  </div>

                  {/* Enrollment Info */}
                  <div className="flex items-center justify-between pt-3 border-t border-card-border">
                    <div className="flex items-center gap-1 text-sm text-foreground opacity-70">
                      <FaBook className="text-green-500" />
                      <span>{course.enrolled} enrolled</span>
                    </div>
                    <button className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded font-semibold transition">
                      Enroll Now
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Category Summary */}
        <div className="mt-16 bg-card-bg border border-card-border rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">Course Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category) => {
              const categoryCount = courses.filter((c) => c.category === category).length;
              return (
                <div
                  key={category}
                  className="border border-card-border rounded-lg p-6 hover:border-green-500 transition text-center"
                >
                  <h3 className="text-lg font-semibold mb-2">{category}</h3>
                  <p className="text-3xl font-bold text-green-500">{categoryCount}</p>
                  <p className="text-foreground opacity-70 text-sm mt-2">courses available</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
