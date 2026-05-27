import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "T.R.E.X | Career & City Intelligence",
  description: "India's premier AI-driven career intelligence platform. Evaluate cities, optimize resumes, and match with careers using frontier-class AI.",
  keywords: ["AI Career", "Resume Optimizer", "City Intelligence", "India Jobs", "Career Guidance"],
  authors: [{ name: "T.R.E.X Team" }],
  openGraph: {
    title: "T.R.E.X | Career & City Intelligence",
    description: "The AI Career Operating System for India.",
    type: "website",
    locale: "en_IN",
    url: "https://trex-ai.dev",
  },
  twitter: {
    card: "summary_large_image",
    title: "T.R.E.X | Career & City Intelligence",
    description: "The AI Career Operating System for India.",
  }
};

import { AuthProvider } from "@/components/AuthContext";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="antialiased min-h-screen bg-white" suppressHydrationWarning>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

