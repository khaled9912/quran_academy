import Link from "next/link";

const ParentDashboardPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Parent Dashboard</h1>
          <p className="text-lg text-foreground opacity-75">
            Monitor your child&apos;s attendance, progress, and payment status.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { title: "Children", value: "2" },
            { title: "Attendance Rate", value: "92%" },
            { title: "Pending Payments", value: "1" },
            { title: "Reports Available", value: "3" },
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
            href="/assignments"
            className="rounded-3xl border border-card-border bg-card-bg p-6 hover:border-green-500 transition"
          >
            <h2 className="text-xl font-semibold mb-2">Homework</h2>
            <p className="text-foreground opacity-75">
              Review submitted homework and feedback for your child.
            </p>
          </Link>

          <Link
            href="/notifications"
            className="rounded-3xl border border-card-border bg-card-bg p-6 hover:border-green-500 transition"
          >
            <h2 className="text-xl font-semibold mb-2">Notifications</h2>
            <p className="text-foreground opacity-75">
              Receive attendance alerts, reminders, and school updates.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboardPage;
