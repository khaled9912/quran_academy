import Link from "next/link";

const AdminStudentsPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 md:px-8 lg:px-16">
        <div className="mb-8">
          <Link
            href="/admin/dashboard"
            className="text-green-500 hover:text-green-600 mb-4 inline-block"
          >
            Back to Admin Dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-2">Students</h1>
          <p className="text-lg text-foreground opacity-75">
            Review student profiles, enrollment status, and progress.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {["Amina Hassan", "Omar Khalid", "Sara Ali", "Youssef Tariq"].map(
            (student) => (
              <div
                key={student}
                className="rounded-3xl border border-card-border bg-card-bg p-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xl font-semibold">{student}</p>
                    <p className="text-foreground opacity-75">
                      Level: Beginner • Status: Active
                    </p>
                  </div>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-green-700 text-sm font-semibold">
                    Enrolled
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminStudentsPage;
