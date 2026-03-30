import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import PageLoader from "@/components/PageLoader";
import BackendWarmup from "@/components/BackendWarmup";

export const metadata: Metadata = {
  title: "CogniscanAI — Early Cognitive Decline Detection",
  description: "AI-powered multimodal cognitive screening using memory, reaction, speech, and pattern tests.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#02182b] text-white antialiased flex flex-col">
        <AuthProvider>
          <PageLoader />
          <BackendWarmup />
          <Navbar />
          <main className="flex-1 pt-16">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
