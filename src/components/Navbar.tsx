"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User, sendEmailVerification } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { clearNotifCount } from "@/lib/db";
import { Menu, X, ChevronDown, LogOut, User as UserIcon, PlusCircle, Bell, Briefcase, Send, MailWarning } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

interface UserProfile {
  name: string;
  role: "talent" | "recruiter";
  photoURL?: string;
  notifCount?: number;
  isVerified?: boolean;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [emailVerified, setEmailVerified] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Live profile listener (onSnapshot) — updates notifCount in real time
  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setEmailVerified(u?.emailVerified ?? true);

      // Clean up previous listener if user changes
      if (unsubProfile) { unsubProfile(); unsubProfile = null; }

      if (u) {
        // Real-time listener on user doc
        unsubProfile = onSnapshot(doc(db, "users", u.uid), (snap) => {
          if (snap.exists()) {
            setProfile(snap.data() as UserProfile);
          }
        });
      } else {
        setProfile(null);
      }
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  const handleResendVerification = async () => {
    if (!user) return;
    try {
      await sendEmailVerification(user);
      toast.success("Email de vérification envoyé !");
    } catch {
      toast.error("Erreur lors de l'envoi. Réessayez dans quelques minutes.");
    }
  };

  const handleOpenNotifs = async () => {
    setIsNotifOpen(!isNotifOpen);
    setIsUserMenuOpen(false);
    // Mark as read when recruiter opens the panel
    if (user && profile?.role === "recruiter" && (profile?.notifCount ?? 0) > 0) {
      await clearNotifCount(user.uid);
    }
  };

  const initials = profile?.name
    ? profile.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const notifCount = profile?.notifCount ?? 0;

  const navLinks = [
    { href: "/explorer", label: "Explorer" },
    ...(profile?.role === "recruiter" ? [
      { href: "/talents", label: "Talents" },
      { href: "/soumettre", label: "Publier", mobileOnly: true }
    ] : []),
  ];

