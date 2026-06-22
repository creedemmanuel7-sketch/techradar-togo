import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TechRadar Togo — Le hub central de la tech togolaise",
  description: "Toutes les opportunités tech du Togo. Stages, emplois, événements, formations, programmes et concours. Au même endroit.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative text-white bg-black">
        {/* Background Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="bg-orb orb-magenta"></div>
          <div className="bg-orb orb-cyan"></div>
          <div className="bg-orb orb-blue"></div>
          <div className="bg-grain"></div>
        </div>

        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-1 pt-16">
          {children}
        </main>

        {/* Footer */}
        <Footer />
        <Toaster theme="dark" position="bottom-right" richColors />
      </body>
    </html>
  );
}
