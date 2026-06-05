"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaClock,
  FaUser,
  FaBook,
  FaArrowLeft,
  FaCheckCircle,
} from "react-icons/fa";

interface CourseDetailData {
  id: number;
  title: string;
  description: string;
  fullDescription: string;
  teacher: string;
  schedule: string;
  thumbnail: string;
  category: string;
  level: string;
  enrolled: number;
  price?: string;
  duration?: string;
  learningPoints: string[];
}

const getCourseData = (id: string): CourseDetailData => {
  const coursesData: { [key: string]: CourseDetailData } = {
    "1": {
      id: 1,
      title: "Quran Tajweed Essentials",
      description:
        "Learn the fundamentals of Tajweed rules to recite the Quran correctly.",
      fullDescription:
        "This comprehensive course covers all the essential Tajweed rules needed to recite the Quran with proper articulation and pronunciation. You will learn from experienced teachers who will guide you through each letter's pronunciation point, nasalization rules, and elongation techniques.",
      teacher: "Sheikh Ahmed Al-Mansouri",
      schedule: "Monday & Wednesday - 6:00 PM - 7:30 PM",
      thumbnail:
        "https://images.pexels.com/photos/16066399/pexels-photo-16066399/free-photo-of-man-reading-koran.jpeg",
      category: "Quran",
      level: "Beginner",
      enrolled: 234,
      price: "Free",
      duration: "8 weeks",
      learningPoints: [
        "Understanding Tajweed rules and their importance",
        "Correct pronunciation of Arabic letters",
        "Articulation points for each letter",
        "Nasalization and elongation techniques",
        "Common mistakes and how to avoid them",
        "Practical recitation practice",
      ],
    },
    "2": {
      id: 2,
      title: "Arabic Language Basics",
      description: "Start your journey in learning Modern Standard Arabic.",
      fullDescription:
        "This beginner-friendly course introduces you to the Arabic language from scratch. Learn the alphabet, basic vocabulary, fundamental grammar, and simple conversational phrases. Our expert instructors make learning fun and engaging.",
      teacher: "Sister Fatima Al-Rashid",
      schedule: "Tuesday & Thursday - 4:00 PM - 5:30 PM",
      thumbnail:
        "https://images.pexels.com/photos/8522576/pexels-photo-8522576.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      category: "Arabic",
      level: "Beginner",
      enrolled: 189,
      price: "Free",
      duration: "10 weeks",
      learningPoints: [
        "Arabic alphabet and writing system",
        "Basic vocabulary and essential phrases",
        "Sentence structure and grammar basics",
        "Simple conversational skills",
        "Reading and writing practice",
        "Cultural context of Arabic language",
      ],
    },
    "3": {
      id: 3,
      title: "Islamic Studies Fundamentals",
      description:
        "Explore the core principles of Islam including the Five Pillars.",
      fullDescription:
        "A comprehensive introduction to Islamic studies covering the foundational principles of Islam. This course explores the Five Pillars, basic Islamic jurisprudence, and Islamic history, providing students with a solid understanding of Islamic teachings.",
      teacher: "Sheikh Mohammad Al-Aziz",
      schedule: "Saturday & Sunday - 5:00 PM - 6:30 PM",
      thumbnail:
        "https://images.pexels.com/photos/2608353/pexels-photo-2608353.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      category: "Islamic Studies",
      level: "Beginner",
      enrolled: 312,
      price: "Free",
      duration: "12 weeks",
      learningPoints: [
        "The pillars of Islam and their significance",
        "Core Islamic beliefs and principles",
        "Islamic jurisprudence basics",
        "The Quran and Sunnah",
        "Islamic ethics and morality",
        "Introduction to Islamic history",
      ],
    },
    "4": {
      id: 4,
      title: "Quranic Arabic for Beginners",
      description: "Understand the Arabic used in the Quran.",
      fullDescription:
        "This course teaches the classical Arabic found in the Quran. Learn vocabulary specific to Quranic texts, grammatical structures unique to Quranic language, and translation techniques to better understand the meaning of the Quran.",
      teacher: "Dr. Layla Hassan",
      schedule: "Monday & Friday - 7:00 PM - 8:30 PM",
      thumbnail:
        "https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg",
      category: "Arabic",
      level: "Intermediate",
      enrolled: 156,
      price: "Free",
      duration: "10 weeks",
      learningPoints: [
        "Quranic vocabulary and word roots",
        "Classical Arabic grammar",
        "Quranic literary devices",
        "Translation methods and techniques",
        "Understanding Quranic context",
        "Practical exercises with Quranic verses",
      ],
    },
    "5": {
      id: 5,
      title: "Advanced Tajweed Techniques",
      description:
        "Master advanced Tajweed rules including rare characteristics.",
      fullDescription:
        "For advanced learners who have mastered the basics. This course covers complex Tajweed rules, rare recitation characteristics, and advanced recitation techniques taught by expert Quran reciters.",
      teacher: "Sheikh Ahmed Al-Mansouri",
      schedule: "Wednesday - 8:00 PM - 9:30 PM",
      thumbnail:
        "https://images.pexels.com/photos/16066399/pexels-photo-16066399/free-photo-of-man-reading-koran.jpeg",
      category: "Quran",
      level: "Advanced",
      enrolled: 87,
      price: "Free",
      duration: "8 weeks",
      learningPoints: [
        "Advanced Tajweed rules",
        "Rare letter characteristics",
        "Complex articulation techniques",
        "Different Quranic recitation styles",
        "Memorization techniques",
        "Professional recitation standards",
      ],
    },
    "6": {
      id: 6,
      title: "Islamic History & Civilization",
      description:
        "Journey through Islamic history from the Prophet Muhammad to modern times.",
      fullDescription:
        "Explore the rich history of Islamic civilization spanning over 1400 years. From the life of Prophet Muhammad to the development of Islamic sciences and arts, this course provides a comprehensive overview of Islamic historical achievements.",
      teacher: "Professor Ibrahim Ali",
      schedule: "Tuesday & Saturday - 3:00 PM - 4:30 PM",
      thumbnail:
        "https://images.pexels.com/photos/2608353/pexels-photo-2608353.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      category: "Islamic Studies",
      level: "Intermediate",
      enrolled: 203,
      price: "Free",
      duration: "12 weeks",
      learningPoints: [
        "Life of Prophet Muhammad and the Companions",
        "Islamic empires and dynasties",
        "Development of Islamic sciences",
        "Islamic art and architecture",
        "Cultural contributions to world civilization",
        "Contemporary Islamic issues",
      ],
    },
  };

  return coursesData[id] || coursesData["1"];
};

