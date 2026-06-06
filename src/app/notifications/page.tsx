import Link from "next/link";

const NotificationsPage = () => {
  const notifications = [
    {
      id: "1",
      title: "Attendance Alert",
      message: "Your child missed today&apos;s Quran lesson.",
      date: "Jun 5, 2026",
      status: "unread",
    },
    {
      id: "2",
      title: "Homework Reminder",
      message: "Arabic homework is due tomorrow.",
      date: "Jun 6, 2026",
      status: "read",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 md:px-8 lg:px-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Notifications</h1>
          <p className="text-lg text-foreground opacity-75">
            Stay updated with attendance alerts, homework reminders, and
            payments.
          </p>
        </div>

        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="rounded-3xl border border-card-border bg-card-bg p-6"
            >
              <div className="flex items-center justify-between gap-4 mb-3">
                <div>
                  <p className="text-xl font-semibold">{notification.title}</p>
                  <p className="text-foreground opacity-70">
                    {notification.date}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${
                    notification.status === "unread"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {notification.status}
                </span>
              </div>
              <p className="text-foreground opacity-75">
                {notification.message}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/parent/dashboard"
            className="text-green-500 hover:text-green-600"
          >
            Back to Parent Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
