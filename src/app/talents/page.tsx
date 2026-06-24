"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getTalents, getOpportunities, UserProfile, Opportunity } from "@/lib/db";
import { calculateMatchScore } from "@/lib/match";
import { Search, MapPin, Loader2, Mail, Zap, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function TalentsPage() {
  const [talents, setTalents] = useState<UserProfile[]>([]);
  const [myOpportunities, setMyOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOppId, setSelectedOppId] = useState<string>("none");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/connexion"); return; }
      try {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (!docSnap.exists() || docSnap.data().role !== "recruiter") {
          router.push("/explorer"); return;
        }
        const [talentsData, allOpps] = await Promise.all([getTalents(), getOpportunities()]);
        const mine = allOpps.filter(o => o.publisherId === user.uid);
        setTalents(talentsData);
        setMyOpportunities(mine);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const selectedOpp = myOpportunities.find(o => o.id === selectedOppId);

  const talentsWithScore = talents
    .filter(t => {
      const term = searchTerm.toLowerCase();
      return !searchTerm ||
        t.name.toLowerCase().includes(term) ||
        t.skills?.toLowerCase().includes(term) ||
        t.location?.toLowerCase().includes(term);
    })
    .map(t => ({
      ...t,
      matchScore: selectedOpp
        ? calculateMatchScore(t.skills, `${selectedOpp.title} ${selectedOpp.description} ${selectedOpp.domain}`, selectedOpp.domain)
        : 0,
    }))
    .sort((a, b) => b.matchScore - a.matchScore);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-[#C9A84C]" />
    </div>
  );

  return (
    <div className="min-h-screen pb-24 px-4 sm:px-6 mt-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Annuaire des Talents</h1>
          <p className="text-white/50">Trouvez les meilleurs profils tech du Togo. Sélectionnez une de vos offres pour activer le matching inversé.</p>
        </div>

        {/* Reverse Matching Selector */}
        <div className="glass rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 text-[#C9A84C] text-sm font-semibold whitespace-nowrap">
            <Zap className="w-4 h-4" />
            Matching Inversé
          </div>
          <div className="relative flex-1 w-full">
            <select
              value={selectedOppId}
              onChange={e => setSelectedOppId(e.target.value)}
              className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm text-white focus:outline-none focus:border-[#C9A84C]/50 cursor-pointer"
            >
              <option value="none" className="bg-[#111]">— Sélectionner une de vos offres pour voir les scores de match —</option>
              {myOpportunities.map(o => (
                <option key={o.id} value={o.id} className="bg-[#111]">{o.title} · {o.organization}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>
          {selectedOpp && (
            <span className="text-xs text-[#C9A84C]/80 bg-[#C9A84C]/10 px-3 py-1.5 rounded-lg whitespace-nowrap">
              Triés par pertinence ↓
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Chercher par compétence, ville, nom..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-white/30 outline-none focus:border-[#C9A84C]/50 focus:bg-white/10 transition-all"
          />
        </div>

        {talentsWithScore.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center text-white/50">
            Aucun talent trouvé pour "{searchTerm}".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {talentsWithScore.map((talent, i) => (
              <motion.div
                key={talent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-3xl p-6 hover:bg-white/5 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A84C]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#C9A84C]/10 transition-colors" />
                
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-tr from-[#C9A84C] to-[#F5E6A3] flex items-center justify-center text-black text-lg font-bold flex-shrink-0">
                    {talent.photoURL ? (
                      <img src={talent.photoURL} alt={talent.name} className="w-full h-full object-cover" />
                    ) : (
                      talent.name.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-lg leading-tight truncate">{talent.name}</h3>
                      {/* Match Score Badge */}
                      {selectedOpp && talent.matchScore > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap flex-shrink-0 ${
                          talent.matchScore >= 80 ? "bg-green-500/20 text-green-400 border-green-500/30" :
                          talent.matchScore >= 50 ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                          "bg-white/10 text-white/50 border-white/10"
                        }`}>
                          Match {talent.matchScore}%
                        </span>
                      )}
                    </div>
                    {talent.location && (
                      <p className="flex items-center gap-1 text-xs text-white/40 mt-1">
                        <MapPin className="w-3 h-3" /> {talent.location}
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-sm text-white/70 mb-4 line-clamp-2 min-h-[40px]">
                  {talent.bio || <span className="italic text-white/30">Aucune bio.</span>}
                </p>

                {talent.skills && (
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {talent.skills.split(",").slice(0, 4).map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-white/60 border border-white/10">
                        {skill.trim()}
                      </span>
                    ))}
                    {talent.skills.split(",").length > 4 && (
                      <span className="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-white/40 border border-white/10">
                        +{talent.skills.split(",").length - 4}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex gap-3 mt-auto">
                  <a
                    href={`/profil/${talent.id}`}
                    className="flex-1 text-center py-2.5 rounded-xl border border-white/10 text-white/70 text-sm font-medium hover:bg-white/5 hover:text-white transition-colors"
                  >
                    Voir profil
                  </a>
                  <a
                    href={`mailto:${talent.email}?subject=Opportunité via TechRadar Togo${selectedOpp ? ` — ${selectedOpp.title}` : ""}`}
                    className="flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl bg-[#C9A84C]/10 text-[#C9A84C] text-sm font-medium hover:bg-[#C9A84C]/20 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Contacter
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
