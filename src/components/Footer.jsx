"use client";
import { FaFacebook, FaYoutube, FaHandPeace } from "react-icons/fa";
import ContactForm from "@/components/ContactForm";

const Footer = () => {
  return (
    <section
      className="w-full p-10 bg-card-bg text-center md:text-left"
      id="contacts"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left Column - Message */}
        <div className="flex flex-col justify-center items-center md:items-start p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <FaHandPeace className="text-3xl text-yellow-500" />
            <h2 className="text-4xl font-semibold text-green-500 dark:text-green-400">
              Reach Out
            </h2>
          </div>
          <p className="text-xl text-foreground">
            Ready to start your Quran journey today? We are here to help you
            every step of the way.
          </p>
          <div className="flex space-x-4 mt-6">
            <a
              href="https://www.facebook.com/people/Quran/61568090070901/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FaFacebook className="text-3xl text-blue-600 hover:text-blue-800 dark:hover:text-blue-400" />
            </a>
            <a
              href="https://youtube.com/YourAcademy"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <FaYoutube className="text-3xl text-red-600 hover:text-red-800 dark:hover:text-red-400" />
            </a>
          </div>
        </div>

        {/* Right Column - Contact Form */}
        <ContactForm />
      </div>
      <p className="mt-10 text-foreground opacity-70">
        &copy; {new Date().getFullYear()} Rayan Academy. All rights reserved.
      </p>
    </section>
  );
};

export default Footer;
