"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { addOpportunity, OpportunityData } from "@/lib/db";
import { CategoryType } from "@/components/ui/CategoryBadge";
import { Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SoumettrePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/connexion");
      } else {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.role !== "recruiter") {
              toast.error("Accès refusé : Seuls les recruteurs peuvent publier une offre.");
              router.push("/explorer");
              return;
            }
          }
        } catch (e) {
          console.error(e);
        }
        setCurrentUser(user);
        setLoadingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const [formData, setFormData] = useState({
    title: "",
    organization: "",
    type: "emploi",
    domain: "Web",
    level: "Tous",
    location: "",
    deadline: "",
    externalLink: "",
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Mapping type to typeLabel for simplicity
      const labels: Record<string, string> = {
        "stage": "Stage",
        "emploi": "Emploi",
        "evenement": "Événement",
        "formation": "Formation",
        "programme": "Programme",
        "concours": "Concours"
      };

      const dataToSave: OpportunityData = {
        ...formData,
        type: formData.type as CategoryType,
        typeLabel: labels[formData.type],
        publisherId: currentUser?.uid || "",
      };

      await addOpportunity(dataToSave);
      
      setIsSuccess(true);
      setFormData({
        title: "", organization: "", type: "emploi", domain: "Web",
        level: "Tous", location: "", deadline: "", externalLink: "", description: "",
      });
      
      setTimeout(() => setIsSuccess(false), 5000); // Reset success state after 5s
    } catch (error) {
      toast.error("Une erreur est survenue lors de la publication.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#C9A84C]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center pb-24 px-4 sm:px-6 overflow-hidden min-h-screen">
      
      <section className="w-full max-w-2xl mx-auto mt-12 mb-8 relative z-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Publier une opportunité</h1>
        <p className="text-white/50">Partagez une offre avec la communauté tech du Togo.</p>
      </section>

      <section className="w-full max-w-2xl mx-auto relative z-10">
        <GlassCard className="p-8">
          
          {isSuccess ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#A5D6A7]/20 flex items-center justify-center text-[#A5D6A7] mb-6">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Opportunité publiée !</h2>
              <p className="text-white/50 mb-8">Elle est maintenant visible par toute la communauté.</p>
              <GlassButton variant="primary" onClick={() => setIsSuccess(false)}>
                Publier une autre
              </GlassButton>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider ml-1">Titre de l'offre *</label>
                  <input required name="title" value={formData.title} onChange={handleChange} placeholder="ex: Développeur Frontend" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-[#C9A84C]/50 focus:bg-white/10 transition-all" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider ml-1">Organisation *</label>
                  <input required name="organization" value={formData.organization} onChange={handleChange} placeholder="ex: TechVision" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-[#C9A84C]/50 focus:bg-white/10 transition-all" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider ml-1">Type d'opportunité *</label>
                  <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#C9A84C]/50 transition-all appearance-none">
                    <option value="emploi">Emploi</option>
                    <option value="stage">Stage</option>
                    <option value="evenement">Événement</option>
                    <option value="formation">Formation</option>
                    <option value="programme">Programme d'accompagnement</option>
                    <option value="concours">Concours / Hackathon</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider ml-1">Domaine</label>
                  <input name="domain" value={formData.domain} onChange={handleChange} placeholder="ex: Web, Mobile, Data..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-[#C9A84C]/50 focus:bg-white/10 transition-all" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider ml-1">Localisation *</label>
                  <input required name="location" value={formData.location} onChange={handleChange} placeholder="ex: Lomé, Togo (ou Remote)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-[#C9A84C]/50 focus:bg-white/10 transition-all" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider ml-1">Date limite</label>
                  <input name="deadline" value={formData.deadline} onChange={handleChange} placeholder="ex: 15 Juil 2026" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-[#C9A84C]/50 focus:bg-white/10 transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider ml-1">Lien pour postuler (URL) *</label>
                <input required type="url" name="externalLink" value={formData.externalLink} onChange={handleChange} placeholder="https://..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-[#C9A84C]/50 focus:bg-white/10 transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider ml-1">Description *</label>
                <textarea required name="description" value={formData.description} onChange={handleChange} rows={5} placeholder="Décris l'opportunité : missions, profil recherché, conditions..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-[#C9A84C]/50 focus:bg-white/10 transition-all resize-none" />
              </div>

              <div className="pt-6">
                <GlassButton type="submit" disabled={isSubmitting} variant="primary" className="w-full py-4 text-lg bg-gradient-to-r from-[#C9A84C]/80 to-[#F5E6A3]/80 hover:from-[#C9A84C] hover:to-[#F5E6A3] text-black border-none font-bold">
                  {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Publier l'opportunité"}
                </GlassButton>
              </div>
            </form>
          )}

        </GlassCard>
      </section>

    </div>
  );
}
