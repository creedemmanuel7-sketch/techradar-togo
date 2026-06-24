import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#C9A84C",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "TechRadar Togo — Le hub central de la tech togolaise",
  description: "Toutes les opportunités tech du Togo. Stages, emplois, événements, formations, programmes et concours. Au même endroit.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TechRadar Togo",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/icons/icon-192x192.png",
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

        <AuthProvider>
          {/* Navbar */}
          <Navbar />

          {/* Main Content */}
          <main className="flex-1 pt-16">
            {children}
          </main>

          {/* Footer */}
          <Footer />
        </AuthProvider>
        <Toaster theme="dark" position="bottom-right" richColors />
        {/* PWA Service Worker */}
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
