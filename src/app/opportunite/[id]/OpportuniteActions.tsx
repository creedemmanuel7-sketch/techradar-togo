"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { 
  toggleSavedOpportunity, deleteOpportunity, submitApplication, 
  closeOpportunity, openOpportunity, Opportunity, UserProfile 
} from "@/lib/db";
import { Share2, Heart, Trash2, Loader2, Send, Pencil, CheckCircle2, Lock, Unlock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface OpportuniteActionsProps {
  opp: Opportunity;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  received:  { label: "Candidature reçue",     color: "text-blue-400" },
  reviewing: { label: "En cours d'examen",      color: "text-yellow-400" },
  accepted:  { label: "Candidature acceptée 🎉", color: "text-green-400" },
  rejected:  { label: "Non retenu",              color: "text-red-400" },
};

export function OpportuniteActions({ opp }: OpportuniteActionsProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  // Native application modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  // Local status (to reflect close/reopen without page reload)
  const [localStatus, setLocalStatus] = useState<"open" | "closed">(opp.status || "open");

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            setProfile(data);
            if (data.savedOpportunities?.includes(opp.id)) {
              setIsSaved(true);
            }
          }
        } catch (error) {
          console.error(error);
        }
      } else {
        setProfile(null);
      }
    });
    return () => unsubscribe();
  }, [opp.id]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié dans le presse-papier !");
    } catch {
      toast.error("Erreur lors de la copie du lien.");
    }
  };

  const handleToggleSave = async () => {
    if (!user) { toast.error("Connectez-vous pour sauvegarder."); return; }
    setIsSaving(true);
    try {
      const newState = !isSaved;
      await toggleSavedOpportunity(user.uid, opp.id, newState);
      setIsSaved(newState);
      toast.success(newState ? "Opportunité sauvegardée !" : "Retirée des favoris.");
    } catch { toast.error("Une erreur s'est produite."); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette opportunité ?")) return;
    setIsDeleting(true);
    try {
      await deleteOpportunity(opp.id);
      toast.success("Opportunité supprimée !");
      router.push("/explorer");
    } catch { toast.error("Erreur lors de la suppression."); setIsDeleting(false); }
  };

  const handleToggleClose = async () => {
    setIsClosing(true);
    try {
      if (localStatus === "open") {
        await closeOpportunity(opp.id);
        setLocalStatus("closed");
        toast.success("Offre marquée comme pourvue/clôturée.");
      } else {
        await openOpportunity(opp.id);
        setLocalStatus("open");
        toast.success("Offre réouverte !");
      }
    } catch { toast.error("Erreur lors du changement de statut."); }
    finally { setIsClosing(false); }
  };

  const handleApply = async () => {
    if (!user || !profile) { toast.error("Connectez-vous pour postuler."); return; }
    if (!applyMessage.trim()) { toast.error("Veuillez rédiger un message de motivation."); return; }
    setIsSubmitting(true);
    try {
      await submitApplication({
        opportunityId: opp.id,
        opportunityTitle: opp.title,
        organization: opp.organization,
        talentId: user.uid,
        talentName: profile.name,
        talentEmail: profile.email,
        talentSkills: profile.skills,
        message: applyMessage,
        status: "received",
        recruiterId: opp.publisherId,
      });
      setHasApplied(true);
      setShowApplyModal(false);
      toast.success("🎉 Candidature envoyée ! Le recruteur va être notifié.");
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "already_applied") {
        toast.error("Vous avez déjà postulé à cette offre.");
        setHasApplied(true);
      } else {
        toast.error("Erreur lors de l'envoi. Réessayez.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOwner = user?.uid === opp.publisherId;
  const isRecruiter = profile?.role === "recruiter";
  const isTalent = profile?.role === "talent";

  return (
    <>
      <div className="flex flex-col gap-3 w-full sm:w-auto mt-6 sm:mt-0">
        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all text-sm font-medium"
          >
            <Share2 className="w-4 h-4" />
            Partager
          </button>

          {isTalent && (
            <button
              onClick={handleToggleSave}
              disabled={isSaving}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border transition-all text-sm font-medium ${isSaved ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20" : "bg-white/5 hover:bg-white/10 border-white/10 text-white"}`}
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />}
              {isSaved ? "Sauvegardé" : "Favoris"}
            </button>
          )}
        </div>

        {/* CTA Postuler — uniquement pour les talents, offre ouverte */}
        {isTalent && localStatus === "open" && (
          hasApplied ? (
            <div className="w-full flex items-center justify-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 font-bold px-8 py-4 rounded-2xl text-sm">
              <CheckCircle2 className="w-5 h-5" />
              Candidature envoyée ✓
            </div>
          ) : (
            <button
              onClick={() => setShowApplyModal(true)}
              className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#C9A84C] to-[#F5E6A3] text-black font-bold px-8 py-4 rounded-2xl text-base hover:opacity-90 transition-opacity"
            >
              <Send className="w-4 h-4" />
              Postuler via TechRadar
            </button>
          )
        )}

        {/* Offre clôturée — message visible */}
        {isTalent && localStatus === "closed" && (
          <div className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white/40 font-medium px-8 py-4 rounded-2xl text-sm cursor-not-allowed">
            <Lock className="w-4 h-4" />
            Offre clôturée
          </div>
        )}

        {/* Boutons propriétaire */}
        {isOwner && (
          <div className="flex flex-col gap-2 mt-1">
            <Link
              href={`/opportunite/${opp.id}/modifier`}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#C9A84C]/10 hover:bg-[#C9A84C]/20 border border-[#C9A84C]/30 text-[#C9A84C] transition-all text-sm font-medium"
            >
              <Pencil className="w-4 h-4" />
              Modifier l'offre
            </Link>
            <button
              onClick={handleToggleClose}
              disabled={isClosing}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl transition-all text-sm font-medium ${
                localStatus === "open"
                  ? "bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400"
                  : "bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400"
              }`}
            >
              {isClosing ? <Loader2 className="w-4 h-4 animate-spin" /> : localStatus === "open" ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              {localStatus === "open" ? "Clôturer l'offre" : "Rouvrir l'offre"}
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition-all text-sm font-medium"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Supprimer l'offre
            </button>
          </div>
        )}
      </div>

      {/* Application Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowApplyModal(false)}>
          <div className="glass rounded-3xl p-8 max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-extrabold mb-1">Postuler</h2>
            <p className="text-white/50 text-sm mb-6">
              <span className="text-[#C9A84C] font-semibold">{opp.title}</span> · {opp.organization}
            </p>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 text-white/80">Message de motivation</label>
              <textarea
                rows={5}
                value={applyMessage}
                onChange={e => setApplyMessage(e.target.value)}
                placeholder="Présentez-vous brièvement et expliquez pourquoi vous êtes le bon profil pour cette opportunité..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-[#C9A84C]/50 text-sm resize-none"
              />
              <p className="text-xs text-white/30 mt-1 text-right">{applyMessage.length} caractères</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowApplyModal(false)}
                className="flex-1 py-3 rounded-2xl border border-white/10 text-white/60 text-sm font-medium hover:bg-white/5 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleApply}
                disabled={isSubmitting || !applyMessage.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-[#C9A84C] to-[#F5E6A3] text-black font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isSubmitting ? "Envoi..." : "Envoyer ma candidature"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
