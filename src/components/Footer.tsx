"use client";

import { MapPin, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const SocialIcon = ({ name }: { name: string }) => {
  switch (name) {
    case "LinkedIn":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      );
    case "Twitter/X":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
        </svg>
      );
    case "GitHub":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
        </svg>
      );
    default:
      return null;
  }
};

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const isExplorer = mounted && pathname === "/explorer";

  return (
    <footer className={`relative mt-24 border-t border-white/10 bg-[#050505]/40 backdrop-blur-[40px] transition-all duration-300 z-10 ${isExplorer ? "lg:pl-64 xl:pl-72" : ""}`}>
      
      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-8">
        
        {/* MAIN GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          
          {/* BRAND */}
          <div className="lg:col-span-2">
            <a href="/" className="flex items-center gap-2.5 mb-5 group w-fit">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#C9A84C] to-[#F5E6A3] flex items-center justify-center text-black font-extrabold text-base shadow-lg group-hover:scale-105 transition-transform">
                TR
              </div>
              <span className="font-bold text-xl tracking-tight text-white">TechRadar Togo</span>
            </a>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs mb-6">
              Le hub central de l'écosystème tech togolais. Centralisons les opportunités, connectons les talents.
            </p>
            <div className="flex items-center gap-2 text-xs text-white/30 mb-6">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Lomé, Togo — 🌍 Afrique de l'Ouest</span>
            </div>
            {/* SOCIALS */}
            <div className="flex items-center gap-3">
              {[
                { name: "LinkedIn", href: "https://linkedin.com/company/techradar-togo" },
                { name: "Twitter/X", href: "https://twitter.com/techradar_togo" },
                { name: "GitHub", href: "https://github.com/creedemmanuel7-sketch/techradar-togo" },
              ].map(({ name, href }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={name}
                  className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  <SocialIcon name={name} />
                </a>
              ))}
            </div>
          </div>

          {/* NAVIGATION */}
          <div>
            <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-5">Plateforme</h4>
            <ul className="space-y-3">
              {[
                { href: "/explorer", label: "Explorer les opportunités" },
                { href: "/soumettre", label: "Publier une opportunité" },
                { href: "/inscription", label: "Créer un compte" },
                { href: "/connexion", label: "Se connecter" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-white/50 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* CATEGORIES */}
          <div>
            <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-5">Catégories</h4>
            <ul className="space-y-3">
              {[
                { href: "/explorer?type=stage", label: "Stages" },
                { href: "/explorer?type=emploi", label: "Emplois" },
                { href: "/explorer?type=evenement", label: "Événements" },
                { href: "/explorer?type=formation", label: "Formations" },
                { href: "/explorer?type=concours", label: "Concours & Hackathons" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-white/50 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30 text-center sm:text-left flex items-center gap-2">
            <span>© {currentYear} TechRadar Togo.</span>
            <span>
              Créé par <a href="https://creedemmanuel7-sketch.github.io/mon-portfolio" target="_blank" rel="noreferrer" className="text-[#C9A84C] hover:underline font-medium">Emmanuel</a>
            </span>
          </p>
          <div className="flex items-center gap-1 text-xs text-white/20">
            <Zap className="w-3 h-3 text-[#C9A84C]" />
            <span>Construit en 72h — <span className="text-[#C9A84C] font-medium">#BuildForTheCommunity</span></span>
          </div>
        </div>

        {/* Social & Legal Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-8">
          <div className="flex items-center gap-6">
            <a href="#" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all group">
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all group">
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="https://github.com/creedemmanuel7-sketch/techradar-togo" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all group">
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
          
          <div className="flex items-center gap-6 text-sm font-medium text-white/40">
            <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-white transition-colors">Conditions</a>
            <Link href="/a-propos" className="hover:text-white transition-colors">À propos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
