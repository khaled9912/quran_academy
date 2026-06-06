import Link from "next/link";

const AdminDashboardPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-lg text-foreground opacity-75">
            Manage teachers, students, parents, courses, reports, and more.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          {[
            { title: "Total Students", value: "312" },
            { title: "Total Teachers", value: "42" },
            { title: "Active Courses", value: "18" },
            { title: "Pending Invoices", value: "14" },
          ].map((metric) => (
            <div
              key={metric.title}
              className="rounded-3xl border border-card-border bg-card-bg p-6"
            >
              <p className="text-sm uppercase text-foreground opacity-70 mb-2">
                {metric.title}
              </p>
              <p className="text-3xl font-semibold text-green-600">
                {metric.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/admin/students"
            className="rounded-3xl border border-card-border bg-card-bg p-6 hover:border-green-500 transition"
          >
            <h2 className="text-xl font-semibold mb-2">Manage Students</h2>
            <p className="text-foreground opacity-75">
              Create, edit, and review student profiles and enrollments.
            </p>
          </Link>

          <Link
            href="/admin/teachers"
            className="rounded-3xl border border-card-border bg-card-bg p-6 hover:border-green-500 transition"
          >
            <h2 className="text-xl font-semibold mb-2">Manage Teachers</h2>
            <p className="text-foreground opacity-75">
              Add teachers, view their schedules, and assign courses.
            </p>
          </Link>

          <Link
            href="/admin/courses"
            className="rounded-3xl border border-card-border bg-card-bg p-6 hover:border-green-500 transition"
          >
            <h2 className="text-xl font-semibold mb-2">Manage Courses</h2>
            <p className="text-foreground opacity-75">
              Create course listings, set capacity, and publish schedules.
            </p>
          </Link>

          <Link
            href="/admin/reports"
            className="rounded-3xl border border-card-border bg-card-bg p-6 hover:border-green-500 transition"
          >
            <h2 className="text-xl font-semibold mb-2">Reports</h2>
            <p className="text-foreground opacity-75">
              View attendance, homework, and revenue summaries.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
