"use client";

import { useEffect, useState, useRef, use } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getOpportunities, Opportunity, deleteOpportunity, deleteUserData } from "@/lib/db";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { Camera, Loader2, Edit3, MapPin, Clock, Briefcase, GraduationCap, Trash2, AlertTriangle, Database } from "lucide-react";
import { deleteUser } from "firebase/auth";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { seedDatabase } from "@/lib/seed";

interface UserProfile {
  name: string;
  email: string;
  role: "talent" | "recruiter";
  photoURL?: string;
  bio?: string;
  location?: string;
  skills?: string;
  savedOpportunities?: string[];
}

export default function ProfilPage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = use(params);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<UserProfile>>({});
  const [userOpps, setUserOpps] = useState<Opportunity[]>([]);
  const [savedOpps, setSavedOpps] = useState<Opportunity[]>([]);
  const [activeTab, setActiveTab] = useState<"published" | "saved">("published");
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [seeding, setSeeding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.uid === uid) setIsOwner(true);
    });
    return () => unsubscribe();
  }, [uid]);

  useEffect(() => {
    async function fetchProfile() {
      const docSnap = await getDoc(doc(db, "users", uid));
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setProfile(data);
        setEditData(data);
      }
      // Fetch their published & saved opportunities
      const allOpps = await getOpportunities();
      setUserOpps(allOpps.filter((o) => o.publisherId === uid));
      
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        if (data.savedOpportunities && data.savedOpportunities.length > 0) {
          setSavedOpps(allOpps.filter((o) => data.savedOpportunities!.includes(o.id)));
        }
      }
      
      setLoading(false);
    }
    fetchProfile();
  }, [uid]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", uid), editData);
      setProfile({ ...profile!, ...editData });
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image valide.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5 Mo.");
      return;
    }

    setUploadingPhoto(true);
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `avatars/${uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      await updateDoc(doc(db, "users", uid), { photoURL: downloadURL });
      setProfile((prev) => prev ? { ...prev, photoURL: downloadURL } : prev);
      toast.success("Photo de profil mise à jour !");
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Erreur lors du téléchargement de la photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "SUPPRIMER") return;

    setIsDeletingAccount(true);
    try {
      // 1. Cascade-delete all Firestore data (opportunities + user doc)
      await deleteUserData(uid);

      // 2. Delete the Firebase Auth account
      const currentUser = auth.currentUser;
      if (currentUser) await deleteUser(currentUser);

      toast.success("Votre compte a été supprimé.");
      window.location.href = "/";
    } catch (error: any) {
      // Firebase may require recent login before deleting an auth account
      if (error?.code === "auth/requires-recent-login") {
        toast.error("Sécurité : veuillez vous déconnecter, vous reconnecter, puis réessayer.");
        setShowDeleteModal(false);
      } else {
        toast.error("Erreur lors de la suppression du compte.");
        console.error(error);
      }
      setIsDeletingAccount(false);
    }
  };

  const handleDeleteOpp = async (e: React.MouseEvent, oppId: string) => {
    e.preventDefault(); // Prevent navigating to the opportunity page
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette opportunité ?")) return;
    
    try {
      await deleteOpportunity(oppId);
      setUserOpps((prev) => prev.filter(opp => opp.id !== oppId));
      toast.success("Opportunité supprimée avec succès.");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la suppression.");
    }
  };

  const initials = profile?.name
    ? profile.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const handleSeed = async () => {
    if (!confirm("⚠️ HACKATHON: Injecter 15 profils et 20 opportunités de test dans la base de données ?")) return;
    setSeeding(true);
    const res = await seedDatabase();
    if (res.success) {
      toast.success(res.message);
      // Reload page to fetch new opportunities if needed
      window.location.reload();
    } else {
      toast.error(res.message);
    }
    setSeeding(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#C9A84C]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <h1 className="text-2xl font-bold">Profil introuvable</h1>
        <a href="/" className="text-[#C9A84C] hover:underline">Retour à l'accueil</a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center pb-24 px-4 sm:px-6">
      <div className="w-full max-w-4xl mx-auto mt-10">

        {/* PROFILE HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8 sm:p-12 mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#C9A84C]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
            {/* AVATAR */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden bg-gradient-to-tr from-[#C9A84C] to-[#F5E6A3] flex items-center justify-center text-black text-3xl font-extrabold shadow-2xl">
                {profile.photoURL ? (
                  <img src={profile.photoURL} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              {isOwner && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-9 h-9 bg-[#C9A84C] rounded-xl flex items-center justify-center text-black shadow-lg hover:bg-[#F5E6A3] transition-colors"
                >
                  {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>

            {/* INFO */}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label htmlFor="edit-name" className="text-sm font-semibold text-white/70 ml-1">Nom complet</label>
                    <input
                      id="edit-name"
                      value={editData.name || ""}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-2xl font-bold text-white outline-none focus:border-[#C9A84C]/50"
                      placeholder="Ton nom complet"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="edit-bio" className="text-sm font-semibold text-white/70 ml-1">Bio</label>
                    <textarea
                      id="edit-bio"
                      value={editData.bio || ""}
                      onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                      rows={3}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white/80 outline-none focus:border-[#C9A84C]/50 resize-none placeholder-white/30"
                      placeholder="Décris-toi en quelques mots... (ex: Développeur React passionné, 3 ans d'exp.)"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="edit-location" className="text-sm font-semibold text-white/70 ml-1">Ville</label>
                      <input
                        id="edit-location"
                        value={editData.location || ""}
                        onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#C9A84C]/50 placeholder-white/30"
                        placeholder="📍 ex: Lomé"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="edit-skills" className="text-sm font-semibold text-white/70 ml-1">Compétences</label>
                      <input
                        id="edit-skills"
                        value={editData.skills || ""}
                        onChange={(e) => setEditData({ ...editData, skills: e.target.value })}
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#C9A84C]/50 placeholder-white/30"
                        placeholder="🛠️ ex: React, Node"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 bg-gradient-to-r from-[#C9A84C] to-[#F5E6A3] text-black font-bold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enregistrer"}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2.5 text-sm text-white/50 hover:text-white border border-white/10 rounded-xl transition-all"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-extrabold mb-1">{profile.name}</h1>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${profile.role === "talent" ? "bg-[#4FC3F7]/15 text-[#4FC3F7]" : "bg-[#C9A84C]/15 text-[#C9A84C]"}`}>
                          {profile.role === "talent" ? "🎓 Talent" : "🏢 Recruteur"}
                        </span>
                      </div>
                    </div>
                    {isOwner && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                        Modifier
                      </button>
                    )}
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed mb-4 max-w-xl">
                    {profile.bio || (isOwner ? <span className="text-white/30 italic">Ajoute une description pour te présenter...</span> : "Aucune description.")}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-white/40">
                    {profile.location && (
                      <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{profile.location}</span>
                    )}
                    {profile.skills && (
                      <span className="flex items-center gap-1.5">🛠️ {profile.skills}</span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* DANGER ZONE moved to the bottom (H-2) */}

        {/* TABS */}
        {isOwner && (
          <div className="flex items-center gap-4 border-b border-white/10 mb-6">
            <button
              onClick={() => setActiveTab("published")}
              className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "published" ? "border-[#C9A84C] text-[#C9A84C]" : "border-transparent text-white/50 hover:text-white"}`}
            >
              Mes publications
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "saved" ? "border-[#C9A84C] text-[#C9A84C]" : "border-transparent text-white/50 hover:text-white"}`}
            >
              Mes favoris ({savedOpps.length})
            </button>
          </div>
        )}

        {/* OPPORTUNITIES GRID */}
        <div>
          {!isOwner && (
            <h2 className="text-xl font-bold mb-6">
              Opportunités publiées par {profile.name}
            </h2>
          )}
          
          {(activeTab === "published" || !isOwner) ? (
            userOpps.length === 0 ? (
              <div className="glass rounded-2xl p-10 text-center text-white/40 text-sm">
                {isOwner
                  ? <>Vous n'avez encore rien publié. <a href="/soumettre" className="text-[#C9A84C] hover:underline">Publier maintenant →</a></>
                  : "Aucune opportunité publiée par cet utilisateur."}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {userOpps.map((opp) => (
                  <a key={opp.id} href={`/opportunite/${opp.id}`} className="block group">
                    <div className="glass rounded-2xl p-6 hover:bg-white/5 transition-all">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <CategoryBadge type={opp.type} label={opp.typeLabel} />
                        {isOwner && (
                          <button
                            onClick={(e) => handleDeleteOpp(e, opp.id)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <h3 className="font-bold text-base mb-1 group-hover:text-[#F5E6A3] transition-colors">{opp.title}</h3>
                      <p className="text-[#C9A84C] text-sm font-medium mb-3">{opp.organization}</p>
                      <div className="flex items-center gap-3 text-xs text-white/40">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{opp.location}</span>
                        {opp.deadline && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{opp.deadline}</span>}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )
          ) : (
            savedOpps.length === 0 ? (
              <div className="glass rounded-2xl p-10 text-center text-white/40 text-sm">
                Vous n'avez pas encore de favoris. <a href="/explorer" className="text-[#C9A84C] hover:underline">Explorer les offres →</a>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {savedOpps.map((opp) => (
                  <a key={opp.id} href={`/opportunite/${opp.id}`} className="block group">
                    <div className="glass rounded-2xl p-6 hover:bg-white/5 transition-all">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <CategoryBadge type={opp.type} label={opp.typeLabel} />
                      </div>
                      <h3 className="font-bold text-base mb-1 group-hover:text-[#F5E6A3] transition-colors">{opp.title}</h3>
                      <p className="text-[#C9A84C] text-sm font-medium mb-3">{opp.organization}</p>
                      <div className="flex items-center gap-3 text-xs text-white/40">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{opp.location}</span>
                        {opp.deadline && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{opp.deadline}</span>}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )
          )}
        </div>

        {/* DANGER ZONE — only visible to the account owner, at the bottom */}
        {isOwner && (
          <div className="mt-16 pt-8 border-t border-red-500/10 space-y-6">
            
            {/* HACKATHON SEED DATA */}
            <div className="rounded-3xl border border-blue-500/20 bg-blue-500/5 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-blue-500/10 flex-shrink-0">
                    <Database className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-bold text-blue-400 text-lg mb-1">Zone Hackathon (Démo)</p>
                    <p className="text-white/50 text-sm max-w-md">
                      Injecter de fausses données (15 talents, 20 opportunités) pour la démo live. Ne cliquer qu'une seule fois.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSeed}
                  disabled={seeding}
                  className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-all text-sm font-bold"
                >
                  {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : "Générer fausses données"}
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-red-500/10 flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <p className="font-bold text-red-400 text-lg mb-1">Zone de danger</p>
                    <p className="text-white/50 text-sm max-w-md">
                      Une fois votre compte supprimé, toutes vos données et vos offres publiées seront effacées définitivement. Cette action est irréversible.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all text-sm font-bold"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer le compte
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isDeletingAccount && setShowDeleteModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-8 w-full max-w-md relative z-10 border-red-500/30"
          >
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4 text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Supprimer définitivement ?</h3>
            <p className="text-white/60 text-sm mb-6 leading-relaxed">
              Cette action supprimera votre profil et toutes vos offres du Radar. Tapez <span className="font-mono text-red-400 font-bold bg-red-500/10 px-1.5 py-0.5 rounded">SUPPRIMER</span> pour confirmer.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="SUPPRIMER"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-center font-mono focus:border-red-500/50 outline-none mb-6"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeletingAccount}
                className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "SUPPRIMER" || isDeletingAccount}
                className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isDeletingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmer"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
