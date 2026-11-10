import ContactForm from "@/components/ContactForm";
import { SiteFooter } from "@/components/SiteFooter";
import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact Us",
  description:
    "Have a question about online Quran, Tajweed, Arabic, or Islamic studies classes? Contact Ana Quran Academy from anywhere in the world and our team will reply.",
  path: "/contact",
  keywords: [
    "contact online Quran academy",
    "online Quran classes enquiry",
    "English Quran teachers",
  ],
});

const ContactPage = () => {
  return (
    <>
      <div className="min-h-screen bg-background text-foreground pt-28 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-green-500 dark:text-green-400 mb-3">
              Contact Us
            </h1>
            <p className="text-lg text-foreground opacity-75">
              Ready to start your Quran journey? Send us a message from anywhere
              in the world and we will help you every step of the way. Lessons
              are scheduled in your local time zone.
            </p>
          </div>
          <ContactForm />

          <div className="mt-10 rounded-3xl border border-card-border bg-card-bg p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">
              Are you a Quran, Tajweed, Islamic studies, or Arabic teacher?
            </h2>
            <p className="mb-4 text-foreground opacity-75">
              We are always happy to hear from experienced teachers. Send us
              your details and CV and our team will review your application.
            </p>
            <Link
              href="/teach"
              className="inline-flex items-center justify-center rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              Apply to teach with us
            </Link>
          </div>
        </div>
      </div>
      <SiteFooter />
    </>
  );
};

export default ContactPage;
