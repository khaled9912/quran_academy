import Link from "next/link";

const TeacherDashboardPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Teacher Dashboard</h1>
          <p className="text-lg text-foreground opacity-75">
            View your classes, upcoming sessions, attendance, and assignments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { title: "Today's Classes", value: "3" },
            { title: "Pending Attendance", value: "12" },
            { title: "Assignments to Review", value: "8" },
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
            href="/teacher/schedule"
            className="rounded-3xl border border-card-border bg-card-bg p-6 hover:border-green-500 transition"
          >
            <h2 className="text-xl font-semibold mb-2">Manage Sessions</h2>
            <p className="text-foreground opacity-75">
              Create and update your teaching schedule with session controls.
            </p>
          </Link>

          <Link
            href="/teacher/attendance"
            className="rounded-3xl border border-card-border bg-card-bg p-6 hover:border-green-500 transition"
          >
            <h2 className="text-xl font-semibold mb-2">Mark Attendance</h2>
            <p className="text-foreground opacity-75">
              Track student attendance for your active sessions.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboardPage;