const CourseDetailPage = ({ params }: { params: { id: string } }) => {
  const course = getCourseData(params.id);

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 md:px-8 lg:px-16">
        {/* Back Button */}
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-green-500 hover:text-green-600 mb-8"
        >
          <FaArrowLeft />
          <span>Back to Courses</span>
        </Link>

        {/* Course Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Main Content */}
          <div className="md:col-span-2">
            <div className="flex gap-3 mb-4">
              <span className="px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-full">
                {course.category}
              </span>
              <span className="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">
                {course.level}
              </span>
            </div>

            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-lg text-foreground opacity-80 mb-6">
              {course.description}
            </p>

            {/* Instructor Info */}
            <div className="bg-card-bg border border-card-border rounded-lg p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <FaUser className="text-green-500 text-xl" />
                <div>
                  <p className="text-sm text-foreground opacity-70">
                    Instructor
                  </p>
                  <p className="text-lg font-semibold">{course.teacher}</p>
                </div>
              </div>
            </div>

            {/* Course Thumbnail */}
            <div className="relative h-64 bg-gradient-to-br from-green-400 to-green-600 rounded-lg overflow-hidden mb-8">
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Full Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">About This Course</h2>
              <p className="text-foreground opacity-80 leading-relaxed">
                {course.fullDescription}
              </p>
            </div>

            {/* What You&apos;ll Learn */}
            <div className="bg-card-bg border border-card-border rounded-lg p-8">
              <h2 className="text-2xl font-semibold mb-6">
                What You&apos;ll Learn
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.learningPoints.map((point, index) => (
                  <div key={index} className="flex gap-3">
                    <FaCheckCircle className="text-green-500 flex-shrink-0 mt-1" />
                    <span className="text-foreground opacity-90">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            {/* Course Info Card */}
            <div className="bg-card-bg border border-card-border rounded-lg p-6 sticky top-24 space-y-4">
              <div>
                <p className="text-sm text-foreground opacity-70 mb-1">Price</p>
                <p className="text-2xl font-bold text-green-500">
                  {course.price}
                </p>
              </div>

              <div className="border-t border-card-border pt-4">
                <div className="flex items-center gap-2 mb-3 text-foreground opacity-80">
                  <FaClock className="text-green-500" />
                  <span className="text-sm">{course.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground opacity-80">
                  <FaBook className="text-green-500" />
                  <span className="text-sm">
                    {course.enrolled} students enrolled
                  </span>
                </div>
              </div>

              {/* Schedule */}
              <div className="border-t border-card-border pt-4">
                <p className="text-sm text-foreground opacity-70 mb-2">
                  Schedule
                </p>
                <p className="text-foreground opacity-90 font-semibold">
                  {course.schedule}
                </p>
              </div>

              <button className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg font-semibold transition">
                Enroll Now
              </button>

              <button className="w-full px-6 py-2 border border-green-500 text-green-500 hover:bg-green-500 hover:text-white rounded-lg font-semibold transition">
                Add to Wishlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
