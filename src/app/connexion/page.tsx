"use client";

import { useState } from "react";
import { GlassButton } from "@/components/ui/GlassButton";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

// C-1 : Codes d'erreur Firebase → messages utilisateurs clairs
const FIREBASE_ERRORS: Record<string, string> = {
  "auth/user-not-found": "Aucun compte avec cet e-mail.",
  "auth/wrong-password": "Mot de passe incorrect.",
  "auth/invalid-credential": "E-mail ou mot de passe incorrect.",
  "auth/invalid-email": "L'adresse e-mail n'est pas valide.",
  "auth/too-many-requests": "Trop de tentatives. Réessayez dans quelques minutes.",
  "auth/user-disabled": "Ce compte a été désactivé.",
  "auth/network-request-failed": "Problème de connexion réseau. Vérifiez votre internet.",
};

export default function ConnexionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formData, setFormData] = useState({
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
    setIsSubmitting(true);
    setFieldErrors({});
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      window.location.href = "/explorer";
    } catch (error: any) {
      const message = FIREBASE_ERRORS[error.code] ?? "Une erreur inattendue est survenue.";
      // Affectation au bon champ selon le code
      if (error.code === "auth/user-not-found" || error.code === "auth/invalid-email") {
        setFieldErrors({ email: message });
      } else if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        setFieldErrors({ password: message });
      } else {
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // C-2 : Réinitialisation du mot de passe
  const handleForgotPassword = async () => {
    if (!formData.email) {
      setFieldErrors({ email: "Entrez votre e-mail pour recevoir le lien de réinitialisation." });
      return;
    }
    setIsSendingReset(true);
    try {
      await sendPasswordResetEmail(auth, formData.email);
      toast.success("Lien de réinitialisation envoyé sur " + formData.email);
    } catch (error: any) {
      const message = FIREBASE_ERRORS[error.code] ?? "Erreur lors de l'envoi.";
      setFieldErrors({ email: message });
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-black/40 z-0"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 tracking-tight">Bon retour.</h1>
          <p className="text-white/50">Connectez-vous pour accéder au Radar.</p>
        </div>

        <div className="bg-white/5 backdrop-blur-[60px] saturate-200 border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent opacity-50"></div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            
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
              <div className="flex items-center justify-between ml-1">
                <label htmlFor="password" className="text-sm font-semibold text-white/70">Mot de passe</label>
                {/* C-2 : Lien mot de passe oublié */}
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isSendingReset}
                  className="text-xs text-white/40 hover:text-[#C9A84C] transition-colors"
                >
                  {isSendingReset ? "Envoi..." : "Mot de passe oublié ?"}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  id="password"
                  required
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full bg-white/5 border rounded-xl pl-10 pr-12 py-3 text-white placeholder-white/30 outline-none transition-all ${
                    fieldErrors.password
                      ? "border-red-500/60 focus:border-red-500"
                      : "border-white/10 focus:border-[#C9A84C]/50 focus:bg-white/10"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-400 ml-1 mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <div className="pt-4">
              <GlassButton
                type="submit"
                variant="primary"
                className="w-full py-4 text-lg bg-gradient-to-r from-[#C9A84C]/80 to-[#F5E6A3]/80 hover:from-[#C9A84C] hover:to-[#F5E6A3] text-black border-none font-bold"
              >
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Se connecter"}
              </GlassButton>
            </div>
            
            <p className="text-center text-sm text-white/50 mt-4">
              Pas encore de compte ?{" "}
              <a href="/inscription" className="text-[#C9A84C] hover:underline font-medium">S'inscrire</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
