"use client";

import { useState } from "react";
import { GlassButton } from "@/components/ui/GlassButton";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Loader2, Mail, Lock } from "lucide-react";

export default function ConnexionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      window.location.href = "/explorer";
    } catch (error: any) {
      alert("Identifiants incorrects ou erreur de connexion.");
    } finally {
      setIsSubmitting(false);
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

        {/* Form Container with Extreme Blur */}
        <div className="bg-white/5 backdrop-blur-[60px] saturate-200 border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent opacity-50"></div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider ml-1">Adresse E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="credo@techradar.tg" className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 outline-none focus:border-[#C9A84C]/50 focus:bg-white/10 transition-all" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider ml-1">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input required type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 outline-none focus:border-[#C9A84C]/50 focus:bg-white/10 transition-all" />
              </div>
            </div>

            <div className="pt-4">
              <GlassButton variant="primary" className="w-full py-4 text-lg bg-gradient-to-r from-[#C9A84C]/80 to-[#F5E6A3]/80 hover:from-[#C9A84C] hover:to-[#F5E6A3] text-black border-none font-bold" onClick={() => {}}>
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Se connecter"}
              </GlassButton>
            </div>
            
            <p className="text-center text-sm text-white/50 mt-4">
              Pas encore de compte ? <a href="/inscription" className="text-[#C9A84C] hover:underline font-medium">S'inscrire</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
