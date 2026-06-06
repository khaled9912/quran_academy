import Link from "next/link";

const AdminReportsPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-16">
        <div className="mb-8">
          <Link
            href="/admin/dashboard"
            className="text-green-500 hover:text-green-600 mb-4 inline-block"
          >
            Back to Admin Dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-2">Admin Reports</h1>
          <p className="text-lg text-foreground opacity-75">
            See attendance rates, revenue trends, and student progress
            summaries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-card-border bg-card-bg p-6">
            <h2 className="text-xl font-semibold mb-3">Attendance Summary</h2>
            <p className="text-foreground opacity-75">
              Track overall attendance for active sessions across all courses.
            </p>
          </div>

          <div className="rounded-3xl border border-card-border bg-card-bg p-6">
            <h2 className="text-xl font-semibold mb-3">Revenue Overview</h2>
            <p className="text-foreground opacity-75">
              Monitor invoices, payments due, and monthly revenue metrics.
            </p>
          </div>

          <div className="rounded-3xl border border-card-border bg-card-bg p-6">
            <h2 className="text-xl font-semibold mb-3">Course Performance</h2>
            <p className="text-foreground opacity-75">
              Compare active course enrollment and completion trends.
            </p>
          </div>

          <div className="rounded-3xl border border-card-border bg-card-bg p-6">
            <h2 className="text-xl font-semibold mb-3">Student Progress</h2>
            <p className="text-foreground opacity-75">
              Review student evaluations, homeworks, and attendance rate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
