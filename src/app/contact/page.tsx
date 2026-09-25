import ContactForm from "@/components/ContactForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Rayan Academy",
  description:
    "Have a question about Quran, Arabic, or Islamic studies classes? Send us a message and our team will get back to you.",
};

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground pt-28 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-green-500 dark:text-green-400 mb-3">
            Contact Us
          </h1>
          <p className="text-lg text-foreground opacity-75">
            Ready to start your Quran journey? Send us a message and we will
            help you every step of the way.
          </p>
        </div>
        <ContactForm />
      </div>
    </div>
  );
};

export default ContactPage;
