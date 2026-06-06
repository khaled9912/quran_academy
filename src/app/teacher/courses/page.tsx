import Link from "next/link";

const TeacherCoursesPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 md:px-8 lg:px-16">
        <div className="mb-8">
          <Link
            href="/teacher/dashboard"
            className="text-green-500 hover:text-green-600 mb-4 inline-block"
          >
            Back to Teacher Dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-2">My Courses</h1>
          <p className="text-lg text-foreground opacity-75">
            View your assigned courses, student lists, and upcoming lessons.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {[
            "Quran Tajweed Essentials",
            "Arabic Language Basics",
            "Islamic Studies Fundamentals",
          ].map((course) => (
            <div
              key={course}
              className="rounded-3xl border border-card-border bg-card-bg p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xl font-semibold">{course}</p>
                  <p className="text-foreground opacity-75">
                    Students: 24 • Sessions: 12
                  </p>
                </div>
                <button className="rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 transition">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherCoursesPage;
