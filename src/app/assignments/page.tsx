import Link from "next/link";

const AssignmentsPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Homework & Assignments</h1>
          <p className="text-lg text-foreground opacity-75">
            Track assignments, submission status, and teacher feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {[
            {
              title: "Surah Al-Baqarah Memorization",
              due: "June 12",
              status: "Pending",
            },
            {
              title: "Arabic Grammar Exercise",
              due: "June 15",
              status: "Submitted",
            },
            {
              title: "Islamic Studies Summary",
              due: "June 18",
              status: "Reviewed",
            },
          ].map((assignment) => (
            <div
              key={assignment.title}
              className="rounded-3xl border border-card-border bg-card-bg p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-xl font-semibold">{assignment.title}</p>
                  <p className="text-foreground opacity-75">
                    Due date: {assignment.due}
                  </p>
                </div>
                <span className="rounded-full px-3 py-1 text-sm font-semibold bg-green-100 text-green-700">
                  {assignment.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/student-dashboard"
            className="text-green-500 hover:text-green-600"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AssignmentsPage;
