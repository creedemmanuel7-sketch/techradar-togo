"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Loader2, User, Mail, Lock, Briefcase } from "lucide-react";
import { toast } from "sonner";

// C-1 : Codes d'erreur Firebase → messages utilisateurs clairs
const FIREBASE_ERRORS: Record<string, string> = {
  "auth/email-already-in-use": "Cette adresse e-mail est déjà utilisée.",
  "auth/invalid-email": "L'adresse e-mail n'est pas valide.",
  "auth/weak-password": "Le mot de passe doit contenir au moins 6 caractères.",
  "auth/network-request-failed": "Problème de connexion réseau. Vérifiez votre internet.",
};

export default function InscriptionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState<"talent" | "recruiter">("talent");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; name?: string }>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear field error on change
    if (fieldErrors[e.target.name as keyof typeof fieldErrors]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (formData.name.trim().length < 2) {
      setFieldErrors({ name: "Le nom doit contenir au moins 2 caractères." });
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // 2. Save user profile in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name: formData.name,
        email: formData.email,
        role: role,
        createdAt: Date.now()
      });

      // Redirect
      window.location.href = "/explorer";
    } catch (error: any) {
      const message = FIREBASE_ERRORS[error.code] ?? "Une erreur inattendue est survenue.";
      
      // Affectation au bon champ
      if (error.code === "auth/email-already-in-use" || error.code === "auth/invalid-email") {
        setFieldErrors({ email: message });
      } else if (error.code === "auth/weak-password") {
        setFieldErrors({ password: message });
      } else {
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-black/40 z-0"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 tracking-tight">Rejoindre le Radar</h1>
          <p className="text-white/50">Trouvez votre prochain défi ou votre futur talent.</p>
        </div>

        <div className="bg-white/5 backdrop-blur-[60px] saturate-200 border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50"></div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="flex bg-[#111] p-1 rounded-xl mb-2">
              <button
                type="button"
                onClick={() => setRole("talent")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${role === "talent" ? "bg-white/10 text-white shadow" : "text-white/50 hover:text-white"}`}
              >
                <User className="w-4 h-4" /> Talent
              </button>
              <button
                type="button"
                onClick={() => setRole("recruiter")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${role === "recruiter" ? "bg-[#C9A84C]/20 text-[#C9A84C] shadow" : "text-white/50 hover:text-white"}`}
              >
                <Briefcase className="w-4 h-4" /> Recruteur
              </button>
            </div>
            <p className="text-xs text-white/40 text-center mb-6 min-h-[16px]">
              {role === "talent" ? "Je cherche des opportunités dans la tech" : "Je publie des offres pour ma structure"}
            </p>

            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-semibold text-white/70 ml-1 block">Nom complet</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  id="name"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="ex: Credo"
                  className={`w-full bg-white/5 border rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 outline-none transition-all ${
                    fieldErrors.name
                      ? "border-red-500/60 focus:border-red-500"
                      : "border-white/10 focus:border-[#C9A84C]/50 focus:bg-white/10"
                  }`}
                />
              </div>
              {fieldErrors.name && (
                <p className="text-xs text-red-400 ml-1 mt-1">{fieldErrors.name}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-semibold text-white/70 ml-1 block">Adresse E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  id="email"
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="credo@techradar.tg"
                  className={`w-full bg-white/5 border rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 outline-none transition-all ${
                    fieldErrors.email
                      ? "border-red-500/60 focus:border-red-500"
                      : "border-white/10 focus:border-[#C9A84C]/50 focus:bg-white/10"
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-red-400 ml-1 mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-semibold text-white/70 ml-1 block">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  id="password"
                  required
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full bg-white/5 border rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 outline-none transition-all ${
                    fieldErrors.password
                      ? "border-red-500/60 focus:border-red-500"
                      : "border-white/10 focus:border-[#C9A84C]/50 focus:bg-white/10"
                  }`}
                />
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-400 ml-1 mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <div className="pt-4">
              <GlassButton
                variant="primary"
                className="w-full py-4 text-lg bg-gradient-to-r from-[#C9A84C]/80 to-[#F5E6A3]/80 hover:from-[#C9A84C] hover:to-[#F5E6A3] text-black border-none font-bold"
                onClick={() => {}}
              >
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Créer mon compte"}
              </GlassButton>
            </div>
            
            <p className="text-center text-sm text-white/50 mt-4">
              Déjà un compte ? <a href="/connexion" className="text-[#C9A84C] hover:underline font-medium">Se connecter</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
