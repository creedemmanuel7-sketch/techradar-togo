"use client";

import { useEffect, useState, useRef, use } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getOpportunities, Opportunity } from "@/lib/db";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { Camera, Loader2, Edit3, MapPin, Clock, Briefcase, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

interface UserProfile {
  name: string;
  email: string;
  role: "talent" | "recruiter";
  photoURL?: string;
  bio?: string;
  location?: string;
  skills?: string;
}

export default function ProfilPage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = use(params);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<UserProfile>>({});
  const [userOpps, setUserOpps] = useState<Opportunity[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
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
      // Fetch their published opportunities
      const allOpps = await getOpportunities();
      setUserOpps(allOpps.filter((o) => o.publisherId === uid));
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
    setUploadingPhoto(true);
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `avatars/${uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      await updateDoc(doc(db, "users", uid), { photoURL: downloadURL });
      setProfile((prev) => prev ? { ...prev, photoURL: downloadURL } : prev);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Erreur lors de l'upload de la photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const initials = profile?.name
    ? profile.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

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
                  <input
                    value={editData.name || ""}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-2xl font-bold text-white outline-none focus:border-[#C9A84C]/50"
                    placeholder="Ton nom complet"
                  />
                  <textarea
                    value={editData.bio || ""}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    rows={3}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white/80 outline-none focus:border-[#C9A84C]/50 resize-none placeholder-white/30"
                    placeholder="Décris-toi en quelques mots... (ex: Développeur React passionné, 3 ans d'exp.)"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      value={editData.location || ""}
                      onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                      className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#C9A84C]/50 placeholder-white/30"
                      placeholder="📍 Ville (ex: Lomé)"
                    />
                    <input
                      value={editData.skills || ""}
                      onChange={(e) => setEditData({ ...editData, skills: e.target.value })}
                      className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#C9A84C]/50 placeholder-white/30"
                      placeholder="🛠️ Compétences (ex: React, Node)"
                    />
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

        {/* PUBLISHED OPPORTUNITIES */}
        <div>
          <h2 className="text-xl font-bold mb-6">
            {isOwner ? "Mes opportunités publiées" : `Opportunités publiées par ${profile.name}`}
          </h2>
          {userOpps.length === 0 ? (
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
          )}
        </div>
      </div>
    </div>
  );
}
