"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { toggleSavedOpportunity, deleteOpportunity, Opportunity } from "@/lib/db";
import { Share2, Heart, Trash2, Loader2, ExternalLink, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface OpportuniteActionsProps {
  opp: Opportunity;
  externalLink?: string;
}

export function OpportuniteActions({ opp, externalLink }: OpportuniteActionsProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
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
            setUserRole(data.role || null);
            if (data.savedOpportunities?.includes(opp.id)) {
              setIsSaved(true);
            }
          }
        } catch (error) {
          console.error(error);
        }
      } else {
        setUserRole(null);
      }
    });
    return () => unsubscribe();
  }, [opp.id]);

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
      await toggleSavedOpportunity(user.uid, opp.id, newSavedState);
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
      await deleteOpportunity(opp.id);
      toast.success("Opportunité supprimée !");
      router.push("/explorer");
    } catch (error) {
      toast.error("Erreur lors de la suppression.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-col gap-3 w-full sm:w-auto mt-6 sm:mt-0">
      {/* Bouton Postuler retiré (H-1) : Uniquement affiché dans le CTA du bas pour éviter la confusion */}

      <div className="flex items-center gap-3">
        <button 
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all text-sm font-medium"
        >
          <Share2 className="w-4 h-4" />
          Partager
        </button>
        {/* Hide Save button for recruiters — they manage opportunities, they don't save them */}
        {userRole !== "recruiter" && (
          <button 
            onClick={handleToggleSave}
            disabled={isSaving}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border transition-all text-sm font-medium ${isSaved ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20' : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'}`}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />}
            {isSaved ? "Sauvegardé" : "Favoris"}
          </button>
        )}
      </div>
      
      {user?.uid === opp.publisherId && (
        <div className="flex flex-col gap-2 mt-1">
          <Link
            href={`/opportunite/${opp.id}/modifier`}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#C9A84C]/10 hover:bg-[#C9A84C]/20 border border-[#C9A84C]/30 text-[#C9A84C] transition-all text-sm font-medium"
          >
            <Pencil className="w-4 h-4" />
            Modifier l'offre
          </Link>
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

      {/* Bouton Postuler : visible uniquement pour les talents */}
      {userRole === "talent" && externalLink && (
        <a
          href={externalLink}
          target="_blank"
          rel="noreferrer"
          className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#C9A84C] to-[#F5E6A3] text-black font-bold px-8 py-4 rounded-2xl text-base hover:opacity-90 transition-opacity mt-1"
        >
          Postuler <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </div>
  );
}
