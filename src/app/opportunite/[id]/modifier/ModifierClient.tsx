"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { updateOpportunity, Opportunity } from "@/lib/db";
import { CategoryType } from "@/components/ui/CategoryBadge";
import { TYPE_LABEL } from "@/lib/constants";
import { Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GlassButton } from "@/components/ui/GlassButton";
import { OpportunityForm, OpportunityFormData } from "@/components/ui/OpportunityForm";

interface ModifierClientProps {
  opp: Opportunity;
}

export function ModifierClient({ opp }: ModifierClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [formData, setFormData] = useState<OpportunityFormData>({
    title: opp.title,
    organization: opp.organization,
    type: opp.type,
    domain: opp.domain,
    level: opp.level,
    location: opp.location,
    deadline: opp.deadline || "",
    externalLink: opp.externalLink || "",
    description: opp.description || "",
  });

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/connexion");
        return;
      }
      if (user.uid !== opp.publisherId) {
        toast.error("Accès refusé : vous n'êtes pas l'auteur de cette offre.");
        router.push(`/opportunite/${opp.id}`);
        return;
      }
      setIsAuthorized(true);
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, [opp.id, opp.publisherId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateOpportunity(opp.id, {
        ...formData,
        type: formData.type as CategoryType,
        typeLabel: TYPE_LABEL[formData.type as CategoryType],
      });
      setIsSuccess(true);
    } catch (error) {
      toast.error("Une erreur est survenue lors de la sauvegarde.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#C9A84C]" />
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="flex flex-col items-center pb-24 px-4 sm:px-6 overflow-hidden min-h-screen">

      <section className="w-full max-w-2xl mx-auto mt-12 mb-8 relative z-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Modifier l'opportunité</h1>
        <p className="text-white/50">Les modifications seront visibles immédiatement par la communauté.</p>
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
              <h2 className="text-2xl font-bold mb-2">Offre mise à jour !</h2>
              <p className="text-white/50 mb-8">Les modifications ont bien été enregistrées.</p>
              <GlassButton variant="primary" onClick={() => router.push(`/opportunite/${opp.id}`)}>
                Voir l'offre
              </GlassButton>
            </motion.div>
          ) : (
            <OpportunityForm
              formData={formData}
              onChange={handleChange}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              submitLabel="Enregistrer les modifications"
            />
          )}

        </GlassCard>
      </section>
    </div>
  );
}