  return (
    <>
      {/* Email verification banner */}
      {user && !emailVerified && (
        <div className="fixed top-0 w-full z-[60] bg-amber-500/90 backdrop-blur-sm px-4 py-2 flex items-center justify-center gap-3 text-xs text-black font-medium">
          <MailWarning className="w-4 h-4 flex-shrink-0" />
          <span>Votre email n'est pas vérifié. Vérifiez votre boîte mail.</span>
          <button
            onClick={handleResendVerification}
            className="underline font-bold hover:opacity-80 transition-opacity"
          >
            Renvoyer l'email
          </button>
        </div>
      )}

      <nav className={`fixed ${user && !emailVerified ? "top-9" : "top-0"} w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/60 backdrop-blur-[40px] saturate-200 border-b border-white/10 shadow-lg"
          : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* LOGO */}
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#C9A84C] to-[#F5E6A3] flex items-center justify-center text-black font-extrabold text-sm shadow-lg group-hover:scale-110 transition-transform">
              TR
            </div>
            <span className="font-bold text-lg tracking-tight text-white hidden sm:block">TechRadar Togo</span>
          </a>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.filter(l => !l.mobileOnly).map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                  pathname === link.href
                    ? "text-white bg-white/8 font-semibold"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* RIGHT ACTIONS */}
          <div className="hidden md:flex items-center gap-3">
            {user && profile ? (
              <>
                {/* Bouton Publier — recruteurs uniquement */}
                {profile.role === "recruiter" && (
                  <a
                    href="/soumettre"
                    className="flex items-center gap-2 bg-gradient-to-r from-[#C9A84C] to-[#F5E6A3] text-black font-bold px-4 py-2 rounded-xl text-sm hover:opacity-90 transition-opacity"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Publier
                  </a>
                )}

                {/* NOTIFICATION BELL — with live badge */}
                <div className="relative">
                  <button
                    onClick={handleOpenNotifs}
                    className="relative flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 w-10 h-10 rounded-xl transition-all"
                  >
                    <Bell className="w-5 h-5 text-white/80" />
                    {notifCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center px-1 animate-pulse">
                        {notifCount > 9 ? "9+" : notifCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {isNotifOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-80 bg-[#111] border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden z-50"
                      >
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                          <h3 className="font-bold text-sm">Notifications</h3>
                          {profile.role === "recruiter" && (
                            <a href="/candidatures" className="text-xs text-[#C9A84C] font-medium hover:underline" onClick={() => setIsNotifOpen(false)}>
                              Voir les candidatures →
                            </a>
                          )}
                        </div>
                        <div className="flex flex-col max-h-80 overflow-y-auto">
                          {profile.role === "recruiter" ? (
                            notifCount > 0 ? (
                              <div className="p-5 flex flex-col items-center text-center gap-2">
                                <span className="text-3xl font-extrabold text-[#C9A84C]">{notifCount}</span>
                                <p className="text-sm text-white/70">
                                  nouvelle{notifCount > 1 ? "s" : ""} candidature{notifCount > 1 ? "s" : ""} non lue{notifCount > 1 ? "s" : ""}
                                </p>
                                <a
                                  href="/candidatures"
                                  className="mt-2 text-xs bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20 px-4 py-2 rounded-xl hover:bg-[#C9A84C]/20 transition-all"
                                  onClick={() => setIsNotifOpen(false)}
                                >
                                  Gérer les candidatures
                                </a>
                              </div>
                            ) : (
                              <div className="p-6 text-center text-white/40 text-sm">
                                Aucune nouvelle candidature
                              </div>
                            )
                          ) : (
                            <div className="p-6 text-center text-white/40 text-sm">
                              Complétez votre profil pour recevoir des alertes de matching.
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* USER MENU */}
                <div className="relative">
                  <button
                    onClick={() => { setIsUserMenuOpen(!isUserMenuOpen); setIsNotifOpen(false); }}
                    className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 px-3 py-2 rounded-xl transition-all"
                  >
                    {profile.photoURL ? (
                      <img src={profile.photoURL} alt={profile.name} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#C9A84C] to-[#F5E6A3] flex items-center justify-center text-black text-xs font-bold">
                        {initials}
                      </div>
                    )}
                    <span className="text-sm font-medium text-white/80 max-w-[100px] truncate">{profile.name}</span>
                    <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-[#111] border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden"
                      >
                        <a
                          href={`/profil/${user.uid}`}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <UserIcon className="w-4 h-4" /> Mon profil
                        </a>
                        {profile.role === "talent" && (
                          <a
                            href="/mes-candidatures"
                            className="flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Send className="w-4 h-4" /> Mes candidatures
                          </a>
                        )}
                        {profile.role === "recruiter" && (
                          <a
                            href="/candidatures"
                            className="flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Briefcase className="w-4 h-4" /> Candidatures reçues
                          </a>
                        )}
                        <div className="h-px bg-white/10 mx-3" />
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <LogOut className="w-4 h-4" /> Déconnexion
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <a href="/connexion" className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors">
                  Connexion
                </a>
                <a
                  href="/inscription"
                  className="flex items-center gap-2 bg-gradient-to-r from-[#C9A84C] to-[#F5E6A3] text-black font-bold px-4 py-2 rounded-xl text-sm hover:opacity-90 transition-opacity"
                >
                  S'inscrire
                </a>
              </>
            )}
          </div>

          {/* MOBILE BURGER */}
          <button
            className="md:hidden bg-white/5 border border-white/10 p-2 rounded-xl"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-72 bg-[#0a0a0a] border-l border-white/10 z-50 md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <span className="font-bold text-lg">Menu</span>
                <button onClick={() => setIsMobileOpen(false)} className="bg-white/5 p-2 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 p-4 space-y-1">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="flex items-center px-4 py-3 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              <div className="p-4 border-t border-white/10 space-y-3">
                {user && profile ? (
                  <>
                    <a
                      href={`/profil/${user.uid}`}
                      className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      {profile.photoURL ? (
                        <img src={profile.photoURL} alt={profile.name} className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#C9A84C] to-[#F5E6A3] flex items-center justify-center text-black text-xs font-bold">
                          {initials}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold">{profile.name}</p>
                        <p className="text-xs text-white/50 capitalize">{profile.role}</p>
                      </div>
                    </a>
                    {profile.role === "recruiter" && notifCount > 0 && (
                      <a
                        href="/candidatures"
                        className="flex items-center justify-between px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400"
                        onClick={() => setIsMobileOpen(false)}
                      >
                        <span className="flex items-center gap-2"><Bell className="w-4 h-4" /> Nouvelles candidatures</span>
                        <span className="font-bold">{notifCount}</span>
                      </a>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <LogOut className="w-4 h-4" /> Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <a href="/connexion" className="block text-center px-4 py-3 text-sm font-medium text-white/70 hover:text-white border border-white/10 rounded-xl transition-all" onClick={() => setIsMobileOpen(false)}>
                      Connexion
                    </a>
                    <a href="/inscription" className="block text-center px-4 py-3 text-sm font-bold bg-gradient-to-r from-[#C9A84C] to-[#F5E6A3] text-black rounded-xl" onClick={() => setIsMobileOpen(false)}>
                      S'inscrire
                    </a>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
