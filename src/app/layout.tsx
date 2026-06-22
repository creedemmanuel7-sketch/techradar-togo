import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TechRadar Togo",
  description: "Toutes les opportunités tech du Togo. Au même endroit.",
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
        {/* Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="bg-orb orb-magenta"></div>
          <div className="bg-orb orb-cyan"></div>
          <div className="bg-orb orb-blue"></div>
          <div className="bg-grain"></div>
        </div>

        {/* Navbar */}
        <nav className="fixed top-0 w-full z-50 glass px-6 py-4 border-b border-white/10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#C9A84C] to-[#F5E6A3] flex items-center justify-center text-black font-bold text-lg">
                TR
              </div>
              <span className="font-bold text-xl tracking-tight text-white">TechRadar Togo</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
              <a href="/explorer" className="hover:text-white transition-colors">Explorer</a>
              <a href="/soumettre" className="hover:text-white transition-colors">Soumettre</a>
              <a href="/connexion" className="hover:text-white transition-colors">Connexion</a>
              <a href="/soumettre" className="glass px-5 py-2 rounded-full text-white font-medium hover:bg-white/10 transition-all border border-white/20">
                Publier une opportunité
              </a>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 pt-24">
          {children}
        </main>
      </body>
    </html>
  );
}
