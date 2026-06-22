"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Loader2, User, Mail, Lock, Briefcase } from "lucide-react";

export default function InscriptionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState<"talent" | "recruiter">("talent");
  const [formData, setFormData] = useState({
    name: "",
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
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // 2. Save user profile in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name: formData.name,
        email: formData.email,
        role: role,
        createdAt: Date.now()
      });

      // Redirect or show success
      window.location.href = "/explorer";
    } catch (error: any) {
      alert("Erreur lors de l'inscription : " + error.message);
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

        {/* Form Container with Extreme Blur */}
        <div className="bg-white/5 backdrop-blur-[60px] saturate-200 border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          {/* Subtle top edge highlight */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50"></div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Role Selection */}
            <div className="flex bg-[#111] p-1 rounded-xl mb-6">
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
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${role === "recruiter" ? "bg-white/10 text-[#C9A84C] shadow" : "text-white/50 hover:text-white"}`}
              >
                <Briefcase className="w-4 h-4" /> Recruteur
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider ml-1">Nom complet</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input required name="name" value={formData.name} onChange={handleChange} placeholder="ex: Credo" className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 outline-none focus:border-[#C9A84C]/50 focus:bg-white/10 transition-all" />
              </div>
            </div>

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
              <GlassButton variant="primary" className="w-full py-4 text-lg bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 border-white/20 font-bold" onClick={() => {}}>
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Créer mon compte"}
              </GlassButton>
            </div>
            
            <p className="text-center text-sm text-white/50 mt-4">
              Déjà un compte ? <a href="/connexion" className="text-white hover:underline">Se connecter</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
