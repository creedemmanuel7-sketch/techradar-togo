"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getTalents, UserProfile } from "@/lib/db";
import { Search, MapPin, Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function TalentsPage() {
  const [talents, setTalents] = useState<UserProfile[]>([]);
  const [filteredTalents, setFilteredTalents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/connexion");
        return;
      }
      
      try {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          const profile = docSnap.data() as UserProfile;
          if (profile.role !== "recruiter") {
            router.push("/explorer");
            return;
          }
          
          // Fetch talents
          const talentsData = await getTalents();
          setTalents(talentsData);
          setFilteredTalents(talentsData);
        } else {
          router.push("/explorer");
        }
      } catch (error) {
        console.error("Error verifying access:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredTalents(
      talents.filter(
        (t) =>
          t.name.toLowerCase().includes(term) ||
          t.skills?.toLowerCase().includes(term) ||
          t.location?.toLowerCase().includes(term) ||
          t.bio?.toLowerCase().includes(term)
      )
    );
  }, [searchTerm, talents]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#C9A84C]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-4 sm:px-6 mt-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Annuaire des Talents</h1>
          <p className="text-white/50">Trouvez les meilleurs profils tech du Togo pour votre équipe.</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-10 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Chercher par compétence, ville, nom..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-white/30 outline-none focus:border-[#C9A84C]/50 focus:bg-white/10 transition-all"
          />
        </div>

        {/* Results */}
        {filteredTalents.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center text-white/50">
            Aucun talent trouvé pour "{searchTerm}".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTalents.map((talent, i) => (
              <motion.div
                key={talent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-3xl p-6 hover:bg-white/5 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A84C]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#C9A84C]/10 transition-colors" />
                
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-tr from-[#C9A84C] to-[#F5E6A3] flex items-center justify-center text-black text-xl font-bold flex-shrink-0">
                    {talent.photoURL ? (
                      <img src={talent.photoURL} alt={talent.name} className="w-full h-full object-cover" />
                    ) : (
                      talent.name.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{talent.name}</h3>
                    {talent.location && (
                      <p className="flex items-center gap-1 text-xs text-white/40 mt-1">
                        <MapPin className="w-3 h-3" /> {talent.location}
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-sm text-white/70 mb-4 line-clamp-3 min-h-[60px]">
                  {talent.bio || <span className="italic text-white/30">Aucune bio.</span>}
                </p>

                {talent.skills && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {talent.skills.split(",").slice(0, 4).map((skill, index) => (
                      <span key={index} className="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-white/60 border border-white/10">
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
                    href={`mailto:${talent.email}?subject=Contact via Tech Radar Togo`}
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
