import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Providers } from "@/components/providers";
import { LessonCallProvider } from "@/providers/lesson-call-provider";

const inter = Inter({ subsets: ["latin"] });

const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="dark"&&t!=="light"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}var r=document.documentElement;r.dataset.theme=t;r.style.colorScheme=t;}catch(e){}})();`;

export const metadata: Metadata = {
  title: "Ana Quran | Personal Online Quran & Arabic Learning",
  description:
    "Learn Quran, Arabic, and Islamic studies through personal online lessons with dedicated teachers and flexible scheduling at Ana Quran.",
  icons: {
    icon: "/logo-ana-quran-mark.svg?v=1",
    shortcut: "/logo-ana-quran-mark.svg?v=1",
    apple: "/logo-ana-quran-mark.svg?v=1",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <LessonCallProvider>{children}</LessonCallProvider>
        </Providers>
      </body>
    </html>
  );
}
