"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getApplicationsByRecruiter, updateApplicationStatus, Application, ApplicationStatus } from "@/lib/db";
import { Loader2, Users, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; bg: string; text: string; border: string }> = {
  received:  { label: "Reçue",       bg: "bg-blue-500/10",   text: "text-blue-400",   border: "border-blue-500/20" },
  reviewing: { label: "En examen",   bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/20" },
  accepted:  { label: "Acceptée",    bg: "bg-green-500/10",  text: "text-green-400",  border: "border-green-500/20" },
  rejected:  { label: "Non retenu",  bg: "bg-red-500/10",    text: "text-red-400",    border: "border-red-500/20" },
};

const ALL_STATUSES: ApplicationStatus[] = ["received", "reviewing", "accepted", "rejected"];

export default function CandidaturesPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterOpp, setFilterOpp] = useState("Toutes");
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/connexion"); return; }
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists() || userDoc.data().role !== "recruiter") {
        router.push("/explorer");
        return;
      }
      const data = await getApplicationsByRecruiter(user.uid);
      setApplications(data);
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    setUpdatingId(appId);
    try {
      await updateApplicationStatus(appId, newStatus);
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
      toast.success(`Statut mis à jour : ${STATUS_CONFIG[newStatus].label}`);
    } catch { toast.error("Erreur lors de la mise à jour."); }
    finally { setUpdatingId(null); }
  };

  const uniqueOpportunities = ["Toutes", ...Array.from(new Set(applications.map(a => a.opportunityTitle)))];
  const filtered = filterOpp === "Toutes" ? applications : applications.filter(a => a.opportunityTitle === filterOpp);

  const formatDate = (ms: number) => new Date(ms).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#C9A84C]" /></div>;

  return (
    <div className="min-h-screen pb-24 px-4 sm:px-6 mt-24">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold mb-1 tracking-tight">Candidatures reçues</h1>
            <p className="text-white/50 text-sm">{applications.length} candidature{applications.length > 1 ? "s" : ""} au total</p>
          </div>
          {/* Filter by opportunity */}
          <div className="relative">
            <select
              value={filterOpp}
              onChange={e => setFilterOpp(e.target.value)}
              className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm text-white focus:outline-none focus:border-[#C9A84C]/50 cursor-pointer"
            >
              {uniqueOpportunities.map(o => (
                <option key={o} value={o} className="bg-[#111]">{o}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="glass rounded-3xl p-16 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-xl font-bold mb-2">Aucune candidature</h3>
            <p className="text-white/50 text-sm">Les candidats qui postulent via TechRadar apparaîtront ici.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((app, i) => {
              const config = STATUS_CONFIG[app.status] || STATUS_CONFIG.received;
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass rounded-3xl p-6"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#C9A84C] to-[#F5E6A3] flex items-center justify-center text-black font-bold text-lg flex-shrink-0">
                      {app.talentName?.charAt(0).toUpperCase() || "?"}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                        <div>
                          <h3 className="font-bold text-lg">{app.talentName}</h3>
                          <p className="text-white/50 text-sm">{app.talentEmail}</p>
                          <p className="text-white/30 text-xs mt-0.5">
                            Pour <Link href={`/opportunite/${app.opportunityId}`} className="text-[#C9A84C] hover:underline">{app.opportunityTitle}</Link>
                            {" · "}{formatDate(app.createdAt)}
                          </p>
                        </div>

                        {/* Status selector */}
                        <div className="relative">
                          {updatingId === app.id ? (
                            <Loader2 className="w-5 h-5 animate-spin text-[#C9A84C]" />
                          ) : (
                            <select
                              value={app.status}
                              onChange={e => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                              className={`appearance-none ${config.bg} border ${config.border} ${config.text} rounded-xl px-3 py-2 pr-8 text-xs font-bold focus:outline-none cursor-pointer`}
                            >
                              {ALL_STATUSES.map(s => (
                                <option key={s} value={s} className="bg-[#111] text-white">{STATUS_CONFIG[s].label}</option>
                              ))}
                            </select>
                          )}
                          <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 ${config.text} pointer-events-none`} />
                        </div>
                      </div>

                      {/* Skills */}
                      {app.talentSkills && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {app.talentSkills.split(",").slice(0, 5).map((skill, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-lg bg-white/5 text-xs text-white/60 border border-white/10">
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Message */}
                      {app.message && (
                        <div className="bg-white/3 rounded-xl p-3 border border-white/5">
                          <p className="text-xs text-white/40 mb-1 font-medium">Message de motivation</p>
                          <p className="text-sm text-white/70 italic">"{app.message}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
