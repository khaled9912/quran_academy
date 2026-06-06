import Link from "next/link";

const InvoicesPage = () => {
  const invoices = [
    {
      id: "INV-001",
      student: "Amina Hassan",
      amount: "450 EGP",
      dueDate: "Jun 20, 2026",
      status: "unpaid",
    },
    {
      id: "INV-002",
      student: "Omar Khalid",
      amount: "380 EGP",
      dueDate: "Jul 2, 2026",
      status: "paid",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Invoices</h1>
          <p className="text-lg text-foreground opacity-75">
            Review billing status, pending payments, and invoice history.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="rounded-3xl border border-card-border bg-card-bg p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-xl font-semibold">{invoice.id}</p>
                  <p className="text-foreground opacity-75">
                    {invoice.student}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">{invoice.amount}</p>
                  <p className="text-foreground opacity-75">
                    Due: {invoice.dueDate}
                  </p>
                </div>
              </div>
              <div
                className={`mt-4 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                  invoice.status === "paid"
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {invoice.status}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/admin/dashboard"
            className="text-green-500 hover:text-green-600"
          >
            Back to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InvoicesPage;
