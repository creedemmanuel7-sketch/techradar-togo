"use client";

import { useEffect, useState, use } from "react";
import { getOpportunityById, Opportunity, toggleSavedOpportunity, deleteOpportunity } from "@/lib/db";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { ArrowLeft, MapPin, Clock, ExternalLink, Loader2, Building2, Layers, Heart, Share2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function OpportunitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [opp, setOpp] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.savedOpportunities?.includes(id)) {
              setIsSaved(true);
            }
          }
        } catch (error) {
          console.error(error);
        }
      }
    });
    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    async function fetchOpp() {
      const data = await getOpportunityById(id);
      if (!data) setNotFound(true);
      else setOpp(data);
      setLoading(false);
    }
    fetchOpp();
  }, [id]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié dans le presse-papier !");
    } catch (err) {
      toast.error("Erreur lors de la copie du lien.");
    }
  };

  const handleToggleSave = async () => {
    if (!user) {
      toast.error("Connectez-vous pour sauvegarder des opportunités.");
      return;
    }
    setIsSaving(true);
    try {
      const newSavedState = !isSaved;
      await toggleSavedOpportunity(user.uid, id, newSavedState);
      setIsSaved(newSavedState);
      toast.success(newSavedState ? "Opportunité sauvegardée dans vos favoris" : "Opportunité retirée des favoris");
    } catch (error) {
      toast.error("Une erreur s'est produite.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette opportunité ?")) return;
    setIsDeleting(true);
    try {
      await deleteOpportunity(id);
      toast.success("Opportunité supprimée !");
      router.push("/explorer");
    } catch (error) {
      toast.error("Erreur lors de la suppression.");
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#C9A84C]" />
      </div>
    );
  }

  if (notFound || !opp) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-3xl font-bold">Opportunité introuvable</h1>
        <p className="text-white/50">Cette page n'existe pas ou a été supprimée.</p>
        <a href="/explorer" className="text-[#C9A84C] hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Retour au Radar
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center pb-24 px-4 sm:px-6">

      {/* BREADCRUMB */}
      <div className="w-full max-w-4xl mx-auto mt-10 mb-8">
        <a href="/explorer" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour au Radar
        </a>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-4xl mx-auto"
      >
        {/* HERO CARD */}
        <div className="glass rounded-3xl p-8 sm:p-12 mb-8 relative overflow-hidden">
          {/* Gradient background accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A84C]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-8">
            <div className="flex-1">
              <div className="mb-4">
                <CategoryBadge type={opp.type} label={opp.typeLabel} />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 leading-tight">{opp.title}</h1>
              <p className="text-[#C9A84C] text-xl font-bold">{opp.organization}</p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-col gap-3">
              {opp.externalLink ? (
                <a
                  href={opp.externalLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-shrink-0 flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#C9A84C] to-[#F5E6A3] text-black font-bold px-8 py-4 rounded-2xl text-base hover:opacity-90 transition-opacity shadow-lg shadow-[#C9A84C]/20"
                >
                  Postuler maintenant
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <div className="flex-shrink-0 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/30 text-sm text-center">
                  Lien non disponible
                </div>
              )}

              <div className="flex items-center gap-3">
                <button 
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all text-sm font-medium"
                >
                  <Share2 className="w-4 h-4" />
                  Partager
                </button>
                <button 
                  onClick={handleToggleSave}
                  disabled={isSaving}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border transition-all text-sm font-medium ${isSaved ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20' : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'}`}
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />}
                  {isSaved ? "Sauvegardé" : "Favoris"}
                </button>
              </div>
              {user?.uid === opp.publisherId && (
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition-all text-sm font-medium mt-1"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Supprimer l'offre
                </button>
              )}
            </div>
          </div>

          {/* METADATA PILLS */}
          <div className="flex flex-wrap gap-3">
            {[
              { icon: MapPin, value: opp.location, label: "Lieu" },
              { icon: Layers, value: opp.domain, label: "Domaine" },
              { icon: Building2, value: opp.level, label: "Niveau" },
              ...(opp.deadline ? [{ icon: Clock, value: opp.deadline, label: "Date limite" }] : []),
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl">
                <Icon className="w-4 h-4 text-[#C9A84C]" />
                <div>
                  <p className="text-xs text-white/40">{label}</p>
                  <p className="text-sm font-semibold text-white">{value || "Non précisé"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="glass rounded-3xl p-8 sm:p-12 mb-8">
          <h2 className="text-xl font-bold mb-5 text-white/80">Description de l'opportunité</h2>
          {opp.description ? (
            <div className="text-white/70 leading-relaxed text-base whitespace-pre-wrap">
              {opp.description}
            </div>
          ) : (
            <div className="text-white/30 italic text-sm">
              Aucune description fournie. Pour plus d'informations, utilisez le lien pour postuler.
            </div>
          )}
        </div>

        {/* CTA BOTTOM */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass rounded-3xl px-8 py-6">
          <div>
            <p className="font-bold text-lg">Intéressé(e) par cette opportunité ?</p>
            <p className="text-sm text-white/50">Ne laissez pas passer votre chance dans l'écosystème tech togolais.</p>
          </div>
          {opp.externalLink ? (
            <a
              href={opp.externalLink}
              target="_blank"
              rel="noreferrer"
              className="flex-shrink-0 flex items-center gap-2.5 bg-gradient-to-r from-[#C9A84C] to-[#F5E6A3] text-black font-bold px-8 py-4 rounded-2xl text-base hover:opacity-90 transition-opacity"
            >
              Postuler <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <span className="text-white/30 text-sm">Lien indisponible</span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
