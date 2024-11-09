import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import CoursesSection from "@/components/CoursesSection";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AnaaQuran Academy",
  description:
    "AnaaQuran Academy specializes in teaching the Quran, Arabic, and Islamic studies to non-Arabs. Our experienced teachers make learning accessible and enjoyable for everyone. teaching the quran to children ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.svg" />
      </head>
      <body className={inter.className}>
        <Navbar />
        {children}
        <HeroSection />
        <AboutSection />
        <CoursesSection />
        <Footer />
      </body>
    </html>
  );
}
