import type { Metadata } from "next";

import { RegionalNotice } from "@/components/RegionalNotice";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Not available in your country",
  description:
    "Ana Quran Academy teaches English-speaking students worldwide. Student enrolment is closed in some countries; teaching applications stay open.",
  path: "/not-available",
  noIndex: true,
});

export default function NotAvailablePage() {
  return (
    <main className="min-h-screen bg-[#f3efe8] text-[#173b35] dark:bg-background dark:text-foreground">
      <RegionalNotice />
    </main>
  );
}
