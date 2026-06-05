import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RecallFlow — AI-Powered Spaced Repetition",
  description: "Master any topic with scientifically-backed spaced repetition and active recall. RecallFlow automatically schedules your revisions for optimal retention.",
  keywords: ["spaced repetition", "active recall", "learning", "study", "revision", "memory"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
