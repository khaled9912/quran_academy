import Link from "next/link";

const SessionsPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Sessions</h1>
          <p className="text-lg text-foreground opacity-75">
            Browse upcoming sessions, join live lessons, and review your class
            schedule.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {[
            {
              title: "Quran Tajweed Essentials",
              time: "Monday 6:00 PM",
              teacher: "Sheikh Ahmed Al-Mansouri",
            },
            {
              title: "Arabic Language Basics",
              time: "Tuesday 4:00 PM",
              teacher: "Sister Fatima Al-Rashid",
            },
            {
              title: "Islamic Studies Fundamentals",
              time: "Saturday 5:00 PM",
              teacher: "Sheikh Mohammad Al-Aziz",
            },
          ].map((session) => (
            <div
              key={session.title}
              className="rounded-3xl border border-card-border bg-card-bg p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-xl font-semibold">{session.title}</p>
                  <p className="text-foreground opacity-75">{session.time}</p>
                </div>
                <p className="text-green-600 font-semibold">
                  Instructor: {session.teacher}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/schedule"
            className="text-green-500 hover:text-green-600"
          >
            View full schedule
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SessionsPage;
